from backend.app.services.project_approval_service import SAMPLE_APPROVAL_ID

BASE_URL = f"/project-approvals/{SAMPLE_APPROVAL_ID}"


def test_project_approval_uc10_records_notification_request(office, service):
    # Given เอกสารอนุมัติสมบูรณ์แล้ว
    service.get_approval(SAMPLE_APPROVAL_ID).status = "อนุมัติสมบูรณ์"
    # When เรียก UC-10 ซ้ำสองครั้ง
    first = office.post(f"{BASE_URL}/notifications/uc-10")
    second = office.post(f"{BASE_URL}/notifications/uc-10")
    # Then มีคำขอแจ้ง UC-10 เพียงรายการเดียว
    assert first.status_code == 200
    assert first.json()["target_use_case"] == "UC-10"
    assert second.json()["requested_at"] == first.json()["requested_at"]
    assert len(service.uc10.list_requests()) == 1


def test_project_approval_uc10_requires_completed_status(office, service):
    # Given เอกสารยังไม่อนุมัติสมบูรณ์
    # When เรียก UC-10
    response = office.post(f"{BASE_URL}/notifications/uc-10")
    # Then ระบบไม่สร้างคำขอแจ้ง
    assert response.status_code == 409
    assert service.uc10.list_requests() == []
