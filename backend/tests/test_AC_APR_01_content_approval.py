from backend.app.services.project_approval_service import (
    INCOMPLETE_SAMPLE_APPROVAL_ID,
    SAMPLE_APPROVAL_ID,
)

BASE_URL = f"/project-approvals/{SAMPLE_APPROVAL_ID}"


def test_AC_APR_01_content_approval(advisor, service):
    # Given เอกสารครบทั้งชุดแล้ว
    assert len(advisor.get(BASE_URL).json()["documents"]) == 3
    # When อาจารย์กดอนุมัติเนื้อหาออนไลน์
    response = advisor.post(f"{BASE_URL}/content-approval")
    # Then ระบบบันทึกวันเวลาอนุมัติ และแจ้งให้พิมพ์ใบปะหน้า
    assert response.status_code == 200
    assert response.json()["content_approved_at"]
    assert "ใบปะหน้า" in response.json()["print_message"]
    assert advisor.get(BASE_URL).json()["content_approved_at"]
    actions = service.list_actions(SAMPLE_APPROVAL_ID)
    assert [(item.actor_id, item.action) for item in actions] == [
        ("intuwet_p@silpakorn.edu", "content_approved")
    ]


def test_AC_APR_01_repeat_approval_keeps_first_timestamp(advisor, service):
    # Given อาจารย์อนุมัติเนื้อหาแล้ว
    first = advisor.post(f"{BASE_URL}/content-approval")
    # When ส่งคำขออนุมัติซ้ำตาม ASM-03
    second = advisor.post(f"{BASE_URL}/content-approval")
    # Then วันเวลาอนุมัติเดิมไม่เปลี่ยนและไม่มีประวัติซ้ำ
    assert second.json()["content_approved_at"] == first.json()["content_approved_at"]
    assert len(service.list_actions(SAMPLE_APPROVAL_ID)) == 1


def test_AC_APR_01_incomplete_documents_cannot_be_approved(advisor, service):
    # Given เอกสารยังไม่ครบทั้งชุด
    url = f"/project-approvals/{INCOMPLETE_SAMPLE_APPROVAL_ID}/content-approval"
    # When อาจารย์กดอนุมัติเนื้อหา
    response = advisor.post(url)
    # Then ระบบไม่บันทึกการอนุมัติ
    assert response.status_code == 409
    assert service.get_approval(INCOMPLETE_SAMPLE_APPROVAL_ID).content_approved_at is None
