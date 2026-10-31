from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..api.hours_submission import get_activity_session
from ..middleware.auth import require_roles
from ..models.activity import Activity
from ..models.auth_token import UserRole
from ..models.hours_submission import ActivityHourType
from ..schemas.hours_submission import (
    ActivityHourTypeResponse,
    ActivityPeopleResponse,
)
from ..services.hours_data import HoursDataService


activity_data_router = APIRouter(tags=["activity-data"])


def _require_finished_activity(session: Session, activity_id: int) -> Activity:
    """ยืนยันว่าข้อมูลเปิดได้เฉพาะกิจกรรมจบแล้วตาม FR-SBH-01."""
    activity = session.scalar(
        select(Activity).where(Activity.activity_id == activity_id)
    )
    if activity is None:
        raise HTTPException(status_code=404, detail="ไม่พบกิจกรรม")
    if activity.status != "จบแล้ว":
        raise HTTPException(
            status_code=403,
            detail="เปิดข้อมูลชั่วโมงได้เฉพาะกิจกรรมที่จบแล้ว",
        )
    return activity


@activity_data_router.get(
    "/activities/{activity_id}/participants",
    response_model=ActivityPeopleResponse,
    dependencies=[Depends(require_roles(UserRole.CLUB_COMMITTEE))],
)
def get_activity_people(
    activity_id: int,
    session: Session = Depends(get_activity_session),
) -> ActivityPeopleResponse:
    """คืนผู้เข้าร่วมและ Staff ของกิจกรรมจบแล้วตาม FR-SBH-02 และ ASM-05."""
    _require_finished_activity(session, activity_id)
    data = HoursDataService.get_activity_data(session, activity_id)
    return ActivityPeopleResponse(
        participants=data.participants,
        staff=data.staff,
    )


@activity_data_router.get(
    "/activities/{activity_id}/hour-types",
    response_model=list[ActivityHourTypeResponse],
    dependencies=[Depends(require_roles(UserRole.CLUB_COMMITTEE))],
)
def get_activity_hour_types(
    activity_id: int,
    session: Session = Depends(get_activity_session),
) -> list[ActivityHourType]:
    """คืนประเภทชั่วโมงระดับกิจกรรมของกิจกรรมจบแล้วตาม FR-SBH-02 และ ASM-05."""
    _require_finished_activity(session, activity_id)
    return HoursDataService.get_activity_data(session, activity_id).hour_types
