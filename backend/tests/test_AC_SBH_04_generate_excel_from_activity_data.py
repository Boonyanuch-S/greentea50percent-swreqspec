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
from backend.app.models.hours_submission import (
    ActivityHourType,
    ActivityParticipant,
    ActivityStaff,
)
from backend.app.services.auth_service import token_registry


def _client_with_club_token() -> TestClient:
    token = "test-AC-SBH-04-activity-data"
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
    )


def test_AC_SBH_04_generate_excel_from_activity_data():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session = Session(engine)
    session.add_all(
        [
            _activity(1, "จบแล้ว"),
            _activity(2, "กำลังดำเนินการ"),
            ActivityParticipant(
                participant_id=1,
                activity_id=1,
                user_id="participant-1",
                role_type="ผู้เข้าร่วม",
            ),
            ActivityStaff(
                staff_id=1,
                activity_id=1,
                user_id="staff-1",
                role_type="Staff",
            ),
            ActivityHourType(
                hour_type_id=1,
                activity_id=1,
                name="จิตอาสา",
                code="VOLUNTEER",
            ),
            ActivityHourType(
                hour_type_id=2,
                activity_id=1,
                name="กศ.",
                code="EDUCATION",
            ),
        ]
    )
    session.commit()
    app.dependency_overrides[get_activity_session] = lambda: session

    try:
        client = _client_with_club_token()
        people_response = client.get("/activities/1/participants")
        types_response = client.get("/activities/1/hour-types")
        unfinished_people = client.get("/activities/2/participants")
        unfinished_types = client.get("/activities/2/hour-types")

        assert people_response.status_code == 200
        assert people_response.json() == {
            "participants": [
                {
                    "participant_id": 1,
                    "staff_id": None,
                    "activity_id": 1,
                    "user_id": "participant-1",
                    "role_type": "ผู้เข้าร่วม",
                }
            ],
            "staff": [
                {
                    "participant_id": None,
                    "staff_id": 1,
                    "activity_id": 1,
                    "user_id": "staff-1",
                    "role_type": "Staff",
                }
            ],
        }
        assert types_response.status_code == 200
        assert {item["name"] for item in types_response.json()} == {"จิตอาสา", "กศ."}
        assert unfinished_people.status_code == 403
        assert unfinished_types.status_code == 403
    finally:
        app.dependency_overrides.pop(get_activity_session, None)
        session.close()
        engine.dispose()


def test_AC_SBH_04_rejects_unauthenticated_activity_data_access():
    client = TestClient(app)

    assert client.get("/activities/1/participants").status_code == 401
    assert client.get("/activities/1/hour-types").status_code == 401
