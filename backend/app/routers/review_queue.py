from fastapi import APIRouter, Depends, HTTPException

from ..middleware.auth import require_authenticated_user
from ..services.review_queue_service import ReviewQueueService


# บังคับ Login ก่อนเข้าคิวและรายละเอียดเอกสารตาม CON-NFR-21 และ NFR-SEC-01
review_queue_router = APIRouter(
    dependencies=[Depends(require_authenticated_user)],
)

review_queue_service = ReviewQueueService()


def _submission_response(submission):
    return {
        "submission_id": submission.submission_id,
        "project_id": submission.project_id,
        "submitted_at": submission.submitted_at,
        "sender_user_id": submission.sender_user_id,
        "status": submission.status,
        "review_queue_order": submission.review_queue_order,
        "project_name": submission.project_name,
        "project_owner": submission.project_owner,
        "summary": submission.summary,
        "document_url": submission.document_url,
        "created_at": submission.created_at,
        "current_status": submission.current_status,
    }


@review_queue_router.get("/review-queue")
def get_review_queue():
    """คืนคิวเอกสารเรียงตามวันที่ส่ง รองรับ FR-VDC-01."""
    return [_submission_response(item) for item in review_queue_service.list_pending()]


@review_queue_router.get("/submissions/{submission_id}")
def get_submission(submission_id: int):
    """คืนรายละเอียดเอกสารที่เลือก รองรับ FR-VDC-02."""
    submission = review_queue_service.get_submission(submission_id)
    if submission is None:
        raise HTTPException(status_code=404, detail="ไม่พบเอกสารโครงการ")
    return _submission_response(submission)
