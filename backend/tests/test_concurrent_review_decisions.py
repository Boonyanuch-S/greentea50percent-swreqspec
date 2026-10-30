from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from threading import Barrier

from backend.app.models.project_submission import ProjectSubmission
from backend.app.services.approval_service import ApprovalService
from backend.app.services.rejection_service import RejectionService
from backend.app.services.review_queue_service import ReviewQueueService


def test_latest_concurrent_review_decision_replaces_previous():
    # Given เจ้าหน้าที่สองคนกำลังตัดสินเอกสารฉบับเดียวกัน
    submission = ProjectSubmission(
        submission_id=301,
        project_id=301,
        submitted_at=datetime(2026, 10, 30),
        sender_user_id="club-301",
        status="รอตรวจสอบ",
        review_queue_order=1,
        project_name="โครงการตัวอย่าง",
        project_owner="ผู้รับผิดชอบ",
        summary="รายละเอียดโครงการ",
        document_url="/documents/301",
        created_at=datetime(2026, 10, 30),
        current_status="รอตรวจสอบ",
    )
    queue = ReviewQueueService([submission])
    approval_service = ApprovalService(queue)
    rejection_service = RejectionService(queue)
    start = Barrier(2)

    def approve():
        start.wait()
        return approval_service.approve(301, "reviewer-approve")

    def reject():
        start.wait()
        return rejection_service.reject(301, "reviewer-reject", "เหตุผลก่อน")

    # When คำขออนุมัติและตีกลับเข้ามาพร้อมกัน แล้วมีคำตัดสินล่าสุดตามมา
    with ThreadPoolExecutor(max_workers=2) as executor:
        approval = executor.submit(approve)
        rejection = executor.submit(reject)
        approval.result()
        rejection.result()

    concurrent_decisions = (
        approval_service.list_decisions()
        + rejection_service.list_decisions()
    )
    assert len(concurrent_decisions) == 1
    if concurrent_decisions[0].decision_type == "approve":
        assert submission.status == "ส่งต่ออาจารย์"
        assert rejection_service.list_member_messages() == []
        assert len(approval_service.list_club_notifications()) == 1
    else:
        assert concurrent_decisions[0].decision_type == "reject"
        assert submission.status == "ตีกลับให้แก้ไข"
        assert approval_service.list_club_notifications() == []
        assert len(rejection_service.list_member_messages()) == 1

    latest_result = rejection_service.reject(
        301,
        "reviewer-latest",
        "เหตุผลล่าสุด",
    )

    # Then เหลือคำตัดสินและข้อความแจ้งของรายการล่าสุดเท่านั้น
    assert latest_result is not None
    latest_decisions = (
        approval_service.list_decisions()
        + rejection_service.list_decisions()
    )
    assert len(latest_decisions) == 1
    assert latest_decisions[0].decision_type == "reject"
    assert latest_decisions[0].reviewer_user_id == "reviewer-latest"
    assert submission.status == "ตีกลับให้แก้ไข"
    assert approval_service.list_advisor_handoffs() == []
    assert approval_service.list_club_notifications() == []
    latest_messages = rejection_service.list_member_messages()
    assert len(latest_messages) == 1
    assert latest_messages[0].reason_text == "เหตุผลล่าสุด"
