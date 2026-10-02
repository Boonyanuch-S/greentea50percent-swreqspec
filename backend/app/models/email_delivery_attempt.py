from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class EmailDeliveryAttempt(Base):
    """บันทึกความพยายามส่งอีเมลทุกครั้งตาม FR-NOTI-04."""

    __tablename__ = "email_delivery_attempts"

    request_id: Mapped[str] = mapped_column(String, primary_key=True)
    attempt_number: Mapped[int] = mapped_column(Integer, primary_key=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    finished_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    delivery_result: Mapped[str] = mapped_column(String, nullable=False)
    error_detail: Mapped[str | None] = mapped_column(Text, nullable=True)
