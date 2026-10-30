from datetime import datetime, timezone
from threading import RLock

from ..models.notification_message import NotificationMessage
from ..models.project_submission import ProjectSubmission
from ..models.review_decision import ReviewDecision
from .review_queue_service import ReviewQueueService

FORWARDED_STATUS = "ส่งต่ออาจารย์"
# Serialize decisions across both review services in this in-process prototype.
review_decision_lock = RLock()


class ApprovalService:
    """บันทึกการอนุมัติและส่งต่อเอกสารเข้า mock queue ของ UC-05 ตาม FR-VDC-05 และ IF-UC05-01."""

    def __init__(self, review_queue: ReviewQueueService) -> None:
        self._review_queue = review_queue
        self._decisions: list[ReviewDecision] = []
        self._advisor_handoffs: list[ProjectSubmission] = []
        self._club_notifications: dict[int, NotificationMessage] = {}
        self._next_decision_id = 1
        self._next_notification_id = 1

    def approve(
        self,
        submission_id: int,
        reviewer_user_id: str,
    ) -> ReviewDecision | None:
        """บันทึกคำตัดสินและส่งต่อเอกสารเข้า mock queue ของ UC-05 ตาม FR-VDC-05 และ IF-UC05-01."""
        with review_decision_lock:
            submission = self._review_queue.get_submission(submission_id)
            if submission is None:
                return None

            decision = ReviewDecision(
                decision_id=self._next_decision_id,
                submission_id=submission_id,
                reviewer_user_id=reviewer_user_id,
                decision_type="approve",
                reason_text=None,
                decided_at=datetime.now(timezone.utc),
            )
            self._next_decision_id += 1
            submission.status = FORWARDED_STATUS
            submission.current_status = FORWARDED_STATUS
            self._decisions = [
                existing
                for existing in self._decisions
                if existing.submission_id != submission_id
            ]
            self._advisor_handoffs = [
                existing
                for existing in self._advisor_handoffs
                if existing.submission_id != submission_id
            ]
            self._club_notifications[submission_id] = NotificationMessage(
                notification_id=self._next_notification_id,
                target_user_id=submission.sender_user_id,
                target_case="UC-01",
                message="โครงการได้รับอนุมัติแล้ว",
                sent_at=decision.decided_at,
            )
            self._next_notification_id += 1
            self._decisions.append(decision)
            self._advisor_handoffs.append(submission)
            return decision

    def list_decisions(self) -> list[ReviewDecision]:
        """คืนคำตัดสินที่เก็บใน mock store ตาม FR-VDC-05."""
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
                and submission.status == FORWARDED_STATUS
            ]

    def list_advisor_handoffs(self) -> list[ProjectSubmission]:
        """คืนรายการเอกสารที่ส่งเข้า mock queue ของ UC-05 ตาม IF-UC05-01."""
        with review_decision_lock:
            return [
                submission
                for submission in self._advisor_handoffs
                if submission.status == FORWARDED_STATUS
            ]

    def list_club_notifications(self) -> list[NotificationMessage]:
        """คืนข้อความแจ้งอนุมัติที่บันทึกแบบ synchronous ตาม FR-VDC-05 และ IF-UC05-01."""
        with review_decision_lock:
            return [
                notification
                for submission_id, notification in self._club_notifications.items()
                if (
                    submission := self._review_queue.get_submission(submission_id)
                )
                is not None
                and submission.status == FORWARDED_STATUS
            ]
