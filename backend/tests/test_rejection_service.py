from datetime import datetime

from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.models.project_submission import ProjectSubmission
from backend.app.routers import review_decisions
from backend.app.services.rejection_service import RejectionService
from backend.app.services.review_queue_service import ReviewQueueService


def test_reject_status_and_reason_sent_to_member(monkeypatch):
    # Given เอกสารที่พบว่าไม่ครบและเจ้าหน้าที่เข้าสู่ระบบแล้ว
    submission = ProjectSubmission(
        submission_id=17,
        project_id=17,
        submitted_at=datetime(2026, 10, 30),
        sender_user_id="club-17",
        status="รอตรวจสอบ",
        review_queue_order=1,
        project_name="โครงการตัวอย่าง",
        project_owner="ผู้รับผิดชอบ",
        summary="รายละเอียดโครงการ",
        document_url="/documents/17",
        created_at=datetime(2026, 10, 30),
        current_status="รอตรวจสอบ",
    )
    service = RejectionService(ReviewQueueService([submission]))
    monkeypatch.setattr(review_decisions, "rejection_service", service)
    client = TestClient(app)
    reason = "เอกสารแนบไม่ครบตามรายการที่ตรวจ"

    # When เจ้าหน้าที่ตีกลับพร้อมระบุเหตุผล
    response = client.post(
        "/submissions/17/review/reject",
        headers={"Authorization": "reviewer-session"},
        json={
            "reviewer_user_id": "reviewer-1",
            "reason_text": reason,
        },
    )

    # Then ระบบเปลี่ยนสถานะและส่งเหตุผลเข้าคิวจำลอง UC-01 ให้กรรมการผู้ส่ง
    assert response.status_code == 200
    assert response.json()["decision_type"] == "reject"
    assert response.json()["status"] == "ตีกลับให้แก้ไข"
    assert response.json()["reason_text"] == reason
    assert response.json()["notification"] == {
        "target_user_id": "club-17",
        "target_use_case": "UC-01",
        "status": "queued",
        "reason_text": reason,
    }
    assert submission.status == "ตีกลับให้แก้ไข"
    assert submission.current_status == "ตีกลับให้แก้ไข"
    assert service.list_decisions()[0].reason_text == reason
    assert service.list_member_messages()[0].target_user_id == "club-17"
