from collections.abc import Iterable
from datetime import datetime, timezone
from threading import RLock

from ..config import (
    COVER_SHEET_ALLOWED_EXTENSIONS,
    COVER_SHEET_MAX_BYTES,
    COVER_SHEET_MAX_MEGABYTES,
    COVER_SHEET_SIGNATURES,
)
from ..integrations.uc01 import UC01_USE_CASE, UC01ReturnPackage, UC01ReturnQueue
from ..integrations.uc10 import UC10Integration
from ..models.cover_sheet_upload import CoverSheetUpload
from ..models.notification_request import NotificationRequest
from ..models.project_approval import (
    COMPLETED_STATUS,
    PENDING_STATUS,
    ApprovalAction,
    ProjectApproval,
    ProjectDocumentItem,
)
from ..models.review_comment import ReviewComment
from ..storage.cover_sheet import CoverSheetStorage
from .approval_service import FORWARDED_STATUS
from .rejection_service import RETURNED_STATUS

SAMPLE_APPROVAL_ID = "approval-005-001"
INCOMPLETE_SAMPLE_APPROVAL_ID = "approval-005-003"
# เอกสารที่ต้องมีครบก่อนอนุมัติเนื้อหา ตาม FR-APR-01, AC-APR-01 และ ASM-03
REQUIRED_DOCUMENT_TYPES = ("เล่มโครงการ", "กส 002", "ใบแนบกิจกรรม")
PRINT_COVER_SHEET_MESSAGE = "กรุณาพิมพ์เฉพาะใบปะหน้าเพื่อขอลายเซ็นจริง"
RECEIVED_VALIDATION_STATUS = "received"


class ProjectApprovalConflict(Exception):
    """ขั้นตอนที่ขอทำขัดกับลำดับการอนุมัติตาม ASM-01 และ ASM-02."""


class InvalidCoverSheet(ProjectApprovalConflict):
    """ไฟล์ใบปะหน้าไม่ตรงชนิดหรือขนาดที่กำหนดตาม IF-UPLOAD-01 และ Q-03."""


class ProjectApprovalService:
    """จัดการการอนุมัติเอกสารแบบ in-memory ตาม FR-APR-01 ถึง FR-APR-06."""

    def __init__(
        self,
        approvals: Iterable[ProjectApproval] = (),
        documents: Iterable[ProjectDocumentItem] = (),
    ) -> None:
        self._approvals = {approval.id: approval for approval in approvals}
        self._documents = list(documents)
        self._actions: list[ApprovalAction] = []
        self._cover_sheets: dict[str, CoverSheetUpload] = {}
        self._comments: list[ReviewComment] = []
        self._storage = CoverSheetStorage()
        self.uc10 = UC10Integration()
        self.uc01 = UC01ReturnQueue()
        self._lock = RLock()

    def list_approvals(self, status: str | None = None) -> list[ProjectApproval]:
        """คืนรายการเอกสารให้เลือกเปิด ตาม FR-APR-01 และ FR-APR-05."""
        return [
            approval
            for approval in sorted(self._approvals.values(), key=lambda item: item.id)
            if status is None or approval.status == status
        ]

    def get_approval(self, approval_id: str) -> ProjectApproval | None:
        return self._approvals.get(approval_id)

    def list_documents(self, approval_id: str) -> list[ProjectDocumentItem]:
        """คืนเอกสารทั้งชุดเรียงตามลำดับแสดงผล ตาม FR-APR-01."""
        return sorted(
            (item for item in self._documents if item.approval_id == approval_id),
            key=lambda item: item.display_order,
        )

    def get_document(self, approval_id: str, document_id: str) -> ProjectDocumentItem | None:
        """คืนเฉพาะเอกสารรายการที่เลือก ตาม FR-APR-01 และ AC-APR-03."""
        return next(
            (item for item in self.list_documents(approval_id) if item.id == document_id),
            None,
        )

    def get_cover_sheet(self, approval_id: str) -> CoverSheetUpload | None:
        return self._cover_sheets.get(approval_id)

    def list_actions(self, approval_id: str) -> list[ApprovalAction]:
        return [item for item in self._actions if item.approval_id == approval_id]

    def list_comments(self, approval_id: str) -> list[ReviewComment]:
        return [item for item in self._comments if item.approval_id == approval_id]

    def approve_content(self, approval_id: str, actor_id: str) -> ProjectApproval | None:
        """บันทึกเวลาอนุมัติเนื้อหาครั้งแรกเมื่อเอกสารครบชุด ตาม FR-APR-03, ASM-01 และ ASM-03."""
        with self._lock:
            approval = self._approvals.get(approval_id)
            if approval is None:
                return None
            self._require_status(approval, FORWARDED_STATUS)
            self._require_complete_documents(approval_id)
            if approval.content_approved_at is None:
                now = datetime.now(timezone.utc)
                approval.content_approved_at = now
                approval.updated_at = now
                self._record_action(approval_id, actor_id, "content_approved", now)
            return approval

    def upload_cover_sheet(
        self,
        approval_id: str,
        file_name: str,
        content: bytes,
        uploaded_by: str,
    ) -> CoverSheetUpload | None:
        """รับใบปะหน้าหลังอนุมัติเนื้อหาแล้ว ตาม FR-APR-04, IF-UPLOAD-01 และ ASM-01."""
        with self._lock:
            approval = self._approvals.get(approval_id)
            if approval is None:
                return None
            self._require_status(approval, FORWARDED_STATUS, PENDING_STATUS)
            if approval.content_approved_at is None:
                raise ProjectApprovalConflict("ต้องอนุมัติเนื้อหาก่อนอัปโหลดใบปะหน้า")
            self._require_valid_cover_sheet(file_name, content)

            now = datetime.now(timezone.utc)
            upload = CoverSheetUpload(
                id=len(self._cover_sheets) + 1,
                approval_id=approval_id,
                file_name=file_name,
                file_reference=self._storage.save(approval_id, file_name, content),
                uploaded_by=uploaded_by,
                uploaded_at=now,
                validation_status=RECEIVED_VALIDATION_STATUS,
            )
            self._cover_sheets[approval_id] = upload
            approval.status = PENDING_STATUS
            approval.updated_at = now
            self._record_action(approval_id, uploaded_by, "cover_sheet_uploaded", now)
            return upload

    def complete_review(self, approval_id: str, reviewer_id: str) -> ProjectApproval | None:
        """เปลี่ยนเป็นอนุมัติสมบูรณ์และเรียก UC-10 ตาม FR-APR-05, IF-UC10-01 และ ASM-02."""
        with self._lock:
            approval = self._approvals.get(approval_id)
            if approval is None:
                return None
            self._require_reviewable(approval)

            now = datetime.now(timezone.utc)
            approval.status = COMPLETED_STATUS
            approval.completed_at = now
            approval.updated_at = now
            self._record_action(approval_id, reviewer_id, "review_passed", now)
            self.uc10.request_notification(approval_id)
            return approval

    def request_completion_notification(self, approval_id: str) -> NotificationRequest | None:
        """เรียก UC-10 เฉพาะเอกสารที่อนุมัติสมบูรณ์แล้ว ตาม IF-UC10-01."""
        with self._lock:
            approval = self._approvals.get(approval_id)
            if approval is None:
                return None
            if approval.status != COMPLETED_STATUS:
                raise ProjectApprovalConflict("เอกสารยังไม่อนุมัติสมบูรณ์")
            return self.uc10.request_notification(approval_id)

    def return_documents(
        self,
        approval_id: str,
        reviewer_id: str,
        comment_text: str,
        by_advisor: bool = False,
    ) -> UC01ReturnPackage | None:
        """ส่งเอกสารทั้งชุดพร้อมคอมเมนต์กลับ UC-01 ตาม FR-APR-06, IF-UC01-02 และ ASM-02."""
        with self._lock:
            approval = self._approvals.get(approval_id)
            if approval is None:
                return None
            if by_advisor:
                self._require_status(approval, FORWARDED_STATUS)
            else:
                self._require_reviewable(approval)

            now = datetime.now(timezone.utc)
            self._comments.append(
                ReviewComment(
                    id=len(self._comments) + 1,
                    approval_id=approval_id,
                    author_id=reviewer_id,
                    comment_text=comment_text,
                    created_at=now,
                )
            )
            approval.status = RETURNED_STATUS
            approval.updated_at = now
            self._record_action(approval_id, reviewer_id, "returned", now)
            package = UC01ReturnPackage(
                approval_id=approval_id,
                project_id=approval.project_id,
                target_use_case=UC01_USE_CASE,
                documents=tuple(self.list_documents(approval_id)),
                comment_text=comment_text,
                returned_at=now,
            )
            self.uc01.send(package)
            return package

    def require_cover_sheet_size(self, size: int | None) -> None:
        """ปฏิเสธไฟล์เกินขนาดก่อนอ่านเนื้อไฟล์ตาม IF-UPLOAD-01 และ Q-03."""
        if size is not None and size > COVER_SHEET_MAX_BYTES:
            raise InvalidCoverSheet(f"ไฟล์ใบปะหน้าต้องมีขนาดไม่เกิน {COVER_SHEET_MAX_MEGABYTES} MB")

    def _require_valid_cover_sheet(self, file_name: str, content: bytes) -> None:
        """ตรวจชนิดจากนามสกุลและต้นไฟล์ และตรวจขนาด ตาม IF-UPLOAD-01 และ Q-03."""
        self.require_cover_sheet_size(len(content))
        extension = next(
            (item for item in COVER_SHEET_ALLOWED_EXTENSIONS if file_name.lower().endswith(item)),
            None,
        )
        if extension is None or not content.startswith(COVER_SHEET_SIGNATURES[extension]):
            allowed = ", ".join(COVER_SHEET_ALLOWED_EXTENSIONS)
            raise InvalidCoverSheet(f"รับเฉพาะไฟล์ชนิด {allowed}")

    def _require_complete_documents(self, approval_id: str) -> None:
        """เอกสารต้องครบชุดก่อนอนุมัติ ตาม AC-APR-01 และ ASM-03."""
        document_types = {item.document_type for item in self.list_documents(approval_id)}
        if not set(REQUIRED_DOCUMENT_TYPES) <= document_types:
            raise ProjectApprovalConflict("เอกสารยังไม่ครบทั้งชุด")

    def _require_status(self, approval: ProjectApproval, *statuses: str) -> None:
        if approval.status not in statuses:
            raise ProjectApprovalConflict(f"เอกสารอยู่ในสถานะ {approval.status} แล้ว")

    def _require_reviewable(self, approval: ProjectApproval) -> None:
        """กองกิจตรวจได้เมื่อมีใบปะหน้าที่เซ็นแล้วตาม ASM-01 และ ASM-02."""
        self._require_status(approval, PENDING_STATUS)
        if approval.id not in self._cover_sheets:
            raise ProjectApprovalConflict("ยังไม่มีใบปะหน้าที่เซ็นแล้ว")

    def _record_action(
        self,
        approval_id: str,
        actor_id: str,
        action: str,
        action_at: datetime,
    ) -> None:
        self._actions.append(
            ApprovalAction(
                id=len(self._actions) + 1,
                approval_id=approval_id,
                actor_id=actor_id,
                action=action,
                action_at=action_at,
            )
        )


def _sample_documents(
    approval_id: str,
    project_name: str,
    *,
    include_attachment: bool = True,
) -> list[ProjectDocumentItem]:
    documents = [
        ProjectDocumentItem(
            id="project-book",
            approval_id=approval_id,
            document_type="เล่มโครงการ",
            title=f"เล่ม{project_name}",
            document_reference="project-book-2569.pdf",
            display_order=1,
            objectives=(
                "พัฒนาทักษะการทำงานเป็นทีมของนักศึกษา",
                "ส่งเสริมการเรียนรู้ผ่านกิจกรรมวิทยาศาสตร์",
            ),
            indicators=(
                "ผู้เข้าร่วมไม่น้อยกว่า 80 คน",
                "ผู้เข้าร่วมประเมินความพึงพอใจเฉลี่ยไม่น้อยกว่า 4.00",
            ),
            document_format="รูปแบบเอกสารครบถ้วนตามแบบโครงการ",
        ),
        ProjectDocumentItem(
            id="ks-002",
            approval_id=approval_id,
            document_type="กส 002",
            title="แบบ กส 002",
            document_reference="ks-002-2569.pdf",
            display_order=2,
            objectives=("สรุปรายละเอียดการดำเนินโครงการ",),
            indicators=("ข้อมูลกิจกรรมและผู้รับผิดชอบครบถ้วน",),
            document_format="แบบฟอร์ม กส 002 พร้อมตรวจสอบ",
        ),
    ]
    if include_attachment:
        documents.append(
            ProjectDocumentItem(
                id="activity-attachment",
                approval_id=approval_id,
                document_type="ใบแนบกิจกรรม",
                title="ใบแนบรายละเอียดกิจกรรม",
                document_reference="activity-attachment-2569.pdf",
                display_order=3,
                objectives=("แสดงรายละเอียดกิจกรรมและกำหนดการ",),
                indicators=("กำหนดการสอดคล้องกับวัตถุประสงค์โครงการ",),
                document_format="ตารางกิจกรรมและกำหนดการจัดรูปแบบแล้ว",
            )
        )
    return documents


def create_sample_project_approval_service() -> ProjectApprovalService:
    """สร้างข้อมูลตัวอย่างที่ถือว่า UC-03 ส่งต่อแล้ว ตาม FR-APR-01 และ FR-APR-02."""
    now = datetime.now(timezone.utc)
    samples = (
        (SAMPLE_APPROVAL_ID, 5001, "โครงการค่ายวิทยาศาสตร์ 2569", True),
        ("approval-005-002", 5002, "โครงการอบรมทักษะห้องปฏิบัติการ", True),
        (INCOMPLETE_SAMPLE_APPROVAL_ID, 5003, "โครงการวันวิทยาศาสตร์", False),
    )
    approvals = [
        ProjectApproval(
            id=approval_id,
            project_id=project_id,
            project_name=project_name,
            status=FORWARDED_STATUS,
            created_at=now,
            updated_at=now,
        )
        for approval_id, project_id, project_name, _ in samples
    ]
    documents = [
        document
        for approval_id, _, project_name, include_attachment in samples
        for document in _sample_documents(
            approval_id,
            project_name,
            include_attachment=include_attachment,
        )
    ]
    return ProjectApprovalService(approvals, documents)
