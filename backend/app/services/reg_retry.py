from decimal import Decimal, InvalidOperation

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..audit.activity_hours_access import record_activity_hours_access
from ..config import REG_MAX_ATTEMPTS
from ..integrations.reg_client import RegClient
from ..models.activity_hours import ActivityHourDocument
from ..models.authenticated_user_context import AuthenticatedUserContext
from ..models.reg_submission import (
    RegParticipantHour,
    RegSubmission,
    RegSubmissionPayload,
)
from .activity_hours_approval import HOURS_RECORDED_STATUS, REG_SUCCESS_STATUS

class RegRetryError(Exception):
    """ข้อผิดพลาดของการส่ง REG ซ้ำตาม FR-HRS-07 และ IF-REG-01."""

    def __init__(self, status_code: int, detail: str) -> None:
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


def _payload_from_submission(submission: RegSubmission) -> RegSubmissionPayload:
    """คืน payload เดิมจาก RegSubmission เพื่อไม่เปลี่ยนข้อมูลระหว่างส่งซ้ำตาม IF-REG-01."""
    submitted_data = submission.submitted_data
    if not isinstance(submitted_data, dict):
        raise RegRetryError(500, "ข้อมูลคำขอ REG ที่บันทึกไว้ไม่ถูกต้อง")
    document_id = submitted_data.get("document_id")
    participant_hours = submitted_data.get("participant_hours")
    if type(document_id) is not int or not isinstance(participant_hours, list):
        raise RegRetryError(500, "ข้อมูลคำขอ REG ที่บันทึกไว้ไม่ถูกต้อง")

    entries: list[RegParticipantHour] = []
    for participant in participant_hours:
        if not isinstance(participant, dict):
            raise RegRetryError(500, "ข้อมูลรายการชั่วโมงที่บันทึกไว้ไม่ถูกต้อง")
        student_reference = participant.get("student_reference")
        reported_hour_type = participant.get("reported_hour_type")
        reported_hours = participant.get("reported_hours")
        if not all(
            isinstance(value, str)
            for value in (student_reference, reported_hour_type, reported_hours)
        ):
            raise RegRetryError(500, "ข้อมูลรายการชั่วโมงที่บันทึกไว้ไม่ถูกต้อง")
        try:
            hours = Decimal(reported_hours)
        except InvalidOperation as error:
            raise RegRetryError(500, "ข้อมูลชั่วโมงที่บันทึกไว้ไม่ถูกต้อง") from error
        entries.append(
            RegParticipantHour(
                student_reference=student_reference,
                reported_hour_type=reported_hour_type,
                reported_hours=hours,
            )
        )

    return RegSubmissionPayload(
        document_id=document_id,
        participant_hours=tuple(entries),
    )


def retry_activity_hours_reg_submission(
    session: Session,
    document_id: int,
    user_context: AuthenticatedUserContext,
    reg_client: RegClient,
) -> tuple[ActivityHourDocument, RegSubmission]:
    """ส่ง REG ซ้ำเฉพาะคำขอที่ล้มเหลวและไม่เกินจำนวนที่กำหนดตาม FR-HRS-07 และ IF-REG-01."""
    document = session.get(ActivityHourDocument, document_id)
    if document is None:
        raise RegRetryError(404, "ไม่พบเอกสารชั่วโมงกิจกรรม")

    record_activity_hours_access(
        session,
        user_context,
        access_item=f"activity-hours:document:{document_id}:reg-retry",
    )

    submission = session.scalar(
        select(RegSubmission)
        .where(RegSubmission.document_id == document_id)
        .order_by(RegSubmission.submission_id.desc())
    )
    if submission is None:
        raise RegRetryError(409, "ไม่พบคำขอ REG ที่ส่งไม่สำเร็จ")
    if submission.response_status == REG_SUCCESS_STATUS:
        raise RegRetryError(409, "คำขอ REG นี้บันทึกสำเร็จแล้ว")
    if submission.attempt_count >= REG_MAX_ATTEMPTS:
        raise RegRetryError(409, "ส่งคำขอ REG ซ้ำครบจำนวนที่อนุญาตแล้ว")

    payload = _payload_from_submission(submission)
    retry_result = reg_client.submit(payload)
    submission.response_status = retry_result.response_status
    submission.error_message = retry_result.error_message
    submission.last_attempt_at = retry_result.last_attempt_at
    submission.attempt_count += 1
    if submission.response_status == REG_SUCCESS_STATUS:
        document.status = HOURS_RECORDED_STATUS
    session.commit()

    if submission.response_status != REG_SUCCESS_STATUS:
        raise RegRetryError(502, "ส่งข้อมูลไม่สำเร็จ")

    return document, submission
