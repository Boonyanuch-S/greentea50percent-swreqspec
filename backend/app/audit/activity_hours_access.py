from sqlalchemy.orm import Session

from ..models.authenticated_user_context import AuthenticatedUserContext
from .student_access_log import record_student_access


def record_activity_hours_access(
    session: Session,
    user_context: AuthenticatedUserContext,
    access_item: str,
) -> None:
    """บันทึก access context ของชั่วโมงกิจกรรมตาม DOM-PDPA-01 และ NFR-SEC-02."""
    record_student_access(
        session,
        accessor_id=user_context.user_id,
        access_item=access_item,
    )
    session.commit()
