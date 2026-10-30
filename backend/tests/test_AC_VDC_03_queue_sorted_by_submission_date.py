from datetime import datetime

from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.models.project_submission import ProjectSubmission
from backend.app.routers import review_queue as review_queue_module
from backend.app.services.review_queue_service import ReviewQueueService


def test_AC_VDC_03_queue_sorted_by_submission_date(monkeypatch):
    # Given มีเอกสารโครงการหลายฉบับรอตรวจสอบ โดยวันที่ส่งไม่เรียงตามลำดับข้อมูล
    submissions = [
        ProjectSubmission(
            submission_id=submission_id,
            project_id=submission_id,
            submitted_at=datetime(2026, 9, submitted_day),
            sender_user_id="club-1",
            status="รอตรวจสอบ",
            review_queue_order=submission_id,
            project_name=f"โครงการ {submission_id}",
            project_owner="สโมสรนักศึกษาคณะวิทยาศาสตร์",
            summary="รายละเอียดโครงการ",
            document_url=f"/documents/{submission_id}",
            created_at=datetime(2026, 9, submitted_day),
            current_status="รอตรวจสอบ",
        )
        for submission_id, submitted_day in [(3, 22), (1, 18), (2, 20)]
    ]
    monkeypatch.setattr(
        review_queue_module,
        "review_queue_service",
        ReviewQueueService(submissions),
    )
    client = TestClient(app)

    # When เจ้าหน้าที่เปิดคิวเอกสารพร้อมยืนยันตัวตน
    response = client.get("/review-queue", headers={"Authorization": "test-session"})

    # Then ระบบแสดงลิสต์จากวันที่ส่งเก่าก่อนไปใหม่
    assert response.status_code == 200
    assert [item["submission_id"] for item in response.json()] == [1, 2, 3]
