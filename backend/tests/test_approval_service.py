from datetime import datetime

from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.models.project_submission import ProjectSubmission
from backend.app.routers import review_decisions
from backend.app.services.approval_service import ApprovalService
from backend.app.services.review_queue_service import ReviewQueueService


def test_approval_status_and_advisor_handoff(monkeypatch):
    # Given เอกสารครบตาม Checklist กลางและเจ้าหน้าที่เข้าสู่ระบบแล้ว
    submission = ProjectSubmission(
        submission_id=14,
        project_id=14,
        submitted_at=datetime(2026, 10, 30),
        sender_user_id="club-14",
        status="รอตรวจสอบ",
        review_queue_order=1,
        project_name="โครงการตัวอย่าง",
        project_owner="ผู้รับผิดชอบ",
        summary="รายละเอียดโครงการ",
        document_url="/documents/14",
        created_at=datetime(2026, 10, 30),
        current_status="รอตรวจสอบ",
    )
    service = ApprovalService(ReviewQueueService([submission]))
    monkeypatch.setattr(review_decisions, "approval_service", service)
    client = TestClient(app)

    # When เจ้าหน้าที่กดอนุมัติ
    response = client.post(
        "/submissions/14/review/approve",
        headers={"Authorization": "reviewer-session"},
        json={"reviewer_user_id": "reviewer-1"},
    )

    # Then ระบบบันทึกคำตัดสิน เปลี่ยนสถานะ และส่งเอกสารเข้า mock queue ของ UC-05
    assert response.status_code == 200
    assert response.json()["decision_type"] == "approve"
    assert response.json()["reviewer_user_id"] == "reviewer-1"
    assert response.json()["status"] == "ส่งต่ออาจารย์"
    assert response.json()["handoff"] == {
        "target_use_case": "UC-05",
        "status": "queued",
    }
    assert submission.status == "ส่งต่ออาจารย์"
    assert submission.current_status == "ส่งต่ออาจารย์"
    assert service.list_decisions()[0].submission_id == 14
    assert service.list_advisor_handoffs() == [submission]
