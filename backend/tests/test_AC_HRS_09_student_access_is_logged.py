from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.app.api.activity_hours import (
    get_activity_hours_excel_config,
    get_activity_hours_file_resolver,
)
from backend.app.api.hours_submission import get_activity_session
from backend.app.audit.student_access_log import record_student_access
from backend.app.main import app
from backend.app.models.activity import Activity, Base
from backend.app.models.activity_hours import ActivityHourDocument
from backend.app.models.auth_token import UserRole
from backend.app.models.authenticated_user_context import AuthenticatedUserContext
from backend.app.models.student_access_log import StudentAccessLog
from backend.app.services.auth_service import token_registry


def _create_logged_in_activity_document():
    """เตรียมเอกสารและ session ผู้ใช้สำหรับตรวจ audit log ตาม AC-HRS-09."""
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
    session.add(
        ActivityHourDocument(
            document_id=41,
            activity_id=1,
            source_file_reference="activity-hours.xlsx",
            submitted_at=datetime(2026, 10, 20),
            status="รอตรวจสอบ",
        )
    )
    session.commit()
    app.dependency_overrides[get_activity_session] = lambda: session

    token = "test-activity-hours-access-log-token"
    now = datetime.now(timezone.utc)
    token_registry.register(
        token,
        AuthenticatedUserContext("staff-1", UserRole.STUDENT_AFFAIRS_OFFICER, now),
        now.replace(tzinfo=None) + timedelta(minutes=30),
    )
    return engine, session, token


def test_AC_HRS_09_student_access_is_logged() -> None:
    """บันทึกผู้เข้าถึง เวลา และรายการข้อมูลที่เปิดดูตาม AC-HRS-09."""
    engine = create_engine("sqlite://")
    StudentAccessLog.__table__.create(engine)

    try:
        with Session(engine) as session:
            access_log = record_student_access(
                session,
                accessor_id="staff-1",
                access_item="รายชื่อและชั่วโมงกิจกรรม",
            )
            session.commit()

            saved_log = session.get(StudentAccessLog, access_log.log_id)

            assert saved_log is not None
            assert saved_log.accessor_id == "staff-1"
            assert isinstance(saved_log.accessed_at, datetime)
            assert saved_log.access_item == "รายชื่อและชั่วโมงกิจกรรม"
    finally:
        engine.dispose()


def test_AC_HRS_09_participant_endpoint_logs_access_context(monkeypatch) -> None:
    """บันทึกผู้เข้าถึงและเอกสารเมื่ออ่านรายชื่อชั่วโมงตาม AC-HRS-09."""
    engine, session, token = _create_logged_in_activity_document()
    app.dependency_overrides[get_activity_hours_excel_config] = lambda: None
    app.dependency_overrides[get_activity_hours_file_resolver] = lambda: None
    monkeypatch.setattr(
        "backend.app.api.activity_hours.read_activity_hour_document",
        lambda **_: [],
    )

    try:
        response = TestClient(app).get(
            "/activity-hours/documents/41/participants",
            headers={"Authorization": token},
        )

        assert response.status_code == 200
        access_log = session.query(StudentAccessLog).one()
        assert access_log.accessor_id == "staff-1"
        assert access_log.access_item == "activity-hours:document:41:participants"
        assert isinstance(access_log.accessed_at, datetime)
    finally:
        app.dependency_overrides.pop(get_activity_session, None)
        app.dependency_overrides.pop(get_activity_hours_excel_config, None)
        app.dependency_overrides.pop(get_activity_hours_file_resolver, None)
        session.close()
        engine.dispose()


def test_AC_HRS_09_individual_summary_endpoint_logs_access_context() -> None:
    """บันทึกผู้เข้าถึงและเอกสารเมื่อเรียก UC-04 ตาม AC-HRS-09."""
    engine, session, token = _create_logged_in_activity_document()
    previous_provider_exists = hasattr(app.state, "uc04_summary_provider")
    previous_provider = getattr(app.state, "uc04_summary_provider", None)
    app.state.uc04_summary_provider = lambda *_: {"summary": "ready"}

    try:
        response = TestClient(app).get(
            "/activity-hours/documents/41/individual-summary",
            params={"participant_id": "S-001"},
            headers={"Authorization": token},
        )

        assert response.status_code == 200
        access_log = session.query(StudentAccessLog).one()
        assert access_log.accessor_id == "staff-1"
        assert access_log.access_item == (
            "activity-hours:document:41:individual-summary"
        )
        assert isinstance(access_log.accessed_at, datetime)
    finally:
        app.dependency_overrides.pop(get_activity_session, None)
        if previous_provider_exists:
            app.state.uc04_summary_provider = previous_provider
        else:
            del app.state.uc04_summary_provider
        session.close()
        engine.dispose()
