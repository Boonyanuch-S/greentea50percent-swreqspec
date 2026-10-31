import pytest

from backend.app.config import COVER_SHEET_MAX_BYTES, COVER_SHEET_SIGNATURES
from backend.app.services.project_approval_service import SAMPLE_APPROVAL_ID

BASE_URL = f"/project-approvals/{SAMPLE_APPROVAL_ID}"
PDF = COVER_SHEET_SIGNATURES[".pdf"] + b"signed"


def upload(client, file_name="cover-sheet.pdf", content=PDF):
    return client.post(f"{BASE_URL}/cover-sheet", files={"file": (file_name, content)})


def test_AC_APR_02_cover_sheet_upload_accepted(advisor, service):
    # Given อาจารย์อนุมัติเนื้อหาแล้ว และเอกสารอยู่ที่สถานะส่งต่ออาจารย์
    advisor.post(f"{BASE_URL}/content-approval")
    assert advisor.get(BASE_URL).json()["status"] == "ส่งต่ออาจารย์"
    # When อาจารย์อัปโหลดใบปะหน้าที่เซ็นแล้ว
    response = upload(advisor)
    # Then ระบบรับไฟล์และสถานะเปลี่ยนเป็นรออนุมัติ
    assert response.status_code == 200
    assert response.json()["file_name"] == "cover-sheet.pdf"
    assert response.json()["status"] == "รออนุมัติ"
    assert advisor.get(BASE_URL).json()["status"] == "รออนุมัติ"
    assert service.get_cover_sheet(SAMPLE_APPROVAL_ID).uploaded_by == "intuwet_p@silpakorn.edu"
    assert advisor.get(BASE_URL).json()["cover_sheet"]["file_name"] == "cover-sheet.pdf"


def test_AC_APR_02_cover_sheet_requires_content_approval_first(advisor, service):
    # Given อาจารย์ยังไม่ได้อนุมัติเนื้อหาตาม ASM-01
    # When อัปโหลดใบปะหน้า
    response = upload(advisor)
    # Then ระบบปฏิเสธและไม่บันทึกไฟล์
    assert response.status_code == 409
    assert service.get_cover_sheet(SAMPLE_APPROVAL_ID) is None


@pytest.mark.parametrize(
    ("file_name", "content"),
    [
        ("cover-sheet.exe", PDF),
        ("cover-sheet.pdf", b"MZ-not-a-pdf"),
        ("cover-sheet.png", PDF),
        ("cover-sheet.pdf", PDF + b"x" * COVER_SHEET_MAX_BYTES),
    ],
)
def test_AC_APR_02_cover_sheet_upload_rejects_invalid_file(advisor, service, file_name, content):
    # Given อาจารย์อนุมัติเนื้อหาแล้ว
    advisor.post(f"{BASE_URL}/content-approval")
    # When อัปโหลดไฟล์ที่ชนิดหรือขนาดไม่ตรงตาม Q-03
    response = upload(advisor, file_name, content)
    # Then ระบบแจ้งข้อผิดพลาดและไม่บันทึกไฟล์
    assert response.status_code == 409
    assert response.json()["detail"]
    assert service.get_cover_sheet(SAMPLE_APPROVAL_ID) is None


@pytest.mark.parametrize("file_name", ["cover.PDF", "cover.jpg", "cover.jpeg", "cover.png"])
def test_AC_APR_02_cover_sheet_upload_accepts_allowed_file(advisor, service, file_name):
    # Given อาจารย์อนุมัติเนื้อหาแล้ว
    advisor.post(f"{BASE_URL}/content-approval")
    signature = COVER_SHEET_SIGNATURES[file_name[file_name.index("."):].lower()]
    # When อัปโหลดไฟล์ชนิดที่รับได้ขนาดพอดีเพดาน
    response = upload(advisor, file_name, signature.ljust(COVER_SHEET_MAX_BYTES, b"x"))
    # Then ระบบรับไฟล์
    assert response.status_code == 200
    assert service.get_cover_sheet(SAMPLE_APPROVAL_ID).file_name == file_name


def test_AC_APR_02_reupload_replaces_previous_file(advisor, service):
    # Given อาจารย์อัปโหลดใบปะหน้าแล้ว
    advisor.post(f"{BASE_URL}/content-approval")
    upload(advisor, "first.pdf")
    # When อัปโหลดใหม่ระหว่างสถานะรออนุมัติตาม ASM-03
    response = upload(advisor, "second.pdf")
    # Then ระบบใช้ไฟล์ล่าสุด
    assert response.status_code == 200
    assert service.get_cover_sheet(SAMPLE_APPROVAL_ID).file_name == "second.pdf"
