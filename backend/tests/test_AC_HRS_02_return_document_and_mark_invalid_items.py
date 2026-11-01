from datetime import date, datetime, timedelta, timezone

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.app.api.hours_submission import get_activity_session
from backend.app.main import app
from backend.app.models.activity import Activity, Base
from backend.app.models.activity_hours import (
    ActivityHourDocument,
    ActivityParticipantHour,
)
from backend.app.models.auth_token import UserRole
from backend.app.models.authenticated_user_context import AuthenticatedUserContext
from backend.app.models.hour_criteria import HourCriteria
from backend.app.models.student_access_log import StudentAccessLog
from backend.app.services.auth_service import token_registry


def _create_validation_context(
    *,
    academic_year: str | None,
    include_active_criteria: bool,
) -> tuple[Engine, Session, str]:
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
            activity_date=date(2026, 10, 1),
            regular_submission_deadline=date(2026, 10, 30),
            status="จบแล้ว",
            academic_year=academic_year,
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
    session.add_all(
        [
            ActivityParticipantHour(
                item_id=1,
                document_id=41,
                student_reference="S-001",
                participant_name="ผู้เข้าร่วม 1",
                reported_hour_type="จิตอาสา",
                reported_hours=2,
            ),
            ActivityParticipantHour(
                item_id=2,
                document_id=41,
                student_reference="S-002",
                participant_name="ผู้เข้าร่วม 2",
                reported_hour_type="ประเภทที่ไม่มีเกณฑ์",
                reported_hours=3,
            ),
        ]
    )
    if include_active_criteria:
        session.add(
            HourCriteria(
                criteria_id=1,
                academic_year="AY-2569-S1",
                hour_type="จิตอาสา",
                criteria_definition="",
                active_status=True,
            )
        )
        session.add(
            HourCriteria(
                criteria_id=2,
                academic_year="AY-2569-S1",
                hour_type="การศึกษา",
                criteria_definition="",
                active_status=False,
            )
        )
    session.commit()
    app.dependency_overrides[get_activity_session] = lambda: session

    token = f"test-activity-hours-validation-{academic_year}-{include_active_criteria}"
    now = datetime.now(timezone.utc)
    token_registry.register(
        token,
        AuthenticatedUserContext("staff-1", UserRole.STUDENT_AFFAIRS_OFFICER, now),
        now.replace(tzinfo=None) + timedelta(minutes=30),
    )
    return engine, session, token


def test_AC_HRS_02_return_document_and_mark_invalid_items() -> None:
    """ตรวจเกณฑ์ตามปีของกิจกรรม ทำเครื่องหมายเฉพาะรายการผิดและคืนเอกสารตาม AC-HRS-02."""
    engine, session, token = _create_validation_context(
        academic_year="AY-2569-S1",
        include_active_criteria=True,
    )
    try:
        response = TestClient(app).post(
            "/activity-hours/documents/41/validate",
            headers={"Authorization": token},
        )

        assert response.status_code == 200
        assert response.json()["academic_year"] == "AY-2569-S1"
        assert response.json()["status"] == "ส่งคืน UC-02"
        assert [
            item["student_reference"] for item in response.json()["invalid_items"]
        ] == ["S-002"]

        document = session.get(ActivityHourDocument, 41)
        participants = session.scalars(
            select(ActivityParticipantHour)
            .where(ActivityParticipantHour.document_id == 41)
            .order_by(ActivityParticipantHour.item_id)
        ).all()
        assert document is not None
        assert document.status == "ส่งคืน UC-02"
        assert document.returned_at is not None
        assert participants[0].validation_status is None
        assert participants[1].validation_status == "ไม่ตรงเกณฑ์"
        assert participants[1].validation_message
        assert session.scalars(select(StudentAccessLog)).one().access_item == (
            "activity-hours:document:41:validate"
        )
    finally:
        app.dependency_overrides.pop(get_activity_session, None)
        session.close()
        engine.dispose()


def test_validation_without_activity_year_keeps_document_unchanged() -> None:
    """หยุดและคงเอกสารเดิมเมื่อไม่มีปีการศึกษาที่ระบุบน Activity ตาม ASM-01."""
    engine, session, token = _create_validation_context(
        academic_year=None,
        include_active_criteria=True,
    )
    try:
        response = TestClient(app).post(
            "/activity-hours/documents/41/validate",
            headers={"Authorization": token},
        )

        assert response.status_code == 409
        document = session.get(ActivityHourDocument, 41)
        participants = session.scalars(
            select(ActivityParticipantHour)
            .where(ActivityParticipantHour.document_id == 41)
            .order_by(ActivityParticipantHour.item_id)
        ).all()
        assert document is not None
        assert document.status == "รอตรวจสอบ"
        assert document.returned_at is None
        assert all(participant.validation_status is None for participant in participants)
    finally:
        app.dependency_overrides.pop(get_activity_session, None)
        session.close()
        engine.dispose()


def test_validation_without_active_criteria_keeps_document_unchanged() -> None:
    """หยุดและคงเอกสารเดิมเมื่อปีนั้นไม่มีเกณฑ์ active ตาม ASM-01."""
    engine, session, token = _create_validation_context(
        academic_year="AY-2569-S1",
        include_active_criteria=False,
    )
    try:
        response = TestClient(app).post(
            "/activity-hours/documents/41/validate",
            headers={"Authorization": token},
        )

        assert response.status_code == 409
        document = session.get(ActivityHourDocument, 41)
        participants = session.scalars(
            select(ActivityParticipantHour)
            .where(ActivityParticipantHour.document_id == 41)
        ).all()
        assert document is not None
        assert document.status == "รอตรวจสอบ"
        assert document.returned_at is None
        assert all(participant.validation_status is None for participant in participants)
    finally:
        app.dependency_overrides.pop(get_activity_session, None)
        session.close()
        engine.dispose()
