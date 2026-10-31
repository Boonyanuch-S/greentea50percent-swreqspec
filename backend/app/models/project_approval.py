from dataclasses import dataclass
from datetime import datetime

PENDING_STATUS = "รออนุมัติ"
COMPLETED_STATUS = "อนุมัติสมบูรณ์"


@dataclass
class ProjectApproval:
    """สถานะการอนุมัติเอกสารทั้งชุด ตาม FR-APR-03, FR-APR-04, FR-APR-05, ASM-01 และ ASM-02."""

    id: str
    project_id: int
    project_name: str
    status: str
    created_at: datetime
    updated_at: datetime
    content_approved_at: datetime | None = None
    completed_at: datetime | None = None


@dataclass(frozen=True)
class ProjectDocumentItem:
    """เอกสาร 1 รายการในชุดพร้อมหัวข้อที่อาจารย์ตรวจ ตาม FR-APR-01 และ FR-APR-02."""

    id: str
    approval_id: str
    document_type: str
    title: str
    document_reference: str
    display_order: int
    objectives: tuple[str, ...]
    indicators: tuple[str, ...]
    document_format: str


@dataclass(frozen=True)
class ApprovalAction:
    """ประวัติการดำเนินการต่อเอกสาร ตาม FR-APR-03, FR-APR-05 และ FR-APR-06."""

    id: int
    approval_id: str
    actor_id: str
    action: str
    action_at: datetime
