from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from backend.app.models.checklist_item import ChecklistItemVersion
from backend.app.models.checklist_rule import ChecklistBase, ChecklistRule
from backend.app.services.checklist_service import ChecklistService


def test_AC_VDC_05_checklist_versions_keep_stable_item_id():
    # Given มี Checklist กลางหนึ่งฉบับพร้อมรายการที่มีผลตรวจเดิม
    engine = create_engine("sqlite:///:memory:")
    ChecklistBase.metadata.create_all(engine)

    with Session(engine) as session:
        original_item = ChecklistService.add_item(session, "เอกสารประกอบ")
        original_item_id = original_item.checklist_item_id
        original_rule_id = original_item.checklist_rule_id

        # When เจ้าหน้าที่แก้ชื่อรายการใน Checklist กลาง
        renamed_item = ChecklistService.rename_item(
            session,
            original_item_id,
            "เอกสารประกอบฉบับแก้ไข",
        )

        # Then มีเวอร์ชันล่าสุดที่ใช้ item ID เดิม และเก็บชื่อเดิมในเวอร์ชันก่อนหน้า
        assert renamed_item is not None
        assert renamed_item.checklist_item_id == original_item_id
        assert renamed_item.item_name == "เอกสารประกอบฉบับแก้ไข"
        assert original_item.item_name == "เอกสารประกอบ"
        assert original_item.checklist_rule_id == original_rule_id

        previous_rule = session.get(ChecklistRule, original_rule_id)
        latest_rule = ChecklistService.latest_rule(session)
        assert previous_rule is not None and not previous_rule.is_current
        assert latest_rule is not None and latest_rule.is_current
        assert latest_rule.version == previous_rule.version + 1

        latest_item = session.scalar(
            select(ChecklistItemVersion).where(
                ChecklistItemVersion.checklist_rule_id == latest_rule.checklist_rule_id,
                ChecklistItemVersion.checklist_item_id == original_item_id,
            )
        )
        assert latest_item is not None
        assert latest_item.item_name == "เอกสารประกอบฉบับแก้ไข"
