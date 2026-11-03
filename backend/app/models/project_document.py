from dataclasses import dataclass, field

from ..storage.project_document import StoredDocumentFile


@dataclass
class ProjectDocument:
    """เอกสารโครงการของสโมสรที่เดินผ่านทุกขั้นตรวจ ตาม FR-PRJ-01 ถึง FR-PRJ-06."""

    id: str
    owner_id: str
    project_name: str
    objectives: str
    activity_date: str
    location: str
    indicators: str
    attachments: dict[str, StoredDocumentFile] = field(default_factory=dict)
    submission_id: int | None = None
    approval_id: str | None = None
    round: int = 0
    history: list[dict[str, str | int]] = field(default_factory=list)
