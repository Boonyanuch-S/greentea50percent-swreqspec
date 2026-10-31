from backend.app.models.project_approval import PENDING_STATUS
from backend.app.services.project_approval_service import (
    SAMPLE_APPROVAL_ID,
    create_sample_project_approval_service,
)


def test_project_approval_seed_has_full_document_set():
    # Given ข้อมูลตัวอย่างของฟีเจอร์อนุมัติเอกสาร
    service = create_sample_project_approval_service()
    # When อ่านเอกสารที่รออนุมัติ
    approval = service.get_approval(SAMPLE_APPROVAL_ID)
    documents = service.list_documents(SAMPLE_APPROVAL_ID)
    # Then มีเอกสารครบชุดพร้อมหัวข้อที่อาจารย์ต้องตรวจตาม FR-APR-02
    assert approval.status == PENDING_STATUS
    assert [item.document_type for item in documents] == [
        "เล่มโครงการ",
        "กส 002",
        "ใบแนบกิจกรรม",
    ]
    assert all(item.objectives and item.indicators and item.document_format for item in documents)
