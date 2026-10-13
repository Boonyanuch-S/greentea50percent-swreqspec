# RTM: การตรวจ AC รอบทีม

อ้างอิง test cases: [test-cases.md](./test-cases.md)

## ผลการตรวจและทีมตัดสิน

| ID | AC/TC หรือข้อค้นพบ | หลักฐาน | กอง | ทีมตัดสิน |
|---|---|---|---|---|
| F-001 | AC-AUTH-01/02/03: endpoint ใช้ `_UnconfiguredVerifier` และยังไม่เชื่อมแหล่งบัญชีจริง | `backend/app/routers/auth.py` | ยังไม่ถึง | ยังไม่แก้โค้ด เพราะ plan และ spec ระบุว่าแหล่งบัญชียังรอ Open Question; ให้ถือเป็น task ยังไม่ถึง ไม่ใช่ทำ test ให้ผ่าน |
| F-002 | AC-VDC-03: ไม่มี test เดิมจับการเรียงคิวผิด | ผลทำให้ `review_queue_service.py` พังแล้ว test เดิมยังผ่าน | AI เข้าใจผิด | ปิดแล้ว: เพิ่ม test ตามตารางใน TC-VDC-03-1 และโค้ดปัจจุบันตรง AC |
| F-003 | TC-AUTH-02/03 เดิมตรวจแค่ `None` ไม่ตรวจข้อความผลลัพธ์ | รอบตรวจตาราง | ยังไม่ถึง | ปิดแล้ว: แก้ test ให้เรียก `login` และตรวจ `status_code` กับ `detail` ตรงตาม spec; ไม่แก้ระบบ |
| F-004 | TC-VDC-03-2 กรณีวันส่งเท่ากันไม่มีเกณฑ์เรียงลำดับใน spec | AC-VDC-03 และ plan ข้อ 4 | ยังไม่ถึง | ปิดแล้ว: เพิ่ม Q-06 และ CHANGELOG ใน `specs/003-ตรวจเอกสารโครงการ/spec.md`; test ไม่ assert ลำดับที่ spec ยังไม่กำหนด |
| F-005 | frontend test เดิม `setup.test.jsx` ยังหา “ระบบจองคิวตรวจสุขภาพ” แต่หน้าปัจจุบันเป็น “ขอบันทึกชั่วโมงย้อนหลัง” | `frontend/src/__tests__/setup.test.jsx` และผล `npm test -- --run` | คนเจอเอง | ปิดแล้ว: ปรับ smoke test ให้ตรวจ heading ของหน้าปัจจุบันตาม spec และรอ state update ด้วย `waitFor`; full suite ผ่าน 3 tests |

## หลักฐานตรวจครบ 5 AC

| AC | TC ครบ 3 แบบ | test ที่รัน | ผล mutation 1 บรรทัด |
|---|---|---|---|
| AC-AUTH-01 | TC-AUTH-01-1, TC-AUTH-01-2, TC-AUTH-01-3 | `test_TC_AUTH_01_1_successful_login_returns_token_and_role`, `test_TC_AUTH_01_2_boundary_role_returns_token`, `test_TC_AUTH_01_3_invalid_password_is_rejected` | ทำ token เป็นค่าว่างแล้ว test AUTH-01 ไม่ผ่าน; restore แล้ว |
| AC-AUTH-02 | TC-AUTH-02-1, TC-AUTH-02-2, TC-AUTH-02-3 | `test_TC_AUTH_02_1_wrong_password_uses_generic_message`, `test_TC_AUTH_02_2_empty_wrong_password_uses_generic_message`, `test_TC_AUTH_02_3_correct_password_follows_success_path` | เปลี่ยนข้อความ generic error แล้ว test AUTH-02 ไม่ผ่าน; restore แล้ว |
| AC-AUTH-03 | TC-AUTH-03-1, TC-AUTH-03-2, TC-AUTH-03-3 | `test_TC_AUTH_03_1_unknown_username_uses_generic_message`, `test_TC_AUTH_03_2_empty_username_uses_generic_message`, `test_TC_AUTH_03_3_existing_username_follows_success_path` | กลับเงื่อนไขผลลัพธ์ login แล้ว test AUTH-03 ไม่ผ่าน; restore แล้ว |
| AC-VDC-03 | TC-VDC-03-1, TC-VDC-03-2, TC-VDC-03-3 | `test_TC_VDC_03_1_pending_queue_is_sorted_by_submitted_at`, `test_TC_VDC_03_2_same_submission_time_keeps_all_documents`, `test_TC_VDC_03_3_empty_pending_queue_returns_empty_list` | เรียงคิวกลับด้านแล้ว test VDC-03-1 ไม่ผ่าน; restore แล้ว |
| AC-LATE-03 | TC-LATE-03-1, TC-LATE-03-2, TC-LATE-03-3 | `test_TC_LATE_03_1_returns_all_late_activities`, `test_TC_LATE_03_2_deadline_today_is_not_late`, `test_TC_LATE_03_3_no_late_activities_returns_empty_list` | เปลี่ยน `<` เป็น `<=` แล้ว test LATE-03-2 ไม่ผ่าน; restore แล้ว |

ผลรวม: 5 AC, 15 TC ไม่ซ้ำ, ทุกแถวสถานะ `ใช้ได้`; `PYTHONPATH=. pytest -v backend/tests` ผ่าน 16 tests และ `cd frontend && npm test` ผ่าน 3 tests

## คำถามตรวจ 5 ข้อ แบ่ง 3 กอง

### กอง “ถึงแล้ว”

1. **Q1:** AC ที่เลือกมี test cases ครบ 3 แบบและทุกแถวสถานะ “ใช้ได้” หรือไม่?  
   **ทีมตัดสิน:** ถึงแล้ว มี 15 แถวใน [test-cases.md](./test-cases.md) ครอบคลุม 5 AC โดยแต่ละ AC มีทางปกติ/ขอบ/ทางผิดครบ
2. **Q2:** Then ของ test ใหม่ตรวจผลในข้อมูล ไม่ใช่ตรวจเพียงว่าคำสั่งไม่ error หรือไม่?  
   **ทีมตัดสิน:** ถึงแล้วหลังแก้ F-003; ตรวจ token/role, ข้อความ error, ลำดับคิว และรายการกิจกรรม

### กอง “ยังไม่ถึง”

3. **Q3:** ทุก AC ที่ task ระบุว่าเสร็จมี implementation ครบถึงระดับใช้งานจริงหรือไม่?  
   **ทีมตัดสิน:** ยังไม่ถึงสำหรับ Login endpoint เพราะ verifier ยังเป็น skeleton และรอคำตอบใน spec; ไม่ปกปิดด้วย test stub
4. **Q4:** ขอบเขตการเรียงลำดับเมื่อ `submitted_at` เท่ากันถูกระบุใน spec หรือไม่?  
   **ทีมตัดสิน:** ยังไม่ถึง เพิ่ม Q-06 แล้ว; test ไม่ตัดสินแทนทีม

### กอง “AI เข้าใจผิด”

5. **Q5:** การรัน test ด้วย `cd backend && pytest` เป็นคำสั่งที่ใช้ได้ตรงกับโครง package นี้หรือไม่?  
   **ทีมตัดสิน:** AI เข้าใจผิด คำสั่งนั้น import `backend` ไม่ได้; คำสั่งที่ใช้ตรวจคือ `PYTHONPATH=. pytest -q backend/tests` และต้องบันทึกไว้เป็นข้อจำกัดการรัน

## สถานะปิดข้อค้นพบ

- F-002, F-003 และ F-004 ปิดแล้วตามหลักฐานใน commit `verify v2`
- F-001 ยังไม่ถึง: รอทีมตอบคำถามแหล่งข้อมูลบัญชีตาม Open Questions ก่อนเชื่อม verifier จริง
- F-005 ปิดแล้ว: ปรับ smoke test เดิมให้ตรงกับหน้าจอปัจจุบัน และ frontend full suite ผ่าน
