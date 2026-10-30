from datetime import datetime

from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.models.project_submission import ProjectSubmission
from backend.app.routers import review_decisions
from backend.app.services.approval_service import ApprovalService
from backend.app.services.review_queue_service import ReviewQueueService


def test_AC_VDC_01_approve_forwards_to_advisor(monkeypatch):
    # Given เอกสารครบตาม Checklist และมีกรรมการสโมสรเป็นผู้ส่ง
    submission = ProjectSubmission(
        submission_id=101,
        project_id=101,
        submitted_at=datetime(2026, 10, 30),
        sender_user_id="club-101",
        status="รอตรวจสอบ",
        review_queue_order=1,
        project_name="โครงการตัวอย่าง",
        project_owner="ผู้รับผิดชอบ",
        summary="รายละเอียดโครงการ",
        document_url="/documents/101",
        created_at=datetime(2026, 10, 30),
        current_status="รอตรวจสอบ",
    )
    service = ApprovalService(ReviewQueueService([submission]))
    monkeypatch.setattr(review_decisions, "approval_service", service)
    client = TestClient(app)

    # When เจ้าหน้าที่อนุมัติเอกสาร
    response = client.post(
        "/submissions/101/review/approve",
        headers={"Authorization": "reviewer-session"},
        json={"reviewer_user_id": "reviewer-1"},
    )

    # Then ระบบส่งต่อเอกสารและบันทึกการแจ้งกรรมการก่อนตอบกลับ
    assert response.status_code == 200
    assert response.json()["decision_type"] == "approve"
    assert response.json()["status"] == "ส่งต่ออาจารย์"
    assert response.json()["handoff"] == {
        "target_use_case": "UC-05",
        "status": "queued",
    }
    assert submission.status == "ส่งต่ออาจารย์"
    assert service.list_advisor_handoffs() == [submission]
    notifications = service.list_club_notifications()
    assert len(notifications) == 1
    assert notifications[0].target_user_id == "club-101"
    assert notifications[0].target_case == "UC-01"
    assert notifications[0].message == "โครงการได้รับอนุมัติแล้ว"
    assert notifications[0].sent_at is not None
