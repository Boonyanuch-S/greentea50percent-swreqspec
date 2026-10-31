from backend.app.services.project_approval_service import SAMPLE_APPROVAL_ID

BASE_URL = f"/project-approvals/{SAMPLE_APPROVAL_ID}"


def test_AC_APR_03_select_project_document(advisor):
    # Given มีเอกสารโครงการที่รออาจารย์อนุมัติ
    # When อาจารย์เปิดหน้าอนุมัติและเลือกเอกสารรายการหนึ่ง
    approval = advisor.get(BASE_URL)
    selected = advisor.get(f"{BASE_URL}/documents/ks-002")
    # Then ระบบคืนเอกสารรายการที่เลือก โดยมีรายการเอกสารทั้งชุดให้เลือกดู
    assert approval.status_code == 200
    assert [item["id"] for item in approval.json()["documents"]] == [
        "project-book",
        "ks-002",
        "activity-attachment",
    ]
    assert selected.status_code == 200
    assert selected.json()["title"] == "แบบ กส 002"


def test_AC_APR_03_list_approvals_for_selection(advisor):
    # Given มีเอกสารที่ส่งต่อถึงอาจารย์หลายชุด
    # When อาจารย์เปิดรายการเอกสาร
    response = advisor.get("/project-approvals")
    # Then เห็นทุกชุดให้เลือกเปิด
    assert response.status_code == 200
    assert len(response.json()) == 3
    assert all(item["status"] == "ส่งต่ออาจารย์" for item in response.json())


def test_AC_APR_07_review_items_are_returned_for_selected_document(advisor):
    # Given อาจารย์เปิดเอกสารที่รออนุมัติ
    # When เลือกเอกสารรายการหนึ่ง
    selected = advisor.get(f"{BASE_URL}/documents/ks-002")
    # Then ระบบคืนวัตถุประสงค์ ตัวชี้วัด และรูปแบบของเอกสารรายการนั้น
    assert selected.json()["objectives"] == ["สรุปรายละเอียดการดำเนินโครงการ"]
    assert selected.json()["indicators"] == ["ข้อมูลกิจกรรมและผู้รับผิดชอบครบถ้วน"]
    assert selected.json()["format"] == "แบบฟอร์ม กส 002 พร้อมตรวจสอบ"


def test_AC_APR_03_unknown_document_is_not_found(advisor):
    # Given มีเอกสารโครงการที่รออาจารย์อนุมัติ
    # When เลือกเอกสารที่ไม่อยู่ในชุดนี้
    response = advisor.get(f"{BASE_URL}/documents/unknown")
    # Then ระบบไม่คืนเอกสารอื่นแทน
    assert response.status_code == 404
