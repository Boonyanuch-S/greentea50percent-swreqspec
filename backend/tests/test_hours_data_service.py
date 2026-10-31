from datetime import date

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from backend.app.models.activity import Activity, Base
from backend.app.models.hours_submission import (
    ActivityHourType,
    ActivityParticipant,
    ActivityStaff,
)
from backend.app.services.hours_data import HoursDataService


def test_hours_data_service_returns_activity_people_and_all_hour_types():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        activity = Activity(
            activity_id=1,
            owner_user_id="club-1",
            name="กิจกรรมทดสอบ",
            activity_date=date(2026, 10, 1),
            regular_submission_deadline=date(2026, 10, 30),
            status="จบแล้ว",
        )
        participant = ActivityParticipant(
            participant_id=1,
            activity_id=1,
            user_id="participant-1",
            role_type="ผู้เข้าร่วม",
        )
        staff = ActivityStaff(
            staff_id=1,
            activity_id=1,
            user_id="staff-1",
            role_type="Staff",
        )
        hour_types = [
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
        session.add_all([activity, participant, staff, *hour_types])
        session.commit()

        result = HoursDataService.get_activity_data(session, activity_id=1)

    assert [item.user_id for item in result.participants] == ["participant-1"]
    assert [item.user_id for item in result.staff] == ["staff-1"]
    assert {item.name for item in result.hour_types} == {"จิตอาสา", "กศ."}
    assert not hasattr(result.participants[0], "hour_type")
