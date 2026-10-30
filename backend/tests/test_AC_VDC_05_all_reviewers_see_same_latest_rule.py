from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.main import app
from backend.app.models.checklist_item import ChecklistBase
from backend.app.routers.checklists import get_checklist_session


def test_AC_VDC_05_all_reviewers_see_same_latest_rule():
    # Given เจ้าหน้าที่คณะคนแรกเพิ่มรายการ Checklist กลาง
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
    reviewer_one = {"Authorization": "reviewer-one"}
    reviewer_two = {"Authorization": "reviewer-two"}
    try:
        added_response = client.post(
            "/checklists/items",
            headers=reviewer_one,
            json={"item_name": "เอกสารประกอบ"},
        )
        item_id = added_response.json()["checklist_item_id"]

        # When เจ้าหน้าที่คนที่สองเปิด Checklist และคนแรกแก้ชื่อรายการเดิม
        second_reviewer_response = client.get(
            "/checklists/latest",
            headers=reviewer_two,
        )
        rename_response = client.patch(
            f"/checklists/items/{item_id}",
            headers=reviewer_one,
            json={"item_name": "เอกสารประกอบฉบับแก้ไข"},
        )
        latest_for_second_reviewer = client.get(
            "/checklists/latest",
            headers=reviewer_two,
        )

        # Then ทั้งสองเห็นรายการล่าสุดร่วมกันและรายการที่แก้ชื่อยังใช้ item ID เดิม
        assert added_response.status_code == 201
        assert second_reviewer_response.status_code == 200
        assert second_reviewer_response.json()["items"] == [
            {"checklist_item_id": item_id, "item_name": "เอกสารประกอบ"}
        ]
        assert rename_response.status_code == 200
        assert latest_for_second_reviewer.status_code == 200
        assert latest_for_second_reviewer.json()["items"] == [
            {
                "checklist_item_id": item_id,
                "item_name": "เอกสารประกอบฉบับแก้ไข",
            }
        ]
    finally:
        app.dependency_overrides.clear()
        test_engine.dispose()
