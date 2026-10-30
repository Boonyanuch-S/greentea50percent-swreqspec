from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator

from ..middleware.auth import require_authenticated_user
from ..services.approval_service import (
    FORWARDED_STATUS,
    ApprovalService,
)
from ..services.rejection_service import (
    RETURNED_STATUS,
    RejectionService,
)
from .review_queue import review_queue_service

review_decision_router = APIRouter(
    dependencies=[Depends(require_authenticated_user)],
)
approval_service = ApprovalService(review_queue_service)
rejection_service = RejectionService(review_queue_service)


class ApprovalRequest(BaseModel):
    """ข้อมูลเจ้าหน้าที่ผู้อนุมัติ ตาม FR-VDC-05."""

    reviewer_user_id: str = Field(min_length=1)


class RejectionRequest(BaseModel):
    """ข้อมูลเจ้าหน้าที่และเหตุผลการตีกลับ ตาม FR-VDC-06 และ IF-UC01-01."""

    reviewer_user_id: str = Field(min_length=1)
    reason_text: str = Field(min_length=1)

    @field_validator("reviewer_user_id", "reason_text")
    @classmethod
    def reject_blank_values(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("ต้องระบุข้อมูล")
        return value


@review_decision_router.post("/submissions/{submission_id}/review/approve")
def approve_submission(
    submission_id: int,
    request: ApprovalRequest,
) -> dict[str, int | str | dict[str, str]]:
    """บันทึกคำตัดสิน เปลี่ยนสถานะ และส่งต่อให้ UC-05 ตาม FR-VDC-05 และ IF-UC05-01."""
    decision = approval_service.approve(
        submission_id,
        request.reviewer_user_id,
    )
    if decision is None:
        raise HTTPException(status_code=404, detail="ไม่พบเอกสารโครงการ")

    return {
        "decision_id": decision.decision_id,
        "submission_id": decision.submission_id,
        "reviewer_user_id": decision.reviewer_user_id,
        "decision_type": decision.decision_type,
        "decided_at": decision.decided_at.isoformat(),
        "status": FORWARDED_STATUS,
        "handoff": {
            "target_use_case": "UC-05",
            "status": "queued",
        },
    }


@review_decision_router.post("/submissions/{submission_id}/review/reject")
def reject_submission(
    submission_id: int,
    request: RejectionRequest,
) -> dict[str, int | str | dict[str, int | str]]:
    """บันทึกการตีกลับและส่งเหตุผลเข้าคิวจำลอง UC-01 ตาม FR-VDC-06 และ IF-UC01-01."""
    result = rejection_service.reject(
        submission_id,
        request.reviewer_user_id,
        request.reason_text,
    )
    if result is None:
        raise HTTPException(status_code=404, detail="ไม่พบเอกสารโครงการ")
    decision, message = result

    return {
        "decision_id": decision.decision_id,
        "submission_id": decision.submission_id,
        "reviewer_user_id": decision.reviewer_user_id,
        "decision_type": decision.decision_type,
        "decided_at": decision.decided_at.isoformat(),
        "status": RETURNED_STATUS,
        "reason_text": message.reason_text,
        "notification": {
            "target_user_id": message.target_user_id,
            "target_use_case": message.target_use_case,
            "status": "queued",
            "reason_text": message.reason_text,
        },
    }
