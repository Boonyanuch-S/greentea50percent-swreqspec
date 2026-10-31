from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.services.project_approval_service import SAMPLE_APPROVAL_ID

BASE_URL = f"/project-approvals/{SAMPLE_APPROVAL_ID}"
ENDPOINTS = [
    ("get", "/project-approvals"),
    ("get", BASE_URL),
    ("get", f"{BASE_URL}/documents/project-book"),
    ("post", f"{BASE_URL}/content-approval"),
    ("post", f"{BASE_URL}/cover-sheet"),
    ("post", f"{BASE_URL}/review"),
    ("post", f"{BASE_URL}/return"),
    ("post", f"{BASE_URL}/notifications/uc-10"),
]


@pytest.mark.parametrize(("method", "path"), ENDPOINTS)
@pytest.mark.parametrize("headers", [{}, {"Authorization": "anything-fake"}])
def test_AC_APR_06_reject_unauthenticated_access(method, path, headers):
    # Given ผู้ใช้ยังไม่ได้เข้าสู่ระบบ หรือใช้ Token ที่ระบบไม่ได้ออกให้
    client = TestClient(app, headers=headers)
    # When พยายามเข้าถึงฟีเจอร์อนุมัติเอกสาร
    response = client.request(method, path)
    # Then ระบบปฏิเสธการเข้าถึงจนกว่าจะยืนยันตัวตนสำเร็จ
    assert response.status_code == 401


def test_AC_APR_06_login_token_grants_access(service):
    # Given ผู้ใช้เข้าสู่ระบบด้วยบัญชีอาจารย์
    client = TestClient(app)
    login = client.post(
        "/login",
        json={"username": "intuwet_p@silpakorn.edu", "password": "advisor1234"},
    )
    assert login.status_code == 200
    assert login.json()["role"] == "advisor"
    # When ใช้ Token ที่ได้รับเรียกฟีเจอร์
    response = client.get("/project-approvals", headers={"Authorization": login.json()["token"]})
    # Then ระบบอนุญาต
    assert response.status_code == 200


def test_AC_APR_06_login_expiry_states_timezone():
    # Given ผู้ใช้เข้าสู่ระบบด้วยบัญชีที่ถูกต้อง
    # When ระบบออก Token
    response = TestClient(app).post(
        "/login",
        json={"username": "intuwet_p@silpakorn.edu", "password": "advisor1234"},
    )
    # Then เวลาหมดอายุระบุ timezone และอีก 30 นาทีข้างหน้าตาม IF-TOKEN-01
    expires_at = datetime.fromisoformat(response.json()["expires_at"])
    assert expires_at.tzinfo is not None
    remaining = expires_at - datetime.now(timezone.utc)
    assert timedelta(minutes=29) < remaining <= timedelta(minutes=30)


def test_AC_APR_06_wrong_password_gets_no_token():
    # Given ผู้ใช้กรอกรหัสผ่านผิด
    # When เข้าสู่ระบบ
    response = TestClient(app).post(
        "/login",
        json={"username": "intuwet_p@silpakorn.edu", "password": "wrong"},
    )
    # Then ระบบปฏิเสธด้วยข้อความทั่วไป
    assert response.status_code == 401
    assert response.json()["detail"] == "บัญชีหรือรหัสผ่านไม่ถูกต้อง"


@pytest.mark.parametrize(
    ("role", "path"),
    [
        ("office", f"{BASE_URL}/content-approval"),
        ("advisor", f"{BASE_URL}/review"),
        ("club", f"{BASE_URL}/review"),
        ("advisor", f"{BASE_URL}/notifications/uc-10"),
    ],
)
def test_role_cannot_use_other_role_action(role, path, request):
    # Given ผู้ใช้ login แล้วแต่เป็นคนละบทบาทกับผู้ทำตาม FR-APR-03 และ FR-APR-05
    client = request.getfixturevalue(role)
    # When เรียกฟังก์ชันของบทบาทอื่น
    response = client.post(path)
    # Then ระบบปฏิเสธและสถานะไม่เปลี่ยน
    assert response.status_code == 403


def test_club_role_cannot_read_approvals(club):
    # Given กรรมการสโมสร login แล้ว
    # When เปิดรายการเอกสารของฟีเจอร์นี้
    response = club.get("/project-approvals")
    # Then ระบบปฏิเสธตาม DOM-PDPA-02
    assert response.status_code == 403
