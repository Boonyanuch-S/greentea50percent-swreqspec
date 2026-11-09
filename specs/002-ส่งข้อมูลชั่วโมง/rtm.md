# RTM: ส่งข้อมูลชั่วโมง
อ้างอิง: spec.md Draft v3 | tasks.md | test-cases.md
สร้างด้วย /verify เมื่อ 2569-11-09 | test: 240 ผ่าน 0 ไม่ผ่าน (backend 155, frontend 85)

หมายเหตุการรัน: รอบแรก `cd backend && pytest -v` เริ่มไม่ได้เพราะ environment ไม่มี SQLAlchemy; ติดตั้ง dependencies จาก `backend/requirements.txt` แล้วรันซ้ำผ่าน
ไม่มี `specs/000-shared/` และไม่มี `mockups/`

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-SBH-01 | AC-SBH-03 | T-01, T-02, T-04 เสร็จ; T-05 ทำบางส่วน | `api/hours_submission.py`: `list_hours_submission_activities`, `get_hours_submission_activity`; `HoursSubmission.jsx`: กรองสถานะ | `test_AC_SBH_03_only_finished_activity_allowed`, `test_AC_SBH_03_mixed_activity_statuses_are_filtered_before_display` (ผ่าน); `test_TC_SBH_03_1/2` Given ไม่ตรงข้อมูลที่เตรียม | ช่องโหว่ (F-001, F-006) |
| FR-SBH-02 | AC-SBH-04 | T-06 เสร็จ; T-08/T-09 พร้อมทำ | `api/activity_data.py`: `get_activity_people`, `get_activity_hour_types`; `services/hours_data.py` | `test_AC_SBH_04_generate_excel_from_activity_data`, `test_hours_data_service_returns_activity_people_and_all_hour_types` (ผ่าน; ตรวจข้อมูล แต่ไม่มี source จริงหรือ Excel: F-001, F-002) | ช่องโหว่ (F-001, F-002) |
| FR-SBH-03 | AC-SBH-04 | T-07/T-08/T-09/T-10 พร้อมทำ | ไม่มี generator หรือ template registry; mock สร้างเฉพาะ preview object | ไม่มี test สร้าง/ตรวจไฟล์ Excel หรือ template | ช่องโหว่ (F-002, F-005) |
| FR-SBH-04 | AC-SBH-01 (ปรับตามคำตอบ Q-02) | T-09/T-16 พร้อมทำ | `HoursSubmission.jsx`: preview mock แบบอ่านอย่างเดียว, คำแนะนำแก้ไฟล์ต้นทาง, checkbox และปุ่มยืนยัน | `test_FR_SBH_04_require_completeness_check_before_submit` (ผ่าน; ตรวจข้อความ, ไม่มีช่องแก้ข้อมูลในหน้า, บล็อกก่อนติ๊กและเรียก submit หลังติ๊ก); ยังไม่มีไฟล์จริงให้ตรวจ (F-002) | ช่องโหว่ (F-002) |
| FR-SBH-05 | AC-SBH-01 | T-03 เสร็จ; T-11 พร้อมทำ; T-17 ยังไม่เสร็จ | มีแต่ `hoursSubmissionMock.submitHours`; ไม่มี API ส่งไฟล์/คิวจาก UC-02 | ไม่มี test ของ AC-SBH-01 ที่ตรวจการสร้างไฟล์และคิว UC-07 จริง | ช่องโหว่ (F-003) |
| FR-SBH-06 | AC-SBH-02 | T-03 เสร็จ; T-14/T-15/T-17 ยังไม่เสร็จเพราะรอ mapping จาก UC-04 (ยังไม่มี Q-ID) | mock แสดงสถานะและปิดปุ่มเมื่อไม่มี `projectNumber`; ไม่มีการอ่านสถานะจาก UC-04 จริง | ไม่มี test ของ AC-SBH-02 | ยังไม่ถึง |
| FR-SBH-07 | AC-SBH-05 | T-12/T-13 | `DeadlineCheckService.is_deadline_exceeded`; `HoursSubmission.jsx` แสดงลิงก์ไป UC-11 เมื่อเกินกำหนด | backend และ frontend tests ตรวจสถานะเกินกำหนด, ลิงก์และการนำทาง; ไม่มี deadline แล้วไม่ถือว่าเกิน (ผ่าน) | ครบ |
| NFR-SEC-01 | AC-SBH-06 | T-04 เสร็จ; T-05 ทำบางส่วน | `middleware/auth.py`: `require_roles`, `require_authenticated_context`; App บังคับหน้า Login | `test_AC_SBH_06_reject_unauthenticated_access`, `test_AC_SBH_04_rejects_unauthenticated_activity_data_access` (ผ่าน) | ครบ |
| CON-NFR-21 | AC-SBH-06 | T-04 เสร็จ; T-05 ทำบางส่วน | guard สำหรับ API กิจกรรม/ข้อมูลชั่วโมงและหน้า Login | test unauthenticated API ทั้ง list/detail/participants/hour-types (ผ่าน) | ครบ |
| IF-TPL-01 | AC-SBH-04 | T-07/T-08/T-10 พร้อมทำ | mock ฝัง `HOURS-SCI` / `1.0`; ไม่มี registry/config/admin สำหรับ template | ไม่มี test config/template หรือไฟล์ Excel | ช่องโหว่ (F-005) |
| IF-PRJNUM-01 | AC-SBH-02 | T-03 เสร็จ; T-14/T-15/T-17 ยังไม่เสร็จเพราะรอ mapping สถานะ UC-04 (ยังไม่มี Q-ID) | field `Activity.project_number_status` ถูกส่งกลับ แต่ไม่มี client/API เชื่อม UC-04 | ไม่มี test การอ่าน/แปลสถานะ UC-04 | ยังไม่ถึง |
| IF-UC07-01 | AC-SBH-01 | T-03 เสร็จ; T-11 พร้อมทำ; T-17 ยังไม่เสร็จ | mock เพิ่มเอกสารเข้า `activityHoursMock` ในหน่วยความจำ; ไม่มีการส่งเข้าคิวจริง | ไม่มี test เชื่อมรายการส่งเข้าคิว UC-07 | ช่องโหว่ (F-003) |

สรุป: ครบ 3 | ยังไม่ถึง 2 | รอ 0 | ช่องโหว่ 7

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `main.py`: app/router wiring | FR-SBH-01/02 | ต่อ router list/detail/participants/hour-types แล้ว แต่ไม่ได้ตั้ง `app.state.activity_session` | เมื่อเรียก server จริง API ตอบ 503 จาก `get_activity_session`; F-001 |
| `GET /activities/hours-submission`: `list_hours_submission_activities` | FR-SBH-01, CON-NFR-21 | เงื่อนไขกรองสถานะตรง | backend test ใส่ dependency override จึงไม่ตรวจ startup wiring; F-001 |
| `GET /activities/{activity_id}/hours-submission`: `get_hours_submission_activity` | FR-SBH-01, FR-SBH-07, IF-PRJNUM-01 | กรองสถานะและคืน deadline/status ตามแบบจำลอง; ไม่ได้อ่านสถานะจาก UC-04 | API ไม่ทำงานจริงเมื่อไม่มี session; การแปลสถานะเลขยังรอทีม |
| `GET /activities/{activity_id}/participants`: `get_activity_people` | FR-SBH-01/02, CON-NFR-21 | คืน participants และ staff ของกิจกรรมที่จบแล้ว | test ตรวจ payload และปฏิเสธกิจกรรมไม่จบ แต่ runtime session ยังไม่ถูกตั้ง (F-001) |
| `GET /activities/{activity_id}/hour-types`: `get_activity_hour_types` | FR-SBH-02, ASM-05, CON-NFR-21 | คืนประเภทชั่วโมงผูก activity ไม่แยกรายบุคคล | test ตรวจรายการประเภท แต่ยังไม่มีการใช้สร้าง Excel |
| `ActivityAccessService` / `ActivityRepository.list_finished_activities` | FR-SBH-01 | ตรง; query เลือก status `"จบแล้ว"` | มี backend test สถานะผสมและตรวจรายการ |
| `HoursDataService.get_activity_data` / `ActivityRepository.list_participants`, `list_staff`, `list_hour_types` | FR-SBH-02, ASM-05 | ตรงกับการดึงผู้เข้าร่วม Staff และประเภทชั่วโมงระดับกิจกรรม | test ตรวจผล service และ API |
| `DeadlineCheckService.is_deadline_exceeded` | FR-SBH-07, ASM-03 | เปรียบเทียบเฉพาะ deadline ที่มี; `None` ไม่เกินกำหนด | helper tests ผ่าน; model/API runtime ยังอาศัยข้อมูล deadline |
| `HoursSubmission.jsx`: `ActivitySelector`, `HoursSubmission` | FR-SBH-01/03/04/05/06/07 | UI กรองกิจกรรมจบแล้ว, แสดง preview mock/คำแนะนำแก้ไฟล์ต้นทาง/checkbox, บล็อกยืนยันเมื่อยังไม่ครบหรือเลขโครงการไม่พร้อม, แสดงลิงก์ UC-11 เมื่อเกินกำหนด | Preview ไม่ใช่ไฟล์ Excel จริง (F-002); การส่งยังเป็น mock (F-003); F-004 ปิดแล้ว |
| `api/client.js`: `createHoursSubmissionClient` | FR-SBH-01, FR-SBH-07, CON-NFR-21 | เรียก authenticated GET สำหรับ list/detail ได้ | App ไม่ได้สร้าง client นี้เป็นค่าเริ่มต้น; F-001 |
| `App.jsx`: `sessionHoursSubmissionClient` | FR-SBH-01 | ค่าเริ่มต้นเป็น `hoursSubmissionMock`, ไม่ได้เชื่อม API client จริง | F-001 |
| `hoursSubmissionMock.getFinishedActivities`, `getSubmission` | FR-SBH-01/03/04/06 | ใช้ข้อมูล/preview ตัวอย่างที่ฝังใน source | ผู้ใช้เห็นข้อมูลจำลองแทนข้อมูลกิจกรรมจริง; F-001, F-002 |
| `hoursSubmissionMock.submitHours` / `activityHoursMock.addSubmittedDocument` | FR-SBH-05, IF-UC07-01, Q-03 | คำตอบ Q-03 ยืนยันส่งเข้าคิวหลังยืนยัน แต่ mock เพียงเพิ่มข้อมูลใน memory ไม่มี API ส่งเข้าคิว UC-07 จริง | F-003 |
| `POST /hours-submissions/preview`, `GET /config/templates`, `POST /hours-submissions/submit`, `GET /project-number/status/{activityId}`, `POST /review-queue/submit` | FR-SBH-03/05, FR-SBH-06, IF-TPL-01, IF-PRJNUM-01, IF-UC07-01 | ไม่มี endpoint เหล่านี้ใน app wiring; เส้น `/review-queue` ที่มีเป็น GET ของ UC-01/คิวเอกสาร ไม่ใช่การส่ง UC-02 เข้า UC-07 | T-07 ถึง T-11/T-14/T-17 ยังไม่เสร็จ; F-002, F-003, F-005 |
| `LateSubmissionPage.jsx` | UC-11 | หน้าส่งชั่วโมงเสนอทางเลือกและลิงก์ไป UC-11 ตาม AC-SBH-05; หน้า UC-11 เป็น mock แยกต่างหากและไม่มี flow ขอผ่อนผันจริงใน UC-02 | Frontend test ยืนยันลิงก์และการนำทาง; F-004 ปิดแล้ว |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-001 | โค้ดไม่มี FR | `backend/app/api/hours_submission.py:get_activity_session`, `backend/app/main.py`, `frontend/src/App.jsx` | FR-SBH-01, FR-SBH-02, T-05 | API จริงไม่มี `app.state.activity_session` จึงตอบ 503; หน้ากรรมการใช้ `hoursSubmissionMock` เป็นค่าเริ่มต้น, แม้มี authenticated client และ tests ผ่านเพราะ override dependency/ฉีด client เอง จึงยังไม่มี flow ใช้ข้อมูลกิจกรรมจริงตาม T-05 | |
| F-002 | โค้ดไม่มี FR | `test_AC_SBH_04_generate_excel_from_activity_data`, `hoursSubmissionMock.js`, ไม่มี generator/registry | FR-SBH-03, FR-SBH-04, AC-SBH-04, Q-02 | test ชื่อสร้าง Excel แต่ตรวจแค่ participant/Staff/hour type; ไม่มีไฟล์ Excel หรือ preview จากไฟล์จริงให้ตรวจความครบถ้วน และไม่มี flow ส่งไฟล์ต้นทางฉบับแก้ไขกลับเข้าระบบตาม Q-02; หน้าแสดงเพียง preview object จาก mock และ endpoint preview/template registry ยังไม่มี | |
| F-003 | โค้ดไม่มี FR | `hoursSubmissionMock.js:submitHours`, `activityHoursMock.addSubmittedDocument`, ไม่มี API UC-07 | FR-SBH-05, IF-UC07-01, Q-03 (ตอบแล้ว) | ทีมยืนยันให้ส่งเข้าคิวทันทีหลังกรรมการตรวจและยืนยัน แต่ปัจจุบันหน้าจอเพียงเพิ่มรายการใน memory; ไม่มี API/การบันทึกรายการเข้าสู่คิว UC-07 จริง | |
| F-005 | ละเมิด Constraint | `frontend/src/services/hoursSubmissionMock.js`: `template` | IF-TPL-01 | ค่า `HOURS-SCI` / version `1.0` hardcode ใน mock และถูกแสดงบนหน้าจอ ขัดกับข้อกำหนดอ่าน template ID/เวอร์ชันจาก config และไม่ hardcode แม้เป็น mock ที่ถูกใช้เป็นค่าเริ่มต้นของ App | |
| F-006 | test อ่อน | `frontend/src/__tests__/hours-submission-navigation.test.jsx`: `test_TC_SBH_03_1_mixed_activity_statuses`, `test_TC_SBH_03_2_status_boundary` | AC-SBH-03, TC-SBH-03-1, TC-SBH-03-2 | test ทั้งสองระบุ Given ว่ามีกิจกรรมสถานะปะปน แต่สร้าง client ด้วยรายการกิจกรรมจบแล้วเท่านั้น จึงไม่ทดสอบการกรองตาม Given; มี `test_AC_SBH_03_mixed_activity_statuses_are_filtered_before_display` แยกที่ตรวจพฤติกรรมจริงแล้ว แต่ TC ที่ทีมอนุมัติยังไม่ตรงกับข้อมูลทดสอบ | |
| F-005 | ละเมิด Constraint | `frontend/src/services/hoursSubmissionMock.js`: `template` | IF-TPL-01 | ค่า `HOURS-SCI` / version `1.0` hardcode ใน mock และถูกแสดงบนหน้าจอ ขัดกับข้อกำหนดอ่าน template ID/เวอร์ชันจาก config และไม่ hardcode แม้เป็น mock ที่ถูกใช้เป็นค่าเริ่มต้นของ App | |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| F-004 | เพิ่มลิงก์จากหน้าส่งข้อมูลชั่วโมงไปหน้า UC-11 เมื่อ deadline เกินกำหนด; กำหนด `deadlineExceeded: false` ให้ mock ที่ไม่มี deadline และทำให้ `Activity.regular_submission_deadline` รับค่า `None` ตาม ASM-03 | Frontend tests ตรวจว่ามีลิงก์และนำทางไปหน้า UC-11 เมื่อเกินกำหนด และไม่แสดงลิงก์เมื่อไม่เกินกำหนด; backend `pytest -v` ผ่าน 155 tests รวมกรณีไม่มี deadline ที่คืน `deadline_exceeded: false` |
| F-007 | ปรับ AC-SBH-01 ตามคำตอบทีม Q-02 ให้ระบุการตรวจความครบถ้วนและแนวทางเมื่อพบข้อมูลผิด; หน้าส่งแจ้งให้กลับไปแก้ไฟล์ต้นทางและไม่มีช่องแก้ข้อมูล | `test_FR_SBH_04_require_completeness_check_before_submit` ตรวจข้อความ/ไม่มี textbox, ปุ่มยืนยันปิดก่อนติ๊ก และเรียก submit หลังติ๊ก; frontend test ผ่าน |
