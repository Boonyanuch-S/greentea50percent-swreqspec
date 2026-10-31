from datetime import date, datetime, timedelta, timezone

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.app.main import app
from backend.app.middleware.auth import require_roles
from backend.app.models.activity import Activity, Base
from backend.app.models.auth_token import UserRole
from backend.app.models.authenticated_user_context import AuthenticatedUserContext
from backend.app.api.hours_submission import get_activity_session
from backend.app.services.auth_service import token_registry


def _client_with_club_token():
    token = "test-hours-submission-token"
    now = datetime.now(timezone.utc)
    token_registry.register(
        token,
        AuthenticatedUserContext("club-1", UserRole.CLUB_COMMITTEE, now),
        now.replace(tzinfo=None) + timedelta(minutes=30),
    )
    return TestClient(app, headers={"Authorization": token})


def _activity(activity_id: int, status: str) -> Activity:
    return Activity(
        activity_id=activity_id,
        owner_user_id="club-1",
        name=f"กิจกรรม {activity_id}",
        activity_date=date(2026, 10, 1),
        regular_submission_deadline=date(2026, 10, 30),
        status=status,
        project_number_status="พร้อม",
        category_template_id=None,
    )


def test_AC_SBH_03_only_finished_activity_allowed():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session = Session(engine)
    session.add_all([_activity(1, "จบแล้ว"), _activity(2, "กำลังดำเนินการ")])
    session.commit()
    app.dependency_overrides[get_activity_session] = lambda: session

    try:
        client = _client_with_club_token()
        activities = client.get("/activities/hours-submission")
        finished = client.get("/activities/1/hours-submission")
        unfinished = client.get("/activities/2/hours-submission")

        assert activities.status_code == 200
        assert [activity["activity_id"] for activity in activities.json()] == [1]
        assert finished.status_code == 200
        assert finished.json()["status"] == "จบแล้ว"
        assert unfinished.status_code == 403
    finally:
        app.dependency_overrides.pop(get_activity_session, None)
        session.close()
        engine.dispose()


def test_AC_SBH_06_reject_unauthenticated_access():
    client = TestClient(app)
    list_response = client.get("/activities/hours-submission")
    response = client.get("/activities/1/hours-submission")

    assert list_response.status_code == 401
    assert response.status_code == 401
