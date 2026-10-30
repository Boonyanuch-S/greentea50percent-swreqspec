from dataclasses import dataclass
from datetime import datetime, timezone

from ..models.project_submission import ProjectSubmission
from ..models.review_decision import ReviewDecision
from .approval_service import review_decision_lock
from .review_queue_service import ReviewQueueService

RETURNED_STATUS = "ตีกลับให้แก้ไข"


@dataclass(frozen=True)
class UC01ReturnMessage:
    """ข้อมูลเหตุผลที่ส่งเข้าคิวจำลอง UC-01 ตาม FR-VDC-06 และ IF-UC01-01."""

    submission_id: int
    target_user_id: str
    target_use_case: str
    reason_text: str


class RejectionService:
    """บันทึกการตีกลับและส่งเหตุผลเข้าคิวจำลอง UC-01 ตาม FR-VDC-06 และ IF-UC01-01."""

    def __init__(self, review_queue: ReviewQueueService) -> None:
        self._review_queue = review_queue
        self._decisions: list[ReviewDecision] = []
        self._member_messages: list[UC01ReturnMessage] = []
        self._next_decision_id = 1

    def reject(
        self,
        submission_id: int,
        reviewer_user_id: str,
        reason_text: str,
    ) -> tuple[ReviewDecision, UC01ReturnMessage] | None:
        """บันทึกคำตัดสิน เปลี่ยนสถานะ และส่งเหตุผลเข้าคิวจำลอง UC-01 ตาม FR-VDC-06 และ IF-UC01-01."""
        with review_decision_lock:
            submission = self._review_queue.get_submission(submission_id)
            if submission is None:
                return None

            decision = ReviewDecision(
                decision_id=self._next_decision_id,
                submission_id=submission_id,
                reviewer_user_id=reviewer_user_id,
                decision_type="reject",
                reason_text=reason_text,
                decided_at=datetime.now(timezone.utc),
            )
            self._next_decision_id += 1
            message = UC01ReturnMessage(
                submission_id=submission_id,
                target_user_id=submission.sender_user_id,
                target_use_case="UC-01",
                reason_text=reason_text,
            )
            submission.status = RETURNED_STATUS
            submission.current_status = RETURNED_STATUS
            self._decisions = [
                existing
                for existing in self._decisions
                if existing.submission_id != submission_id
            ]
            self._member_messages = [
                existing
                for existing in self._member_messages
                if existing.submission_id != submission_id
            ]
            self._decisions.append(decision)
            self._member_messages.append(message)
            return decision, message

    def list_decisions(self) -> list[ReviewDecision]:
        """คืนคำตัดสินที่เก็บใน mock store ตาม FR-VDC-06."""
        with review_decision_lock:
            return [
                decision
                for decision in self._decisions
                if (
                    submission := self._review_queue.get_submission(
                        decision.submission_id
                    )
                )
                is not None
                and submission.status == RETURNED_STATUS
            ]

    def list_member_messages(self) -> list[UC01ReturnMessage]:
        """คืนเหตุผลที่ส่งเข้าคิวจำลอง UC-01 ตาม IF-UC01-01."""
        with review_decision_lock:
            return [
                message
                for message in self._member_messages
                if (
                    submission := self._review_queue.get_submission(
                        message.submission_id
                    )
                )
                is not None
                and submission.status == RETURNED_STATUS
            ]
