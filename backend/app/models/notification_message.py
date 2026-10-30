from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class NotificationMessage:
    """ข้อความแจ้งผลที่บันทึกแบบ synchronous ใน mock integration ตาม FR-VDC-05 และ IF-UC05-01."""

    notification_id: int
    target_user_id: str
    target_case: str
    message: str
    sent_at: datetime
