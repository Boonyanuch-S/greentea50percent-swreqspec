from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class NotificationRequest:
    """คำขอแจ้งกรรมการสโมสรผ่าน UC-10 ตาม FR-APR-05 และ IF-UC10-01."""

    id: int
    approval_id: str
    target_use_case: str
    requested_at: datetime
    delivery_status: str
