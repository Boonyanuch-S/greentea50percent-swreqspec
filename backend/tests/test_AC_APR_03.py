"""test ของ AC-APR-03 (FR-APR-01) ตามแถวใน specs/005-อนุมัติเอกสาร/test-cases.md"""

from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.services.project_approval_service import SAMPLE_APPROVAL_ID

BASE_URL = f"/project-approvals/{SAMPLE_APPROVAL_ID}"
FULL_SET_TYPES = ["เล่มโครงการ", "กส 002", "ใบแนบกิจกรรม"]


def _ks002_id(approval_json):
    return next(item["id"] for item in approval_json["documents"] if item["document_type"] == "กส 002")


def test_TC_APR_03_1_select_document_returns_selected_and_full_set(advisor):
    # Given login ด้วยบัญชีอาจารย์ที่ปรึกษาสโมสร และมีเอกสารโครงการครบชุด 3 รายการ
    #       (เล่มโครงการ, กส 002, ใบแนบกิจกรรม) สถานะ "ส่งต่ออาจารย์"
    approval = advisor.get(BASE_URL)
    assert approval.status_code == 200
    assert approval.json()["status"] == "ส่งต่ออาจารย์"

    # When เรียก GET /project-approvals/{approvalId} แล้วเลือก "แบบ กส 002"
    #      ด้วย GET /project-approvals/{approvalId}/documents/{documentId}
    document_id = _ks002_id(approval.json())
    selected = advisor.get(f"{BASE_URL}/documents/{document_id}")
    file_response = advisor.get(f"{BASE_URL}/documents/{document_id}/file")

    # Then (1) ระบบคืนเอกสารรายการที่เลือก คือ "แบบ กส 002" เท่านั้น ไม่ใช่รายการอื่น
    assert selected.status_code == 200
    assert selected.json()["id"] == document_id
    assert selected.json()["document_type"] == "กส 002"
    assert selected.json()["title"] == "แบบ กส 002"
    # Then (2) เปิดไฟล์ของรายการที่เลือกได้ (CHANGELOG 2569-11-01)
    assert file_response.status_code == 200
    assert len(file_response.content) > 0
    # Then (3) รายการเอกสารของชุดมีครบ 3 รายการ: เล่มโครงการ, กส 002, ใบแนบกิจกรรม
    assert sorted(item["document_type"] for item in approval.json()["documents"]) == sorted(FULL_SET_TYPES)


def test_TC_APR_03_3_each_of_three_documents_can_be_opened(advisor):
    # Given เหมือน TC-APR-03-1 (เอกสารครบชุด 3 รายการตาม FR-APR-01)
    approval = advisor.get(BASE_URL)
    assert approval.status_code == 200
    document_ids = [item["id"] for item in approval.json()["documents"]]
    assert len(document_ids) == 3

    # When เลือกเอกสารทีละรายการจนครบทั้ง 3 รายการ (รายการแรกและรายการสุดท้ายของชุดด้วย)
    for document_id in document_ids:
        selected = advisor.get(f"{BASE_URL}/documents/{document_id}")
        set_after = advisor.get(BASE_URL)

        # Then (1) ทุกครั้งระบบคืนเฉพาะเอกสารรายการที่เลือกตรงกับ documentId ที่ขอ
        assert selected.status_code == 200
        assert selected.json()["id"] == document_id
        # Then (2) รายการเอกสารของชุดยังเป็น 3 รายการเท่าเดิมทุกครั้ง
        assert [item["id"] for item in set_after.json()["documents"]] == document_ids


def test_TC_APR_03_6_unauthenticated_cannot_open_document(service):
    # Given ผู้ใช้ยังไม่ได้ login (ไม่มี Token หรือ Token ปลอม) และมีเอกสารที่ส่งต่อถึงอาจารย์
    clients = [TestClient(app), TestClient(app, headers={"Authorization": "fake-token"})]
    paths = [BASE_URL, f"{BASE_URL}/documents/ks-002"]

    for client in clients:
        for path in paths:
            # When เรียก GET /project-approvals/{approvalId} และ GET .../documents/{documentId}
            response = client.get(path)

            # Then (1) ระบบปฏิเสธการเข้าถึง (CON-NFR-21, NFR-SEC-01, AC-APR-06)
            #      แถวไม่ได้ระบุรหัส จึงตรวจเพียงว่าเป็นรหัสปฏิเสธ (401 หรือ 403)
            assert response.status_code in (401, 403)
            # Then (2) ไม่มีข้อมูลเอกสารหรือรายการเอกสารในคำตอบ
            body = response.json()
            assert "documents" not in body
            assert "title" not in body
            assert "objectives" not in body


def test_TC_APR_03_7_other_role_cannot_open_approval(club):
    # Given login ด้วยบัญชีบทบาทอื่นที่ไม่ใช่อาจารย์ที่ปรึกษาหรือกองกิจ (กรรมการสโมสร)
    #       และมีเอกสารที่ส่งต่อถึงอาจารย์
    # When เรียก GET /project-approvals/{approvalId}
    response = club.get(BASE_URL)

    # Then (1) ระบบตอบ 403 (plan ข้อ 4 "บทบาทอื่นได้ 403")
    assert response.status_code == 403
    # Then (2) กรณีเรียก GET .../documents/{documentId} ด้วยบทบาทนี้: ยังไม่ตรวจ
    #      เพราะ spec ไม่ได้บอกผลที่ต้องเป็น (ยังไม่มีคำตอบจากทีม)
