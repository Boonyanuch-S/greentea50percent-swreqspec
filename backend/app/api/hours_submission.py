from collections.abc import Generator

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..middleware.auth import require_roles
from ..models.activity import Activity
from ..models.auth_token import UserRole
from ..schemas.hours_submission import (
    HoursSubmissionActivityResponse,
    HoursSubmissionDetailResponse,
)
from ..services.activity_access import ActivityAccessService
from ..services.deadline_check import DeadlineCheckService


hours_submission_router = APIRouter(tags=["hours-submission"])


def get_activity_session(request: Request) -> Generator[Session, None, None]:
    """รับ Session กิจกรรมจาก app wiring ตาม FR-SBH-01."""
    session = getattr(request.app.state, "activity_session", None)
    if session is None:
        raise HTTPException(status_code=503, detail="ยังไม่มีแหล่งข้อมูลกิจกรรม")
    yield session


@hours_submission_router.get(
    "/activities/hours-submission",
    response_model=list[HoursSubmissionActivityResponse],
    dependencies=[Depends(require_roles(UserRole.CLUB_COMMITTEE))],
)
def list_hours_submission_activities(
    session: Session = Depends(get_activity_session),
) -> list[Activity]:
    """คืนรายการกิจกรรมจบแล้วให้กรรมการที่ Login ตาม FR-SBH-01."""
    return ActivityAccessService.list_finished_activities(session)


@hours_submission_router.get(
    "/activities/{activity_id}/hours-submission",
    response_model=HoursSubmissionDetailResponse,
    dependencies=[Depends(require_roles(UserRole.CLUB_COMMITTEE))],
)
def get_hours_submission_activity(
    activity_id: int,
    session: Session = Depends(get_activity_session),
) -> HoursSubmissionDetailResponse:
    """เปิดกิจกรรมที่จบแล้วพร้อมสถานะ deadline ตาม FR-SBH-01 และ FR-SBH-07."""
    activity = session.scalar(
        select(Activity).where(Activity.activity_id == activity_id)
    )
    if activity is None:
        raise HTTPException(status_code=404, detail="ไม่พบกิจกรรม")
    if activity.status != "จบแล้ว":
        raise HTTPException(status_code=403, detail="เปิดหน้าส่งชั่วโมงได้เฉพาะกิจกรรมที่จบแล้ว")
    return HoursSubmissionDetailResponse(
        activity_id=activity.activity_id,
        activity_name=activity.activity_name,
        status=activity.status,
        end_date=activity.end_date,
        project_number_status=activity.project_number_status,
        category_template_id=activity.category_template_id,
        deadline_exceeded=DeadlineCheckService.is_deadline_exceeded(
            activity.regular_submission_deadline
        ),
    )
