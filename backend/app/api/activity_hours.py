from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import REG_TIMEOUT_SECONDS
from ..integrations.reg_client import RegClient, RegTimeoutTransport
from ..integrations.uc10_notification_client import UC10NotificationClient
from ..api.hours_submission import get_activity_session
from ..audit.activity_hours_access import record_activity_hours_access
from ..models.activity import Activity
from ..models.activity_hours import ActivityHourDocument, ActivityParticipantHour
from ..models.authenticated_user_context import AuthenticatedUserContext
from ..models.hour_criteria import HourCriteria
from ..models.reg_submission import RegSubmission
from ..integrations.uc04_summary_client import UC04SummaryClient, get_uc04_summary_client
from ..services.activity_hours_reader import (
    ActivityHoursExcelConfig,
    ActivityHoursExcelError,
    ActivityHoursFileReferenceError,
    ActivityHoursFileResolver,
    get_activity_hours_excel_config,
    get_activity_hours_file_resolver,
    read_activity_hour_document,
)
from ..services.hour_validation import mark_participants_with_unmatched_hour_types
from ..services.activity_hours_approval import (
    HOURS_RECORDED_STATUS,
    ActivityHoursApprovalError,
    approve_activity_hour_document,
)
from ..services.reg_retry import RegRetryError, retry_activity_hours_reg_submission
from backend.auth.activity_hours_guard import require_activity_hours_user


activity_hours_router = APIRouter(
    prefix="/activity-hours",
    tags=["activity-hours"],
    dependencies=[Depends(require_activity_hours_user)],
)


def get_reg_client(request: Request) -> RegClient:
    """รับ transport สำหรับส่ง REG จาก app wiring ตาม IF-REG-01."""
    transport = getattr(request.app.state, "reg_timeout_transport", None)
    if not callable(transport):
        raise HTTPException(status_code=503, detail="ยังไม่ได้ตั้งค่า transport สำหรับ REG")
    return RegClient(
        timeout_transport=transport,
        timeout_seconds=REG_TIMEOUT_SECONDS,
    )


def get_uc10_notification_client(request: Request) -> UC10NotificationClient:
    """คืน client คำขอแจ้งยืนยัน UC-10 ตาม FR-HRS-05."""
    client = getattr(request.app.state, "uc10_notification_client", None)
    if client is None:
        client = UC10NotificationClient()
        request.app.state.uc10_notification_client = client
    return client


@activity_hours_router.get("/documents/pending")
def list_pending_activity_hour_documents(
    session: Session = Depends(get_activity_session),
) -> list[dict[str, object]]:
    """คืนเอกสารที่รอตรวจเรียงตามวันส่งก่อน-หลังตาม FR-HRS-01, CON-NFR-21 และ NFR-SEC-01."""
    statement = (
        select(ActivityHourDocument)
        .where(ActivityHourDocument.status == "รอตรวจสอบ")
        .order_by(ActivityHourDocument.submitted_at)
    )
    return [
        {
            "document_id": document.document_id,
            "activity_id": document.activity_id,
            "source_file_reference": document.source_file_reference,
            "submitted_at": document.submitted_at,
            "status": document.status,
            "returned_at": document.returned_at,
        }
        for document in session.scalars(statement).all()
    ]


@activity_hours_router.post("/documents/{document_id}/approve")
def approve_activity_hours(
    document_id: int,
    session: Session = Depends(get_activity_session),
    reg_client: RegClient = Depends(get_reg_client),
    uc10_client: UC10NotificationClient = Depends(get_uc10_notification_client),
    user_context: AuthenticatedUserContext = Depends(require_activity_hours_user),
) -> dict[str, object]:
    """ส่งชั่วโมงที่ตรงเกณฑ์ไป REG และเปลี่ยนสถานะเมื่อสำเร็จตาม FR-HRS-04 และ IF-REG-01."""
    try:
        document, submission = approve_activity_hour_document(
            session,
            document_id,
            user_context,
            reg_client,
        )
    except ActivityHoursApprovalError as error:
        raise HTTPException(status_code=error.status_code, detail=error.detail) from error

    response = {
        "document_id": document.document_id,
        "status": document.status,
        "submission_id": submission.submission_id,
        "response_status": submission.response_status,
        "error_message": submission.error_message,
    }
    if document.status == HOURS_RECORDED_STATUS:
        notification = uc10_client.request_confirmation(document.document_id)
        response["notification_status"] = notification.delivery_status
    return response


@activity_hours_router.post("/documents/{document_id}/reg-retry")
def retry_activity_hours_reg(
    document_id: int,
    session: Session = Depends(get_activity_session),
    reg_client: RegClient = Depends(get_reg_client),
    uc10_client: UC10NotificationClient = Depends(get_uc10_notification_client),
    user_context: AuthenticatedUserContext = Depends(require_activity_hours_user),
) -> dict[str, object]:
    """ส่งคำขอ REG ที่ล้มเหลวซ้ำด้วยตนเองได้หนึ่งครั้งตาม FR-HRS-07 และ IF-REG-01."""
    try:
        document, submission = retry_activity_hours_reg_submission(
            session,
            document_id,
            user_context,
            reg_client,
        )
    except RegRetryError as error:
        raise HTTPException(status_code=error.status_code, detail=error.detail) from error

    response = {
        "document_id": document.document_id,
        "status": document.status,
        "submission_id": submission.submission_id,
        "response_status": submission.response_status,
        "error_message": submission.error_message,
        "attempt_count": submission.attempt_count,
    }
    if document.status == HOURS_RECORDED_STATUS:
        notification = uc10_client.request_confirmation(document.document_id)
        response["notification_status"] = notification.delivery_status
    return response


@activity_hours_router.post("/documents/{document_id}/validate")
def validate_activity_hour_document(
    document_id: int,
    session: Session = Depends(get_activity_session),
    user_context: AuthenticatedUserContext = Depends(require_activity_hours_user),
) -> dict[str, object]:
    """ตรวจประเภทชั่วโมงตามปีของกิจกรรมและคืนเอกสารที่มีรายการผิดตาม FR-HRS-03, FR-HRS-06 และ ASM-01."""
    document = session.get(ActivityHourDocument, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="ไม่พบเอกสารชั่วโมงกิจกรรม")

    record_activity_hours_access(
        session,
        user_context,
        access_item=f"activity-hours:document:{document_id}:validate",
    )

    activity = session.get(Activity, document.activity_id)
    if activity is None or activity.academic_year is None:
        raise HTTPException(
            status_code=409,
            detail="ไม่สามารถตรวจสอบได้: ไม่พบปีการศึกษาที่กำหนดในข้อมูลกิจกรรม",
        )

    criteria = session.scalars(
        select(HourCriteria).where(
            HourCriteria.academic_year == activity.academic_year,
            HourCriteria.active_status.is_(True),
        )
    ).all()
    if not criteria:
        raise HTTPException(
            status_code=409,
            detail="ไม่สามารถตรวจสอบได้: ไม่พบเกณฑ์ active สำหรับปีการศึกษาของกิจกรรม",
        )

    participants = session.scalars(
        select(ActivityParticipantHour).where(
            ActivityParticipantHour.document_id == document_id
        )
    ).all()
    invalid_participants = mark_participants_with_unmatched_hour_types(
        participants,
        criteria,
    )

    if invalid_participants:
        document.status = "ส่งคืน UC-02"
        document.returned_at = datetime.now(timezone.utc)
        session.commit()

    return {
        "document_id": document.document_id,
        "academic_year": activity.academic_year,
        "status": document.status,
        "invalid_items": [
            {
                "item_id": participant.item_id,
                "student_reference": participant.student_reference,
                "reported_hour_type": participant.reported_hour_type,
                "validation_status": participant.validation_status,
                "validation_message": participant.validation_message,
            }
            for participant in invalid_participants
        ],
    }


@activity_hours_router.get("/documents/{document_id}/participants")
def list_activity_hour_document_participants(
    document_id: int,
    session: Session = Depends(get_activity_session),
    excel_config: ActivityHoursExcelConfig = Depends(get_activity_hours_excel_config),
    file_resolver: ActivityHoursFileResolver = Depends(get_activity_hours_file_resolver),
    user_context: AuthenticatedUserContext = Depends(require_activity_hours_user),
) -> list[dict[str, object]]:
    """คืนผู้เข้าร่วมและประเภทชั่วโมงจาก Excel ครบทุกรายการตาม FR-HRS-02, IF-XLS-01 และ CON-NFR-21."""
    document = session.get(ActivityHourDocument, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="ไม่พบเอกสารชั่วโมงกิจกรรม")

    record_activity_hours_access(
        session,
        user_context,
        access_item=f"activity-hours:document:{document_id}:participants",
    )

    try:
        participants = read_activity_hour_document(
            document=document,
            file_resolver=file_resolver,
            config=excel_config,
        )
    except ActivityHoursFileReferenceError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ActivityHoursExcelError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    return [
        {
            "student_reference": participant.student_reference,
            "participant_name": participant.participant_name,
            "reported_hour_type": participant.reported_hour_type,
            "reported_hours": participant.reported_hours,
        }
        for participant in participants
    ]


@activity_hours_router.get("/documents/{document_id}/individual-summary")
def get_activity_hours_individual_summary(
    document_id: int,
    participant_id: str,
    session: Session = Depends(get_activity_session),
    summary_client: UC04SummaryClient = Depends(get_uc04_summary_client),
    user_context: AuthenticatedUserContext = Depends(require_activity_hours_user),
) -> dict[str, object]:
    """เรียก UC-04 สำหรับผู้เข้าร่วมที่เลือกตาม FR-HRS-08 และ AC-HRS-07."""
    if session.get(ActivityHourDocument, document_id) is None:
        raise HTTPException(status_code=404, detail="ไม่พบเอกสารชั่วโมงกิจกรรม")

    record_activity_hours_access(
        session,
        user_context,
        access_item=f"activity-hours:document:{document_id}:individual-summary",
    )

    return summary_client.get_individual_summary(document_id, participant_id)
