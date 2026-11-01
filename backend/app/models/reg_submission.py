from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .activity import Base


@dataclass(frozen=True)
class RegParticipantHour:
    """รายการชั่วโมงที่ส่งให้ REG ตาม IF-REG-01 และ FR-HRS-04."""

    student_reference: str
    reported_hour_type: str
    reported_hours: Decimal

    def to_dict(self) -> dict[str, str]:
        """แปลงชั่วโมงเป็นข้อความเพื่อรักษาค่าทศนิยมใน payload ตาม IF-REG-01."""
        return {
            "student_reference": self.student_reference,
            "reported_hour_type": self.reported_hour_type,
            "reported_hours": str(self.reported_hours),
        }


@dataclass(frozen=True)
class RegSubmissionPayload:
    """ข้อมูลชั่วโมงระดับแอปที่ส่งผ่าน client ไป REG ตาม IF-REG-01 และ FR-HRS-04."""

    document_id: int
    participant_hours: tuple[RegParticipantHour, ...]

    def to_dict(self) -> dict[str, object]:
        """สร้าง payload จากรายการชั่วโมงโดยไม่กำหนด wire format ของ REG ตาม IF-REG-01."""
        return {
            "document_id": self.document_id,
            "participant_hours": [item.to_dict() for item in self.participant_hours],
        }


@dataclass(frozen=True)
class RegClientResponse:
    """ผลตอบกลับจาก transport ของ REG ตาม IF-REG-01 และ FR-HRS-04."""

    response_status: str
    error_message: str | None = None


class RegSubmission(Base):
    """โมเดลบันทึกคำขอและผลตอบกลับ REG ตาม IF-REG-01 และ FR-HRS-04."""

    __tablename__ = "reg_submissions"

    submission_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    document_id: Mapped[int] = mapped_column(
        ForeignKey("activity_hour_documents.document_id"),
        nullable=False,
        index=True,
    )
    submitted_data: Mapped[dict[str, object]] = mapped_column(JSON, nullable=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    response_status: Mapped[str] = mapped_column(String, nullable=False)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    last_attempt_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    attempt_count: Mapped[int] = mapped_column(Integer, nullable=False)
