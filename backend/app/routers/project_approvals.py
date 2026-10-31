from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, Field, field_validator

from ..config import COVER_SHEET_ALLOWED_EXTENSIONS
from ..middleware.auth import require_authenticated_context, require_roles
from ..models.auth_token import UserRole
from ..models.authenticated_user_context import AuthenticatedUserContext
from ..models.project_approval import PENDING_STATUS, ProjectApproval, ProjectDocumentItem
from ..services.project_approval_service import (
    PRINT_COVER_SHEET_MESSAGE,
    ProjectApprovalConflict,
    ProjectApprovalService,
    create_sample_project_approval_service,
)

# บังคับ Token จริงก่อนเข้าถึงทุก endpoint ของฟีเจอร์ตาม CON-NFR-21 และ NFR-SEC-01
project_approval_router = APIRouter(
    prefix="/project-approvals",
    dependencies=[Depends(require_authenticated_context)],
)

project_approval_service = create_sample_project_approval_service()
APPROVAL_NOT_FOUND = "ไม่พบเอกสารที่รออนุมัติ"
require_advisor = require_roles(UserRole.ADVISOR)
require_office = require_roles(UserRole.STUDENT_AFFAIRS_OFFICER)
require_approval_reader = require_roles(UserRole.ADVISOR, UserRole.STUDENT_AFFAIRS_OFFICER)


def get_project_approval_service() -> ProjectApprovalService:
    return project_approval_service


class ReturnRequest(BaseModel):
    """คอมเมนต์รายละเอียดที่ต้องแก้ไขตาม FR-APR-06 และ IF-UC01-02."""

    comment_text: str = Field(min_length=1)

    @field_validator("comment_text")
    @classmethod
    def reject_blank_values(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("ต้องระบุข้อมูล")
        return value


def _document_summary(document: ProjectDocumentItem) -> dict[str, str | int]:
    return {
        "id": document.id,
        "document_type": document.document_type,
        "title": document.title,
        "document_reference": document.document_reference,
        "display_order": document.display_order,
    }


def _document_detail(document: ProjectDocumentItem) -> dict:
    return {
        **_document_summary(document),
        "objectives": list(document.objectives),
        "indicators": list(document.indicators),
        "format": document.document_format,
    }


def _approval_summary(approval: ProjectApproval) -> dict:
    return {
        "id": approval.id,
        "project_id": approval.project_id,
        "project_name": approval.project_name,
        "status": approval.status,
        "content_approved_at": approval.content_approved_at,
        "completed_at": approval.completed_at,
    }


def _approval_response(approval: ProjectApproval, service: ProjectApprovalService) -> dict:
    cover_sheet = service.get_cover_sheet(approval.id)
    return {
        **_approval_summary(approval),
        "cover_sheet": cover_sheet
        and {"file_name": cover_sheet.file_name, "uploaded_at": cover_sheet.uploaded_at},
        "cover_sheet_accept": ",".join(COVER_SHEET_ALLOWED_EXTENSIONS),
        "documents": [_document_summary(item) for item in service.list_documents(approval.id)],
    }


def _conflict(error: ProjectApprovalConflict) -> HTTPException:
    return HTTPException(status_code=409, detail=str(error))


@project_approval_router.get("")
def list_project_approvals(
    user: AuthenticatedUserContext = Depends(require_approval_reader),
    service: ProjectApprovalService = Depends(get_project_approval_service),
) -> list[dict]:
    """คืนรายการให้อาจารย์เลือกเปิด และคืนเฉพาะสถานะรออนุมัติให้กองกิจ ตาม FR-APR-01 และ FR-APR-05."""
    status = PENDING_STATUS if user.role == UserRole.STUDENT_AFFAIRS_OFFICER else None
    return [_approval_summary(item) for item in service.list_approvals(status)]


@project_approval_router.get("/{approval_id}", dependencies=[Depends(require_approval_reader)])
def get_project_approval(
    approval_id: str,
    service: ProjectApprovalService = Depends(get_project_approval_service),
) -> dict:
    """คืนรายการเอกสารทั้งชุดและสถานะ ตาม FR-APR-01."""
    approval = service.get_approval(approval_id)
    if approval is None:
        raise HTTPException(status_code=404, detail=APPROVAL_NOT_FOUND)
    return _approval_response(approval, service)


@project_approval_router.get(
    "/{approval_id}/documents/{document_id}",
    dependencies=[Depends(require_approval_reader)],
)
def get_project_document(
    approval_id: str,
    document_id: str,
    service: ProjectApprovalService = Depends(get_project_approval_service),
) -> dict:
    """คืนเอกสารรายการที่เลือกพร้อมหัวข้อตรวจ ตาม FR-APR-01, FR-APR-02 และ AC-APR-03."""
    document = service.get_document(approval_id, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="ไม่พบเอกสารรายการนี้")
    return _document_detail(document)


@project_approval_router.post("/{approval_id}/content-approval")
def approve_content(
    approval_id: str,
    user: AuthenticatedUserContext = Depends(require_advisor),
    service: ProjectApprovalService = Depends(get_project_approval_service),
) -> dict:
    """บันทึกเวลาอนุมัติและแจ้งให้พิมพ์ใบปะหน้า ตาม FR-APR-03 และ AC-APR-01."""
    try:
        approval = service.approve_content(approval_id, user.user_id)
    except ProjectApprovalConflict as error:
        raise _conflict(error) from error
    if approval is None:
        raise HTTPException(status_code=404, detail=APPROVAL_NOT_FOUND)
    return {
        "status": approval.status,
        "content_approved_at": approval.content_approved_at,
        "print_message": PRINT_COVER_SHEET_MESSAGE,
    }


@project_approval_router.post("/{approval_id}/cover-sheet")
async def upload_cover_sheet(
    approval_id: str,
    file: UploadFile = File(...),
    user: AuthenticatedUserContext = Depends(require_advisor),
    service: ProjectApprovalService = Depends(get_project_approval_service),
) -> dict:
    """รับไฟล์ใบปะหน้าที่เซ็นแล้วและเปลี่ยนเป็นรออนุมัติ ตาม FR-APR-04, IF-UPLOAD-01 และ Q-03."""
    try:
        service.require_cover_sheet_size(file.size)
        upload = service.upload_cover_sheet(
            approval_id,
            file.filename or "cover-sheet",
            await file.read(),
            user.user_id,
        )
    except ProjectApprovalConflict as error:
        raise _conflict(error) from error
    if upload is None:
        raise HTTPException(status_code=404, detail=APPROVAL_NOT_FOUND)
    return {
        "file_name": upload.file_name,
        "uploaded_at": upload.uploaded_at,
        "status": service.get_approval(approval_id).status,
    }


@project_approval_router.post("/{approval_id}/review")
def pass_review(
    approval_id: str,
    user: AuthenticatedUserContext = Depends(require_office),
    service: ProjectApprovalService = Depends(get_project_approval_service),
) -> dict:
    """บันทึกผลตรวจผ่านของกองกิจและเรียก UC-10 ตาม FR-APR-05 และ AC-APR-02."""
    try:
        approval = service.complete_review(approval_id, user.user_id)
    except ProjectApprovalConflict as error:
        raise _conflict(error) from error
    if approval is None:
        raise HTTPException(status_code=404, detail=APPROVAL_NOT_FOUND)
    return {"status": approval.status, "completed_at": approval.completed_at}


@project_approval_router.post("/{approval_id}/return")
def return_documents(
    approval_id: str,
    request: ReturnRequest,
    user: AuthenticatedUserContext = Depends(require_approval_reader),
    service: ProjectApprovalService = Depends(get_project_approval_service),
) -> dict:
    """ส่งเอกสารทั้งชุดกลับ UC-01 จากอาจารย์หรือกองกิจ ตาม FR-APR-06, IF-UC01-02 และ AC-APR-04."""
    try:
        package = service.return_documents(
            approval_id,
            user.user_id,
            request.comment_text,
            by_advisor=user.role == UserRole.ADVISOR,
        )
    except ProjectApprovalConflict as error:
        raise _conflict(error) from error
    if package is None:
        raise HTTPException(status_code=404, detail=APPROVAL_NOT_FOUND)
    return {
        "status": service.get_approval(approval_id).status,
        "target_use_case": package.target_use_case,
        "comment_text": package.comment_text,
        "documents": [_document_summary(item) for item in package.documents],
    }


@project_approval_router.post(
    "/{approval_id}/notifications/uc-10",
    dependencies=[Depends(require_office)],
)
def notify_uc10(
    approval_id: str,
    service: ProjectApprovalService = Depends(get_project_approval_service),
) -> dict:
    """คืนผลการเรียก UC-10 ของเอกสารที่อนุมัติสมบูรณ์ ตาม FR-APR-05 และ IF-UC10-01."""
    try:
        request = service.request_completion_notification(approval_id)
    except ProjectApprovalConflict as error:
        raise _conflict(error) from error
    if request is None:
        raise HTTPException(status_code=404, detail=APPROVAL_NOT_FOUND)
    return {
        "approval_id": request.approval_id,
        "target_use_case": request.target_use_case,
        "requested_at": request.requested_at,
        "delivery_status": request.delivery_status,
    }
