from backend.app.config import COVER_SHEET_SIGNATURES
from backend.app.services.project_approval_service import SAMPLE_APPROVAL_ID

BASE_URL = f"/project-approvals/{SAMPLE_APPROVAL_ID}"
COMMENT = "แก้ตัวชี้วัดในเล่มโครงการให้วัดผลได้"


def submit_cover_sheet(advisor):
    advisor.post(f"{BASE_URL}/content-approval")
    advisor.post(
        f"{BASE_URL}/cover-sheet",
        files={"file": ("cover-sheet.pdf", COVER_SHEET_SIGNATURES[".pdf"] + b"signed")},
    )


def test_AC_APR_04_return_full_document_with_comment(advisor, office, service):
    # Given กองกิจตรวจสอบเอกสารแล้วไม่เห็นด้วย
    submit_cover_sheet(advisor)
    # When กองกิจกดตีกลับและกรอกคอมเมนต์รายละเอียดที่ต้องแก้ไข
    response = office.post(f"{BASE_URL}/return", json={"comment_text": COMMENT})
    # Then ระบบส่งเอกสารทั้งชุดกลับไปยัง UC-01 พร้อมคอมเมนต์ครบถ้วน
    assert response.status_code == 200
    assert response.json()["status"] == "ตีกลับให้แก้ไข"
    assert response.json()["target_use_case"] == "UC-01"
    assert response.json()["comment_text"] == COMMENT
    assert len(response.json()["documents"]) == 3
    package = service.uc01.list_packages()[0]
    assert package.comment_text == COMMENT
    assert len(package.documents) == 3
    assert service.list_comments(SAMPLE_APPROVAL_ID)[0].comment_text == COMMENT
    assert service.uc10.list_requests() == []


def test_AC_APR_04_blank_comment_is_rejected(advisor, office, service):
    # Given กองกิจตรวจสอบเอกสารแล้วไม่เห็นด้วย
    submit_cover_sheet(advisor)
    # When ตีกลับโดยไม่กรอกคอมเมนต์
    response = office.post(f"{BASE_URL}/return", json={"comment_text": "   "})
    # Then ระบบไม่ส่งเอกสารกลับ
    assert response.status_code == 422
    assert service.uc01.list_packages() == []
    assert office.get(BASE_URL).json()["status"] == "รออนุมัติ"


def test_IF_UC01_02_advisor_returns_documents_with_comment(advisor, service):
    # Given อาจารย์ไม่เห็นด้วยกับเอกสารบางส่วน
    # When อาจารย์ส่งกลับพร้อมความเห็น
    response = advisor.post(f"{BASE_URL}/return", json={"comment_text": COMMENT})
    # Then ระบบส่งเอกสารทั้งชุดกลับ UC-01
    assert response.status_code == 200
    assert response.json()["status"] == "ตีกลับให้แก้ไข"
    package = service.uc01.list_packages()[0]
    assert package.comment_text == COMMENT
    assert len(package.documents) == 3
    assert service.list_comments(SAMPLE_APPROVAL_ID)[0].author_id == "intuwet_p@silpakorn.edu"


def test_IF_UC01_02_advisor_cannot_return_after_cover_sheet(advisor, service):
    # Given อาจารย์ส่งใบปะหน้าแล้ว เอกสารอยู่ที่กองกิจ
    submit_cover_sheet(advisor)
    # When อาจารย์ส่งกลับ
    response = advisor.post(f"{BASE_URL}/return", json={"comment_text": COMMENT})
    # Then ระบบปฏิเสธ
    assert response.status_code == 409
    assert service.uc01.list_packages() == []
