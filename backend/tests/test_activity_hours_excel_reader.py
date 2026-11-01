from decimal import Decimal
from io import BytesIO

import pytest
from openpyxl import Workbook

from backend.app.models.activity_hours import ActivityParticipantHour
from backend.importers.activity_hours_excel import (
    ActivityHoursExcelConfig,
    ActivityHoursExcelError,
    read_activity_hours_excel,
)


def _excel_file(
    headers: list[str],
    rows: list[list[object]],
    header_row: int = 1,
) -> BytesIO:
    workbook = Workbook()
    worksheet = workbook.active
    worksheet.title = "Configured worksheet"
    for _ in range(header_row - 1):
        worksheet.append([None])
    worksheet.append(headers)
    for row in rows:
        worksheet.append(row)
    file = BytesIO()
    workbook.save(file)
    file.seek(0)
    return file


def _config() -> ActivityHoursExcelConfig:
    return ActivityHoursExcelConfig(
        worksheet_name="Configured worksheet",
        header_row=1,
        student_reference_header="Student ref",
        participant_name_header="Full name",
        reported_hour_type_header="Hour category",
        reported_hours_header="Hours reported",
    )


def test_activity_hours_excel_reader_maps_all_participants_and_hour_types() -> None:
    file = _excel_file(
        ["Student ref", "Full name", "Hour category", "Hours reported"],
        [
            ["S-001", "Participant One", "Volunteer", 2.5],
            ["S-002", "Participant Two", "Education", 3],
        ],
    )

    records = read_activity_hours_excel(file, _config(), document_id=42)

    assert len(records) == 2
    assert all(isinstance(record, ActivityParticipantHour) for record in records)
    assert [
        (
            record.document_id,
            record.student_reference,
            record.participant_name,
            record.reported_hour_type,
            record.reported_hours,
        )
        for record in records
    ] == [
        (42, "S-001", "Participant One", "Volunteer", Decimal("2.5")),
        (42, "S-002", "Participant Two", "Education", Decimal("3")),
    ]


def test_activity_hours_excel_reader_uses_configured_headers_and_header_row() -> None:
    file = _excel_file(
        ["ignored", "Reference", "Name", "Category", "Hours"],
        [["ignore", "S-003", "Participant Three", "Volunteer", "1.25"]],
        header_row=2,
    )
    config = ActivityHoursExcelConfig(
        worksheet_name="Configured worksheet",
        header_row=2,
        student_reference_header="Reference",
        participant_name_header="Name",
        reported_hour_type_header="Category",
        reported_hours_header="Hours",
    )

    records = read_activity_hours_excel(file, config)

    assert len(records) == 1
    assert records[0].student_reference == "S-003"
    assert records[0].reported_hour_type == "Volunteer"
    assert records[0].reported_hours == Decimal("1.25")


def test_activity_hours_excel_reader_reports_missing_configured_header() -> None:
    file = _excel_file(
        ["Student ref", "Full name", "Hour category"],
        [["S-001", "Participant One", "Volunteer"]],
    )

    with pytest.raises(ActivityHoursExcelError, match="Hours reported"):
        read_activity_hours_excel(file, _config())


def test_activity_hours_excel_reader_reports_invalid_required_value() -> None:
    file = _excel_file(
        ["Student ref", "Full name", "Hour category", "Hours reported"],
        [["S-001", "Participant One", "Volunteer", "not a number"]],
    )

    with pytest.raises(ActivityHoursExcelError, match="แถวที่ 2"):
        read_activity_hours_excel(file, _config())


def test_activity_hours_excel_reader_skips_empty_rows() -> None:
    file = _excel_file(
        ["Student ref", "Full name", "Hour category", "Hours reported"],
        [
            ["S-001", "Participant One", "Volunteer", 2],
            [None, None, None, None],
            ["S-002", "Participant Two", "Education", 3],
        ],
    )

    records = read_activity_hours_excel(file, _config())

    assert [record.student_reference for record in records] == ["S-001", "S-002"]
