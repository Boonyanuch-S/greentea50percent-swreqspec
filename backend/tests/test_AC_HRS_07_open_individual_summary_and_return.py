from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.app.api.hours_submission import get_activity_session
from backend.app.main import app
from backend.app.models.activity import Activity, Base
from backend.app.models.activity_hours import ActivityHourDocument
from backend.app.models.auth_token import UserRole
from backend.app.models.authenticated_user_context import AuthenticatedUserContext
from backend.app.services.auth_service import token_registry


def test_AC_HRS_07_open_individual_summary_and_return() -> None:
    """เรียก UC-04 สำหรับผู้เข้าร่วมที่เลือกและคืนข้อมูลตาม AC-HRS-07."""
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
            activity_date=datetime(2026, 10, 1).date(),
            regular_submission_deadline=datetime(2026, 10, 30).date(),
            status="จบแล้ว",
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
    session.commit()
    app.dependency_overrides[get_activity_session] = lambda: session

    summary = {"summary_reference": "UC-04 response"}
    provider_calls: list[tuple[int, str]] = []
    previous_provider_exists = hasattr(app.state, "uc04_summary_provider")
    previous_provider = getattr(app.state, "uc04_summary_provider", None)

    def simulated_uc04(document_id: int, participant_id: str) -> dict[str, object]:
        provider_calls.append((document_id, participant_id))
        return summary

    app.state.uc04_summary_provider = simulated_uc04
    token = "test-activity-hours-individual-summary-token"
    now = datetime.now(timezone.utc)
    token_registry.register(
        token,
        AuthenticatedUserContext(
            "staff-1",
            UserRole.STUDENT_AFFAIRS_OFFICER,
            now,
        ),
        now.replace(tzinfo=None) + timedelta(minutes=30),
    )

    try:
        response = TestClient(app).get(
            "/activity-hours/documents/41/individual-summary",
            params={"participant_id": "S-001"},
            headers={"Authorization": token},
        )

        assert response.status_code == 200
        assert response.json() == summary
        assert provider_calls == [(41, "S-001")]
    finally:
        app.dependency_overrides.pop(get_activity_session, None)
        if previous_provider_exists:
            app.state.uc04_summary_provider = previous_provider
        else:
            del app.state.uc04_summary_provider
        session.close()
        engine.dispose()
