from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from .activity import Activity, Base


class ActivityParticipant(Base):
    """โมเดลผู้เข้าร่วมกิจกรรมตาม FR-SBH-02."""

    __tablename__ = "activity_participants"

    participant_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    activity_id: Mapped[int] = mapped_column(
        ForeignKey("activities.activity_id"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[str] = mapped_column(String, nullable=False)
    role_type: Mapped[str] = mapped_column(String, nullable=False)


class ActivityStaff(Base):
    """โมเดลเจ้าหน้าที่กิจกรรมตาม FR-SBH-02."""

    __tablename__ = "activity_staff"

    staff_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    activity_id: Mapped[int] = mapped_column(
        ForeignKey("activities.activity_id"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[str] = mapped_column(String, nullable=False)
    role_type: Mapped[str] = mapped_column(String, nullable=False)


class ActivityHourType(Base):
    """โมเดลประเภทชั่วโมงที่ผูกระดับกิจกรรมตาม FR-SBH-02 และ ASM-05."""

    __tablename__ = "activity_hour_types"

    hour_type_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    activity_id: Mapped[int] = mapped_column(
        ForeignKey("activities.activity_id"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    code: Mapped[str] = mapped_column(String, nullable=False)


class ProjectNumberStatus(Base):
    """โมเดลสถานะเลขสรุปโครงการจาก UC-04 ตาม FR-SBH-06 และ IF-PRJNUM-01."""

    __tablename__ = "project_number_statuses"

    project_number_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    activity_id: Mapped[int] = mapped_column(
        ForeignKey("activities.activity_id"),
        nullable=False,
        index=True,
    )
    status: Mapped[str] = mapped_column(String, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class HoursSubmission(Base):
    """โมเดลรายการส่งชั่วโมงตาม FR-SBH-05 และ FR-SBH-06."""

    __tablename__ = "hours_submissions"

    submission_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    activity_id: Mapped[int] = mapped_column(
        ForeignKey("activities.activity_id"),
        nullable=False,
        index=True,
    )
    generated_file_ref: Mapped[str] = mapped_column(String, nullable=False)
    created_by: Mapped[str] = mapped_column(String, nullable=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)


class ReviewQueueEntry(Base):
    """โมเดลรายการเข้าคิว UC-07 ตาม FR-SBH-05 และ IF-UC07-01."""

    __tablename__ = "review_queue_entries"

    queue_entry_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    submission_id: Mapped[int] = mapped_column(
        ForeignKey("hours_submissions.submission_id"),
        nullable=False,
        index=True,
    )
    reviewer_group: Mapped[str] = mapped_column(String, nullable=False)
    queue_status: Mapped[str] = mapped_column(String, nullable=False)
