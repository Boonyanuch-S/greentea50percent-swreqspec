from datetime import date, datetime, timedelta, timezone

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.app.api.hours_submission import get_activity_session
from backend.app.main import app
from backend.app.models.activity import Activity, Base
from backend.app.models.auth_token import UserRole
from backend.app.models.authenticated_user_context import AuthenticatedUserContext
from backend.app.services.auth_service import token_registry
from backend.app.services.deadline_check import DeadlineCheckService


def _client_with_club_token() -> TestClient:
    token = "test-AC-SBH-05-deadline"
    now = datetime.now(timezone.utc)
    token_registry.register(
        token,
        AuthenticatedUserContext("club-1", UserRole.CLUB_COMMITTEE, now),
        now.replace(tzinfo=None) + timedelta(minutes=30),
    )
    return TestClient(app, headers={"Authorization": token})


def _activity(activity_id: int, deadline: date) -> Activity:
    return Activity(
        activity_id=activity_id,
        owner_user_id="club-1",
        name=f"กิจกรรม {activity_id}",
        activity_date=date(2026, 10, 1),
        regular_submission_deadline=deadline,
        status="จบแล้ว",
        project_number_status="พร้อม",
        category_template_id=None,
    )


def test_AC_SBH_05_show_exception_link_when_deadline_exceeded():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session = Session(engine)
    today = date.today()
    session.add_all(
        [
            _activity(1, today - timedelta(days=1)),
            _activity(2, today),
            _activity(3, today + timedelta(days=1)),
        ]
    )
    session.commit()
    app.dependency_overrides[get_activity_session] = lambda: session

    try:
        client = _client_with_club_token()

        exceeded = client.get("/activities/1/hours-submission")
        due_today = client.get("/activities/2/hours-submission")
        not_exceeded = client.get("/activities/3/hours-submission")

        assert exceeded.status_code == 200
        assert exceeded.json()["deadline_exceeded"] is True
        assert due_today.json()["deadline_exceeded"] is False
        assert not_exceeded.json()["deadline_exceeded"] is False
    finally:
        app.dependency_overrides.pop(get_activity_session, None)
        session.close()
        engine.dispose()


def test_AC_SBH_05_no_deadline_does_not_mark_exception():
    assert DeadlineCheckService.is_deadline_exceeded(None, date.today()) is False
