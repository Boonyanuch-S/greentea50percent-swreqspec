from datetime import datetime, timezone

from ..models.notification_request import NotificationRequest

UC10_USE_CASE = "UC-10"
QUEUED_DELIVERY_STATUS = "queued"


class UC10Integration:
    """เรียก UC-10 แบบจำลองและบันทึกคำขอ ตาม FR-APR-05 และ IF-UC10-01 เนื้อหาอีเมลเป็นงานของ UC-10."""

    def __init__(self) -> None:
        self._requests: dict[str, NotificationRequest] = {}

    def request_notification(self, approval_id: str) -> NotificationRequest:
        """คืนคำขอเดิมถ้าเคยเรียกแล้ว เพื่อไม่ให้กรรมการสโมสรถูกแจ้งซ้ำตาม IF-UC10-01."""
        request = self._requests.get(approval_id)
        if request is None:
            request = NotificationRequest(
                id=len(self._requests) + 1,
                approval_id=approval_id,
                target_use_case=UC10_USE_CASE,
                requested_at=datetime.now(timezone.utc),
                delivery_status=QUEUED_DELIVERY_STATUS,
            )
            self._requests[approval_id] = request
        return request

    def list_requests(self) -> list[NotificationRequest]:
        return list(self._requests.values())
