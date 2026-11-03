from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.models.checklist_item import ChecklistBase
from backend.app.services.checklist_service import (
    STARTER_CHECKLIST_ITEMS,
    ChecklistService,
)


def _new_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    ChecklistBase.metadata.create_all(engine)
    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)()


def test_AC_VDC_05_starter_items_become_first_version_in_order():
    # Given Checklist กลางยังว่าง
    session = _new_session()

    # When ระบบใส่รายการเริ่มต้น
    ChecklistService.seed_if_empty(session, STARTER_CHECKLIST_ITEMS)

    # Then ทุกคนเห็นรายการเริ่มต้นเป็นฉบับแรกตามลำดับ
    assert ChecklistService.latest_rule(session).version == 1
    assert tuple(
        item.item_name for item in ChecklistService.latest_items(session)
    ) == STARTER_CHECKLIST_ITEMS


def test_AC_VDC_05_starter_items_can_be_renamed_and_are_not_reseeded():
    # Given เจ้าหน้าที่แก้ชื่อรายการเริ่มต้นให้ตรงกับที่เรียกจริง
    session = _new_session()
    ChecklistService.seed_if_empty(session, STARTER_CHECKLIST_ITEMS)
    first_item = ChecklistService.latest_items(session)[0]
    ChecklistService.rename_item(session, first_item.checklist_item_id, "บันทึกข้อความขออนุมัติ")

    # When ระบบเรียกใส่รายการเริ่มต้นอีกครั้ง
    ChecklistService.seed_if_empty(session, STARTER_CHECKLIST_ITEMS)

    # Then ชื่อที่แก้ยังอยู่และไม่เกิดรายการซ้ำ
    items = ChecklistService.latest_items(session)
    assert items[0].item_name == "บันทึกข้อความขออนุมัติ"
    assert len(items) == len(STARTER_CHECKLIST_ITEMS)
