from dataclasses import dataclass
from datetime import datetime, timezone

UC10_USE_CASE = "UC-10"
QUEUED_DELIVERY_STATUS = "queued"


@dataclass(frozen=True)
class UC10NotificationRequest:
    """คำขอเรียก UC-10 หลังบันทึกชั่วโมงสำเร็จตาม FR-HRS-05."""

    notification_id: int
    document_id: int
    target_use_case: str
    requested_at: datetime
    delivery_status: str


class UC10NotificationClient:
    """ส่งคำขอแจ้งยืนยันไปยัง UC-10 โดยไม่กำหนดเนื้อหาหรือช่องทางตาม FR-HRS-05."""

    def __init__(self) -> None:
        self._requests: list[UC10NotificationRequest] = []

    def request_confirmation(self, document_id: int) -> UC10NotificationRequest:
        """บันทึกคำขอเรียก UC-10 หลัง REG success ตาม FR-HRS-05."""
        request = UC10NotificationRequest(
            notification_id=len(self._requests) + 1,
            document_id=document_id,
            target_use_case=UC10_USE_CASE,
            requested_at=datetime.now(timezone.utc),
            delivery_status=QUEUED_DELIVERY_STATUS,
        )
        self._requests.append(request)
        return request

    def list_requests(self) -> list[UC10NotificationRequest]:
        """คืนคำขอ UC-10 ที่ client บันทึกไว้ตาม FR-HRS-05."""
        return list(self._requests)
