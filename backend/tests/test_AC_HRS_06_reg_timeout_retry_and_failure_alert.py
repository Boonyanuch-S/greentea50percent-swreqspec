from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.app.api.activity_hours import get_reg_client
from backend.app.api.hours_submission import get_activity_session
from backend.app.config import REG_TIMEOUT_SECONDS
from backend.app.integrations.reg_client import RegClient
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
from backend.app.services.auth_service import token_registry


def _create_reg_timeout_context() -> tuple[Engine, Session, str]:
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

    token = "test-activity-hours-reg-timeout"
    now = datetime.now(timezone.utc)
    token_registry.register(
        token,
        AuthenticatedUserContext("staff-1", UserRole.STUDENT_AFFAIRS_OFFICER, now),
        now.replace(tzinfo=None) + timedelta(minutes=30),
    )
    return engine, session, token


def test_AC_HRS_06_reg_timeout_retry_and_failure_alert() -> None:
    """แจ้ง timeout, อนุญาตส่งซ้ำด้วยตนเองครั้งเดียว และแจ้งเมื่อส่งซ้ำล้มเหลวตาม AC-HRS-06."""
    engine, session, token = _create_reg_timeout_context()
    calls: list[tuple[RegSubmissionPayload, float]] = []

    def timeout_transport(
        payload: RegSubmissionPayload,
        *,
        timeout_seconds: float,
    ) -> RegClientResponse:
        calls.append((payload, timeout_seconds))
        raise TimeoutError("REG ไม่ตอบสนอง")

    app.dependency_overrides[get_reg_client] = lambda: RegClient(
        timeout_transport=timeout_transport,
        timeout_seconds=REG_TIMEOUT_SECONDS,
    )
    try:
        first_response = TestClient(app).post(
            "/activity-hours/documents/41/approve",
            headers={"Authorization": token},
        )

        assert first_response.status_code == 502
        assert first_response.json()["detail"] == "ส่งข้อมูลไม่สำเร็จ"
        assert len(calls) == 1
        assert calls[0][1] == 5

        retry_response = TestClient(app).post(
            "/activity-hours/documents/41/reg-retry",
            headers={"Authorization": token},
        )

        assert retry_response.status_code == 502
        assert retry_response.json()["detail"] == "ส่งข้อมูลไม่สำเร็จ"
        assert len(calls) == 2
        assert calls[1][1] == 5
        submission = session.scalar(select(RegSubmission))
        assert submission is not None
        assert submission.response_status == "timeout"
        assert submission.attempt_count == 2
        document = session.get(ActivityHourDocument, 41)
        assert document is not None
        assert document.status == "รอตรวจสอบ"

        repeated_retry = TestClient(app).post(
            "/activity-hours/documents/41/reg-retry",
            headers={"Authorization": token},
        )
        assert repeated_retry.status_code == 409
        assert len(calls) == 2
    finally:
        app.dependency_overrides.pop(get_activity_session, None)
        app.dependency_overrides.pop(get_reg_client, None)
        session.close()
        engine.dispose()
