from datetime import date

from sqlalchemy import Date, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, synonym


class Base(DeclarativeBase):
    pass


class Activity(Base):
    """โมเดลกิจกรรมสำหรับ FR-LATE-01, FR-SBH-01, FR-SBH-02, FR-HRS-03, ASM-01 และ ASM-05."""

    __tablename__ = "activities"

    activity_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    owner_user_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    activity_name: Mapped[str] = mapped_column("name", String, nullable=False)
    name = synonym("activity_name")
    end_date: Mapped[date] = mapped_column("activity_date", Date, nullable=False)
    activity_date = synonym("end_date")
    regular_submission_deadline: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str | None] = mapped_column(String, nullable=True)
    project_number_status: Mapped[str | None] = mapped_column(String, nullable=True)
    category_template_id: Mapped[str | None] = mapped_column(String, nullable=True)
    academic_year: Mapped[str | None] = mapped_column(String, nullable=True)
