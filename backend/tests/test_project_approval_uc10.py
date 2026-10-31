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


def test_project_approval_uc10_records_notification_request(client, service):
    # Given เอกสารอนุมัติสมบูรณ์แล้ว
    service.get_approval(SAMPLE_APPROVAL_ID).status = "อนุมัติสมบูรณ์"
    # When เรียก UC-10 ซ้ำสองครั้ง
    first = client.post(f"{BASE_URL}/notifications/uc-10")
    second = client.post(f"{BASE_URL}/notifications/uc-10")
    # Then มีคำขอแจ้ง UC-10 เพียงรายการเดียว
    assert first.status_code == 200
    assert first.json()["target_use_case"] == "UC-10"
    assert second.json()["requested_at"] == first.json()["requested_at"]
    assert len(service.uc10.list_requests()) == 1


def test_project_approval_uc10_requires_completed_status(client, service):
    # Given เอกสารยังไม่อนุมัติสมบูรณ์
    # When เรียก UC-10
    response = client.post(f"{BASE_URL}/notifications/uc-10")
    # Then ระบบไม่สร้างคำขอแจ้ง
    assert response.status_code == 409
    assert service.uc10.list_requests() == []
