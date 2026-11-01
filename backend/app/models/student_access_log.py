from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from .activity import Base


class StudentAccessLog(Base):
    """บันทึกผู้เข้าถึง เวลา และรายการข้อมูลตาม DOM-PDPA-01, NFR-SEC-02 และ AC-HRS-09."""

    __tablename__ = "student_access_logs"

    log_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    accessor_id: Mapped[str] = mapped_column(String, nullable=False)
    accessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    access_item: Mapped[str] = mapped_column(String, nullable=False)
