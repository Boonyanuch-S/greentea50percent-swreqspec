from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models.template_config import SubmissionTemplateConfig


class TemplateRegistry:
    """อ่าน template ที่พร้อมใช้จาก config ตาม FR-SBH-03, IF-TPL-01 และ ASM-04."""

    @staticmethod
    def list_ready_templates(session: Session) -> list[SubmissionTemplateConfig]:
        """คืนเฉพาะ template ที่เปิดใช้งานจาก registry โดยไม่กำหนด ID หรือเวอร์ชันในโค้ด."""
        statement = (
            select(SubmissionTemplateConfig)
            .where(SubmissionTemplateConfig.active_flag.is_(True))
            .order_by(
                SubmissionTemplateConfig.template_id,
                SubmissionTemplateConfig.version,
            )
        )
        return list(session.scalars(statement).all())
