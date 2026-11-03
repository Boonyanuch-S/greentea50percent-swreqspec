from backend.app.services.project_approval_service import SAMPLE_APPROVAL_ID

BASE = f"/project-approvals/{SAMPLE_APPROVAL_ID}"


def _document_ids(service):
    return [item.id for item in service.list_documents(SAMPLE_APPROVAL_ID)]


def _clear_reviews(service):
    for document_id in _document_ids(service):
        service.set_document_reviewed(SAMPLE_APPROVAL_ID, document_id, False, "advisor")


def test_AC_APR_01_rejects_content_approval_until_all_documents_reviewed(advisor, service):
    # Given อาจารย์ตรวจเอกสารแล้วบางฉบับ
    _clear_reviews(service)
    first_id = _document_ids(service)[0]
    advisor.put(f"{BASE}/documents/{first_id}/review", json={"reviewed": True})

    # When พยายามอนุมัติเนื้อหาโดยตรงผ่าน API
    response = advisor.post(f"{BASE}/content-approval")

    # Then ระบบปฏิเสธและไม่บันทึกเวลาอนุมัติ
    assert response.status_code == 409
    assert "เหลืออีก" in response.json()["detail"]
    assert service.get_approval(SAMPLE_APPROVAL_ID).content_approved_at is None


def test_AC_APR_01_allows_content_approval_after_each_document_reviewed(advisor, service):
    # Given อาจารย์ยืนยันการตรวจครบทุกฉบับ
    _clear_reviews(service)
    for document_id in _document_ids(service):
        response = advisor.put(f"{BASE}/documents/{document_id}/review", json={"reviewed": True})
        assert response.status_code == 200

    # When อนุมัติเนื้อหา
    response = advisor.post(f"{BASE}/content-approval")

    # Then ระบบบันทึกเวลาอนุมัติ และผลตรวจรายฉบับยังเปิดดูได้เมื่อกลับเข้าหน้า
    assert response.status_code == 200
    assert advisor.get(BASE).json()["reviewed_document_ids"] == _document_ids(service)


def test_AC_APR_01_review_locked_after_content_approved(advisor, service):
    # Given อนุมัติเนื้อหาแล้ว
    assert advisor.post(f"{BASE}/content-approval").status_code == 200

    # When พยายามยกเลิกผลตรวจรายฉบับ
    response = advisor.put(
        f"{BASE}/documents/{_document_ids(service)[0]}/review",
        json={"reviewed": False},
    )

    # Then ระบบปฏิเสธ
    assert response.status_code == 409


def test_AC_APR_06_office_cannot_mark_document_reviewed(office, service):
    # Given เจ้าหน้าที่กองกิจไม่ใช่ผู้ตรวจรายฉบับ
    # When เรียกบันทึกการตรวจ
    response = office.put(
        f"{BASE}/documents/{_document_ids(service)[0]}/review",
        json={"reviewed": True},
    )

    # Then ระบบปฏิเสธ
    assert response.status_code in (401, 403)
