from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.main import app
from backend.app.models.checklist_item import ChecklistBase
from backend.app.routers.checklists import get_checklist_session


def test_checklist_api_uses_latest_and_requires_auth():
    # Given มี Checklist กลางจำลองว่าง และคำขอที่ไม่มี Login
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
    try:
        unauthenticated_response = client.get("/checklists/latest")
        # When เจ้าหน้าที่ที่ยืนยันตัวตนอ่าน เพิ่ม และแก้ไข Checklist
        headers = {"Authorization": "reviewer-session"}
        empty_response = client.get("/checklists/latest", headers=headers)
        added_response = client.post(
            "/checklists/items",
            headers=headers,
            json={"item_name": "เอกสารประกอบ"},
        )
        item_id = added_response.json()["checklist_item_id"]
        renamed_response = client.patch(
            f"/checklists/items/{item_id}",
            headers=headers,
            json={"item_name": "เอกสารประกอบฉบับแก้ไข"},
        )
        latest_response = client.get("/checklists/latest", headers=headers)

        # Then API บังคับ Login และคืน Checklist ฉบับล่าสุดหลังการเพิ่ม/แก้ไข
        assert unauthenticated_response.status_code == 401
        assert empty_response.status_code == 200
        assert empty_response.json() == {"version": None, "items": []}
        assert added_response.status_code == 201
        assert renamed_response.status_code == 200
        assert renamed_response.json() == {
            "checklist_item_id": item_id,
            "item_name": "เอกสารประกอบฉบับแก้ไข",
        }
        assert latest_response.status_code == 200
        assert latest_response.json() == {
            "version": 2,
            "items": [
                {
                    "checklist_item_id": item_id,
                    "item_name": "เอกสารประกอบฉบับแก้ไข",
                }
            ],
        }
    finally:
        app.dependency_overrides.clear()
        test_engine.dispose()
