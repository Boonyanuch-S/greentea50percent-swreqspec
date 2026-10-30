from fastapi.testclient import TestClient

from backend.app.main import app


def test_AC_VDC_06_unauthenticated_user_blocked():
    # Given ผู้ใช้ยังไม่ได้เข้าสู่ระบบ
    client = TestClient(app)
    # When พยายามเข้าถึงคิวและรายละเอียดเอกสารโครงการ
    queue_response = client.get("/review-queue")
    submission_response = client.get("/submissions/1")
    # Then ระบบปฏิเสธการเข้าถึงทั้งสอง endpoint
    assert queue_response.status_code == 401
    assert submission_response.status_code == 401
