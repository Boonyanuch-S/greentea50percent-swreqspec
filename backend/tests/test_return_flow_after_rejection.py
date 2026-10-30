from datetime import datetime

from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.models.project_submission import ProjectSubmission
from backend.app.routers import review_decisions
from backend.app.services.rejection_service import RejectionService
from backend.app.services.review_queue_service import ReviewQueueService


def test_return_flow_after_rejection(monkeypatch):
    # Given เอกสารเดิมที่มีข้อมูลโครงการและกรรมการผู้ส่ง
    submission = ProjectSubmission(
        submission_id=201,
        project_id=201,
        submitted_at=datetime(2026, 10, 30),
        sender_user_id="club-201",
        status="รอตรวจสอบ",
        review_queue_order=1,
        project_name="โครงการเดิม",
        project_owner="ผู้รับผิดชอบ",
        summary="ข้อมูลเดิม",
        document_url="/documents/201",
        created_at=datetime(2026, 10, 30),
        current_status="รอตรวจสอบ",
    )
    existing_document = (
        submission.project_id,
        submission.project_name,
        submission.project_owner,
        submission.summary,
        submission.document_url,
    )
    queue = ReviewQueueService([submission])
    service = RejectionService(queue)
    monkeypatch.setattr(review_decisions, "rejection_service", service)
    client = TestClient(app)
    reason = "แก้ไขตัวชี้วัดข้อ 2 ให้สอดคล้องกับวัตถุประสงค์ข้อ 2"

    # When เจ้าหน้าที่ตีกลับพร้อมระบุจุดที่ต้องแก้
    response = client.post(
        "/submissions/201/review/reject",
        headers={"Authorization": "reviewer-session"},
        json={"reviewer_user_id": "reviewer-1", "reason_text": reason},
    )

    # Then UC-01 ได้เหตุผลและ submission_id เดิม โดยข้อมูลโครงการไม่ถูกแทนที่
    assert response.status_code == 200
    assert response.json()["submission_id"] == 201
    assert response.json()["reason_text"] == reason
    assert response.json()["notification"] == {
        "target_user_id": "club-201",
        "target_use_case": "UC-01",
        "status": "queued",
        "reason_text": reason,
    }
    assert queue.get_submission(201) is submission
    assert (
        submission.project_id,
        submission.project_name,
        submission.project_owner,
        submission.summary,
        submission.document_url,
    ) == existing_document
    assert submission.status == "ตีกลับให้แก้ไข"
    assert service.list_member_messages()[0].submission_id == 201
