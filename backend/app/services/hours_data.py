from dataclasses import dataclass

from sqlalchemy.orm import Session

from ..models.hours_submission import ActivityHourType, ActivityParticipant, ActivityStaff
from ..repositories.activity import ActivityRepository


@dataclass(frozen=True)
class ActivityHoursData:
    """ข้อมูลผู้เกี่ยวข้องและประเภทชั่วโมงระดับกิจกรรมตาม FR-SBH-02 และ ASM-05."""

    participants: list[ActivityParticipant]
    staff: list[ActivityStaff]
    hour_types: list[ActivityHourType]


class HoursDataService:
    """ดึงข้อมูลผู้เกี่ยวข้องและประเภทชั่วโมงตาม FR-SBH-02 และ ASM-05."""

    @staticmethod
    def get_activity_data(session: Session, activity_id: int) -> ActivityHoursData:
        """คืนรายชื่อผู้เข้าร่วม Staff และประเภทชั่วโมงทั้งหมดของกิจกรรม."""
        return ActivityHoursData(
            participants=ActivityRepository.list_participants(session, activity_id),
            staff=ActivityRepository.list_staff(session, activity_id),
            hour_types=ActivityRepository.list_hour_types(session, activity_id),
        )
