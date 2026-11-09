# RTM: ส่งข้อมูลชั่วโมง
อ้างอิง: spec.md Draft v3 | tasks.md | test-cases.md
สร้างด้วย /verify เมื่อ 2569-11-09 20:08 UTC | test: 242 ผ่าน 0 ไม่ผ่าน (backend 157, frontend 85)

หมายเหตุ: ไม่พบ `specs/000-shared/`; พบ mockup 2 ไฟล์ซึ่งระบุว่ายังไม่ยืนยันโดย PO และ spec ไม่มีหมวด "หน้าจอ (UI)" จึงไม่ถือ mockup เป็นข้อกำหนด UI ที่ยืนยันแล้ว

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-SBH-01 | AC-SBH-03 | T-01/T-02/T-04 เสร็จ; T-05 ทำบางส่วน | `backend/app/api/hours_submission.py`: `list_hours_submission_activities`, `get_hours_submission_activity`; `frontend/src/pages/HoursSubmission.jsx`: `ActivitySelector`, กรองสถานะ | `test_AC_SBH_03_only_finished_activity_allowed`, `test_AC_SBH_03_mixed_activity_statuses_are_filtered_before_display` (ผ่าน); `test_TC_SBH_03_1/2` (ผ่านแต่ Given ไม่ตรงข้อมูลที่เตรียม) | ช่องโหว่ |
| FR-SBH-02 | AC-SBH-04 | T-01/T-02/T-06 เสร็จ; T-08/T-09 พร้อมทำ | `backend/app/api/activity_data.py`: `get_activity_people`, `get_activity_hour_types`; `backend/app/services/hours_data.py` | `test_AC_SBH_04_generate_excel_from_activity_data`, `test_hours_data_service_returns_activity_people_and_all_hour_types` (ผ่าน; ตรวจข้อมูลที่เตรียม ไม่ได้สร้าง Excel จริง) | ช่องโหว่ |
| FR-SBH-03 | AC-SBH-04 | T-07 เสร็จ รอทีมตรวจ; T-08/T-09/T-10 พร้อมทำ | ไม่มี Excel generator; `frontend/src/services/hoursSubmissionMock.js`: preview object; `backend/app/services/template_registry.py`: อ่านรายการ template ที่ active | `test_AC_SBH_04_generate_excel_from_activity_data` (ผ่าน แต่ไม่มีการตรวจไฟล์ Excel หรือ preview จากไฟล์จริง) | ช่องโหว่ |
| FR-SBH-04 | AC-SBH-01 | T-09/T-16 พร้อมทำ; T-17 รอ mapping UC-04 | `frontend/src/pages/HoursSubmission.jsx`: preview mock, คำแนะนำแก้ไฟล์ต้นทาง, checkbox และปุ่มยืนยัน | `test_FR_SBH_04_require_completeness_check_before_submit` (ผ่าน; ตรวจข้อความ/checkbox/การเรียก mock submit แต่ไม่ตรวจไฟล์จริงหรือการส่งฉบับแก้ไขกลับ) | ช่องโหว่ |
| FR-SBH-05 | AC-SBH-01 | T-03 เสร็จ; T-11 พร้อมทำ; T-17 รอ mapping UC-04 | `frontend/src/services/hoursSubmissionMock.js`: `submitHours`; `activityHoursMock.addSubmittedDocument` | ไม่มี test AC-SBH-01 ที่ตรวจการส่งไฟล์และเพิ่มรายการเข้าคิว UC-07 จริง | ช่องโหว่ |
| FR-SBH-06 | AC-SBH-02 | T-14/T-15/T-17 รอ mapping จาก UC-04 (tasks.md ระบุว่ายังไม่มี Q-ID) | mock แสดงสถานะและปิดปุ่มเมื่อไม่มี `projectNumber`; ไม่มีการอ่านสถานะ UC-04 จริง | ไม่มี test AC-SBH-02; API จริงไม่มี mapping สถานะจาก UC-04 | ยังไม่ถึง |
| FR-SBH-07 | AC-SBH-05 | T-12 เสร็จ; T-13 ทำบางส่วน (โค้ด/การทดสอบครอบคลุมแล้ว) | `backend/app/services/deadline_check.py`: `is_deadline_exceeded`; `frontend/src/pages/HoursSubmission.jsx`: แสดงลิงก์ UC-11 | `test_AC_SBH_05_show_exception_link_when_deadline_exceeded`, `test_AC_SBH_05_no_deadline_does_not_mark_exception`, frontend tests ตรวจลิงก์และนำทาง (ผ่าน) | ครบ |
| NFR-SEC-01 | AC-SBH-06 | T-04 เสร็จ; T-05 ทำบางส่วน | `backend/app/middleware/auth.py`: `require_roles`, `require_authenticated_context`; `frontend/src/App.jsx`: login ก่อนเข้าหน้าตามบทบาท | `test_AC_SBH_06_reject_unauthenticated_access`, `test_AC_SBH_04_rejects_unauthenticated_activity_data_access`, `test_template_registry_rejects_unauthenticated_access` (ผ่าน) | ครบ |
| CON-NFR-21 | AC-SBH-06 | T-04 เสร็จ; T-05 ทำบางส่วน; T-11/T-15/T-17 ยังไม่เสร็จ | auth guard ของ API กิจกรรม/ข้อมูลชั่วโมง/template และ `AppRoutes` | tests unauthenticated ของ list/detail/participants/hour-types/template (ผ่าน) | ครบ |
| IF-TPL-01 | AC-SBH-04 | T-07 เสร็จ รอทีมตรวจ; T-08/T-10 พร้อมทำ | `TemplateRegistry.list_ready_templates`; `GET /config/templates`; ค่า mock `HOURS-SCI`/`1.0` ยังถูกใช้เป็นค่าเริ่มต้น | `test_template_registry_returns_only_configured_ready_templates` (ผ่านเมื่อ override session); ไม่มี test สร้างไฟล์จาก template หรือจัดการ/อัปโหลดผ่านหน้าแอดมิน | ช่องโหว่ |
| IF-PRJNUM-01 | AC-SBH-02 | T-03 เสร็จ; T-14/T-15/T-17 รอทีมกำหนด mapping (ไม่มี Q-ID) | `Activity.project_number_status` เป็นเพียง field; ไม่มี client/API เชื่อม UC-04 | ไม่มี test อ่าน/แปลสถานะ UC-04 | ยังไม่ถึง |
| IF-UC07-01 | AC-SBH-01 | T-03 เสร็จ; T-11 พร้อมทำ; T-17 รอ mapping UC-04 | mock เพิ่มเอกสารใน `activityHoursMock` ในหน่วยความจำ; ไม่มี API ส่งรายการเข้าคิวจริง | ไม่มี test เชื่อมรายการส่งเข้าคิว UC-07 | ช่องโหว่ |

สรุป: ครบ 3 | ยังไม่ถึง 2 | รอ 0 | ช่องโหว่ 7

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `backend/app/main.py`: router wiring | FR-SBH-01/02, IF-TPL-01 | ลงทะเบียน routes แต่ไม่ตั้ง `app.state.activity_session` หรือ `app.state.template_session` | ทดสอบ runtime โดยไม่ override แล้ว `GET /activities/hours-submission` และ `GET /config/templates` ตอบ 503; F-001, F-008 |
| `GET /activities/hours-submission`: `list_hours_submission_activities` | FR-SBH-01, CON-NFR-21 | Query กรองเฉพาะ status `"จบแล้ว"` และจำกัดบทบาทกรรมการ | runtime ยังไม่มี activity session; tests override dependency; F-001 |
| `GET /activities/{activity_id}/hours-submission`: `get_hours_submission_activity` | FR-SBH-01, FR-SBH-07, IF-PRJNUM-01 | ปฏิเสธกิจกรรมที่ไม่จบและคำนวณ deadline; ไม่ได้อ่านสถานะเลขจาก UC-04 | API ทำงานไม่ได้เมื่อไม่มี session; สถานะเลขยังรอ mapping |
| `GET /activities/{activity_id}/participants`: `get_activity_people` | FR-SBH-01/02, CON-NFR-21 | คืน participants และ Staff ของกิจกรรมที่จบแล้ว | test ตรวจ payload และการปฏิเสธกิจกรรมไม่จบ; runtime session ยังไม่ถูกตั้ง (F-001) |
| `GET /activities/{activity_id}/hour-types`: `get_activity_hour_types` | FR-SBH-02, ASM-05, CON-NFR-21 | คืนประเภทชั่วโมงที่ผูกระดับกิจกรรม ไม่แยกรายบุคคล | test ตรวจประเภทชั่วโมงที่เตรียมไว้; runtime session ยังไม่ถูกตั้ง (F-001) |
| `ActivityRepository.list_finished_activities`, `list_participants`, `list_staff`, `list_hour_types`; `HoursDataService.get_activity_data` | FR-SBH-01/02, ASM-05 | query/service ตรงกับข้อมูลที่ต้องดึงและผูกประเภทชั่วโมงระดับกิจกรรม | เป็นข้อมูลจากฐานข้อมูลทดสอบ; ไม่มี wiring แหล่งข้อมูลจริง |
| `GET /config/templates`: `list_ready_templates`; `TemplateRegistry.list_ready_templates` | FR-SBH-03, IF-TPL-01 | คืนเฉพาะ template ที่ active จาก config; ไม่มี API อัปโหลด/จัดการไฟล์ template | runtime ขาด template session จึงตอบ 503; test override dependency; F-008 |
| `SubmissionTemplateConfig` | IF-TPL-01, ASM-04 | เก็บ template ID/เวอร์ชันและสถานะพร้อมใช้ | ไม่เก็บไฟล์หรือ file reference ใน model; ยังไม่มีหน้าแอดมิน |
| `DeadlineCheckService.is_deadline_exceeded` | FR-SBH-07, ASM-03 | เปรียบเทียบเฉพาะ deadline ที่กำหนด; `None` ไม่ถือว่าเกิน | backend tests ตรวจวันก่อน/วันครบกำหนด/วันหลังและไม่มี deadline |
| `frontend/src/api/client.js`: `createHoursSubmissionClient` | FR-SBH-01, FR-SBH-07, CON-NFR-21 | ส่ง token สำหรับ GET รายการ/รายละเอียดกิจกรรม | client ไม่มีการโหลด participants/hour types, preview หรือ submit; หน้าใช้งานจริงยังไม่เรียก client นี้โดยปริยาย (F-001/F-002/F-003) |
| `frontend/src/pages/HoursSubmission.jsx`: `ActivitySelector`, `handleSubmitHours`, `HoursSubmission` | FR-SBH-01/03/04/05/06/07 | กรองกิจกรรมจบแล้ว, แสดง preview/checklist, ปิดปุ่มเมื่อเลขไม่พร้อม และลิงก์ UC-11 | preview เป็นข้อมูล mock; การ submit ต้องพึ่ง client ที่มี `submitHours` ซึ่ง API client จริงไม่มี; F-002/F-003 |
| `frontend/src/App.jsx`: `RoleHome`, `AppRoutes` | CON-NFR-21, FR-SBH-01/05 | Login ก่อนเข้าหน้าตามบทบาท แต่เลือก `hoursSubmissionMock` เป็น client ค่าเริ่มต้น | การใช้งานจริงแสดงข้อมูลจำลองและไม่เชื่อม API กิจกรรม; F-001 |
| `frontend/src/services/hoursSubmissionMock.js`: `getFinishedActivities`, `getSubmission`, `submitHours` | FR-SBH-01/03/04/05/06, IF-TPL-01 | จำลอง preview/สถานะ/การส่ง แต่ไม่สร้างไฟล์หรืออ่าน template config | ฝัง `HOURS-SCI`/`1.0` และส่งเข้า mock queue ในหน่วยความจำ; F-002/F-003/F-005 |
| `frontend/src/services/activityHoursMock.js`: `addSubmittedDocument` | FR-SBH-05, IF-UC07-01 | จำลองการเพิ่มรายการในคิว | ไม่ใช่คิว UC-07 จริง; การตรวจไฟล์หลังเข้าคิวอยู่ใน Out of scope ของ SPEC-SBH-002; F-003 |
| `POST /hours-submissions/preview`, `POST /hours-submissions/submit`, `GET /project-number/status/{activityId}`, `POST /review-queue/submit`; หน้า `TemplateAdmin` | FR-SBH-03/04/05/06, IF-TPL-01, IF-PRJNUM-01, IF-UC07-01 | ไม่พบ endpoint/หน้าเหล่านี้ใน source | งานที่เกี่ยวข้องใน tasks.md ยังพร้อมทำหรือรอ mapping; ขาดการสร้างไฟล์/ส่งเข้าคิวและการจัดการ template จริง |
| `frontend/src/pages/LateSubmissionPage.jsx` และลิงก์จาก `HoursSubmission` | FR-SBH-07 | เสนอทางไป UC-11 โดยไม่เปิด workflow ขอผ่อนผันใน UC-02 | สอดคล้องข้อกำหนดและ Out of scope |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-001 | โค้ดไม่มี FR | `backend/app/api/hours_submission.py:get_activity_session`, `backend/app/main.py`, `frontend/src/App.jsx` | FR-SBH-01/02, T-05 | ไม่มีการตั้ง `app.state.activity_session` ทำให้ API จริงตอบ 503; หน้า default ใช้ `hoursSubmissionMock` แทนแหล่งข้อมูลกิจกรรมจริง แม้ tests ผ่านเพราะ override dependency/ฉีด client | |
| F-002 | โค้ดไม่มี FR | `frontend/src/services/hoursSubmissionMock.js`, ไม่มี Excel generator/preview API; `backend/tests/test_AC_SBH_04_generate_excel_from_activity_data.py` | FR-SBH-03/04, AC-SBH-04, Q-02 | ไม่มีไฟล์ Excel จริงหรือ preview ที่สร้างจากไฟล์; test ชื่อ generate Excel แต่ตรวจเพียง roster/type; ไม่มี flow รับไฟล์ฉบับแก้ไขกลับเข้าระบบตาม Q-02 หน้าแสดงเพียง mock preview | |
| F-003 | โค้ดไม่มี FR | `hoursSubmissionMock.submitHours`, `activityHoursMock.addSubmittedDocument`; ไม่มี API UC-07 | FR-SBH-05, IF-UC07-01, Q-03 (ตอบแล้ว) | หลังกรรมการยืนยัน mock เพิ่มข้อมูลใน memory เท่านั้น ไม่มีการบันทึกรายการส่ง/ไฟล์หรือเชื่อมคิว UC-07 จริง | |
| F-005 | ละเมิด Constraint | `frontend/src/services/hoursSubmissionMock.js`: `template`; `HoursSubmission.jsx` | IF-TPL-01 | ค่า `HOURS-SCI`/เวอร์ชัน `1.0` ถูก hardcode ใน mock ค่าเริ่มต้นและแสดงในหน้า ไม่อ่านจาก config; registry ที่เพิ่มเข้ามายังไม่ถูกใช้โดยหน้า | |
| F-006 | test อ่อน | `frontend/src/__tests__/hours-submission-navigation.test.jsx`: `test_TC_SBH_03_1_mixed_activity_statuses`, `test_TC_SBH_03_2_status_boundary` | AC-SBH-03, TC-SBH-03-1/2 | ทั้งสอง test ระบุ Given ว่ามีกิจกรรมสถานะปะปน แต่สร้าง client ด้วยกิจกรรมจบแล้วเท่านั้น จึงไม่ทดสอบกรณีตาม Given แม้มี AC test แยกที่ตรวจการกรองจริง | |
| F-008 | ละเมิด Constraint | `backend/app/api/template_config.py:get_template_session`, `backend/app/main.py` | IF-TPL-01, T-07 | `main.py` ไม่ตั้ง `app.state.template_session`; เรียก `GET /config/templates` กับแอปจริงโดยไม่ override แล้วตอบ 503; test registry ผ่านเพราะ override session จึงไม่ตรวจ startup wiring | |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| F-004 | เพิ่มลิงก์จากหน้าส่งข้อมูลชั่วโมงไปหน้า UC-11 เมื่อ deadline เกินกำหนด; กำหนด `deadlineExceeded: false` ให้ mock ที่ไม่มี deadline และทำให้ `Activity.regular_submission_deadline` รับค่า `None` ตาม ASM-03 | Frontend tests ตรวจว่ามีลิงก์และนำทางไปหน้า UC-11 เมื่อเกินกำหนด และไม่แสดงลิงก์เมื่อไม่เกินกำหนด; backend `pytest -v` ผ่าน รวมกรณีไม่มี deadline ที่คืน `deadline_exceeded: false` |
| F-007 | ปรับ AC-SBH-01 ตามคำตอบทีม Q-02 ให้ระบุการตรวจความครบถ้วนและแนวทางเมื่อพบข้อมูลผิด; หน้าส่งแจ้งให้กลับไปแก้ไฟล์ต้นทางและไม่มีช่องแก้ข้อมูล | `test_FR_SBH_04_require_completeness_check_before_submit` ตรวจข้อความ/ไม่มี textbox, ปุ่มยืนยันปิดก่อนติ๊ก และเรียก submit หลังติ๊ก; frontend tests ผ่าน |
