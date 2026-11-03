from backend.app.services.project_approval_service import (
    OFFICE_REVIEW_SAMPLES,
    SAMPLE_APPROVAL_ID,
    create_sample_project_approval_service,
)
from backend.app.storage.project_document import SAMPLE_DOCUMENT_DIR, build_sample_pdf


def test_sample_projects_use_generated_mock_documents():
    # Given ข้อมูลตัวอย่างของระบบ
    service = create_sample_project_approval_service(include_office_samples=True)

    # When เปิดไฟล์เอกสารของโครงการตัวอย่าง
    file = service.get_document_file(SAMPLE_APPROVAL_ID, "project-book")

    # Then ได้ PDF ตัวอย่างที่มีเนื้อหา ไม่ใช่ไฟล์สำรอง
    assert file.content.startswith(b"%PDF-")
    assert file.content != build_sample_pdf(file.file_name)
    assert (SAMPLE_DOCUMENT_DIR / SAMPLE_APPROVAL_ID / "project-book.pdf").is_file()


def test_office_samples_have_mock_cover_sheet():
    # Given โครงการตัวอย่างที่รอกองกิจตรวจ
    service = create_sample_project_approval_service(include_office_samples=True)

    # When เปิดใบปะหน้า
    file = service.get_cover_sheet_file(OFFICE_REVIEW_SAMPLES[0][0])

    # Then เปิดได้และเป็น PDF ตัวอย่างของโครงการนั้น
    assert file.media_type == "application/pdf"
    assert len(file.content) > 1000
