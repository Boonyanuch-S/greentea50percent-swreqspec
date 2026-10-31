from sqlalchemy.orm import Session

from ..models.activity import Activity
from ..repositories.activity import ActivityRepository


class ActivityAccessService:
    """ให้บริการเข้าถึงกิจกรรมที่จบแล้วตาม FR-SBH-01."""

    @staticmethod
    def list_finished_activities(session: Session) -> list[Activity]:
        """คืนรายการกิจกรรมสถานะจบแล้วตาม FR-SBH-01."""
        return ActivityRepository.list_finished_activities(session)
