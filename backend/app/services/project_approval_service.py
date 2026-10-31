from collections.abc import Iterable
from datetime import datetime, timezone
from threading import RLock

from ..config import COVER_SHEET_ALLOWED_EXTENSIONS, COVER_SHEET_MAX_BYTES
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
from .rejection_service import RETURNED_STATUS

SAMPLE_APPROVAL_ID = "approval-005-001"
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
        """บันทึกเวลาอนุมัติเนื้อหาครั้งแรก ตาม FR-APR-03 และ ASM-01."""
        with self._lock:
            approval = self._approvals.get(approval_id)
            if approval is None:
                return None
            self._require_pending(approval)
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
            self._require_pending(approval)
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
    ) -> UC01ReturnPackage | None:
        """ส่งเอกสารทั้งชุดพร้อมคอมเมนต์กลับ UC-01 ตาม FR-APR-06, IF-UC01-02 และ ASM-02."""
        with self._lock:
            approval = self._approvals.get(approval_id)
            if approval is None:
                return None
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

    def _require_valid_cover_sheet(self, file_name: str, content: bytes) -> None:
        """ตรวจชนิดและขนาดไฟล์ใบปะหน้าตาม IF-UPLOAD-01 และ Q-03."""
        if not file_name.lower().endswith(COVER_SHEET_ALLOWED_EXTENSIONS):
            raise InvalidCoverSheet("รับเฉพาะไฟล์ PDF, JPG หรือ PNG")
        if len(content) > COVER_SHEET_MAX_BYTES:
            raise InvalidCoverSheet("ไฟล์ใบปะหน้าต้องมีขนาดไม่เกิน 10 MB")

    def _require_pending(self, approval: ProjectApproval) -> None:
        if approval.status != PENDING_STATUS:
            raise ProjectApprovalConflict(f"เอกสารอยู่ในสถานะ {approval.status} แล้ว")

    def _require_reviewable(self, approval: ProjectApproval) -> None:
        """กองกิจตรวจได้เมื่อมีใบปะหน้าที่เซ็นแล้วตาม ASM-01 และ ASM-02."""
        self._require_pending(approval)
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


def create_sample_project_approval_service() -> ProjectApprovalService:
    """สร้างข้อมูลตัวอย่าง 1 ชุดสำหรับลองระบบ ตาม FR-APR-01 และ FR-APR-02."""
    now = datetime.now(timezone.utc)
    approval = ProjectApproval(
        id=SAMPLE_APPROVAL_ID,
        project_id=5001,
        status=PENDING_STATUS,
        created_at=now,
        updated_at=now,
    )
    documents = [
        ProjectDocumentItem(
            id="project-book",
            approval_id=SAMPLE_APPROVAL_ID,
            document_type="เล่มโครงการ",
            title="เล่มโครงการค่ายวิทยาศาสตร์ 2569",
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
            approval_id=SAMPLE_APPROVAL_ID,
            document_type="กส 002",
            title="แบบ กส 002",
            document_reference="ks-002-2569.pdf",
            display_order=2,
            objectives=("สรุปรายละเอียดการดำเนินโครงการ",),
            indicators=("ข้อมูลกิจกรรมและผู้รับผิดชอบครบถ้วน",),
            document_format="แบบฟอร์ม กส 002 พร้อมตรวจสอบ",
        ),
        ProjectDocumentItem(
            id="activity-attachment",
            approval_id=SAMPLE_APPROVAL_ID,
            document_type="ใบแนบกิจกรรม",
            title="ใบแนบรายละเอียดกิจกรรม",
            document_reference="activity-attachment-2569.pdf",
            display_order=3,
            objectives=("แสดงรายละเอียดกิจกรรมและกำหนดการ",),
            indicators=("กำหนดการสอดคล้องกับวัตถุประสงค์โครงการ",),
            document_format="ตารางกิจกรรมและกำหนดการจัดรูปแบบแล้ว",
        ),
    ]
    return ProjectApprovalService([approval], documents)
