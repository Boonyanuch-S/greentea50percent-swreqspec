from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.app.api.activity_hours import (
    get_reg_client,
    get_uc10_notification_client,
)
from backend.app.api.hours_submission import get_activity_session
from backend.app.integrations.reg_client import RegClient
from backend.app.integrations.uc10_notification_client import (
    UC10NotificationClient,
    UC10NotificationRequest,
)
from backend.app.main import app
from backend.app.models.activity import Activity, Base
from backend.app.models.activity_hours import ActivityHourDocument, ActivityParticipantHour
from backend.app.models.auth_token import UserRole
from backend.app.models.authenticated_user_context import AuthenticatedUserContext
from backend.app.models.hour_criteria import HourCriteria
from backend.app.models.reg_submission import RegClientResponse, RegSubmissionPayload
from backend.app.services.auth_service import token_registry


def _create_notification_context() -> tuple[Engine, Session, str]:
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

    token = "test-activity-hours-notify-after-reg-success"
    now = datetime.now(timezone.utc)
    token_registry.register(
        token,
        AuthenticatedUserContext("staff-1", UserRole.STUDENT_AFFAIRS_OFFICER, now),
        now.replace(tzinfo=None) + timedelta(minutes=30),
    )
    return engine, session, token


def test_AC_HRS_05_notify_club_after_reg_success() -> None:
    """เรียก UC-10 หลังสถานะชั่วโมงบันทึกสำเร็จตาม AC-HRS-05."""
    engine, session, token = _create_notification_context()
    events: list[str] = []

    def reg_transport(payload: RegSubmissionPayload) -> RegClientResponse:
        events.append("REG success")
        return RegClientResponse(response_status="success")

    class ObservedUC10NotificationClient(UC10NotificationClient):
        def request_confirmation(self, document_id: int) -> UC10NotificationRequest:
            events.append("UC-10")
            return super().request_confirmation(document_id)

    notification_client = ObservedUC10NotificationClient()
    app.dependency_overrides[get_reg_client] = lambda: RegClient(reg_transport)
    app.dependency_overrides[get_uc10_notification_client] = lambda: notification_client
    try:
        response = TestClient(app).post(
            "/activity-hours/documents/41/approve",
            headers={"Authorization": token},
        )

        assert response.status_code == 200
        assert response.json()["status"] == "บันทึกชั่วโมงสำเร็จ"
        assert response.json()["notification_status"] == "queued"
        assert events == ["REG success", "UC-10"]
        requests = notification_client.list_requests()
        assert len(requests) == 1
        assert requests[0].document_id == 41
        assert requests[0].target_use_case == "UC-10"
    finally:
        app.dependency_overrides.pop(get_activity_session, None)
        app.dependency_overrides.pop(get_reg_client, None)
        app.dependency_overrides.pop(get_uc10_notification_client, None)
        session.close()
        engine.dispose()
