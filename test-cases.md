# Test cases: AC ที่ทีมเลือกตรวจ

อ้างอิง: `specs/009-เข้าสู่ระบบ/spec.md`, `specs/003-ตรวจเอกสารโครงการ/spec.md`, `specs/011-ขอบันทึกชั่วโมงย้อนหลัง/spec.md`

ตารางนี้ใช้เป็นแหล่งอ้างอิงของ test ที่ขึ้นต้นด้วย `test_TC_`

| TC ID | AC | แบบ | Given | When | Then (ตรวจอะไรบ้าง) | ตรวจด้วย | ชื่อ test | สถานะ |
|---|---|---|---|---|---|---|---|---|
| TC-AUTH-01-1 | AC-AUTH-01 | ทางปกติ | บัญชีและรหัสผ่านถูกต้อง และ verifier คืน role `club_committee` | ผู้ใช้กดเข้าสู่ระบบ | ระบบออก token ที่ไม่ว่าง มี `expires_at` หลังเวลาออก token และคืน role ถูกต้อง | pytest | `test_TC_AUTH_01_1_successful_login_returns_token_and_role` | ใช้ได้ |
| TC-AUTH-01-2 | AC-AUTH-01 | ขอบ | บัญชีและรหัสผ่านถูกต้อง และ role เป็น `student_affairs_officer` ซึ่งเป็น role หนึ่งใน spec | ผู้ใช้กดเข้าสู่ระบบ | ระบบออก token ที่ไม่ว่าง และคืน role `student_affairs_officer`; เส้นทางหน้าหลักจริงรอ Q-01 | pytest | `test_TC_AUTH_01_2_boundary_role_returns_token` | ใช้ได้ |
| TC-AUTH-01-3 | AC-AUTH-01 | ทางผิด | รหัสผ่านไม่ถูกต้อง ทำให้เงื่อนไข “บัญชีและรหัสผ่านถูกต้อง” ไม่เป็นจริง | ผู้ใช้กดเข้าสู่ระบบ | ระบบปฏิเสธและแสดงข้อความทั่วไปเดียวกับ AC-AUTH-02 | pytest | `test_TC_AUTH_01_3_invalid_password_is_rejected` | ใช้ได้ |
| TC-AUTH-02-1 | AC-AUTH-02 | ทางปกติ | username มีอยู่และ password ไม่ถูกต้อง | ผู้ใช้กดเข้าสู่ระบบ | ระบบปฏิเสธและคืนข้อความ `บัญชีหรือรหัสผ่านไม่ถูกต้อง` | pytest | `test_TC_AUTH_02_1_wrong_password_uses_generic_message` | ใช้ได้ |
| TC-AUTH-02-2 | AC-AUTH-02 | ขอบ | username มีอยู่และ password ผิดเป็นค่าว่าง | ผู้ใช้กดเข้าสู่ระบบ | ระบบปฏิเสธและคืนข้อความ `บัญชีหรือรหัสผ่านไม่ถูกต้อง` | pytest | `test_TC_AUTH_02_2_empty_wrong_password_uses_generic_message` | ใช้ได้ |
| TC-AUTH-02-3 | AC-AUTH-02 | ทางผิด | password ถูกต้อง แต่ไม่เป็นไปตามเงื่อนไข “รหัสผ่านไม่ถูกต้อง” | ผู้ใช้กดเข้าสู่ระบบ | ระบบออก token และคืน role ตาม AC-AUTH-01 | pytest | `test_TC_AUTH_02_3_correct_password_follows_success_path` | ใช้ได้ |
| TC-AUTH-03-1 | AC-AUTH-03 | ทางปกติ | username ไม่มีอยู่ในระบบ | ผู้ใช้กดเข้าสู่ระบบ | ระบบคืนข้อความทั่วไป `บัญชีหรือรหัสผ่านไม่ถูกต้อง` และไม่เปิดเผยว่า username ไม่มีอยู่ | pytest | `test_TC_AUTH_03_1_unknown_username_uses_generic_message` | ใช้ได้ |
| TC-AUTH-03-2 | AC-AUTH-03 | ขอบ | username ไม่มีอยู่และเป็นค่าว่าง | ผู้ใช้กดเข้าสู่ระบบ | ระบบคืนข้อความทั่วไปเดียวกัน โดยไม่เปิดเผยรายละเอียดบัญชี | pytest | `test_TC_AUTH_03_2_empty_username_uses_generic_message` | ใช้ได้ |
| TC-AUTH-03-3 | AC-AUTH-03 | ทางผิด | username มีอยู่จริง จึงไม่เป็นไปตามเงื่อนไข username ไม่มีอยู่ | ผู้ใช้กดเข้าสู่ระบบด้วย password ที่ถูกต้อง | ระบบออก token และคืน role ตาม AC-AUTH-01 | pytest | `test_TC_AUTH_03_3_existing_username_follows_success_path` | ใช้ได้ |
| TC-VDC-03-1 | AC-VDC-03 | ทางปกติ | มีเอกสารสถานะ `รอตรวจสอบ` หลายฉบับที่มีวันส่งต่างกัน | เจ้าหน้าที่เปิดคิวเอกสาร | ระบบคืนเฉพาะเอกสารรอตรวจสอบและเรียงวันที่ส่งจากก่อนมาหลัง | pytest | `test_TC_VDC_03_1_pending_queue_is_sorted_by_submitted_at` | ใช้ได้ |
| TC-VDC-03-2 | AC-VDC-03 | ขอบ | มีเอกสารที่วันส่งเท่ากัน | เจ้าหน้าที่เปิดคิวเอกสาร | ระบบคืนเอกสารทั้งสองรายการ; ลำดับเมื่อวันส่งเท่ากันรอ Q-06 | pytest | `test_TC_VDC_03_2_same_submission_time_keeps_all_documents` | ใช้ได้ |
| TC-VDC-03-3 | AC-VDC-03 | ทางผิด | ไม่มีเอกสารสถานะ `รอตรวจสอบ` | เจ้าหน้าที่เปิดคิวเอกสาร | ระบบคืนลิสต์ว่าง | pytest | `test_TC_VDC_03_3_empty_pending_queue_returns_empty_list` | ใช้ได้ |
| TC-LATE-03-1 | AC-LATE-03 | ทางปกติ | กรรมการมีหลายกิจกรรมที่เลยกำหนดและมีกิจกรรมที่ยังไม่เลยกำหนด | เปิดหน้าคำขอบันทึกชั่วโมงย้อนหลัง | ระบบคืนกิจกรรมที่เลยกำหนดทั้งหมดของกรรมการ และไม่รวมกิจกรรมที่ยังไม่เลยกำหนด | pytest | `test_TC_LATE_03_1_returns_all_late_activities` | ใช้ได้ |
| TC-LATE-03-2 | AC-LATE-03 | ขอบ | กิจกรรมมีวันกำหนดส่งตรงกับวันที่ตรวจ | เปิดหน้าคำขอบันทึกชั่วโมงย้อนหลัง | ระบบไม่ถือกิจกรรมที่ยังไม่ “เลย” กำหนดเป็นรายการเลยกำหนด | pytest | `test_TC_LATE_03_2_deadline_today_is_not_late` | ใช้ได้ |
| TC-LATE-03-3 | AC-LATE-03 | ทางผิด | กรรมการไม่มีรายการกิจกรรมที่เลยกำหนด | เปิดหน้าคำขอบันทึกชั่วโมงย้อนหลัง | ระบบคืนรายการว่าง | pytest | `test_TC_LATE_03_3_no_late_activities_returns_empty_list` | ใช้ได้ |
