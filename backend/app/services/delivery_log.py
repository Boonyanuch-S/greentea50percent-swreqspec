from datetime import datetime

from sqlalchemy.orm import Session

from ..models.email_delivery_attempt import EmailDeliveryAttempt


class DeliveryLog:
    """ตัวบันทึกผลความพยายามส่งอีเมลตาม FR-NOTI-04."""

    @staticmethod
    def record_attempt(
        session: Session,
        request_id: str,
        attempt_number: int,
        started_at: datetime,
        finished_at: datetime,
        delivery_result: str,
        error_detail: str | None = None,
    ) -> EmailDeliveryAttempt:
        attempt = EmailDeliveryAttempt(
            request_id=request_id,
            attempt_number=attempt_number,
            started_at=started_at,
            finished_at=finished_at,
            delivery_result=delivery_result,
            error_detail=error_detail,
        )
        session.add(attempt)
        return attempt
