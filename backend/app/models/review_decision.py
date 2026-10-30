from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class ReviewDecision:
    """คำตัดสินอนุมัติหรือตีกลับ ตาม FR-VDC-05, FR-VDC-06, IF-UC05-01 และ IF-UC01-01."""

    decision_id: int
    submission_id: int
    reviewer_user_id: str
    decision_type: str
    reason_text: str | None
    decided_at: datetime
