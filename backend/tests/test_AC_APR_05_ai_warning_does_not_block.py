from backend.app.services.project_approval_service import SAMPLE_APPROVAL_ID


def test_AC_APR_05_ai_warning_does_not_block(advisor):
    # Given ระบบแสดงคำเตือนทั่วไปทุกครั้งตาม Q-02 และไม่มีกลไกตรวจจับ
    # When อาจารย์เปิดตรวจเอกสารแล้วกดอนุมัติเนื้อหา
    response = advisor.post(f"/project-approvals/{SAMPLE_APPROVAL_ID}/content-approval")
    # Then ระบบไม่ปฏิเสธหรือบล็อกการอนุมัติอัตโนมัติ
    assert response.status_code == 200
    assert response.json()["content_approved_at"]
