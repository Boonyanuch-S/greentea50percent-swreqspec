from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, model_validator
from sqlalchemy.orm import Session

from ..middleware.auth import require_authenticated_user
from ..models.project_submission import ProjectSubmission
from ..services.project_review_service import ProjectReviewService
from . import review_queue
from .checklists import get_checklist_session


# ปกป้อง Checklist รายโครงการด้วย Login ตาม CON-NFR-21 และ NFR-SEC-01
submissions_router = APIRouter(
    dependencies=[Depends(require_authenticated_user)],
)


class ChecklistEvaluationRequest(BaseModel):
    """สถานะรายการ Checklist ที่ผู้ตรวจเลือก ตาม FR-VDC-03."""

    checklist_item_id: int
    selected: bool
    result: Literal["ครบ", "ไม่ครบ"] | None = None

    @model_validator(mode="after")
    def validate_result(self) -> "ChecklistEvaluationRequest":
        if self.selected and self.result is None:
            raise ValueError("รายการที่เลือกต้องระบุสถานะครบหรือไม่ครบ")
        if not self.selected and self.result is not None:
            raise ValueError("รายการที่ไม่ได้เลือกต้องไม่มีผลตรวจ")
        return self


class ChecklistEvaluationUpdate(BaseModel):
    """รายการ Checklist ที่เลือกและผลตรวจของเอกสาร ตาม FR-VDC-03."""

    items: list[ChecklistEvaluationRequest]


def _require_submission(submission_id: int) -> ProjectSubmission:
    """ตรวจว่าเอกสารอยู่ในคิวก่อนจัดการรายละเอียด ตาม FR-VDC-02."""
    submission = review_queue.review_queue_service.get_submission(submission_id)
    if submission is None:
        raise HTTPException(status_code=404, detail="ไม่พบเอกสารโครงการ")
    return submission


@submissions_router.get("/submissions/{submission_id}/checklist")
def get_submission_checklist(
    submission_id: int,
    session: Session = Depends(get_checklist_session),
) -> list[dict[str, int | str | bool | None]]:
    """คืน Checklist ฉบับล่าสุดพร้อมผลของเอกสาร ตาม FR-VDC-03, FR-VDC-07 และ IF-CHK-02."""
    _require_submission(submission_id)
    return ProjectReviewService.list_latest_evaluations(session, submission_id)


@submissions_router.put("/submissions/{submission_id}/checklist")
def update_submission_checklist(
    submission_id: int,
    request: ChecklistEvaluationUpdate,
    session: Session = Depends(get_checklist_session),
) -> list[dict[str, int | str | bool | None]]:
    """บันทึกรายการที่เลือกและสถานะครบ/ไม่ครบ ตาม FR-VDC-03 และ IF-CHK-02."""
    _require_submission(submission_id)
    item_ids = [item.checklist_item_id for item in request.items]
    if len(item_ids) != len(set(item_ids)):
        raise HTTPException(status_code=422, detail="มีรายการ Checklist ซ้ำ")

    try:
        result = ProjectReviewService.save_evaluations(
            session,
            submission_id,
            [item.model_dump() for item in request.items],
        )
        session.commit()
        return result
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
