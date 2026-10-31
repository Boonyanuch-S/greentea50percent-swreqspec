class CoverSheetStorage:
    """เก็บไฟล์ใบปะหน้าใน memory ของ prototype ตาม IF-UPLOAD-01 ชนิดและขนาดไฟล์รอ Q-03."""

    def __init__(self) -> None:
        self._files: dict[str, bytes] = {}

    def save(self, approval_id: str, file_name: str, content: bytes) -> str:
        """เก็บไฟล์และคืน reference สำหรับ CoverSheetUpload ตาม IF-UPLOAD-01."""
        file_reference = f"cover-sheets/{approval_id}/{file_name}"
        self._files[file_reference] = content
        return file_reference

    def read(self, file_reference: str) -> bytes | None:
        return self._files.get(file_reference)
