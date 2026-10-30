from datetime import datetime

from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.models.project_submission import ProjectSubmission
from backend.app.routers import review_decisions
from backend.app.services.rejection_service import RejectionService
from backend.app.services.review_queue_service import ReviewQueueService


def test_AC_VDC_02_reject_sends_reason_to_member(monkeypatch):
    # Given เอกสารไม่ครบตาม Checklist และเจ้าหน้าที่เข้าสู่ระบบแล้ว
    submission = ProjectSubmission(
        submission_id=20,
        project_id=20,
        submitted_at=datetime(2026, 10, 30),
        sender_user_id="club-20",
        status="รอตรวจสอบ",
        review_queue_order=1,
        project_name="โครงการทดสอบการตีกลับ",
        project_owner="สโมสรนักศึกษาคณะวิทยาศาสตร์",
        summary="รายละเอียดโครงการ",
        document_url="/documents/20",
        created_at=datetime(2026, 10, 30),
        current_status="รอตรวจสอบ",
    )
    service = RejectionService(ReviewQueueService([submission]))
    monkeypatch.setattr(review_decisions, "rejection_service", service)
    client = TestClient(app)
    reason = "เอกสารประกอบยังไม่ครบ"

    # When เจ้าหน้าที่ตีกลับพร้อมระบุเหตุผล
    response = client.post(
        "/submissions/20/review/reject",
        headers={"Authorization": "reviewer-session"},
        json={
            "reviewer_user_id": "reviewer-1",
            "reason_text": reason,
        },
    )

    # Then สถานะถูกเปลี่ยนและเหตุผลถูกส่งเข้าคิวจำลอง UC-01 ของกรรมการสโมสร
    assert response.status_code == 200
    assert response.json()["status"] == "ตีกลับให้แก้ไข"
    assert response.json()["notification"] == {
        "target_user_id": "club-20",
        "target_use_case": "UC-01",
        "status": "queued",
        "reason_text": reason,
    }
    assert submission.status == "ตีกลับให้แก้ไข"
