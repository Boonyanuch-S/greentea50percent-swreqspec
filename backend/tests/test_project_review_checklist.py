from collections.abc import Generator
from datetime import datetime

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.main import app
from backend.app.models.checklist_item import ChecklistBase
from backend.app.models.project_submission import ProjectSubmission
from backend.app.routers import review_queue as review_queue_module
from backend.app.routers.checklists import get_checklist_session
from backend.app.services.review_queue_service import ReviewQueueService


def test_AC_VDC_04_project_details_and_checklist_api(monkeypatch):
    # Given มีเอกสารสองโครงการและ Checklist กลาง โดยยังไม่มีรายการที่เลือก
    submissions = [
        ProjectSubmission(
            submission_id=submission_id,
            project_id=submission_id,
            submitted_at=datetime(2026, 10, submission_id),
            sender_user_id=f"club-{submission_id}",
            status="รอตรวจสอบ",
            review_queue_order=submission_id,
            project_name=f"โครงการ {submission_id}",
            project_owner=f"ผู้รับผิดชอบ {submission_id}",
            summary=f"รายละเอียดโครงการ {submission_id}",
            document_url=f"/documents/{submission_id}",
            created_at=datetime(2026, 10, submission_id),
            current_status="รอตรวจสอบ",
        )
        for submission_id in (1, 2)
    ]
    monkeypatch.setattr(
        review_queue_module,
        "review_queue_service",
        ReviewQueueService(submissions),
    )

    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    ChecklistBase.metadata.create_all(test_engine)
    test_session_factory = sessionmaker(
        bind=test_engine,
        autoflush=False,
        expire_on_commit=False,
    )

    def override_session() -> Generator[Session, None, None]:
        with test_session_factory() as session:
            yield session

    app.dependency_overrides[get_checklist_session] = override_session
    client = TestClient(app)
    headers = {"Authorization": "reviewer-session"}

    try:
        # When เจ้าหน้าที่เปิดรายละเอียดและเลือก Checklist ที่ต่างกันในแต่ละโครงการ
        unauthenticated_details = client.get("/submissions/1")
        details = client.get("/submissions/1", headers=headers)
        missing_checklist = client.get(
            "/submissions/99/checklist",
            headers=headers,
        )
        first_item = client.post(
            "/checklists/items",
            headers=headers,
            json={"item_name": "เอกสารโครงการ"},
        ).json()
        second_item = client.post(
            "/checklists/items",
            headers=headers,
            json={"item_name": "เอกสารประกอบ"},
        ).json()
        initial_checklist = client.get(
            "/submissions/1/checklist",
            headers=headers,
        )
        first_project_update = client.put(
            "/submissions/1/checklist",
            headers=headers,
            json={
                "items": [
                    {
                        "checklist_item_id": first_item["checklist_item_id"],
                        "selected": True,
                        "result": "ครบ",
                    }
                ]
            },
        )
        second_project_update = client.put(
            "/submissions/2/checklist",
            headers=headers,
            json={
                "items": [
                    {
                        "checklist_item_id": second_item["checklist_item_id"],
                        "selected": True,
                        "result": "ไม่ครบ",
                    }
                ]
            },
        )
        unauthenticated_checklist = client.get("/submissions/1/checklist")

        renamed_item = client.patch(
            f"/checklists/items/{first_item['checklist_item_id']}",
            headers=headers,
            json={"item_name": "เอกสารโครงการฉบับแก้ไข"},
        )
        latest_first_project = client.get(
            "/submissions/1/checklist",
            headers=headers,
        )
        latest_second_project = client.get(
            "/submissions/2/checklist",
            headers=headers,
        )

        # Then แต่ละโครงการเห็นรายการที่เลือกและผลของตน โดยสถานะยังผูกกับ item ID เดิม
        assert unauthenticated_details.status_code == 401
        assert details.status_code == 200
        assert details.json()["project_name"] == "โครงการ 1"
        assert missing_checklist.status_code == 404
        assert initial_checklist.status_code == 200
        assert all(
            not item["selected"] and item["result"] is None
            for item in initial_checklist.json()
        )
        assert first_project_update.status_code == 200
        assert second_project_update.status_code == 200
        assert unauthenticated_checklist.status_code == 401
        assert renamed_item.status_code == 200
        assert latest_first_project.status_code == 200
        first_results = {
            item["checklist_item_id"]: item
            for item in latest_first_project.json()
        }
        assert first_results[first_item["checklist_item_id"]] == {
            "checklist_item_id": first_item["checklist_item_id"],
            "item_name": "เอกสารโครงการฉบับแก้ไข",
            "selected": True,
            "result": "ครบ",
        }
        assert first_results[second_item["checklist_item_id"]]["selected"] is False
        assert latest_second_project.status_code == 200
        second_results = {
            item["checklist_item_id"]: item
            for item in latest_second_project.json()
        }
        assert second_results[first_item["checklist_item_id"]]["selected"] is False
        assert second_results[second_item["checklist_item_id"]]["selected"] is True
        assert second_results[second_item["checklist_item_id"]]["result"] == "ไม่ครบ"
    finally:
        app.dependency_overrides.clear()
        test_engine.dispose()
