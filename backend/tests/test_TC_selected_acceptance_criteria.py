from datetime import date, datetime, timedelta, timezone

from backend.app.models.auth_token import UserRole
from backend.app.models.activity import Activity, Base as ActivityBase
from backend.app.repositories.activity import ActivityRepository
from backend.app.routers.auth import LoginRequest, login
from backend.app.services.auth_service import VerifiedUser, authenticate
from backend.app.models.project_submission import ProjectSubmission
from backend.app.services.review_queue_service import ReviewQueueService
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session


class StubVerifier:
    def __init__(self, users):
        self.users = users

    def verify(self, username, password):
        return self.users.get((username, password))


def test_TC_AUTH_01_1_successful_login_returns_token_and_role():
    # Given บัญชีและรหัสผ่านถูกต้อง และ verifier คืน role club_committee
    verifier = StubVerifier({("club", "correct"): VerifiedUser("u-1", UserRole.CLUB_COMMITTEE)})
    # When ผู้ใช้กดเข้าสู่ระบบ
    result = authenticate(verifier, "club", "correct")
    # Then ออก token, expires_at หลังเวลาออก token และคืน role ถูกต้อง
    assert result.token_value
    assert datetime.fromisoformat(result.expires_at_iso) > datetime.now(timezone.utc).replace(tzinfo=None)
    assert result.role == UserRole.CLUB_COMMITTEE


def test_TC_AUTH_01_2_boundary_role_returns_token():
    # Given บัญชีและรหัสผ่านถูกต้อง และ role เป็น student_affairs_officer
    verifier = StubVerifier({("officer", "correct"): VerifiedUser("u-2", UserRole.STUDENT_AFFAIRS_OFFICER)})
    # When ผู้ใช้กดเข้าสู่ระบบ
    result = authenticate(verifier, "officer", "correct")
    # Then ออก token และคืน role ถูกต้อง; เส้นทางหน้าหลักรอ Q-01
    assert result.token_value
    assert result.role == UserRole.STUDENT_AFFAIRS_OFFICER


def test_TC_AUTH_01_3_invalid_password_is_rejected():
    # Given รหัสผ่านไม่ถูกต้อง
    verifier = StubVerifier({})
    # When ผู้ใช้กดเข้าสู่ระบบ
    try:
        login(LoginRequest(username="club", password="wrong"), verifier)
    except HTTPException as error:
        result = error
    # Then ปฏิเสธและใช้ผลเดียวกับ AC-AUTH-02
    assert result.status_code == 401
    assert result.detail == "บัญชีหรือรหัสผ่านไม่ถูกต้อง"


def test_TC_AUTH_02_1_wrong_password_uses_generic_message():
    # Given username มีอยู่แต่ password ไม่ถูกต้อง
    verifier = StubVerifier({})
    # When ผู้ใช้กดเข้าสู่ระบบ
    try:
        login(LoginRequest(username="club", password="wrong"), verifier)
    except HTTPException as error:
        result = error
    # Then ปฏิเสธ
    assert result.status_code == 401
    assert result.detail == "บัญชีหรือรหัสผ่านไม่ถูกต้อง"


def test_TC_AUTH_02_2_empty_wrong_password_uses_generic_message():
    # Given username มีอยู่และ password ผิดเป็นค่าว่าง
    verifier = StubVerifier({})
    # When ผู้ใช้กดเข้าสู่ระบบ
    try:
        login(LoginRequest(username="club", password=""), verifier)
    except HTTPException as error:
        result = error
    # Then ปฏิเสธ
    assert result.status_code == 401
    assert result.detail == "บัญชีหรือรหัสผ่านไม่ถูกต้อง"


def test_TC_AUTH_02_3_correct_password_follows_success_path():
    # Given password ถูกต้อง จึงไม่เป็นไปตามเงื่อนไขของ AC-AUTH-02
    verifier = StubVerifier({("club", "correct"): VerifiedUser("u-1", UserRole.CLUB_COMMITTEE)})
    # When ผู้ใช้กดเข้าสู่ระบบ
    result = authenticate(verifier, "club", "correct")
    # Then ออก token และคืน role
    assert result.token_value
    assert result.role == UserRole.CLUB_COMMITTEE


def test_TC_AUTH_03_1_unknown_username_uses_generic_message():
    # Given username ไม่มีอยู่ในระบบ
    verifier = StubVerifier({})
    # When ผู้ใช้กดเข้าสู่ระบบ
    try:
        login(LoginRequest(username="unknown", password="any"), verifier)
    except HTTPException as error:
        result = error
    # Then ปฏิเสธโดยไม่เปิดเผยรายละเอียดบัญชี
    assert result.status_code == 401
    assert result.detail == "บัญชีหรือรหัสผ่านไม่ถูกต้อง"


def test_TC_AUTH_03_2_empty_username_uses_generic_message():
    # Given username ไม่มีอยู่และเป็นค่าว่าง
    verifier = StubVerifier({})
    # When ผู้ใช้กดเข้าสู่ระบบ
    try:
        login(LoginRequest(username="", password="any"), verifier)
    except HTTPException as error:
        result = error
    # Then ปฏิเสธโดยไม่เปิดเผยรายละเอียดบัญชี
    assert result.status_code == 401
    assert result.detail == "บัญชีหรือรหัสผ่านไม่ถูกต้อง"


def test_TC_AUTH_03_3_existing_username_follows_success_path():
    # Given username มีอยู่จริง จึงไม่ใช่เงื่อนไขของ AC-AUTH-03
    verifier = StubVerifier({("club", "correct"): VerifiedUser("u-1", UserRole.CLUB_COMMITTEE)})
    # When ผู้ใช้กดเข้าสู่ระบบด้วย password ที่ถูกต้อง
    result = authenticate(verifier, "club", "correct")
    # Then ออก token และคืน role
    assert result.token_value
    assert result.role == UserRole.CLUB_COMMITTEE


def submission(submission_id, submitted_at, status="รอตรวจสอบ", order=1):
    return ProjectSubmission(
        submission_id=submission_id,
        project_id=submission_id,
        submitted_at=submitted_at,
        sender_user_id="club-1",
        status=status,
        review_queue_order=order,
        project_name=f"โครงการ {submission_id}",
        project_owner="club-1",
        summary="สรุป",
        document_url=f"/documents/{submission_id}",
        created_at=submitted_at,
        current_status=status,
    )


def test_TC_VDC_03_1_pending_queue_is_sorted_by_submitted_at():
    # Given มีเอกสารรอตรวจหลายฉบับที่มีวันส่งต่างกัน
    service = ReviewQueueService(
        [
            submission(2, datetime(2026, 10, 2), order=2),
            submission(1, datetime(2026, 10, 1), order=1),
            submission(3, datetime(2026, 10, 3), status="อนุมัติ", order=3),
        ]
    )
    # When เจ้าหน้าที่เปิดคิวเอกสาร
    result = service.list_pending()
    # Then คืนเฉพาะรอตรวจสอบและเรียงก่อนมาหลัง
    assert [item.submission_id for item in result] == [1, 2]


def test_TC_VDC_03_2_same_submission_time_keeps_all_documents():
    # Given มีเอกสารสองฉบับวันส่งเท่ากัน
    submitted_at = datetime(2026, 10, 1)
    service = ReviewQueueService([submission(1, submitted_at), submission(2, submitted_at, order=2)])
    # When เจ้าหน้าที่เปิดคิวเอกสาร
    result = service.list_pending()
    # Then คืนเอกสารทั้งสองรายการ; ลำดับเมื่อเท่ากันรอ Q-06
    assert {item.submission_id for item in result} == {1, 2}


def test_TC_VDC_03_3_empty_pending_queue_returns_empty_list():
    # Given ไม่มีเอกสารสถานะรอตรวจสอบ
    service = ReviewQueueService([submission(1, datetime(2026, 10, 1), status="อนุมัติ")])
    # When เจ้าหน้าที่เปิดคิวเอกสาร
    result = service.list_pending()
    # Then คืนลิสต์ว่าง
    assert result == []


def activity(activity_id, deadline):
    return Activity(
        activity_id=activity_id,
        owner_user_id="club-1",
        name=f"กิจกรรม {activity_id}",
        activity_date=deadline - timedelta(days=30),
        regular_submission_deadline=deadline,
    )


def late_result(activities, as_of):
    engine = create_engine("sqlite:///:memory:")
    ActivityBase.metadata.create_all(engine)
    with Session(engine) as session:
        session.add_all(activities)
        session.commit()
        return ActivityRepository.list_late_activities(session, "club-1", as_of)


def test_TC_LATE_03_1_returns_all_late_activities():
    # Given มีหลายกิจกรรมเลยกำหนดและมีรายการที่ยังไม่เลยกำหนด
    result = late_result(
        [activity(1, date(2026, 6, 1)), activity(2, date(2026, 7, 1)), activity(3, date(2026, 12, 1))],
        date(2026, 10, 13),
    )
    # When เปิดหน้าคำขอ
    # Then คืนกิจกรรมที่เลยกำหนดทั้งหมดและไม่รวมรายการที่ยังไม่เลยกำหนด
    assert [item.activity_id for item in result] == [1, 2]


def test_TC_LATE_03_2_deadline_today_is_not_late():
    # Given กิจกรรมมีวันกำหนดส่งตรงกับวันที่ตรวจ
    result = late_result([activity(1, date(2026, 10, 13))], date(2026, 10, 13))
    # When เปิดหน้าคำขอ
    # Then ไม่ถือว่าเป็นกิจกรรมที่เลยกำหนด
    assert result == []


def test_TC_LATE_03_3_no_late_activities_returns_empty_list():
    # Given กรรมการไม่มีรายการกิจกรรมที่เลยกำหนด
    result = late_result([activity(1, date(2026, 12, 1))], date(2026, 10, 13))
    # When เปิดหน้าคำขอ
    # Then คืนรายการว่าง
    assert result == []


def test_AC_VDC_03_queue_uses_submission_id_for_equal_submission_times():
    # Given มีเอกสารรอตรวจที่เวลาส่งเท่ากันแต่มี submission_id ต่างกัน
    submitted_at = datetime(2026, 10, 1)
    service = ReviewQueueService(
        [
            submission(2, submitted_at),
            submission(1, submitted_at),
        ]
    )

    # When เจ้าหน้าที่เปิดคิวเอกสาร
    result = service.list_pending()

    # Then เอกสารเรียงตาม submission_id จากน้อยไปมาก
    assert [item.submission_id for item in result] == [1, 2]
