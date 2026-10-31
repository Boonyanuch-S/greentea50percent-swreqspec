from dataclasses import dataclass
from datetime import datetime

from ..models.project_approval import ProjectDocumentItem

UC01_USE_CASE = "UC-01"


@dataclass(frozen=True)
class UC01ReturnPackage:
    """เอกสารทั้งชุดและคอมเมนต์ที่ส่งกลับ UC-01 ตาม FR-APR-06 และ IF-UC01-02."""

    approval_id: str
    project_id: int
    target_use_case: str
    documents: tuple[ProjectDocumentItem, ...]
    comment_text: str
    returned_at: datetime


class UC01ReturnQueue:
    """คิวจำลองสำหรับส่งเอกสารกลับ UC-01 ตาม IF-UC01-02."""

    def __init__(self) -> None:
        self._packages: list[UC01ReturnPackage] = []

    def send(self, package: UC01ReturnPackage) -> None:
        self._packages.append(package)

    def list_packages(self) -> list[UC01ReturnPackage]:
        return list(self._packages)
