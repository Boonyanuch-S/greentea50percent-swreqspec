from datetime import date

from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from ..models.hours_submission import (
    Activity,
    ActivityHourType,
    ActivityParticipant,
    ActivityStaff,
)


class ActivityRepository:
    """ค้นหากิจกรรมเลยกำหนดของกรรมการตาม FR-LATE-01 และ IF-DEADLINE-01."""

    @staticmethod
    def list_participants(session: Session, activity_id: int) -> list[ActivityParticipant]:
        """คืนผู้เข้าร่วมของกิจกรรมตาม FR-SBH-02."""
        statement = select(ActivityParticipant).where(
            ActivityParticipant.activity_id == activity_id
        )
        return list(session.scalars(statement).all())

    @staticmethod
    def list_staff(session: Session, activity_id: int) -> list[ActivityStaff]:
        """คืน Staff ของกิจกรรมตาม FR-SBH-02."""
        statement = select(ActivityStaff).where(ActivityStaff.activity_id == activity_id)
        return list(session.scalars(statement).all())

    @staticmethod
    def list_hour_types(session: Session, activity_id: int) -> list[ActivityHourType]:
        """คืนประเภทชั่วโมงทั้งหมดที่ผูกระดับกิจกรรมตาม FR-SBH-02 และ ASM-05."""
        statement = select(ActivityHourType).where(
            ActivityHourType.activity_id == activity_id
        )
        return list(session.scalars(statement).all())

    @staticmethod
    def finished_activities_query() -> Select:
        """สร้าง query ที่คืนเฉพาะกิจกรรมสถานะจบแล้วตาม FR-SBH-01."""
        return select(Activity).where(Activity.status == "จบแล้ว")

    @classmethod
    def list_finished_activities(cls, session: Session) -> list[Activity]:
        """คืนเฉพาะกิจกรรมที่จบแล้วตาม FR-SBH-01."""
        return list(session.scalars(cls.finished_activities_query()).all())

    @staticmethod
    def late_activities_query(owner_user_id: str, as_of: date) -> Select:
        """สร้าง query ที่ใช้กำหนดส่งปกติ โดยไม่มี maximum deadline."""
        return (
            select(Activity)
            .where(Activity.owner_user_id == owner_user_id)
            .where(Activity.regular_submission_deadline < as_of)
            .order_by(Activity.regular_submission_deadline, Activity.activity_id)
        )

    @classmethod
    def list_late_activities(
        cls,
        session: Session,
        owner_user_id: str,
        as_of: date,
    ) -> list[Activity]:
        """คืนกิจกรรมที่เลยกำหนดปกติทั้งหมดของกรรมการคนนั้น."""
        return list(session.scalars(cls.late_activities_query(owner_user_id, as_of)).all())
