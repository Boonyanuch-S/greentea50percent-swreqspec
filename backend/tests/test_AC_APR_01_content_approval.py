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


def test_AC_APR_01_content_approval(client, service):
    # Given เอกสารครบทั้งชุดแล้ว
    assert len(client.get(BASE_URL).json()["documents"]) == 3
    # When อาจารย์กดอนุมัติเนื้อหาออนไลน์
    response = client.post(f"{BASE_URL}/content-approval", json=ACTOR)
    # Then ระบบบันทึกวันเวลาอนุมัติ และแจ้งให้พิมพ์ใบปะหน้า
    assert response.status_code == 200
    assert response.json()["content_approved_at"]
    assert "ใบปะหน้า" in response.json()["print_message"]
    assert client.get(BASE_URL).json()["content_approved_at"]
    actions = service.list_actions(SAMPLE_APPROVAL_ID)
    assert [(item.actor_id, item.action) for item in actions] == [
        (ACTOR["actor_user_id"], "content_approved")
    ]


def test_AC_APR_01_repeat_approval_keeps_first_timestamp(client, service):
    # Given อาจารย์อนุมัติเนื้อหาแล้ว
    first = client.post(f"{BASE_URL}/content-approval", json=ACTOR)
    # When ส่งคำขออนุมัติซ้ำ
    second = client.post(f"{BASE_URL}/content-approval", json=ACTOR)
    # Then วันเวลาอนุมัติเดิมไม่เปลี่ยนและไม่มีประวัติซ้ำ
    assert second.json()["content_approved_at"] == first.json()["content_approved_at"]
    assert len(service.list_actions(SAMPLE_APPROVAL_ID)) == 1
