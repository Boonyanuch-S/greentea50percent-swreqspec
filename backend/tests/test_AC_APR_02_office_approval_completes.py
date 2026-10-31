from backend.app.config import COVER_SHEET_SIGNATURES
from backend.app.services.project_approval_service import SAMPLE_APPROVAL_ID

BASE_URL = f"/project-approvals/{SAMPLE_APPROVAL_ID}"


def submit_cover_sheet(advisor):
    advisor.post(f"{BASE_URL}/content-approval")
    advisor.post(
        f"{BASE_URL}/cover-sheet",
        files={"file": ("cover-sheet.pdf", COVER_SHEET_SIGNATURES[".pdf"] + b"signed")},
    )


def test_AC_APR_02_office_approval_completes(advisor, office, service):
    # Given อาจารย์อัปโหลดใบปะหน้าที่เซ็นแล้ว และระบบรับไฟล์
    submit_cover_sheet(advisor)
    assert office.get(BASE_URL).json()["status"] == "รออนุมัติ"
    # When กองกิจตรวจสอบเอกสารและให้ผ่าน
    response = office.post(f"{BASE_URL}/review")
    # Then สถานะเปลี่ยนเป็นอนุมัติสมบูรณ์ และระบบเรียก UC-10 เพื่อแจ้งกรรมการสโมสร
    assert response.status_code == 200
    assert response.json()["status"] == "อนุมัติสมบูรณ์"
    assert response.json()["completed_at"]
    assert [item.approval_id for item in service.uc10.list_requests()] == [SAMPLE_APPROVAL_ID]
    assert service.list_actions(SAMPLE_APPROVAL_ID)[-1].actor_id == "preechawai_p@silpakorn.edu"


def test_AC_APR_02_review_requires_cover_sheet(advisor, office, service):
    # Given อาจารย์อนุมัติเนื้อหาแล้วแต่ยังไม่มีใบปะหน้าตาม ASM-01
    advisor.post(f"{BASE_URL}/content-approval")
    # When กองกิจให้ผ่าน
    response = office.post(f"{BASE_URL}/review")
    # Then สถานะไม่เปลี่ยนและไม่เรียก UC-10
    assert response.status_code == 409
    assert office.get(BASE_URL).json()["status"] == "ส่งต่ออาจารย์"
    assert service.uc10.list_requests() == []


def test_AC_APR_02_office_list_shows_only_pending(advisor, office):
    # Given มีเอกสารที่อาจารย์ส่งใบปะหน้าแล้ว 1 ชุด
    submit_cover_sheet(advisor)
    # When กองกิจเปิดรายการเอกสาร
    response = office.get("/project-approvals")
    # Then เห็นเฉพาะเอกสารสถานะรออนุมัติ
    assert [item["id"] for item in response.json()] == [SAMPLE_APPROVAL_ID]
