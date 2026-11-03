import json
from datetime import date, datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.models.auth_token import UserRole
from backend.app.models.authenticated_user_context import AuthenticatedUserContext
from backend.app.routers import project_documents, review_decisions, review_queue
from backend.app.routers.project_approvals import get_project_approval_service
from backend.app.routers.project_documents import get_project_document_service
from backend.app.services.approval_service import ApprovalService
from backend.app.services.auth_service import token_registry
from backend.app.services.project_approval_service import ProjectApprovalService
from backend.app.services.project_document_service import ProjectDocumentService
from backend.app.services.rejection_service import RejectionService
from backend.app.services.review_queue_service import ReviewQueueService

CLUB_ID = "club@example.test"
PDF = b"%PDF-1.4\n"
FUTURE_DATE = (date.today() + timedelta(days=60)).isoformat()


def _client(user_id, role):
    token = f"workflow-{role.value}"
    now = datetime.now(timezone.utc)
    token_registry.register(
        token,
        AuthenticatedUserContext(user_id, role, now),
        now.replace(tzinfo=None) + timedelta(minutes=30),
    )
    return TestClient(app, headers={"Authorization": token})


@pytest.fixture
def clients(monkeypatch):
    queue = ReviewQueueService()
    approvals = ApprovalService(queue)
    rejections = RejectionService(queue)
    project_approvals = ProjectApprovalService()
    documents = ProjectDocumentService(queue, approvals, rejections, project_approvals)
    monkeypatch.setattr(review_queue, "review_queue_service", queue)
    monkeypatch.setattr(review_decisions, "approval_service", approvals)
    monkeypatch.setattr(review_decisions, "rejection_service", rejections)
    monkeypatch.setattr(project_documents, "project_document_service", documents)
    app.dependency_overrides[get_project_approval_service] = lambda: project_approvals
    app.dependency_overrides[get_project_document_service] = lambda: documents
    yield {
        "club": _client(CLUB_ID, UserRole.CLUB_COMMITTEE),
        "faculty": _client("faculty@example.test", UserRole.FACULTY_OFFICER),
        "advisor": _client("advisor@example.test", UserRole.ADVISOR),
        "office": _client("office@example.test", UserRole.STUDENT_AFFAIRS_OFFICER),
    }
    app.dependency_overrides.pop(get_project_approval_service)
    app.dependency_overrides.pop(get_project_document_service)


def _submit(club, project_id=None, item_ids=("project-book", "ks-002", "activity-attachment")):
    data = {
        "fields": json.dumps(
            {
                "projectName": "โครงการทดสอบปลายทาง",
                "objectives": "วัตถุประสงค์ 1\nวัตถุประสงค์ 2",
                "activityDate": FUTURE_DATE,
                "location": "คณะวิทยาศาสตร์",
                "indicators": "ตัวชี้วัด 1",
            }
        )
    }
    if project_id:
        data["project_id"] = project_id
    files = [(item_id, (f"{item_id}.pdf", PDF, "application/pdf")) for item_id in item_ids]
    return club.post("/project-documents", data=data, files=files)


def _status(club, project_id):
    return club.get(f"/project-documents/{project_id}").json()


def _approve_as_advisor(advisor, approval_id):
    base = f"/project-approvals/{approval_id}"
    for document in advisor.get(base).json()["documents"]:
        assert advisor.put(f"{base}/documents/{document['id']}/review", json={"reviewed": True}).status_code == 200
    assert advisor.post(f"{base}/content-approval").status_code == 200
    response = advisor.post(f"{base}/cover-sheet", files={"file": ("cover.pdf", PDF, "application/pdf")})
    assert response.status_code == 200


def test_project_moves_from_club_to_completed_on_one_data_set(clients):
    # Given กรรมการส่งโครงการพร้อมเอกสารครบ
    project = _submit(clients["club"]).json()
    assert project["status"] == "รอเจ้าหน้าที่คณะตรวจสอบ"

    # When เจ้าหน้าที่คณะเปิดคิว เห็นไฟล์ที่แนบ และอนุมัติ
    queue = clients["faculty"].get("/review-queue").json()
    assert [item["project_name"] for item in queue] == ["โครงการทดสอบปลายทาง"]
    submission_id = queue[0]["submission_id"]
    documents = clients["faculty"].get(f"/submissions/{submission_id}/documents").json()
    assert [item["id"] for item in documents] == ["project-book", "ks-002", "activity-attachment"]
    assert clients["faculty"].get(f"/submissions/{submission_id}/documents/ks-002/file").content == PDF
    response = clients["faculty"].post(
        f"/submissions/{submission_id}/review/approve",
        json={"reviewer_user_id": "faculty@example.test"},
    )
    assert response.status_code == 200

    # Then โครงการเดียวกันไปถึงอาจารย์ และไฟล์เดิมเปิดได้
    assert _status(clients["club"], project["id"])["status"] == "ส่งต่ออาจารย์"
    approvals = clients["advisor"].get("/project-approvals").json()
    assert [item["project_name"] for item in approvals] == ["โครงการทดสอบปลายทาง"]
    approval_id = approvals[0]["id"]
    assert clients["advisor"].get(f"/project-approvals/{approval_id}/documents/project-book/file").content == PDF

    # When อาจารย์ตรวจครบและส่งใบปะหน้า แล้วกองกิจตรวจผ่าน
    _approve_as_advisor(clients["advisor"], approval_id)
    assert _status(clients["club"], project["id"])["status"] == "รอกองกิจตรวจสอบ"
    assert clients["office"].post(f"/project-approvals/{approval_id}/review").status_code == 200

    # Then กรรมการเห็นผลล่าสุดและเส้นทางเอกสารครบ
    final = _status(clients["club"], project["id"])
    assert final["status"] == "อนุมัติสมบูรณ์"
    assert {step["state"] for step in final["route"]} == {"done"}


def test_faculty_rejection_returns_reason_and_club_resubmits(clients):
    # Given เจ้าหน้าที่คณะตีกลับพร้อมเหตุผล
    project = _submit(clients["club"]).json()
    submission_id = clients["faculty"].get("/review-queue").json()[0]["submission_id"]
    clients["faculty"].post(
        f"/submissions/{submission_id}/review/reject",
        json={"reviewer_user_id": "faculty@example.test", "reason_text": "แก้ตัวชี้วัด"},
    )

    # Then กรรมการเห็นเหตุผล และเส้นทางบอกว่าถูกตีกลับที่ขั้นเจ้าหน้าที่คณะ
    returned = _status(clients["club"], project["id"])
    assert (returned["status"], returned["rejectionReason"]) == ("ถูกตีกลับ", "แก้ตัวชี้วัด")
    assert next(step for step in returned["route"] if step["state"] == "returned")["key"] == "faculty"

    # When กรรมการแก้แล้วส่งใหม่โดยไม่ต้องแนบไฟล์เดิมซ้ำ (FR-PRJ-06, Q-04 ของ specs/003)
    response = _submit(clients["club"], project["id"], item_ids=())

    # Then เอกสารกลับเข้าคิว และไม่เหลือเหตุผลเดิม
    assert response.status_code == 200
    assert response.json()["rejectionReason"] is None
    assert len(clients["faculty"].get("/review-queue").json()) == 1


def test_advisor_return_reaches_club_with_comment(clients):
    # Given เอกสารอยู่ที่อาจารย์
    project = _submit(clients["club"]).json()
    submission_id = clients["faculty"].get("/review-queue").json()[0]["submission_id"]
    clients["faculty"].post(
        f"/submissions/{submission_id}/review/approve",
        json={"reviewer_user_id": "faculty@example.test"},
    )
    approval_id = clients["advisor"].get("/project-approvals").json()[0]["id"]

    # When อาจารย์ส่งกลับพร้อมความเห็น
    response = clients["advisor"].post(
        f"/project-approvals/{approval_id}/return",
        json={"comment_text": "ปรับกำหนดการ"},
    )

    # Then กรรมการเห็นความเห็นและแก้ไขได้
    assert response.status_code == 200
    returned = _status(clients["club"], project["id"])
    assert (returned["status"], returned["rejectionReason"]) == ("ถูกตีกลับ", "ปรับกำหนดการ")
    assert _submit(clients["club"], project["id"], item_ids=()).status_code == 200


def test_missing_attachment_is_rejected_and_not_queued(clients):
    # Given กรรมการแนบเอกสารไม่ครบ
    # When กดส่ง
    response = _submit(clients["club"], item_ids=("project-book",))

    # Then ระบบแจ้งรายการที่ขาดและไม่เข้าคิว ตาม AC-PRJ-02
    assert response.status_code == 422
    assert [item["id"] for item in response.json()["missing"]] == ["ks-002", "activity-attachment"]
    assert clients["faculty"].get("/review-queue").json() == []


def test_access_is_limited_by_real_token_and_role(clients):
    # Given Token ปลอม และบทบาทที่ไม่เกี่ยวข้อง
    fake = TestClient(app, headers={"Authorization": "xxx"})

    # Then ปฏิเสธทั้ง UC-03, Checklist กลาง และ UC-07
    assert fake.get("/review-queue").status_code == 401
    assert fake.post("/checklists/items", json={"item_name": "x"}).status_code == 401
    assert clients["club"].get("/review-queue").status_code == 403
    assert clients["club"].post("/checklists/items", json={"item_name": "x"}).status_code == 403
    assert clients["faculty"].get("/activity-hours/documents/pending").status_code == 403
    assert clients["faculty"].get("/project-documents").status_code == 403


def test_club_cannot_read_other_owners_project(clients):
    # Given กรรมการคนหนึ่งส่งโครงการ
    project = _submit(clients["club"]).json()

    # When บัญชีกรรมการอีกคนเปิดโครงการนั้น
    other = _client("other@example.test", UserRole.CLUB_COMMITTEE)

    # Then ไม่พบโครงการ
    assert other.get(f"/project-documents/{project['id']}").status_code == 404


def _approve(clients, submission_id, reviewer="คนอื่น"):
    return clients["faculty"].post(
        f"/submissions/{submission_id}/review/approve",
        json={"reviewer_user_id": reviewer},
    )


def test_approving_twice_does_not_duplicate_advisor_documents(clients):
    # Given เจ้าหน้าที่คณะอนุมัติเอกสารแล้ว
    _submit(clients["club"])
    submission_id = clients["faculty"].get("/review-queue").json()[0]["submission_id"]
    assert _approve(clients, submission_id).status_code == 200

    # When กดอนุมัติซ้ำ
    response = _approve(clients, submission_id)

    # Then ระบบปฏิเสธ และเอกสารของอาจารย์ยังมี 3 ฉบับ
    assert response.status_code == 409
    approval_id = clients["advisor"].get("/project-approvals").json()[0]["id"]
    assert len(clients["advisor"].get(f"/project-approvals/{approval_id}").json()["documents"]) == 3


def test_reject_after_forward_keeps_both_sides_consistent(clients):
    # Given เอกสารส่งต่ออาจารย์แล้ว
    project = _submit(clients["club"]).json()
    submission_id = clients["faculty"].get("/review-queue").json()[0]["submission_id"]
    _approve(clients, submission_id)

    # When เจ้าหน้าที่พยายามตีกลับ
    response = clients["faculty"].post(
        f"/submissions/{submission_id}/review/reject",
        json={"reason_text": "ขอแก้"},
    )

    # Then ระบบปฏิเสธ และสถานะทุกฝั่งยังตรงกัน
    assert response.status_code == 409
    assert _status(clients["club"], project["id"])["status"] == "ส่งต่ออาจารย์"
    assert clients["advisor"].get("/project-approvals").json()[0]["status"] == "ส่งต่ออาจารย์"


@pytest.mark.parametrize(
    ("change", "message"),
    [
        ({"projectName": "   "}, "ชื่อโครงการ"),
        ({"activityDate": "2020-01-01"}, "ผ่านมาแล้ว"),
        ({"activityDate": "ไม่ใช่วันที่"}, "ไม่ถูกต้อง"),
    ],
)
def test_invalid_project_is_rejected(clients, change, message):
    # Given ข้อมูลโครงการไม่ครบหรือวันที่ไม่ถูกต้อง
    fields = {
        "projectName": "โครงการ",
        "objectives": "ก",
        "activityDate": FUTURE_DATE,
        "location": "ข",
        "indicators": "ค",
        **change,
    }

    # When กดส่ง
    response = clients["club"].post("/project-documents", data={"fields": json.dumps(fields)})

    # Then ระบบปฏิเสธและไม่เข้าคิว
    assert response.status_code == 422
    assert message in response.json()["detail"]
    assert clients["faculty"].get("/review-queue").json() == []


def test_malformed_project_fields_return_422(clients):
    # Given ข้อมูลฟอร์มผิดรูปแบบ
    # When ส่งเข้าระบบ
    response = clients["club"].post("/project-documents", data={"fields": "ไม่ใช่ JSON"})

    # Then ระบบตอบว่าไม่ถูกต้อง ไม่เกิด error 500
    assert response.status_code == 422


def test_reviewer_comes_from_token_not_request(clients):
    # Given คำขอที่อ้างชื่อผู้ตรวจคนอื่น
    _submit(clients["club"])
    submission_id = clients["faculty"].get("/review-queue").json()[0]["submission_id"]

    # When อนุมัติ
    response = _approve(clients, submission_id, reviewer="ผู้ปลอม")

    # Then ระบบบันทึกผู้ตรวจจาก Token
    assert response.json()["reviewer_user_id"] == "faculty@example.test"


def test_next_reviewers_see_history_and_faculty_checklist(clients):
    # Given เอกสารถูกตีกลับพร้อมเหตุผล แล้วส่งใหม่
    project = _submit(clients["club"]).json()
    first = clients["faculty"].get("/review-queue").json()[0]["submission_id"]
    clients["faculty"].post(
        f"/submissions/{first}/review/reject",
        json={"reason_text": "เอกสารที่ต้องแก้: กส 002"},
    )
    _submit(clients["club"], project["id"], item_ids=())
    second = clients["faculty"].get("/review-queue").json()[0]["submission_id"]

    # Then เจ้าหน้าที่เห็นว่ารอบก่อนให้แก้อะไร
    history = clients["faculty"].get(f"/submissions/{second}/history").json()
    assert history[0]["reason"] == "เอกสารที่ต้องแก้: กส 002"
    assert history[0]["stage"] == "เจ้าหน้าที่คณะตรวจเอกสาร"

    # When เจ้าหน้าที่บันทึก Checklist แล้วส่งต่อ
    item = clients["faculty"].post("/checklists/items", json={"item_name": "รายการทดสอบ"}).json()
    clients["faculty"].put(
        f"/submissions/{second}/checklist",
        json={"items": [{"checklist_item_id": item["checklist_item_id"], "selected": True, "result": "ครบ"}]},
    )
    _approve(clients, second)

    # Then อาจารย์เห็นผล Checklist และประวัติโดยไม่ต้องตรวจซ้ำจากศูนย์
    approval_id = clients["advisor"].get("/project-approvals").json()[0]["id"]
    context = clients["advisor"].get(f"/project-approvals/{approval_id}/review-context").json()
    assert {"item_name": "รายการทดสอบ", "result": "ครบ"} in context["faculty_checklist"]
    assert context["history"][0]["round"] == 1


def test_all_roles_share_central_checklist_and_results(clients):
    # Given กรรมการส่งโครงการ และเจ้าหน้าที่ตรวจรายการที่ตรงกับไฟล์
    project = _submit(clients["club"]).json()
    submission_id = clients["faculty"].get("/review-queue").json()[0]["submission_id"]
    item = clients["faculty"].post("/checklists/items", json={"item_name": "กส 002"}).json()
    clients["faculty"].put(
        f"/submissions/{submission_id}/checklist",
        json={"items": [{"checklist_item_id": item["checklist_item_id"], "selected": True, "result": "ไม่ครบ"}]},
    )

    # Then กรรมการเห็นรายการกลางและผลตรวจชุดเดียวกัน แต่แก้รายการไม่ได้
    assert "กส 002" in clients["club"].get("/project-documents/central-checklist").json()
    results = _status(clients["club"], project["id"])["checklistResults"]
    assert {"item_name": "กส 002", "result": "ไม่ครบ"} in results
    assert clients["club"].post("/checklists/items", json={"item_name": "x"}).status_code == 403
