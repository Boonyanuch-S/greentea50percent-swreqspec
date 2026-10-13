from datetime import date

from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from ..models.activity import Activity


class ActivityRepository:
    """ค้นหากิจกรรมเลยกำหนดของกรรมการตาม FR-LATE-01 และ IF-DEADLINE-01."""

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
