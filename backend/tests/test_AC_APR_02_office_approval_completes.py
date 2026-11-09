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
    # (อ่านสถานะผ่านอาจารย์ เพราะกองกิจเปิดชุด "ส่งต่ออาจารย์" ไม่ได้ ตามที่ทีมตัดสิน F-018 2569-11-09)
    assert response.status_code == 409
    assert advisor.get(BASE_URL).json()["status"] == "ส่งต่ออาจารย์"
    assert service.uc10.list_requests() == []


def test_AC_APR_02_office_list_shows_only_pending(advisor, office):
    # Given มีเอกสารที่อาจารย์ส่งใบปะหน้าแล้ว 1 ชุด
    submit_cover_sheet(advisor)
    # When กองกิจเปิดรายการเอกสาร
    response = office.get("/project-approvals")
    # Then เห็นเฉพาะเอกสารสถานะรออนุมัติ
    assert [item["id"] for item in response.json()] == [SAMPLE_APPROVAL_ID]


OFFICE_READ_PATHS = [
    BASE_URL,
    f"{BASE_URL}/documents/ks-002",
    f"{BASE_URL}/documents/ks-002/file",
    f"{BASE_URL}/cover-sheet/file",
    f"{BASE_URL}/review-context",
]


def test_AC_APR_02_office_cannot_open_forwarded_approval(office):
    # Given เอกสารยังอยู่ขั้นอาจารย์ สถานะ "ส่งต่ออาจารย์" (ทีมตัดสิน F-018 2569-11-09)
    # When กองกิจเปิดชุดนั้นด้วย approvalId โดยตรง
    responses = [office.get(path) for path in OFFICE_READ_PATHS]
    # Then ระบบตอบว่าไม่พบเอกสาร และไม่ส่งข้อมูลเอกสารกลับ
    assert [item.status_code for item in responses] == [404] * len(OFFICE_READ_PATHS)
    assert all("documents" not in item.json() for item in responses)


def test_AC_APR_02_office_opens_approval_after_cover_sheet(advisor, office):
    # Given อาจารย์ส่งใบปะหน้าแล้ว เอกสารเป็น "รออนุมัติ"
    submit_cover_sheet(advisor)
    # When กองกิจเปิดชุดนั้น
    responses = [office.get(path) for path in OFFICE_READ_PATHS]
    # Then เปิดได้ทุกส่วนที่ใช้ตรวจ
    assert [item.status_code for item in responses] == [200] * len(OFFICE_READ_PATHS)
    assert responses[0].json()["status"] == "รออนุมัติ"


def test_AC_APR_02_office_still_opens_after_review_passed(advisor, office):
    # Given กองกิจตรวจผ่านแล้ว เอกสารเป็น "อนุมัติสมบูรณ์"
    submit_cover_sheet(advisor)
    office.post(f"{BASE_URL}/review")
    # When กองกิจเปิดชุดนั้นอีกครั้ง
    response = office.get(BASE_URL)
    # Then ยังเปิดได้ เพราะทีมห้ามเฉพาะสถานะ "ส่งต่ออาจารย์"
    assert response.status_code == 200
    assert response.json()["status"] == "อนุมัติสมบูรณ์"
