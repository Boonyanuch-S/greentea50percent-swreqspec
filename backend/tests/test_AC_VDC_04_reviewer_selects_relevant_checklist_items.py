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


def test_AC_VDC_04_reviewer_selects_relevant_checklist_items(monkeypatch):
    # Given มีเอกสารสองโครงการและ Checklist กลางที่เจ้าหน้าที่กำหนดรายการเอง
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

    def override_session():
        with test_session_factory() as session:
            yield session

    app.dependency_overrides[get_checklist_session] = override_session
    client = TestClient(app)
    headers = {"Authorization": "reviewer-session"}

    try:
        item_names = [
            "รายการเฉพาะโครงการหนึ่ง",
            "รูปแบบเอกสารอีกประเภท",
            "เอกสารเสริมสำหรับโครงการสอง",
        ]
        items = [
            client.post(
                "/checklists/items",
                headers=headers,
                json={"item_name": item_name},
            ).json()
            for item_name in item_names
        ]

        # When ผู้ตรวจเลือกคนละชุดและกำหนดผลตรวจแยกตามโครงการ
        first_update = client.put(
            "/submissions/1/checklist",
            headers=headers,
            json={
                "items": [
                    {
                        "checklist_item_id": items[0]["checklist_item_id"],
                        "selected": True,
                        "result": "ครบ",
                    }
                ]
            },
        )
        second_update = client.put(
            "/submissions/2/checklist",
            headers=headers,
            json={
                "items": [
                    {
                        "checklist_item_id": items[1]["checklist_item_id"],
                        "selected": True,
                        "result": "ไม่ครบ",
                    },
                    {
                        "checklist_item_id": items[2]["checklist_item_id"],
                        "selected": True,
                        "result": "ครบ",
                    },
                ]
            },
        )
        first_checklist = client.get(
            "/submissions/1/checklist",
            headers=headers,
        )
        second_checklist = client.get(
            "/submissions/2/checklist",
            headers=headers,
        )

        # Then แต่ละโครงการแสดงเฉพาะรายการที่ผู้ตรวจเลือกพร้อมผลของโครงการนั้น
        assert first_update.status_code == 200
        assert second_update.status_code == 200
        assert first_checklist.status_code == 200
        assert second_checklist.status_code == 200
        first_selected = {
            entry["checklist_item_id"]: entry
            for entry in first_checklist.json()
            if entry["selected"]
        }
        second_selected = {
            entry["checklist_item_id"]: entry
            for entry in second_checklist.json()
            if entry["selected"]
        }
        assert set(first_selected) == {items[0]["checklist_item_id"]}
        assert set(second_selected) == {
            items[1]["checklist_item_id"],
            items[2]["checklist_item_id"],
        }
        assert first_selected[items[0]["checklist_item_id"]]["result"] == "ครบ"
        assert second_selected[items[1]["checklist_item_id"]]["result"] == "ไม่ครบ"
        assert second_selected[items[2]["checklist_item_id"]]["result"] == "ครบ"
    finally:
        app.dependency_overrides.clear()
        test_engine.dispose()
