import json
from urllib.parse import quote

from datetime import date

from fastapi import APIRouter, Depends, Form, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from ..config import COVER_SHEET_ALLOWED_EXTENSIONS, COVER_SHEET_MAX_BYTES, COVER_SHEET_MAX_MEGABYTES, COVER_SHEET_SIGNATURES
from ..middleware.auth import require_roles
from ..models.auth_token import UserRole
from ..models.authenticated_user_context import AuthenticatedUserContext
from ..models.project_document import ProjectDocument
from ..services.checklist_service import ChecklistService
from ..services.project_review_service import ProjectReviewService
from ..services.project_document_service import (
    PROJECT_CHECKLIST,
    MissingAttachments,
    ProjectDocumentError,
    ProjectDocumentService,
)
from ..storage.project_document import StoredDocumentFile
from .checklists import get_checklist_session
from .project_approvals import project_approval_service
from .review_decisions import approval_service, rejection_service
from .review_queue import review_queue_service

MEDIA_TYPES = {".pdf": "application/pdf", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png"}
SAMPLE_CLUB_ID = "boonliang_t@silpakorn.edu"
SAMPLE_CLUB_NAME = "สโมสรนักศึกษาคณะวิทยาศาสตร์"

SAMPLE_FACULTY_RESULTS = (
    {"item_name": "เล่มโครงการ", "result": "ครบ"},
    {"item_name": "กส 002", "result": "ครบ"},
    {"item_name": "ใบแนบกิจกรรม", "result": "ครบ"},
    {"item_name": "กศ.001 บันทึกข้อความ", "result": "ครบ"},
)

require_club = require_roles(UserRole.CLUB_COMMITTEE)
require_faculty = require_roles(UserRole.FACULTY_OFFICER)
require_approval_reader = require_roles(UserRole.ADVISOR, UserRole.STUDENT_AFFAIRS_OFFICER)
REQUIRED_FIELDS = {
    "projectName": "ชื่อโครงการ",
    "objectives": "วัตถุประสงค์",
    "activityDate": "วันที่จัดกิจกรรม",
    "location": "สถานที่",
    "indicators": "ตัวชี้วัด",
}
project_document_router = APIRouter()

project_document_service = ProjectDocumentService(
    review_queue_service,
    approval_service,
    rejection_service,
    project_approval_service,
)
project_document_service.seed_samples(SAMPLE_CLUB_ID, SAMPLE_CLUB_NAME)


def get_project_document_service() -> ProjectDocumentService:
    return project_document_service


def _summary(project: ProjectDocument, service: ProjectDocumentService) -> dict:
    status, reason = service.status_of(project)
    return {
        "id": project.id,
        "projectName": project.project_name,
        "activityDate": project.activity_date,
        "status": status,
        "rejectionReason": reason,
    }


def _detail(
    project: ProjectDocument,
    service: ProjectDocumentService,
    session: Session | None = None,
) -> dict:
    return {
        **_summary(project, service),
        "objectives": project.objectives,
        "location": project.location,
        "indicators": project.indicators,
        "attachments": {
            item_id: {"name": file.file_name, "type": file.media_type}
            for item_id, file in project.attachments.items()
        },
        "route": service.route_of(project),
        "history": service.history_of(project),
        "checklistResults": _faculty_results(project, session) if session else [],
    }


def _file_response(file: StoredDocumentFile) -> Response:
    return Response(
        content=file.content,
        media_type=file.media_type,
        headers={
            "Content-Disposition": f"inline; filename*=UTF-8''{quote(file.file_name)}",
            "X-Content-Type-Options": "nosniff",
        },
    )


def _parse_fields(raw_fields: str) -> dict[str, str]:
    """ตรวจข้อมูลโครงการก่อนบันทึก ไม่ให้ส่งฟอร์มว่างหรือวันที่ย้อนหลัง ตาม FR-PRJ-02."""
    try:
        fields = json.loads(raw_fields)
    except json.JSONDecodeError as error:
        raise HTTPException(status_code=422, detail="ข้อมูลโครงการไม่ถูกต้อง") from error
    if not isinstance(fields, dict):
        raise HTTPException(status_code=422, detail="ข้อมูลโครงการไม่ถูกต้อง")

    missing = [
        label
        for key, label in REQUIRED_FIELDS.items()
        if not isinstance(fields.get(key), str) or not fields[key].strip()
    ]
    if missing:
        raise HTTPException(status_code=422, detail=f"กรุณากรอก{' '.join(missing)}")
    try:
        activity_date = date.fromisoformat(fields["activityDate"])
    except ValueError as error:
        raise HTTPException(status_code=422, detail="วันที่จัดกิจกรรมไม่ถูกต้อง") from error
    if activity_date < date.today():
        raise HTTPException(status_code=422, detail="วันที่จัดกิจกรรมต้องไม่เป็นวันที่ผ่านมาแล้ว")
    return fields


async def _read_attachment(upload) -> StoredDocumentFile:
    """ตรวจชนิดและขนาดไฟล์แนบด้วยเกณฑ์เดียวกับใบปะหน้า ตาม FR-PRJ-04 และ Q-03 ของ specs/005."""
    file_name = upload.filename or "document"
    extension = f".{file_name.rsplit('.', 1)[-1].lower()}" if "." in file_name else ""
    content = await upload.read()
    if extension not in COVER_SHEET_ALLOWED_EXTENSIONS or not content.startswith(COVER_SHEET_SIGNATURES[extension]):
        raise HTTPException(status_code=422, detail="รับเฉพาะไฟล์ PDF, JPG หรือ PNG")
    if len(content) > COVER_SHEET_MAX_BYTES:
        raise HTTPException(status_code=422, detail=f"ไฟล์ต้องไม่เกิน {COVER_SHEET_MAX_MEGABYTES} MB")
    return StoredDocumentFile(file_name=file_name, media_type=MEDIA_TYPES[extension], content=content)


@project_document_router.get("/project-documents/checklist")
def get_project_checklist(_: AuthenticatedUserContext = Depends(require_club)) -> list[dict]:
    """คืน Checklist เอกสารที่ต้องแนบ ตาม FR-PRJ-03 และ IF-CHK-01."""
    return [{"id": item.id, "code": item.code, "name": item.name} for item in PROJECT_CHECKLIST]


@project_document_router.get("/project-documents/central-checklist")
def get_central_checklist(
    _: AuthenticatedUserContext = Depends(require_club),
    session: Session = Depends(get_checklist_session),
) -> list[str]:
    """ให้กรรมการเห็น Checklist กลางชุดเดียวกับเจ้าหน้าที่แบบอ่านอย่างเดียว ตาม FR-PRJ-03 และ IF-CHK-02."""
    return [item.item_name for item in ChecklistService.latest_items(session)]


@project_document_router.get("/project-documents")
def list_project_documents(
    user: AuthenticatedUserContext = Depends(require_club),
    service: ProjectDocumentService = Depends(get_project_document_service),
) -> list[dict]:
    """คืนโครงการของผู้ใช้พร้อมสถานะล่าสุด ตาม FR-PRJ-05 และ FR-PRJ-06."""
    return [_summary(project, service) for project in service.list_for_owner(user.user_id)]


@project_document_router.get("/project-documents/{project_id}")
def get_project_document(
    project_id: str,
    user: AuthenticatedUserContext = Depends(require_club),
    service: ProjectDocumentService = Depends(get_project_document_service),
    session: Session = Depends(get_checklist_session),
) -> dict:
    """คืนข้อมูลเดิมพร้อมเหตุผลตีกลับ เส้นทางเอกสาร และผลตรวจ ตาม FR-PRJ-06."""
    project = service.get_for_owner(project_id, user.user_id)
    if project is None:
        raise HTTPException(status_code=404, detail="ไม่พบโครงการ")
    return _detail(project, service, session)


@project_document_router.get("/project-documents/{project_id}/attachments/{item_id}/file")
def get_project_attachment(
    project_id: str,
    item_id: str,
    user: AuthenticatedUserContext = Depends(require_club),
    service: ProjectDocumentService = Depends(get_project_document_service),
) -> Response:
    """เปิดไฟล์เอกสารแนบของโครงการตนเอง ตาม FR-PRJ-04."""
    project = service.get_for_owner(project_id, user.user_id)
    file = project.attachments.get(item_id) if project else None
    if file is None:
        raise HTTPException(status_code=404, detail="ไม่พบไฟล์เอกสาร")
    return _file_response(file)


@project_document_router.post("/project-documents")
async def submit_project_document(
    request: Request,
    fields: str = Form(),
    project_id: str | None = Form(default=None),
    user: AuthenticatedUserContext = Depends(require_club),
    service: ProjectDocumentService = Depends(get_project_document_service),
) -> Response:
    """บันทึกเข้าคิวเมื่อเอกสารครบ และปฏิเสธพร้อมรายการที่ขาด ตาม FR-PRJ-05 และ FR-PRJ-07."""
    parsed_fields = _parse_fields(fields)
    form = await request.form()
    checklist_ids = {item.id for item in PROJECT_CHECKLIST}
    files = {}
    for key, value in form.multi_items():
        if key in checklist_ids and getattr(value, "filename", None):
            files[key] = await _read_attachment(value)
    try:
        project = service.submit(
            user.user_id,
            SAMPLE_CLUB_NAME,
            parsed_fields,
            files,
            project_id or None,
        )
    except MissingAttachments as error:
        return JSONResponse(
            status_code=422,
            content={
                "detail": str(error),
                "missing": [{"id": item.id, "code": item.code, "name": item.name} for item in error.missing],
            },
        )
    except ProjectDocumentError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    return JSONResponse(_detail(project, service))


@project_document_router.get("/submissions/{submission_id}/documents")
def list_submission_documents(
    submission_id: int,
    _: AuthenticatedUserContext = Depends(require_faculty),
    service: ProjectDocumentService = Depends(get_project_document_service),
) -> list[dict]:
    """คืนไฟล์ที่กรรมการแนบเพื่อให้เจ้าหน้าที่ตรวจ ตาม FR-VDC-02 และ FR-VDC-04."""
    project = service.get_by_submission(submission_id)
    if project is None:
        return []
    return [
        {"id": item.id, "type": item.code, "title": item.name, "reference": project.attachments[item.id].file_name}
        for item in PROJECT_CHECKLIST
        if item.id in project.attachments
    ]


@project_document_router.get("/submissions/{submission_id}/documents/{item_id}/file")
def get_submission_document(
    submission_id: int,
    item_id: str,
    _: AuthenticatedUserContext = Depends(require_faculty),
    service: ProjectDocumentService = Depends(get_project_document_service),
) -> Response:
    """เปิดไฟล์ที่กรรมการแนบ ตาม FR-VDC-04."""
    project = service.get_by_submission(submission_id)
    file = project.attachments.get(item_id) if project else None
    if file is None:
        raise HTTPException(status_code=404, detail="ไม่พบไฟล์เอกสาร")
    return _file_response(file)


def _faculty_results(project: ProjectDocument, session: Session) -> list[dict[str, str]]:
    evaluations = ProjectReviewService.list_latest_evaluations(session, project.submission_id)
    return [
        {"item_name": item["item_name"], "result": item["result"]}
        for item in evaluations
        if item["selected"]
    ]


@project_document_router.get("/submissions/{submission_id}/history")
def get_submission_history(
    submission_id: int,
    _: AuthenticatedUserContext = Depends(require_faculty),
    service: ProjectDocumentService = Depends(get_project_document_service),
) -> list[dict]:
    """คืนประวัติการตีกลับให้เจ้าหน้าที่เห็นจุดที่เคยให้แก้ ตาม FR-VDC-04."""
    project = service.get_by_submission(submission_id)
    return service.history_of(project) if project else []


@project_document_router.get("/project-approvals/{approval_id}/review-context")
def get_approval_review_context(
    approval_id: str,
    _: AuthenticatedUserContext = Depends(require_approval_reader),
    service: ProjectDocumentService = Depends(get_project_document_service),
    session: Session = Depends(get_checklist_session),
) -> dict:
    """คืนผล Checklist ของเจ้าหน้าที่คณะและประวัติการตีกลับให้ผู้ตรวจขั้นถัดไป ตาม FR-APR-02."""
    project = service.get_by_approval(approval_id)
    if project is None:
        # โครงการตัวอย่างของ UC-05 ไม่ได้เริ่มจาก UC-01 จึงใช้ผลตรวจตัวอย่างเพื่อให้เห็นหน้าจอครบ
        results = SAMPLE_FACULTY_RESULTS if approval_id.startswith("approval-005-") else []
        return {"faculty_checklist": list(results), "history": []}
    return {"faculty_checklist": _faculty_results(project, session), "history": service.history_of(project)}
