from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, Integer
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class ChecklistBase(DeclarativeBase):
    pass


class ChecklistRule(ChecklistBase):
    """เก็บ Checklist กลางแต่ละเวอร์ชันตาม FR-VDC-07 และ IF-CHK-02."""

    __tablename__ = "checklist_rules"

    checklist_rule_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
    )
    is_current: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    item_versions: Mapped[list["ChecklistItemVersion"]] = relationship(
        back_populates="checklist_rule",
        cascade="all, delete-orphan",
    )
