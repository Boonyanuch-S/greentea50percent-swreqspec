from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .activity import Base


class HourCriteria(Base):
    """โมเดลเกณฑ์ชั่วโมงตาม FR-HRS-03, ASM-01 และ ASM-02."""

    __tablename__ = "hour_criteria"

    criteria_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    academic_year: Mapped[str] = mapped_column(String, nullable=False)
    hour_type: Mapped[str] = mapped_column(String, nullable=False)
    criteria_definition: Mapped[str] = mapped_column(Text, nullable=False)
    active_status: Mapped[bool] = mapped_column(Boolean, nullable=False)
