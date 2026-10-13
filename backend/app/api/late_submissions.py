from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from ..middleware.auth import require_late_submission_user
from ..repositories.activity import ActivityRepository
from ..schemas.late_submission import LateActivityResponse


# บังคับ session ก่อนเข้าถึง API ย้อนหลังตาม CON-NFR-21 และ NFR-SEC-01
late_submission_router = APIRouter(
    prefix="/late-submissions",
    dependencies=[Depends(require_late_submission_user)],
    tags=["late-submissions"],
)


def get_activity_session(request: Request) -> Session:
    """รับ Session จาก app wiring โดยไม่สร้างฐานข้อมูลซ้ำใน feature นี้."""
    session = getattr(request.app.state, "activity_session", None)
    if session is None:
        raise HTTPException(status_code=503, detail="ยังไม่มีแหล่งข้อมูลกิจกรรม")
    return session


@late_submission_router.get("/activities", response_model=list[LateActivityResponse])
def list_late_activities(
    owner_user_id: str,
    as_of: date = Query(default_factory=date.today),
    session: Session = Depends(get_activity_session),
    _session_reference: str = Depends(require_late_submission_user),
) -> list[LateActivityResponse]:
    """คืนกิจกรรมที่เลยกำหนดปกติ โดยไม่ใช้ maximum deadline ตาม FR-LATE-01 และ IF-DEADLINE-01."""
    return ActivityRepository.list_late_activities(session, owner_user_id, as_of)
