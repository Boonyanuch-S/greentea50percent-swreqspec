import pytest
from fastapi.testclient import TestClient

from backend.app.main import FRONTEND_DIST, app

client = TestClient(app)


@pytest.mark.skipif(not FRONTEND_DIST.is_dir(), reason="ยังไม่ได้ build หน้าเว็บ")
def test_port_serves_built_frontend():
    # Given backend ที่มีหน้าเว็บ build แล้ว
    # When เปิดหน้าแรกพร้อม URL ของหน้าใดหน้าหนึ่ง
    response = client.get("/?submission=2")

    # Then ได้หน้าเว็บ
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]


def test_api_prefix_reaches_same_api():
    # Given หน้าเว็บที่ build แล้วเรียก API ด้วย /api
    # When เข้าสู่ระบบผ่าน /api/login
    response = client.post(
        "/api/login",
        json={"username": "faculty@silpakorn.edu", "password": "advisor1234"},
    )

    # Then ได้ Token เหมือนเรียก /login
    assert response.status_code == 200
    assert response.json()["role"] == "faculty_officer"
