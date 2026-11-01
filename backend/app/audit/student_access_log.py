from datetime import datetime, timezone

from sqlalchemy.orm import Session

from ..models.student_access_log import StudentAccessLog


def record_student_access(
    session: Session,
    accessor_id: str,
    access_item: str,
) -> StudentAccessLog:
    """บันทึกการเข้าถึงข้อมูลนักศึกษาตาม DOM-PDPA-01, NFR-SEC-02 และ AC-HRS-09."""
    access_log = StudentAccessLog(
        accessor_id=accessor_id,
        accessed_at=datetime.now(timezone.utc),
        access_item=access_item,
    )
    session.add(access_log)
    return access_log
