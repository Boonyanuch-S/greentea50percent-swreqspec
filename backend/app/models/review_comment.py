from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class ReviewComment:
    """คอมเมนต์รายละเอียดที่ต้องแก้ไขจากกองกิจ ตาม FR-APR-06 และ ASM-02."""

    id: int
    approval_id: str
    author_id: str
    comment_text: str
    created_at: datetime
    resolved_at: datetime | None = None
