import pytest
from fastapi.testclient import TestClient

from backend.app.config import COVER_SHEET_MAX_BYTES
from backend.app.main import app
from backend.app.routers.project_approvals import get_project_approval_service
from backend.app.services.project_approval_service import (
    SAMPLE_APPROVAL_ID,
    create_sample_project_approval_service,
)

BASE_URL = f"/project-approvals/{SAMPLE_APPROVAL_ID}"
ACTOR = {"actor_user_id": "intuwet_p@silpakorn.edu"}


@pytest.fixture
def service():
    sample_service = create_sample_project_approval_service()
    app.dependency_overrides[get_project_approval_service] = lambda: sample_service
    yield sample_service
    app.dependency_overrides.clear()


@pytest.fixture
def client(service):
    return TestClient(app, headers={"Authorization": "test-session"})


def upload_cover_sheet(client):
    return client.post(
        f"{BASE_URL}/cover-sheet",
        files={"file": ("cover-sheet.pdf", b"signed", "application/pdf")},
        data={"uploaded_by": ACTOR["actor_user_id"]},
    )


def test_AC_APR_02_cover_sheet_upload_accepted(client, service):
    # Given อาจารย์อนุมัติเนื้อหาแล้ว
    client.post(f"{BASE_URL}/content-approval", json=ACTOR)
    # When อาจารย์อัปโหลดใบปะหน้าที่เซ็นแล้ว
    response = upload_cover_sheet(client)
    # Then ระบบรับไฟล์และเอกสารมีสถานะรออนุมัติ
    assert response.status_code == 200
    assert response.json()["file_name"] == "cover-sheet.pdf"
    assert response.json()["status"] == "รออนุมัติ"
    upload = service.get_cover_sheet(SAMPLE_APPROVAL_ID)
    assert upload.uploaded_by == ACTOR["actor_user_id"]
    assert client.get(BASE_URL).json()["cover_sheet"]["file_name"] == "cover-sheet.pdf"


def test_AC_APR_02_cover_sheet_requires_content_approval_first(client, service):
    # Given อาจารย์ยังไม่ได้อนุมัติเนื้อหาตาม ASM-01
    # When อัปโหลดใบปะหน้า
    response = upload_cover_sheet(client)
    # Then ระบบปฏิเสธและไม่บันทึกไฟล์
    assert response.status_code == 409
    assert service.get_cover_sheet(SAMPLE_APPROVAL_ID) is None


@pytest.mark.parametrize(
    ("file_name", "content"),
    [
        ("cover-sheet.exe", b"signed"),
        ("cover-sheet.pdf", b"x" * (COVER_SHEET_MAX_BYTES + 1)),
    ],
)
def test_AC_APR_02_cover_sheet_upload_rejects_invalid_file(client, service, file_name, content):
    # Given อาจารย์อนุมัติเนื้อหาแล้ว
    client.post(f"{BASE_URL}/content-approval", json=ACTOR)
    # When อัปโหลดไฟล์ที่ชนิดหรือขนาดไม่ตรงตาม Q-03
    response = client.post(
        f"{BASE_URL}/cover-sheet",
        files={"file": (file_name, content)},
        data={"uploaded_by": ACTOR["actor_user_id"]},
    )
    # Then ระบบแจ้งข้อผิดพลาดและไม่บันทึกไฟล์
    assert response.status_code == 409
    assert response.json()["detail"]
    assert service.get_cover_sheet(SAMPLE_APPROVAL_ID) is None


@pytest.mark.parametrize("file_name", ["cover.PDF", "cover.jpg", "cover.jpeg", "cover.png"])
def test_AC_APR_02_cover_sheet_upload_accepts_allowed_file(client, service, file_name):
    # Given อาจารย์อนุมัติเนื้อหาแล้ว
    client.post(f"{BASE_URL}/content-approval", json=ACTOR)
    # When อัปโหลดไฟล์ชนิดที่รับได้ขนาดพอดีเพดาน
    response = client.post(
        f"{BASE_URL}/cover-sheet",
        files={"file": (file_name, b"x" * COVER_SHEET_MAX_BYTES)},
        data={"uploaded_by": ACTOR["actor_user_id"]},
    )
    # Then ระบบรับไฟล์
    assert response.status_code == 200
    assert service.get_cover_sheet(SAMPLE_APPROVAL_ID).file_name == file_name
