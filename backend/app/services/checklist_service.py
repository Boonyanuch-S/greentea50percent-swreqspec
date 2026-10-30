from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models.checklist_item import ChecklistItem, ChecklistItemVersion
from ..models.checklist_rule import ChecklistRule


class ChecklistService:
    """จัดการ Checklist กลางฉบับล่าสุดโดยคง identity ของรายการ ตาม FR-VDC-07 และ IF-CHK-02."""

    @staticmethod
    def latest_rule(session: Session) -> ChecklistRule | None:
        """คืน Checklist กลางฉบับล่าสุด ตาม IF-CHK-02."""
        return session.scalar(
            select(ChecklistRule)
            .where(ChecklistRule.is_current.is_(True))
            .order_by(ChecklistRule.version.desc())
        )

    @staticmethod
    def latest_items(session: Session) -> list[ChecklistItemVersion]:
        """คืนรายการจาก Checklist กลางฉบับล่าสุด ตาม FR-VDC-07 และ IF-CHK-02."""
        rule = ChecklistService.latest_rule(session)
        if rule is None:
            return []
        return list(
            session.scalars(
                select(ChecklistItemVersion).where(
                    ChecklistItemVersion.checklist_rule_id == rule.checklist_rule_id
                )
            )
        )

    @staticmethod
    def add_item(session: Session, item_name: str) -> ChecklistItemVersion:
        """เพิ่มรายการด้วยการสร้าง Checklist เวอร์ชันล่าสุดใหม่ ตาม FR-VDC-07 และ IF-CHK-02."""
        current_rule = ChecklistService.latest_rule(session)
        previous_items = ChecklistService.latest_items(session)
        new_rule = ChecklistService._create_next_rule(
            session,
            current_rule,
            previous_items,
        )
        item = ChecklistItem()
        session.add(item)
        session.flush()
        new_item = ChecklistItemVersion(
            checklist_item_id=item.checklist_item_id,
            checklist_rule_id=new_rule.checklist_rule_id,
            item_name=item_name,
        )
        session.add(new_item)
        session.flush()
        return new_item

    @staticmethod
    def rename_item(
        session: Session,
        checklist_item_id: int,
        item_name: str,
    ) -> ChecklistItemVersion | None:
        """แก้ชื่อโดยใช้ identity เดิมและสร้างเวอร์ชันใหม่ ตาม FR-VDC-07 และ ASM-03."""
        current_rule = ChecklistService.latest_rule(session)
        if current_rule is None:
            return None

        previous_items = ChecklistService.latest_items(session)
        if not any(item.checklist_item_id == checklist_item_id for item in previous_items):
            return None

        new_rule = ChecklistService._create_next_rule(
            session,
            current_rule,
            previous_items,
            renamed_item=(checklist_item_id, item_name),
        )
        return session.scalar(
            select(ChecklistItemVersion).where(
                ChecklistItemVersion.checklist_rule_id == new_rule.checklist_rule_id,
                ChecklistItemVersion.checklist_item_id == checklist_item_id,
            )
        )

    @staticmethod
    def _create_next_rule(
        session: Session,
        current_rule: ChecklistRule | None,
        previous_items: list[ChecklistItemVersion],
        renamed_item: tuple[int, str] | None = None,
    ) -> ChecklistRule:
        if current_rule is not None:
            current_rule.is_current = False

        new_rule = ChecklistRule(
            version=(current_rule.version + 1) if current_rule else 1,
            is_current=True,
        )
        session.add(new_rule)
        session.flush()

        for item in previous_items:
            item_name = item.item_name
            if renamed_item and item.checklist_item_id == renamed_item[0]:
                item_name = renamed_item[1]
            session.add(
                ChecklistItemVersion(
                    checklist_item_id=item.checklist_item_id,
                    checklist_rule_id=new_rule.checklist_rule_id,
                    item_name=item_name,
                )
            )
        session.flush()
        return new_rule
