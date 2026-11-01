from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..audit.activity_hours_access import record_activity_hours_access
from ..integrations.reg_client import RegClient
from ..models.activity import Activity
from ..models.activity_hours import ActivityHourDocument, ActivityParticipantHour
from ..models.authenticated_user_context import AuthenticatedUserContext
from ..models.hour_criteria import HourCriteria
from ..models.reg_submission import RegParticipantHour, RegSubmission, RegSubmissionPayload

REG_SUCCESS_STATUS = "success"
HOURS_RECORDED_STATUS = "บันทึกชั่วโมงสำเร็จ"
PENDING_REVIEW_STATUS = "รอตรวจสอบ"


class ActivityHoursApprovalError(Exception):
    """ข้อผิดพลาดที่ปฏิเสธการอนุมัติตาม FR-HRS-04 และ ASM-01."""

    def __init__(self, status_code: int, detail: str) -> None:
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


def approve_activity_hour_document(
    session: Session,
    document_id: int,
    user_context: AuthenticatedUserContext,
    reg_client: RegClient,
) -> tuple[ActivityHourDocument, RegSubmission]:
    """ส่งรายการที่ตรงเกณฑ์ไป REG และเปลี่ยนสถานะเมื่อสำเร็จตาม FR-HRS-04 และ IF-REG-01."""
    document = session.get(ActivityHourDocument, document_id)
    if document is None:
        raise ActivityHoursApprovalError(404, "ไม่พบเอกสารชั่วโมงกิจกรรม")
    if document.status != PENDING_REVIEW_STATUS:
        raise ActivityHoursApprovalError(409, "เอกสารนี้ไม่อยู่ในสถานะรอตรวจสอบ")

    record_activity_hours_access(
        session,
        user_context,
        access_item=f"activity-hours:document:{document_id}:approve",
    )

    activity = session.get(Activity, document.activity_id)
    if activity is None or activity.academic_year is None:
        raise ActivityHoursApprovalError(
            409,
            "ไม่สามารถอนุมัติได้: ไม่พบปีการศึกษาที่กำหนดในข้อมูลกิจกรรม",
        )

    active_criteria = session.scalars(
        select(HourCriteria).where(
            HourCriteria.academic_year == activity.academic_year,
            HourCriteria.active_status.is_(True),
        )
    ).all()
    if not active_criteria:
        raise ActivityHoursApprovalError(
            409,
            "ไม่สามารถอนุมัติได้: ไม่พบเกณฑ์ active สำหรับปีการศึกษาของกิจกรรม",
        )

    participants = session.scalars(
        select(ActivityParticipantHour)
        .where(ActivityParticipantHour.document_id == document_id)
        .order_by(ActivityParticipantHour.item_id)
    ).all()
    allowed_hour_types = {criteria.hour_type for criteria in active_criteria}
    if any(
        participant.reported_hour_type not in allowed_hour_types
        for participant in participants
    ):
        raise ActivityHoursApprovalError(
            409,
            "ไม่สามารถอนุมัติได้: มีรายการที่ไม่ตรงเกณฑ์",
        )

    payload = RegSubmissionPayload(
        document_id=document_id,
        participant_hours=tuple(
            RegParticipantHour(
                student_reference=participant.student_reference,
                reported_hour_type=participant.reported_hour_type,
                reported_hours=participant.reported_hours,
            )
            for participant in participants
        ),
    )
    submission = reg_client.submit(payload)
    session.add(submission)
    if submission.response_status == REG_SUCCESS_STATUS:
        document.status = HOURS_RECORDED_STATUS
    session.commit()

    if submission.response_status != REG_SUCCESS_STATUS:
        raise ActivityHoursApprovalError(502, "ส่งข้อมูลไม่สำเร็จ")

    return document, submission
