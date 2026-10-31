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


def test_AC_APR_03_select_project_document(client):
    # Given มีเอกสารโครงการที่รออนุมัติ
    # When อาจารย์เปิดหน้าอนุมัติและเลือกเอกสารรายการหนึ่ง
    approval = client.get(BASE_URL)
    selected = client.get(f"{BASE_URL}/documents/ks-002")
    # Then ระบบคืนเอกสารรายการที่เลือก โดยมีรายการเอกสารทั้งชุดให้เลือกดู
    assert approval.status_code == 200
    assert [item["id"] for item in approval.json()["documents"]] == [
        "project-book",
        "ks-002",
        "activity-attachment",
    ]
    assert selected.status_code == 200
    assert selected.json()["title"] == "แบบ กส 002"
    assert selected.json()["objectives"] == ["สรุปรายละเอียดการดำเนินโครงการ"]
    assert selected.json()["indicators"]
    assert selected.json()["format"]


def test_AC_APR_03_unknown_document_is_not_found(client):
    # Given มีเอกสารโครงการที่รออนุมัติ
    # When เลือกเอกสารที่ไม่อยู่ในชุดนี้
    response = client.get(f"{BASE_URL}/documents/unknown")
    # Then ระบบไม่คืนเอกสารอื่นแทน
    assert response.status_code == 404
