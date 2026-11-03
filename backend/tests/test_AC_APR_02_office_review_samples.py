from backend.app.main import app
from backend.app.models.project_approval import PENDING_STATUS
from backend.app.routers.project_approvals import get_project_approval_service
from backend.app.services.project_approval_service import (
    OFFICE_REVIEW_SAMPLES,
    create_sample_project_approval_service,
)

SAMPLE_IDS = [sample[0] for sample in OFFICE_REVIEW_SAMPLES]


def test_AC_APR_02_office_samples_are_ready_for_review(office):
    # Given ข้อมูลตัวอย่างที่ผ่านขั้นของอาจารย์แล้ว
    service = create_sample_project_approval_service(include_office_samples=True)
    app.dependency_overrides[get_project_approval_service] = lambda: service

    # When กองกิจเปิดรายการและเปิดใบปะหน้าของเอกสารชุดแรก
    listed = office.get("/project-approvals").json()
    cover_sheet = office.get(f"/project-approvals/{SAMPLE_IDS[0]}/cover-sheet/file")

    # Then มีเอกสารรอตรวจ ใบปะหน้าเปิดได้ และตรวจผ่านได้
    assert [item["id"] for item in listed] == SAMPLE_IDS
    assert all(item["status"] == PENDING_STATUS for item in listed)
    assert cover_sheet.content.startswith(b"%PDF-")
    assert office.post(f"/project-approvals/{SAMPLE_IDS[0]}/review").status_code == 200


def test_AC_APR_01_default_samples_keep_three_advisor_approvals():
    # Given ข้อมูลตั้งต้นที่ test ของอาจารย์ใช้
    # When สร้างโดยไม่ขอชุดตัวอย่างของกองกิจ
    service = create_sample_project_approval_service()

    # Then ไม่มีเอกสารรอกองกิจปะปน
    assert service.list_approvals(PENDING_STATUS) == []
