from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient
from openpyxl import Workbook
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.app.api.hours_submission import get_activity_session
from backend.app.main import app
from backend.app.models.activity import Base
from backend.app.models.activity_hours import ActivityHourDocument
from backend.app.models.auth_token import UserRole
from backend.app.models.authenticated_user_context import AuthenticatedUserContext
from backend.app.services.activity_hours_reader import (
    ActivityHoursExcelConfig,
    ActivityHoursFileReferenceError,
    ActivityHoursFileResolver,
    get_activity_hours_excel_config,
)
from backend.app.services.auth_service import token_registry


def _create_excel_file(path) -> None:
    workbook = Workbook()
    worksheet = workbook.active
    worksheet.title = "Mock activity"
    worksheet.append(["Student reference", "Participant", "Hour type", "Reported hours"])
    worksheet.append(["S-001", "Participant One", "Volunteer", 2])
    worksheet.append(["S-002", "Participant Two", "Education", 3])
    workbook.save(path)


def _test_excel_config() -> ActivityHoursExcelConfig:
    return ActivityHoursExcelConfig(
        worksheet_name="Mock activity",
        header_row=1,
        student_reference_header="Student reference",
        participant_name_header="Participant",
        reported_hour_type_header="Hour type",
        reported_hours_header="Reported hours",
    )


def test_AC_HRS_04_display_all_excel_participants_and_hour_types(tmp_path) -> None:
    """เจ้าหน้าที่ Login แล้วเปิด Excel และได้รายชื่อกับประเภทชั่วโมงครบตาม AC-HRS-04."""
    excel_path = tmp_path / "activity-hours.xlsx"
    _create_excel_file(excel_path)

    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session = Session(engine)
    session.add(
        ActivityHourDocument(
            document_id=41,
            activity_id=1,
            source_file_reference=excel_path.name,
            submitted_at=datetime(2026, 10, 20),
            status="รอตรวจสอบ",
        )
    )
    session.commit()
    app.dependency_overrides[get_activity_session] = lambda: session
    app.dependency_overrides[get_activity_hours_excel_config] = _test_excel_config
    app.state.activity_hours_upload_directory = tmp_path

    token = "test-activity-hours-participants-token"
    now = datetime.now(timezone.utc)
    token_registry.register(
        token,
        AuthenticatedUserContext(
            "staff-1",
            UserRole.STUDENT_AFFAIRS_OFFICER,
            now,
        ),
        now.replace(tzinfo=None) + timedelta(minutes=30),
    )

    try:
        response = TestClient(app).get(
            "/activity-hours/documents/41/participants",
            headers={"Authorization": token},
        )

        assert response.status_code == 200
        assert response.json() == [
            {
                "student_reference": "S-001",
                "participant_name": "Participant One",
                "reported_hour_type": "Volunteer",
                "reported_hours": "2",
            },
            {
                "student_reference": "S-002",
                "participant_name": "Participant Two",
                "reported_hour_type": "Education",
                "reported_hours": "3",
            },
        ]

        app.dependency_overrides[get_activity_hours_excel_config] = lambda: (
            ActivityHoursExcelConfig(
                worksheet_name="Mock activity",
                header_row=1,
                student_reference_header="Student reference",
                participant_name_header="Participant",
                reported_hour_type_header="Unconfirmed header",
                reported_hours_header="Reported hours",
            )
        )
        invalid_schema_response = TestClient(app).get(
            "/activity-hours/documents/41/participants",
            headers={"Authorization": token},
        )
        assert invalid_schema_response.status_code == 422
        assert "Unconfirmed header" in invalid_schema_response.json()["detail"]
    finally:
        app.dependency_overrides.pop(get_activity_session, None)
        app.dependency_overrides.pop(get_activity_hours_excel_config, None)
        if hasattr(app.state, "activity_hours_upload_directory"):
            del app.state.activity_hours_upload_directory
        session.close()
        engine.dispose()


def test_activity_hours_file_resolver_rejects_references_outside_upload_directory(
    tmp_path,
) -> None:
    """ปฏิเสธ file reference ที่พยายามออกนอก upload directory ตาม IF-XLS-01."""
    upload_directory = tmp_path / "uploads"
    upload_directory.mkdir()
    resolver = ActivityHoursFileResolver(upload_directory)

    with pytest.raises(ActivityHoursFileReferenceError):
        resolver.open("../outside.xlsx")
