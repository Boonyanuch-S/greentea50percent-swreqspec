from collections.abc import Iterable
from datetime import datetime, timezone
from pathlib import PurePath
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
from ..storage.project_document import (
    ProjectDocumentStorage,
    StoredDocumentFile,
    load_sample_file,
)
from .approval_service import FORWARDED_STATUS
from .rejection_service import RETURNED_STATUS

SAMPLE_APPROVAL_ID = "approval-005-001"
INCOMPLETE_SAMPLE_APPROVAL_ID = "approval-005-003"
# เอกสารที่ต้องมีครบก่อนอนุมัติเนื้อหา ตาม FR-APR-01, AC-APR-01 และ ASM-03
REQUIRED_DOCUMENT_TYPES = ("เล่มโครงการ", "กส 002", "ใบแนบกิจกรรม")
PRINT_COVER_SHEET_MESSAGE = "กรุณาพิมพ์เฉพาะใบปะหน้าเพื่อขอลายเซ็นจริง"
RECEIVED_VALIDATION_STATUS = "received"
SAMPLE_ADVISOR_ID = "intuwet_p@silpakorn.edu"
SAMPLE_ACTIVITY_DATE = ("2027-01-15", "15 มกราคม 2570")
URGENT_SAMPLE_ACTIVITY_DATE = ("2026-11-20", "20 พฤศจิกายน 2569")
URGENT_SAMPLE_ID = "approval-005-004"
OFFICE_REVIEW_SAMPLES = (
    ("approval-005-004", 5004, "โครงการแข่งขันตอบปัญหาวิทยาศาสตร์", True),
    ("approval-005-005", 5005, "โครงการอบรมจริยธรรมการวิจัยสำหรับนักศึกษา", True),
)
COVER_SHEET_MEDIA_TYPES = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
}


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
        self._reviewed_documents: dict[str, set[str]] = {}
        self._comments: list[ReviewComment] = []
        self._storage = CoverSheetStorage()
        self._document_files = ProjectDocumentStorage()
        self.uc10 = UC10Integration()
        self.uc01 = UC01ReturnQueue()
        self._lock = RLock()

    def add_approval(self, approval: ProjectApproval, documents: Iterable[ProjectDocumentItem]) -> None:
        """รับเอกสารที่เจ้าหน้าที่คณะส่งต่อเข้าคิวอาจารย์ ตาม FR-APR-01 และ IF-UC05-01."""
        with self._lock:
            self._approvals[approval.id] = approval
            self._documents.extend(documents)

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

    def save_document_file(self, approval_id: str, document_id: str, file: StoredDocumentFile) -> None:
        """เก็บไฟล์ของเอกสารในชุด เป็นจุดรับไฟล์ที่กรรมการแนบจาก UC-01 ตาม FR-APR-01."""
        self._document_files.save(approval_id, document_id, file)

    def get_document_file(self, approval_id: str, document_id: str) -> StoredDocumentFile | None:
        """คืนไฟล์ของเอกสารรายการที่เลือกเพื่อเปิดตรวจ ตาม FR-APR-01 และ AC-APR-03."""
        if self.get_document(approval_id, document_id) is None:
            return None
        return self._document_files.read(approval_id, document_id)

    def get_cover_sheet_file(self, approval_id: str) -> StoredDocumentFile | None:
        """คืนไฟล์ใบปะหน้าล่าสุดให้เปิดตรวจ ตาม FR-APR-05 และ IF-UPLOAD-01."""
        upload = self._cover_sheets.get(approval_id)
        content = self._storage.read(upload.file_reference) if upload else None
        if upload is None or content is None:
            return None
        extension = PurePath(upload.file_name).suffix.lower()
        return StoredDocumentFile(
            file_name=upload.file_name,
            media_type=COVER_SHEET_MEDIA_TYPES.get(extension, "application/octet-stream"),
            content=content,
        )

    def get_cover_sheet(self, approval_id: str) -> CoverSheetUpload | None:
        return self._cover_sheets.get(approval_id)

    def list_actions(self, approval_id: str) -> list[ApprovalAction]:
        return [item for item in self._actions if item.approval_id == approval_id]

    def list_comments(self, approval_id: str) -> list[ReviewComment]:
        return [item for item in self._comments if item.approval_id == approval_id]

    def list_reviewed_document_ids(self, approval_id: str) -> list[str]:
        """คืนเอกสารที่อาจารย์ยืนยันว่าตรวจแล้ว เรียงตามลำดับแสดงผล ตาม FR-APR-02."""
        reviewed = self._reviewed_documents.get(approval_id, set())
        return [item.id for item in self.list_documents(approval_id) if item.id in reviewed]

    def set_document_reviewed(
        self,
        approval_id: str,
        document_id: str,
        reviewed: bool,
        actor_id: str,
    ) -> ProjectDocumentItem | None:
        """บันทึกการตรวจรายฉบับก่อนอนุมัติเนื้อหา ตาม FR-APR-02 และคำสั่งทีม 2569-11-01."""
        with self._lock:
            approval = self._approvals.get(approval_id)
            document = self.get_document(approval_id, document_id)
            if approval is None or document is None:
                return None
            self._require_status(approval, FORWARDED_STATUS)
            if approval.content_approved_at is not None:
                raise ProjectApprovalConflict("อนุมัติเนื้อหาแล้ว ไม่สามารถเปลี่ยนผลการตรวจรายฉบับได้")
            reviewed_ids = self._reviewed_documents.setdefault(approval_id, set())
            if reviewed:
                reviewed_ids.add(document_id)
            else:
                reviewed_ids.discard(document_id)
            action = "document_reviewed" if reviewed else "document_review_cancelled"
            self._record_action(approval_id, actor_id, action, datetime.now(timezone.utc))
            return document

    def approve_content(self, approval_id: str, actor_id: str) -> ProjectApproval | None:
        """บันทึกเวลาอนุมัติเนื้อหาครั้งแรกเมื่อเอกสารครบชุด ตาม FR-APR-03, ASM-01 และ ASM-03."""
        with self._lock:
            approval = self._approvals.get(approval_id)
            if approval is None:
                return None
            self._require_status(approval, FORWARDED_STATUS)
            self._require_complete_documents(approval_id)
            if approval.content_approved_at is None:
                self._require_all_documents_reviewed(approval_id)
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

    def _require_all_documents_reviewed(self, approval_id: str) -> None:
        remaining = len(self.list_documents(approval_id)) - len(self.list_reviewed_document_ids(approval_id))
        if remaining > 0:
            raise ProjectApprovalConflict(f"ต้องตรวจเอกสารให้ครบก่อนอนุมัติเนื้อหา เหลืออีก {remaining} ฉบับ")

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


def _advance_to_office_review(service: ProjectApprovalService, approval_id: str) -> None:
    """พาโครงการตัวอย่างผ่านขั้นของอาจารย์ด้วยกฎเดียวกับการใช้งานจริง ตาม FR-APR-03 และ FR-APR-04."""
    for document in service.list_documents(approval_id):
        service.set_document_reviewed(approval_id, document.id, True, SAMPLE_ADVISOR_ID)
    service.approve_content(approval_id, SAMPLE_ADVISOR_ID)
    service.upload_cover_sheet(
        approval_id,
        "ใบปะหน้า-ลงนามแล้ว.pdf",
        load_sample_file(approval_id, "cover-sheet", "ใบปะหน้า-ลงนามแล้ว.pdf").content,
        SAMPLE_ADVISOR_ID,
    )


def create_sample_project_approval_service(
    *,
    include_office_samples: bool = False,
) -> ProjectApprovalService:
    """สร้างข้อมูลตัวอย่างที่ถือว่า UC-03 ส่งต่อแล้ว ตาม FR-APR-01 และ FR-APR-02.

    include_office_samples เพิ่มโครงการที่ผ่านขั้นอาจารย์แล้ว เพื่อให้กองกิจมีเอกสารให้ตรวจตาม FR-APR-05
    """
    now = datetime.now(timezone.utc)
    samples = (
        (SAMPLE_APPROVAL_ID, 5001, "โครงการค่ายวิทยาศาสตร์ 2569", True),
        ("approval-005-002", 5002, "โครงการอบรมทักษะห้องปฏิบัติการ", True),
        (INCOMPLETE_SAMPLE_APPROVAL_ID, 5003, "โครงการวันวิทยาศาสตร์", False),
    )
    if include_office_samples:
        samples += OFFICE_REVIEW_SAMPLES
    approvals = [
        ProjectApproval(
            id=approval_id,
            project_id=project_id,
            project_name=project_name,
            status=FORWARDED_STATUS,
            created_at=now,
            updated_at=now,
            activity_date=(URGENT_SAMPLE_ACTIVITY_DATE if approval_id == URGENT_SAMPLE_ID else SAMPLE_ACTIVITY_DATE)[0],
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
    service = ProjectApprovalService(approvals, documents)
    for document in documents:
        service.save_document_file(
            document.approval_id,
            document.id,
            load_sample_file(document.approval_id, document.id, document.document_reference),
        )
    if include_office_samples:
        for approval_id, *_ in OFFICE_REVIEW_SAMPLES:
            _advance_to_office_review(service, approval_id)
    return service
