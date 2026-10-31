from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.routers.project_approvals import get_project_approval_service
from backend.app.services.project_approval_service import (
    SAMPLE_APPROVAL_ID,
    create_sample_project_approval_service,
)


def test_AC_APR_05_ai_warning_does_not_block():
    # Given ระบบแสดงคำเตือนทั่วไปทุกครั้งตาม Q-02 และไม่มีกลไกตรวจจับ
    service = create_sample_project_approval_service()
    app.dependency_overrides[get_project_approval_service] = lambda: service
    client = TestClient(app, headers={"Authorization": "test-session"})
    try:
        # When อาจารย์เปิดตรวจเอกสารแล้วกดอนุมัติเนื้อหา
        response = client.post(
            f"/project-approvals/{SAMPLE_APPROVAL_ID}/content-approval",
            json={"actor_user_id": "intuwet_p@silpakorn.edu"},
        )
    finally:
        app.dependency_overrides.clear()
    # Then ระบบไม่ปฏิเสธหรือบล็อกการอนุมัติอัตโนมัติ
    assert response.status_code == 200
    assert response.json()["content_approved_at"]
