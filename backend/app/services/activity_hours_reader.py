from pathlib import Path
from typing import BinaryIO

from fastapi import HTTPException, Request

from backend.importers.activity_hours_excel import (
    ActivityHoursExcelConfig,
    ActivityHoursExcelError,
    read_activity_hours_excel,
)
from ..models.activity_hours import ActivityHourDocument, ActivityParticipantHour


class ActivityHoursFileReferenceError(ValueError):
    """ปฏิเสธ file reference ที่อยู่นอกพื้นที่อัปโหลดตาม IF-XLS-01."""


class ActivityHoursFileResolver:
    """เปิดไฟล์ Excel เฉพาะภายในพื้นที่อัปโหลดที่กำหนดตาม IF-XLS-01."""

    def __init__(self, upload_directory: str | Path) -> None:
        self._upload_directory = Path(upload_directory).resolve()

    def open(self, file_reference: str) -> BinaryIO:
        """เปิดไฟล์อ้างอิงภายใน upload directory โดยป้องกัน path traversal ตาม IF-XLS-01."""
        reference = Path(file_reference)
        if reference.is_absolute():
            raise ActivityHoursFileReferenceError("file reference ต้องเป็น path แบบ relative")

        try:
            resolved_path = (self._upload_directory / reference).resolve(strict=True)
            resolved_path.relative_to(self._upload_directory)
        except (OSError, ValueError) as error:
            raise ActivityHoursFileReferenceError(
                "ไม่พบไฟล์ในพื้นที่อัปโหลดที่กำหนด"
            ) from error

        if not resolved_path.is_file():
            raise ActivityHoursFileReferenceError(
                "file reference ต้องชี้ไปยังไฟล์"
            )
        if resolved_path.suffix.lower() not in {".xlsx", ".xlsm"}:
            raise ActivityHoursFileReferenceError(
                "รองรับไฟล์ Excel นามสกุล .xlsx หรือ .xlsm"
            )
        return resolved_path.open("rb")


def get_activity_hours_excel_config() -> ActivityHoursExcelConfig:
    """คืน schema placeholder ผ่าน dependency ตาม IF-XLS-01 และ FR-HRS-02."""
    return ActivityHoursExcelConfig(
        worksheet_name="__PLACEHOLDER_CONFIRM_WITH_FILE_OWNER__",
        header_row=1,
        student_reference_header="__PLACEHOLDER_STUDENT_REFERENCE__",
        participant_name_header="__PLACEHOLDER_PARTICIPANT_NAME__",
        reported_hour_type_header="__PLACEHOLDER_HOUR_TYPE__",
        reported_hours_header="__PLACEHOLDER_REPORTED_HOURS__",
    )


def get_activity_hours_file_resolver(request: Request) -> ActivityHoursFileResolver:
    """ใช้ upload directory ที่ระบบกำหนดเป็น dependency ตาม IF-XLS-01."""
    upload_directory = getattr(
        request.app.state,
        "activity_hours_upload_directory",
        None,
    )
    if upload_directory is None:
        raise HTTPException(
            status_code=503,
            detail="ยังไม่ได้กำหนดพื้นที่จัดเก็บไฟล์ชั่วโมงกิจกรรม",
        )
    return ActivityHoursFileResolver(upload_directory)


def read_activity_hour_document(
    document: ActivityHourDocument,
    file_resolver: ActivityHoursFileResolver,
    config: ActivityHoursExcelConfig,
) -> list[ActivityParticipantHour]:
    """อ่านรายการผู้เข้าร่วมและประเภทชั่วโมงตาม FR-HRS-02 และ IF-XLS-01."""
    with file_resolver.open(document.source_file_reference) as file:
        return read_activity_hours_excel(
            file=file,
            config=config,
            document_id=document.document_id,
        )


__all__ = [
    "ActivityHoursExcelConfig",
    "ActivityHoursExcelError",
    "ActivityHoursFileReferenceError",
    "ActivityHoursFileResolver",
    "get_activity_hours_excel_config",
    "get_activity_hours_file_resolver",
    "read_activity_hour_document",
]
