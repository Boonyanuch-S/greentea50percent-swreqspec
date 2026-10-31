import pytest
from fastapi.testclient import TestClient

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


def test_AC_APR_02_office_approval_completes(client, service):
    # Given อาจารย์อัปโหลดใบปะหน้าที่เซ็นแล้ว และระบบรับไฟล์
    client.post(f"{BASE_URL}/content-approval", json=ACTOR)
    upload_cover_sheet(client)
    assert client.get(BASE_URL).json()["status"] == "รออนุมัติ"
    # When กองกิจตรวจสอบเอกสารและให้ผ่าน
    response = client.post(f"{BASE_URL}/review", json={"actor_user_id": "preechawai_p@silpakorn.edu"})
    # Then สถานะเปลี่ยนเป็นอนุมัติสมบูรณ์ และระบบเรียก UC-10 เพื่อแจ้งกรรมการสโมสร
    assert response.status_code == 200
    assert response.json()["status"] == "อนุมัติสมบูรณ์"
    assert response.json()["completed_at"]
    assert [item.approval_id for item in service.uc10.list_requests()] == [SAMPLE_APPROVAL_ID]


def test_AC_APR_02_review_requires_cover_sheet(client, service):
    # Given อาจารย์อนุมัติเนื้อหาแล้วแต่ยังไม่มีใบปะหน้าตาม ASM-01
    client.post(f"{BASE_URL}/content-approval", json=ACTOR)
    # When กองกิจให้ผ่าน
    response = client.post(f"{BASE_URL}/review", json=ACTOR)
    # Then สถานะไม่เปลี่ยนและไม่เรียก UC-10
    assert response.status_code == 409
    assert client.get(BASE_URL).json()["status"] == "รออนุมัติ"
    assert service.uc10.list_requests() == []
