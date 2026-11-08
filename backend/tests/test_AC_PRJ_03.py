"""test ของ AC-PRJ-03 ตามแถวใน specs/001-จัดการเอกสารโครงการ/test-cases.md."""

import json
from datetime import date, timedelta

from fastapi.testclient import TestClient

from backend.app.main import app

FUTURE_DATE = (date.today() + timedelta(days=60)).isoformat()


def test_TC_PRJ_03_6_unauthenticated_api_rejected() -> None:
    """TC-PRJ-03-6 ส่วนหลังบ้าน: Then จาก AC-PRJ-06 / CON-NFR-21."""
    # Given ผู้ใช้ยังไม่ได้เข้าสู่ระบบ (ไม่ส่ง Token)
    anonymous = TestClient(app)
    fields = {
        "projectName": "โครงการที่ไม่ควรถูกบันทึก",
        "objectives": "วัตถุประสงค์",
        "activityDate": FUTURE_DATE,
        "location": "สถานที่",
        "indicators": "ตัวชี้วัด",
    }

    # When พยายามเปิดหน้าสร้างโครงการใหม่ (เรียกข้อมูลที่ฟอร์มใช้ และส่งโครงการ)
    checklist = anonymous.get("/project-documents/checklist")
    central_checklist = anonymous.get("/project-documents/central-checklist")
    submit = anonymous.post("/project-documents", data={"fields": json.dumps(fields)})

    # Then (2) หลังบ้านปฏิเสธคำขอข้อมูลที่ฟอร์มใช้ (Checklist และการส่งโครงการ) เมื่อไม่มีการยืนยันตัวตน
    assert checklist.status_code == 401
    assert central_checklist.status_code == 401
    assert submit.status_code == 401
