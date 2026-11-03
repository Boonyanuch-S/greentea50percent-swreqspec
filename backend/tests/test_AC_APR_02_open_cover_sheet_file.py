from backend.app.services.project_approval_service import SAMPLE_APPROVAL_ID

BASE = f"/project-approvals/{SAMPLE_APPROVAL_ID}"
PNG_BYTES = b"\x89PNG\r\n\x1a\n" + b"0" * 16


def _upload_cover_sheet(advisor):
    assert advisor.post(f"{BASE}/content-approval").status_code == 200
    response = advisor.post(
        f"{BASE}/cover-sheet",
        files={"file": ("ใบปะหน้า.png", PNG_BYTES, "image/png")},
    )
    assert response.status_code == 200


def test_AC_APR_02_office_opens_uploaded_cover_sheet(advisor, office):
    # Given อาจารย์อัปโหลดใบปะหน้าที่เซ็นแล้ว
    _upload_cover_sheet(advisor)

    # When กองกิจเปิดไฟล์ใบปะหน้า
    response = office.get(f"{BASE}/cover-sheet/file")

    # Then ได้ไฟล์เดิมตามชนิดไฟล์
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.content == PNG_BYTES


def test_AC_APR_02_cover_sheet_file_not_found_before_upload(office):
    # Given อาจารย์ยังไม่อัปโหลดใบปะหน้า
    # When กองกิจเปิดไฟล์
    response = office.get(f"{BASE}/cover-sheet/file")

    # Then ระบบแจ้งว่ายังไม่มีไฟล์
    assert response.status_code == 404
