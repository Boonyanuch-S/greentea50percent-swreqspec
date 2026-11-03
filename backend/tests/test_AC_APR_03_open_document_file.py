from backend.app.services.project_approval_service import SAMPLE_APPROVAL_ID

FILE_URL = f"/project-approvals/{SAMPLE_APPROVAL_ID}/documents/project-book/file"


def test_AC_APR_03_advisor_opens_selected_document_file(advisor):
    # Given เอกสารในชุดมีไฟล์ที่อัปโหลดไว้
    # When อาจารย์เปิดเอกสารรายการที่เลือก
    response = advisor.get(FILE_URL)

    # Then ระบบส่งไฟล์เพื่อแสดงในหน้าโดยไม่ให้เบราว์เซอร์เดาชนิดไฟล์
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.headers["content-disposition"].startswith("inline")
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.content.startswith(b"%PDF-")


def test_AC_APR_02_office_opens_document_file(office):
    # Given กองกิจตรวจเอกสารทั้งชุด
    # When เปิดไฟล์เอกสาร
    response = office.get(FILE_URL)

    # Then เปิดได้
    assert response.status_code == 200


def test_AC_APR_03_missing_document_file_returns_not_found(advisor):
    # Given เอกสารรายการนี้ไม่อยู่ในชุด
    # When เปิดไฟล์
    response = advisor.get(f"/project-approvals/{SAMPLE_APPROVAL_ID}/documents/unknown/file")

    # Then ระบบแจ้งว่าไม่มีไฟล์
    assert response.status_code == 404


def test_AC_APR_06_document_file_requires_login(service):
    # Given ผู้ใช้ยังไม่ได้เข้าสู่ระบบ
    from fastapi.testclient import TestClient

    from backend.app.main import app

    # When เปิดไฟล์โดยไม่มี Token
    response = TestClient(app).get(FILE_URL)

    # Then ระบบปฏิเสธ
    assert response.status_code == 401
