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


def test_AC_APR_04_return_full_document_with_comment(client, service):
    # Given กองกิจตรวจสอบเอกสารแล้วไม่เห็นด้วย
    client.post(f"{BASE_URL}/content-approval", json=ACTOR)
    upload_cover_sheet(client)
    comment = "แก้ตัวชี้วัดในเล่มโครงการให้วัดผลได้"
    # When กองกิจกดตีกลับและกรอกคอมเมนต์รายละเอียดที่ต้องแก้ไข
    response = client.post(
        f"{BASE_URL}/return",
        json={"actor_user_id": "preechawai_p@silpakorn.edu", "comment_text": comment},
    )
    # Then ระบบส่งเอกสารทั้งชุดกลับไปยัง UC-01 พร้อมคอมเมนต์ครบถ้วน
    assert response.status_code == 200
    assert response.json()["status"] == "ตีกลับให้แก้ไข"
    assert response.json()["target_use_case"] == "UC-01"
    assert response.json()["comment_text"] == comment
    assert len(response.json()["documents"]) == 3
    package = service.uc01.list_packages()[0]
    assert package.comment_text == comment
    assert len(package.documents) == 3
    assert service.list_comments(SAMPLE_APPROVAL_ID)[0].comment_text == comment
    assert service.uc10.list_requests() == []


def test_AC_APR_04_blank_comment_is_rejected(client, service):
    # Given กองกิจตรวจสอบเอกสารแล้วไม่เห็นด้วย
    client.post(f"{BASE_URL}/content-approval", json=ACTOR)
    upload_cover_sheet(client)
    # When ตีกลับโดยไม่กรอกคอมเมนต์
    response = client.post(f"{BASE_URL}/return", json={**ACTOR, "comment_text": "   "})
    # Then ระบบไม่ส่งเอกสารกลับ
    assert response.status_code == 422
    assert service.uc01.list_packages() == []
    assert client.get(BASE_URL).json()["status"] == "รออนุมัติ"
