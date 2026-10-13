from datetime import date

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from backend.app.models.activity import Activity, Base
from backend.app.repositories.activity import ActivityRepository


def test_AC_LATE_03_list_all_late_activities():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        session.add_all(
            [
                Activity(
                    activity_id=1,
                    owner_user_id="club-1",
                    name="กิจกรรมเลยกำหนดที่หนึ่ง",
                    activity_date=date(2026, 5, 1),
                    regular_submission_deadline=date(2026, 6, 1),
                ),
                Activity(
                    activity_id=2,
                    owner_user_id="club-1",
                    name="กิจกรรมเลยกำหนดที่สอง",
                    activity_date=date(2026, 6, 1),
                    regular_submission_deadline=date(2026, 7, 1),
                ),
                Activity(
                    activity_id=3,
                    owner_user_id="club-1",
                    name="กิจกรรมที่ยังไม่เลยกำหนด",
                    activity_date=date(2026, 9, 1),
                    regular_submission_deadline=date(2026, 12, 1),
                ),
            ]
        )
        session.commit()

        result = ActivityRepository.list_late_activities(
            session,
            owner_user_id="club-1",
            as_of=date(2026, 10, 13),
        )

    assert [activity.activity_id for activity in result] == [1, 2]
    assert all(activity.regular_submission_deadline < date(2026, 10, 13) for activity in result)
