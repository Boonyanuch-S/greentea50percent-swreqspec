from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.app.api.hours_submission import get_activity_session
from backend.app.main import app
from backend.app.models.activity import Activity, Base
from backend.app.models.activity_hours import ActivityHourDocument
from backend.app.models.auth_token import UserRole
from backend.app.models.authenticated_user_context import AuthenticatedUserContext
from backend.app.services.auth_service import token_registry


def test_AC_HRS_03_pending_documents_sorted_by_submitted_at() -> None:
    """แสดงเอกสารรอตรวจตามวันส่งเก่าก่อนไปใหม่ตาม AC-HRS-03."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session = Session(engine)
    session.add(
        Activity(
            activity_id=1,
            owner_user_id="club-1",
            name="กิจกรรม",
            activity_date=datetime(2026, 10, 1).date(),
            regular_submission_deadline=datetime(2026, 10, 30).date(),
            status="จบแล้ว",
        )
    )
    session.add_all(
        [
            ActivityHourDocument(
                document_id=document_id,
                activity_id=1,
                source_file_reference=f"file-{document_id}",
                submitted_at=datetime(2026, 10, submitted_day),
                status=status,
            )
            for document_id, submitted_day, status in (
                (3, 22, "รอตรวจสอบ"),
                (1, 18, "รอตรวจสอบ"),
                (2, 20, "รอตรวจสอบ"),
                (4, 17, "บันทึกชั่วโมงสำเร็จ"),
            )
        ]
    )
    session.commit()
    app.dependency_overrides[get_activity_session] = lambda: session

    token = "test-activity-hours-queue-token"
    token_registry.register(
        token,
        AuthenticatedUserContext(
            "staff-1",
            UserRole.STUDENT_AFFAIRS_OFFICER,
            datetime.now(timezone.utc),
        ),
        datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=30),
    )

    try:
        response = TestClient(app).get(
            "/activity-hours/documents/pending",
            headers={"Authorization": token},
        )

        assert response.status_code == 200
        assert [document["document_id"] for document in response.json()] == [1, 2, 3]
        assert all(document["status"] == "รอตรวจสอบ" for document in response.json())
    finally:
        app.dependency_overrides.pop(get_activity_session, None)
        session.close()
        engine.dispose()
