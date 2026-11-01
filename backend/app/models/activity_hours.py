from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .activity import Base


class ActivityHourDocument(Base):
    """โมเดลเอกสารชั่วโมงกิจกรรมตาม FR-HRS-01, FR-HRS-04, FR-HRS-06 และ IF-XLS-01."""

    __tablename__ = "activity_hour_documents"

    document_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    activity_id: Mapped[int] = mapped_column(
        ForeignKey("activities.activity_id"),
        nullable=False,
        index=True,
    )
    source_file_reference: Mapped[str] = mapped_column(String, nullable=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)
    returned_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )


class ActivityParticipantHour(Base):
    """โมเดลรายการชั่วโมงผู้เข้าร่วมตาม FR-HRS-02, FR-HRS-03, FR-HRS-06 และ IF-XLS-01."""

    __tablename__ = "activity_participant_hours"

    item_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    document_id: Mapped[int] = mapped_column(
        ForeignKey("activity_hour_documents.document_id"),
        nullable=False,
        index=True,
    )
    student_reference: Mapped[str] = mapped_column(String, nullable=False)
    participant_name: Mapped[str] = mapped_column(String, nullable=False)
    reported_hour_type: Mapped[str] = mapped_column(String, nullable=False)
    reported_hours: Mapped[Decimal] = mapped_column(Numeric, nullable=False)
    validation_status: Mapped[str | None] = mapped_column(String, nullable=True)
    validation_message: Mapped[str | None] = mapped_column(Text, nullable=True)
