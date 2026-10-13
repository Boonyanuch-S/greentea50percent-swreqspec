from datetime import date

from sqlalchemy import Date, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Activity(Base):
    """โมเดลกิจกรรมที่ใช้แสดงรายการเลยกำหนดตาม FR-LATE-01."""

    __tablename__ = "activities"

    activity_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    owner_user_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    activity_date: Mapped[date] = mapped_column(Date, nullable=False)
    regular_submission_deadline: Mapped[date] = mapped_column(Date, nullable=False)
