from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from .activity import Base


class SubmissionTemplateConfig(Base):
    """เก็บ template ID/เวอร์ชันและสถานะพร้อมใช้ตาม FR-SBH-03, IF-TPL-01 และ ASM-04."""

    __tablename__ = "submission_template_configs"

    template_id: Mapped[str] = mapped_column(String, primary_key=True)
    version: Mapped[str] = mapped_column(String, primary_key=True)
    active_flag: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    uploaded_by: Mapped[str] = mapped_column(String, nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
    )
