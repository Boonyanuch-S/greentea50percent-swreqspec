from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class CoverSheetUpload:
    """บันทึกไฟล์ใบปะหน้าที่เซ็นแล้ว ตาม FR-APR-04 และ IF-UPLOAD-01."""

    id: int
    approval_id: str
    file_name: str
    file_reference: str
    uploaded_by: str
    uploaded_at: datetime
    validation_status: str
