from collections.abc import Mapping
from dataclasses import dataclass
from datetime import datetime, timezone

from ..models.project_approval import COMPLETED_STATUS, PENDING_STATUS, ProjectApproval, ProjectDocumentItem
from ..models.project_document import ProjectDocument
from ..models.project_submission import ProjectSubmission
from ..storage.project_document import StoredDocumentFile, load_sample_file
from .approval_service import FORWARDED_STATUS, ApprovalService
from .project_approval_service import ProjectApprovalService
from .rejection_service import RETURNED_STATUS, RejectionService
from .review_queue_service import ReviewQueueService

PENDING_FACULTY_REVIEW = "รอเจ้าหน้าที่คณะตรวจสอบ"
RETURNED_TO_CLUB = "ถูกตีกลับ"
PENDING_OFFICE_REVIEW = "รอกองกิจตรวจสอบ"
QUEUE_STATUS = "รอตรวจสอบ"


@dataclass(frozen=True)
class ChecklistDocument:
    """เอกสารที่ต้องแนบ ใช้ชุดเดียวกับเอกสารทั้งชุดที่อาจารย์ตรวจ ตาม FR-PRJ-03 และ FR-APR-01."""

    id: str
    code: str
    name: str


# ใช้ 3 รายการตาม FR-APR-01 เพื่อให้เอกสารเดินถึงขั้นอาจารย์ได้ เกณฑ์จริงยังรอ Q-01 ของ specs/001
PROJECT_CHECKLIST = (
    ChecklistDocument("project-book", "เล่มโครงการ", "เล่มโครงการฉบับสมบูรณ์"),
    ChecklistDocument("ks-002", "กส 002", "แบบเสนอขออนุมัติโครงการ"),
    ChecklistDocument("activity-attachment", "ใบแนบกิจกรรม", "ใบแนบรายละเอียดกิจกรรมและกำหนดการ"),
)

CLUB_SAMPLE_PROJECTS = (
    {
        "name": "ค่ายวิทยาศาสตร์สัญจรเพื่อน้อง ครั้งที่ 1",
        "date": "2026-12-12",
        "date_text": "12 ธันวาคม 2569",
        "location": "โรงเรียนในอำเภอเมืองนครปฐม",
        "objectives": ("เพื่อถ่ายทอดความรู้วิทยาศาสตร์ผ่านการทดลอง", "เพื่อพัฒนาทักษะการทำงานเป็นทีมของนักศึกษาผู้จัด"),
        "indicators": ("นักเรียนเข้าร่วมไม่น้อยกว่าร้อยละ 80", "ความพึงพอใจเฉลี่ยไม่น้อยกว่า 3.51 จาก 5"),
    },
    {
        "name": "โครงการต้อนรับนักศึกษาใหม่คณะวิทยาศาสตร์",
        "date": "2026-11-20",
        "date_text": "20 พฤศจิกายน 2569",
        "location": "คณะวิทยาศาสตร์ พระราชวังสนามจันทร์",
        "objectives": ("เพื่อให้นักศึกษาใหม่รู้จักคณะและรุ่นพี่", "เพื่อสร้างความสัมพันธ์ระหว่างนักศึกษาทุกชั้นปี"),
        "indicators": ("นักศึกษาใหม่เข้าร่วมไม่น้อยกว่าร้อยละ 70", "ความพึงพอใจเฉลี่ยไม่น้อยกว่า 3.51 จาก 5"),
    },
    {
        "name": "กีฬาสีสัมพันธ์คณะวิทยาศาสตร์",
        "date": "2027-01-23",
        "date_text": "23 มกราคม 2570",
        "location": "สนามกีฬา พระราชวังสนามจันทร์",
        "objectives": ("เพื่อส่งเสริมการออกกำลังกายของนักศึกษา", "เพื่อเสริมสร้างความสามัคคีระหว่างภาควิชา"),
        "indicators": ("นักศึกษาทุกภาควิชาเข้าร่วม", "ความพึงพอใจเฉลี่ยไม่น้อยกว่า 3.51 จาก 5"),
    },
)

STEPS = (
    ("submitted", "กรรมการสโมสรส่งโครงการ"),
    ("faculty", "เจ้าหน้าที่คณะตรวจเอกสาร"),
    ("advisor", "อาจารย์ที่ปรึกษาอนุมัติ"),
    ("office", "กองกิจตรวจเอกสาร"),
    ("completed", "อนุมัติสมบูรณ์"),
)


class ProjectDocumentError(Exception):
    """คำขอขัดกับขั้นตอนของเอกสารโครงการ."""


class MissingAttachments(ProjectDocumentError):
    """เอกสารแนบไม่ครบตาม Checklist ตาม FR-PRJ-07."""

    def __init__(self, missing: list[ChecklistDocument]) -> None:
        super().__init__("เอกสารแนบยังไม่ครบตาม Checklist")
        self.missing = missing


class ProjectDocumentService:
    """เชื่อมเอกสารโครงการชุดเดียวผ่าน UC-01, UC-03 และ UC-05 แบบ in-memory ตาม IF-UC05-01 และ IF-UC01-01."""

    def __init__(
        self,
        review_queue: ReviewQueueService,
        approval_service: ApprovalService,
        rejection_service: RejectionService,
        project_approvals: ProjectApprovalService,
    ) -> None:
        self._review_queue = review_queue
        self._approval_service = approval_service
        self._rejection_service = rejection_service
        self._project_approvals = project_approvals
        self._projects: dict[str, ProjectDocument] = {}
        self._next_project_number = 1
        self._next_submission_id = 1
        approval_service.on_approved = self.forward_to_advisor

    def list_for_owner(self, owner_id: str) -> list[ProjectDocument]:
        return [project for project in self._projects.values() if project.owner_id == owner_id]

    def get_for_owner(self, project_id: str, owner_id: str) -> ProjectDocument | None:
        project = self._projects.get(project_id)
        return project if project is not None and project.owner_id == owner_id else None

    def get_by_submission(self, submission_id: int) -> ProjectDocument | None:
        return next(
            (project for project in self._projects.values() if project.submission_id == submission_id),
            None,
        )

    def submit(
        self,
        owner_id: str,
        owner_name: str,
        fields: Mapping[str, str],
        files: Mapping[str, StoredDocumentFile],
        project_id: str | None = None,
    ) -> ProjectDocument:
        """บันทึกและส่งเข้าคิวเจ้าหน้าที่คณะเมื่อเอกสารครบ ตาม FR-PRJ-05, FR-PRJ-06 และ FR-PRJ-07."""
        project = self.get_for_owner(project_id, owner_id) if project_id else None
        if project_id and project is None:
            raise ProjectDocumentError("ไม่พบโครงการ")
        if project is not None and self.status_of(project)[0] != RETURNED_TO_CLUB:
            raise ProjectDocumentError("แก้ไขได้เฉพาะโครงการที่ถูกตีกลับ")
        previous_return = self._current_return(project) if project is not None else None

        attachments = {**(project.attachments if project else {}), **files}
        missing = [item for item in PROJECT_CHECKLIST if item.id not in attachments]
        if missing:
            raise MissingAttachments(missing)

        if project is None:
            project = ProjectDocument(
                id=f"prj-{self._next_project_number:03d}",
                owner_id=owner_id,
                project_name="",
                objectives="",
                activity_date="",
                location="",
                indicators="",
            )
            self._next_project_number += 1
            self._projects[project.id] = project

        project.project_name = fields.get("projectName", "")
        project.objectives = fields.get("objectives", "")
        project.activity_date = fields.get("activityDate", "")
        project.location = fields.get("location", "")
        project.indicators = fields.get("indicators", "")
        project.attachments = attachments
        if previous_return is not None:
            project.history.append(previous_return)
        project.approval_id = None
        project.round += 1
        project.submission_id = self._queue_submission(project, owner_name)
        return project

    def _queue_submission(self, project: ProjectDocument, owner_name: str) -> int:
        submission_id = self._next_submission_id
        self._next_submission_id += 1
        now = datetime.now(timezone.utc)
        self._review_queue.add_submission(
            ProjectSubmission(
                submission_id=submission_id,
                project_id=int(project.id.removeprefix("prj-")),
                submitted_at=now,
                sender_user_id=project.owner_id,
                status=QUEUE_STATUS,
                review_queue_order=submission_id,
                project_name=project.project_name,
                project_owner=owner_name,
                summary=project.objectives,
                document_url=f"/submissions/{submission_id}/documents",
                created_at=now,
                current_status=QUEUE_STATUS,
                activity_date=project.activity_date,
            )
        )
        return submission_id

    def forward_to_advisor(self, submission_id: int) -> None:
        """สร้างรายการอนุมัติของอาจารย์จากเอกสารชุดเดียวกัน ตาม FR-VDC-05 และ IF-UC05-01."""
        project = self.get_by_submission(submission_id)
        if project is None:
            return
        approval_id = f"approval-{project.id}-{project.round}"
        now = datetime.now(timezone.utc)
        objectives = tuple(line for line in project.objectives.splitlines() if line.strip())
        indicators = tuple(line for line in project.indicators.splitlines() if line.strip())
        documents = [
            ProjectDocumentItem(
                id=item.id,
                approval_id=approval_id,
                document_type=item.code,
                title=f"{item.code} {project.project_name}",
                document_reference=project.attachments[item.id].file_name,
                display_order=order,
                objectives=objectives,
                indicators=indicators,
                document_format=item.name,
            )
            for order, item in enumerate(PROJECT_CHECKLIST, start=1)
        ]
        self._project_approvals.add_approval(
            ProjectApproval(
                id=approval_id,
                project_id=int(project.id.removeprefix("prj-")),
                project_name=project.project_name,
                status=FORWARDED_STATUS,
                created_at=now,
                updated_at=now,
                activity_date=project.activity_date,
            ),
            documents,
        )
        for item in PROJECT_CHECKLIST:
            self._project_approvals.save_document_file(approval_id, item.id, project.attachments[item.id])
        project.approval_id = approval_id

    def _current_return(self, project: ProjectDocument) -> dict[str, str | int] | None:
        """สรุปการตีกลับรอบล่าสุดให้รู้ว่าถูกตีกลับที่ขั้นใดและต้องแก้อะไร ตาม IF-UC01-01 และ IF-UC01-02."""
        status, reason = self.status_of(project)
        if status != RETURNED_TO_CLUB:
            return None
        stage = next(step["label"] for step in self.route_of(project) if step["state"] == "returned")
        return {"round": project.round, "stage": stage, "reason": reason or ""}

    def history_of(self, project: ProjectDocument) -> list[dict[str, str | int]]:
        """คืนประวัติการตีกลับทุกรอบ รอบล่าสุดอยู่บนสุด เพื่อให้ผู้ตรวจรอบถัดไปเห็นจุดที่เคยให้แก้."""
        current = self._current_return(project)
        return list(reversed([*project.history, *([current] if current else [])]))

    def get_by_approval(self, approval_id: str) -> ProjectDocument | None:
        return next(
            (project for project in self._projects.values() if project.approval_id == approval_id),
            None,
        )

    def status_of(self, project: ProjectDocument) -> tuple[str, str | None]:
        """คืนสถานะปัจจุบันและเหตุผลตีกลับจากขั้นตรวจจริง ตาม FR-PRJ-06 และ IF-UC01-01/02."""
        if project.approval_id is not None:
            approval = self._project_approvals.get_approval(project.approval_id)
            if approval.status == RETURNED_STATUS:
                comments = self._project_approvals.list_comments(project.approval_id)
                return RETURNED_TO_CLUB, comments[-1].comment_text if comments else None
            if approval.status == PENDING_STATUS:
                return PENDING_OFFICE_REVIEW, None
            return approval.status, None

        submission = self._review_queue.get_submission(project.submission_id)
        if submission.status == RETURNED_STATUS:
            messages = self._rejection_service.list_member_messages()
            reason = next(
                (item.reason_text for item in messages if item.submission_id == project.submission_id),
                None,
            )
            return RETURNED_TO_CLUB, reason
        return PENDING_FACULTY_REVIEW, None

    def route_of(self, project: ProjectDocument) -> list[dict[str, str]]:
        """คืนเส้นทางเอกสารให้เห็นว่าเรื่องอยู่ขั้นใด ตาม FR-PRJ-05 (ปรับจากเส้นทางหนังสือของ e-Saraban)."""
        status, _ = self.status_of(project)
        current = self._current_step(project, status)
        order = [key for key, _ in STEPS]
        returned = status == RETURNED_TO_CLUB
        route = []
        for key, label in STEPS:
            if key == current:
                state = "returned" if returned else "done" if key == "completed" else "current"
            elif order.index(key) < order.index(current):
                state = "done"
            else:
                state = "pending"
            route.append({"key": key, "label": label, "state": state})
        return route

    def _current_step(self, project: ProjectDocument, status: str) -> str:
        if status == COMPLETED_STATUS:
            return "completed"
        if project.approval_id is None:
            return "faculty"
        if status == PENDING_OFFICE_REVIEW or self._project_approvals.get_cover_sheet(project.approval_id):
            return "office"
        return "advisor"

    def seed_samples(self, owner_id: str, owner_name: str) -> None:
        """ใส่โครงการตัวอย่างของสโมสรด้วยขั้นตอนเดียวกับการใช้งานจริง ตาม FR-PRJ-05 และ FR-VDC-06."""
        for number, sample in enumerate(CLUB_SAMPLE_PROJECTS, start=1):
            self.submit(
                owner_id,
                owner_name,
                {
                    "projectName": sample["name"],
                    "objectives": "\n".join(sample["objectives"]),
                    "activityDate": sample["date"],
                    "location": sample["location"],
                    "indicators": "\n".join(sample["indicators"]),
                },
                {
                    item.id: load_sample_file(f"club-{number}", item.id, f"{item.id}.pdf")
                    for item in PROJECT_CHECKLIST
                },
            )
        self._rejection_service.reject(
            1,
            "faculty@silpakorn.edu",
            "ตัวชี้วัดข้อ 2 ยังไม่วัดผลตามวัตถุประสงค์ กรุณาแก้ไขแล้วส่งใหม่",
        )
