from dataclasses import dataclass
from pathlib import Path

# PDF ตัวอย่างสร้างจาก backend/scripts/build_sample_documents.py เนื้อหาเป็นข้อมูลสมมติ
SAMPLE_DOCUMENT_DIR = Path(__file__).parent / "sample_documents"


@dataclass(frozen=True)
class StoredDocumentFile:
    """ไฟล์เอกสารโครงการ 1 ฉบับสำหรับเปิดตรวจ ตาม FR-APR-01."""

    file_name: str
    media_type: str
    content: bytes


class ProjectDocumentStorage:
    """เก็บไฟล์เอกสารโครงการใน memory ของ prototype จนกว่า UC-01 จะส่งไฟล์ที่กรรมการแนบเข้ามา."""

    def __init__(self) -> None:
        self._files: dict[tuple[str, str], StoredDocumentFile] = {}

    def save(self, approval_id: str, document_id: str, file: StoredDocumentFile) -> None:
        self._files[(approval_id, document_id)] = file

    def read(self, approval_id: str, document_id: str) -> StoredDocumentFile | None:
        return self._files.get((approval_id, document_id))


def load_sample_file(project_key: str, item_id: str, file_name: str) -> StoredDocumentFile:
    """อ่านเอกสารตัวอย่างของโครงการ ถ้าไม่มีไฟล์จะใช้ PDF พื้นฐานแทน เพื่อให้ระบบเริ่มทำงานได้เสมอ."""
    path = SAMPLE_DOCUMENT_DIR / project_key / f"{item_id}.pdf"
    content = path.read_bytes() if path.is_file() else build_sample_pdf(file_name)
    return StoredDocumentFile(file_name=file_name, media_type="application/pdf", content=content)


def build_sample_pdf(file_name: str) -> bytes:
    """สร้าง PDF ตัวอย่างหน้าเดียวให้หน้าตรวจเปิดได้ ระหว่างยังไม่มีไฟล์จริงจาก UC-01."""
    safe_name = file_name.encode("ascii", "ignore").decode().replace("\\", "").replace("(", "").replace(")", "")
    stream = (
        "BT /F1 20 Tf 60 760 Td (Sample document) Tj "
        f"0 -32 Td /F1 13 Tf ({safe_name}) Tj "
        "0 -22 Td (Placeholder until UC-01 stores uploaded files.) Tj ET"
    ).encode()
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
        b"/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
        b"<< /Length %d >>\nstream\n%s\nendstream" % (len(stream), stream),
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]
    pdf = b"%PDF-1.4\n"
    offsets = []
    for number, body in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf += b"%d 0 obj\n%s\nendobj\n" % (number, body)
    xref_offset = len(pdf)
    pdf += b"xref\n0 %d\n0000000000 65535 f \n" % (len(objects) + 1)
    pdf += b"".join(b"%010d 00000 n \n" % offset for offset in offsets)
    pdf += b"trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n" % (len(objects) + 1, xref_offset)
    return pdf
