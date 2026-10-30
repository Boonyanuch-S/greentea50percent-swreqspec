from collections.abc import Generator

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from ..middleware.auth import require_authenticated_user
from ..models.checklist_item import ChecklistBase
from ..services.checklist_service import ChecklistService
from ..services.project_review_service import ChecklistEvaluation


# ใช้ฐานข้อมูลจำลองร่วมกันใน process สำหรับ API Checklist ตาม FR-VDC-07 และ IF-CHK-02
checklist_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
ChecklistBase.metadata.create_all(checklist_engine)
ChecklistSession = sessionmaker(
    bind=checklist_engine,
    autoflush=False,
    expire_on_commit=False,
)

# บังคับ Login ก่อนเข้าถึง Checklist ตาม CON-NFR-21 และ NFR-SEC-01
checklist_router = APIRouter(
    dependencies=[Depends(require_authenticated_user)],
)


class ChecklistItemRequest(BaseModel):
    """ข้อมูลรายการ Checklist ที่ผู้ตรวจเพิ่มหรือแก้ไข ตาม FR-VDC-07."""

    item_name: str


def get_checklist_session() -> Generator[Session, None, None]:
    """เปิด session ให้ endpoint ใช้ฐานข้อมูล Checklist จำลอง ตาม FR-VDC-07."""
    with ChecklistSession() as session:
        yield session


from .submissions import submissions_router

checklist_router.include_router(submissions_router)


def _item_response(item) -> dict[str, int | str]:
    """แปลงรายการ Checklist เวอร์ชันล่าสุดเป็นผล API ตาม FR-VDC-07 และ IF-CHK-02."""
    return {
        "checklist_item_id": item.checklist_item_id,
        "item_name": item.item_name,
    }


@checklist_router.get("/checklists/latest")
def get_latest_checklist(
    session: Session = Depends(get_checklist_session),
) -> dict[str, int | list[dict[str, int | str]] | None]:
    """คืนรายการจาก Checklist กลางฉบับล่าสุด ตาม FR-VDC-07 และ IF-CHK-02."""
    rule = ChecklistService.latest_rule(session)
    items = ChecklistService.latest_items(session)
    return {
        "version": rule.version if rule else None,
        "items": [_item_response(item) for item in items],
    }


@checklist_router.post("/checklists/items", status_code=201)
def add_checklist_item(
    request: ChecklistItemRequest,
    session: Session = Depends(get_checklist_session),
) -> dict[str, int | str]:
    """เพิ่มรายการลงใน Checklist กลางฉบับล่าสุด ตาม FR-VDC-07 และ IF-CHK-02."""
    item = ChecklistService.add_item(session, request.item_name)
    session.commit()
    return _item_response(item)


@checklist_router.patch("/checklists/items/{item_id}")
def rename_checklist_item(
    item_id: int,
    request: ChecklistItemRequest,
    session: Session = Depends(get_checklist_session),
) -> dict[str, int | str]:
    """แก้ชื่อรายการโดยคง identity และสร้างเวอร์ชันล่าสุด ตาม FR-VDC-07, IF-CHK-02 และ ASM-03."""
    item = ChecklistService.rename_item(session, item_id, request.item_name)
    if item is None:
        raise HTTPException(status_code=404, detail="ไม่พบรายการ Checklist ในฉบับล่าสุด")
    session.commit()
    return _item_response(item)
