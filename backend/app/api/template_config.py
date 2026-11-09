from collections.abc import Generator

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..middleware.auth import require_authenticated_context
from ..models.template_config import SubmissionTemplateConfig
from ..services.template_registry import TemplateRegistry


template_config_router = APIRouter(tags=["template-config"])


class TemplateConfigResponse(BaseModel):
    """ข้อมูล template ที่พร้อมใช้ตาม IF-TPL-01 และ ASM-04."""

    template_id: str
    version: str


def get_template_session(request: Request) -> Generator[Session, None, None]:
    """รับ SQLAlchemy session ของ config จาก app wiring ตาม IF-TPL-01."""
    session = getattr(request.app.state, "template_session", None)
    if session is None:
        raise HTTPException(status_code=503, detail="ยังไม่มีแหล่งข้อมูล template")
    yield session


@template_config_router.get(
    "/config/templates",
    response_model=list[TemplateConfigResponse],
    dependencies=[Depends(require_authenticated_context)],
)
def list_ready_templates(
    session: Session = Depends(get_template_session),
) -> list[SubmissionTemplateConfig]:
    """คืน template ที่พร้อมใช้ให้ผู้ใช้ที่ยืนยันตัวตนแล้วตาม IF-TPL-01."""
    return TemplateRegistry.list_ready_templates(session)
