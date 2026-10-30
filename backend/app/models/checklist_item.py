from sqlalchemy import ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .checklist_rule import ChecklistBase, ChecklistRule


class ChecklistItem(ChecklistBase):
    """เก็บ stable identity ของรายการ Checklist ตาม FR-VDC-07 และ ASM-03."""

    __tablename__ = "checklist_items"

    checklist_item_id: Mapped[int] = mapped_column(Integer, primary_key=True)

    versions: Mapped[list["ChecklistItemVersion"]] = relationship(
        back_populates="checklist_item",
    )


class ChecklistItemVersion(ChecklistBase):
    """เก็บชื่อรายการแยกตามเวอร์ชัน Checklist ตาม FR-VDC-07 และ IF-CHK-02."""

    __tablename__ = "checklist_item_versions"
    __table_args__ = (
        UniqueConstraint(
            "checklist_item_id",
            "checklist_rule_id",
            name="uq_checklist_item_rule",
        ),
    )

    checklist_item_version_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    checklist_item_id: Mapped[int] = mapped_column(
        ForeignKey("checklist_items.checklist_item_id"),
        nullable=False,
    )
    checklist_rule_id: Mapped[int] = mapped_column(
        ForeignKey("checklist_rules.checklist_rule_id"),
        nullable=False,
    )
    item_name: Mapped[str] = mapped_column(String, nullable=False)

    checklist_item: Mapped[ChecklistItem] = relationship(back_populates="versions")
    checklist_rule: Mapped[ChecklistRule] = relationship(back_populates="item_versions")
