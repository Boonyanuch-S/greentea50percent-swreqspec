from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.app.integrations.reg_client import RegClient
from backend.app.api.activity_hours import get_reg_client
from backend.app.api.hours_submission import get_activity_session
from backend.app.main import app
from backend.app.models.activity import Activity, Base
from backend.app.models.activity_hours import ActivityHourDocument, ActivityParticipantHour
from backend.app.models.auth_token import UserRole
from backend.app.models.authenticated_user_context import AuthenticatedUserContext
from backend.app.models.hour_criteria import HourCriteria
from backend.app.models.reg_submission import (
    RegClientResponse,
    RegSubmission,
    RegSubmissionPayload,
)
from backend.app.models.student_access_log import StudentAccessLog
from backend.app.services.auth_service import token_registry
from backend.app.services.activity_hours_approval import HOURS_RECORDED_STATUS


def _create_approval_context() -> tuple[Engine, Session, str]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session = Session(engine)
    session.add(
        Activity(
            activity_id=1,
            owner_user_id="club-1",
            name="กิจกรรม",
            activity_date=date(2026, 10, 1),
            regular_submission_deadline=date(2026, 10, 30),
            status="จบแล้ว",
            academic_year="AY-2569-S1",
        )
    )
    session.add(
        ActivityHourDocument(
            document_id=41,
            activity_id=1,
            source_file_reference="activity-hours.xlsx",
            submitted_at=datetime(2026, 10, 20),
            status="รอตรวจสอบ",
        )
    )
    session.add(
        ActivityParticipantHour(
            item_id=1,
            document_id=41,
            student_reference="S-001",
            participant_name="ผู้เข้าร่วม 1",
            reported_hour_type="จิตอาสา",
            reported_hours=Decimal("2.50"),
        )
    )
    session.add(
        HourCriteria(
            criteria_id=1,
            academic_year="AY-2569-S1",
            hour_type="จิตอาสา",
            criteria_definition="",
            active_status=True,
        )
    )
    session.commit()
    app.dependency_overrides[get_activity_session] = lambda: session

    token = "test-activity-hours-approve-matching"
    now = datetime.now(timezone.utc)
    token_registry.register(
        token,
        AuthenticatedUserContext("staff-1", UserRole.STUDENT_AFFAIRS_OFFICER, now),
        now.replace(tzinfo=None) + timedelta(minutes=30),
    )
    return engine, session, token


def test_AC_HRS_01_approve_matching_hours() -> None:
    """ส่งรายการที่ตรงเกณฑ์ไป REG และบันทึกสถานะสำเร็จตาม AC-HRS-01."""
    engine, session, token = _create_approval_context()
    sent_payloads: list[RegSubmissionPayload] = []

    def transport(payload: RegSubmissionPayload) -> RegClientResponse:
        sent_payloads.append(payload)
        return RegClientResponse(response_status="success")

    app.dependency_overrides[get_reg_client] = lambda: RegClient(transport)
    try:
        response = TestClient(app).post(
            "/activity-hours/documents/41/approve",
            headers={"Authorization": token},
        )

        assert response.status_code == 200
        assert response.json()["status"] == HOURS_RECORDED_STATUS
        assert response.json()["response_status"] == "success"
        assert len(sent_payloads) == 1
        assert sent_payloads[0].document_id == 41
        assert sent_payloads[0].participant_hours[0].student_reference == "S-001"
        assert sent_payloads[0].participant_hours[0].reported_hour_type == "จิตอาสา"
        assert sent_payloads[0].participant_hours[0].reported_hours == Decimal("2.50")
        assert session.scalar(
            select(ActivityHourDocument).where(ActivityHourDocument.document_id == 41)
        ).status == HOURS_RECORDED_STATUS
        submission = session.scalar(select(RegSubmission))
        assert submission is not None
        assert submission.response_status == "success"
        assert submission.attempt_count == 1
        assert session.scalar(select(StudentAccessLog)).access_item == (
            "activity-hours:document:41:approve"
        )
    finally:
        app.dependency_overrides.pop(get_activity_session, None)
        app.dependency_overrides.pop(get_reg_client, None)
        session.close()
        engine.dispose()
