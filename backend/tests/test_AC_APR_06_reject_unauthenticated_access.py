import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.services.project_approval_service import SAMPLE_APPROVAL_ID

BASE_URL = f"/project-approvals/{SAMPLE_APPROVAL_ID}"


@pytest.mark.parametrize(
    ("method", "path"),
    [
        ("get", BASE_URL),
        ("get", f"{BASE_URL}/documents/project-book"),
        ("post", f"{BASE_URL}/content-approval"),
        ("post", f"{BASE_URL}/cover-sheet"),
        ("post", f"{BASE_URL}/review"),
        ("post", f"{BASE_URL}/return"),
        ("post", f"{BASE_URL}/notifications/uc-10"),
    ],
)
def test_AC_APR_06_reject_unauthenticated_access(method, path):
    # Given ผู้ใช้ยังไม่ได้เข้าสู่ระบบ
    client = TestClient(app)
    # When พยายามเข้าถึงฟีเจอร์อนุมัติเอกสาร
    response = client.request(method, path)
    # Then ระบบปฏิเสธการเข้าถึงจนกว่าจะยืนยันตัวตนสำเร็จ
    assert response.status_code == 401
