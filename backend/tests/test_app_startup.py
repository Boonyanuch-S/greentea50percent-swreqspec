from fastapi.testclient import TestClient

from backend.app.main import app


def test_app_includes_review_queue_router():
    # Given แอป FastAPI เริ่มทำงานพร้อม router สำหรับ UC-03
    client = TestClient(app)
    # When เรียก API คิวเอกสารพร้อมข้อมูลยืนยันตัวตน
    response = client.get("/review-queue", headers={"Authorization": "test-session"})
    # Then router ตอบกลับสำเร็จ
    assert response.status_code == 200
    assert response.json() == []
