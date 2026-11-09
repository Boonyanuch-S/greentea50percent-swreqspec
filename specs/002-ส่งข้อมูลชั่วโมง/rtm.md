# RTM: ส่งข้อมูลชั่วโมง
อ้างอิง: spec.md Draft v2 | tasks.md | test-cases.md
สร้างด้วย /verify เมื่อ 2569-11-09 16:40 | test: 237 ผ่าน 0 ไม่ผ่าน (backend 155, frontend 82)

หมายเหตุการรัน: รอบแรก `cd backend && pytest -v` เริ่มไม่ได้เพราะ environment ไม่มี SQLAlchemy; ติดตั้ง dependencies จาก `backend/requirements.txt` แล้วรันซ้ำผ่าน
ไม่มี `specs/000-shared/` และไม่มี `mockups/`

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-SBH-01 | AC-SBH-03 | T-01, T-02, T-04 เสร็จ; T-05 ทำบางส่วน | `api/hours_submission.py`: `list_hours_submission_activities`, `get_hours_submission_activity`; `HoursSubmission.jsx`: `ActivitySelector` | `test_AC_SBH_03_only_finished_activity_allowed` (ผ่าน); `test_TC_SBH_03_1_*` ถึง `test_TC_SBH_03_4_*` (ผ่านแต่ F-006) | ช่องโหว่ (F-001, F-006) |
| FR-SBH-02 | AC-SBH-04 | T-06 เสร็จ; T-08/T-09 พร้อมทำ | `api/activity_data.py`: `get_activity_people`, `get_activity_hour_types`; `services/hours_data.py` | `test_AC_SBH_04_generate_excel_from_activity_data`, `test_hours_data_service_returns_activity_people_and_all_hour_types` (ผ่าน; ข้อมูลถูกตรวจ แต่ Excel ไม่ได้สร้าง: F-002) | ช่องโหว่ (F-001, F-002) |
| FR-SBH-03 | AC-SBH-04 | T-07/T-08/T-09/T-10 พร้อมทำ | ไม่มี generator หรือ template registry; mock สร้างเฉพาะ preview object | ไม่มี test สร้าง/ตรวจไฟล์ Excel หรือ template | ช่องโหว่ (F-002, F-005) |
| FR-SBH-04 | AC-SBH-01 (ไม่ได้ตรวจการให้ตรวจความครบถ้วน) | T-09 พร้อมทำ; T-16 รอ Q-02 | `HoursSubmission.jsx`: checkbox และปุ่มยืนยัน (ใช้ preview mock) | ไม่มี test ยืนยันว่ากรรมการตรวจความครบถ้วนของไฟล์ได้ | ช่องโหว่ (F-007) |
| FR-SBH-05 | AC-SBH-01 | T-03 เสร็จ; T-11 พร้อมทำ; T-17 รอ Q-03 และ mapping | มีแต่ `hoursSubmissionMock.submitHours`; ไม่มี API ส่งไฟล์/คิวจาก UC-02 | ไม่มี test ของ AC-SBH-01 | ช่องโหว่ (F-003) |
| FR-SBH-06 | AC-SBH-02 | T-03 เสร็จ; T-14/T-15 รอ mapping จาก UC-04 (ยังไม่มี Q-ID) | mock แสดงสถานะและปิดปุ่มเมื่อไม่มี `projectNumber`; ไม่มีการอ่านสถานะจาก UC-04 จริง | ไม่มี test ของ AC-SBH-02 | รอ mapping (ยังไม่มี Q-ID) |
| FR-SBH-07 | AC-SBH-05 | T-12 เสร็จ; T-13 ทำบางส่วน | `DeadlineCheckService.is_deadline_exceeded`; `HoursSubmission.jsx` แสดงข้อความเตือน แต่ไม่มีทางเลือก/ลิงก์ไป UC-11 | `test_AC_SBH_05_show_exception_link_when_deadline_exceeded` ฝั่ง backend และ Vitest (ผ่าน แต่ assert แค่ข้อความ: F-004) | ช่องโหว่ (F-004) |
| NFR-SEC-01 | AC-SBH-06 | T-04 เสร็จ; T-05 ทำบางส่วน | `middleware/auth.py`: `require_roles`, `require_authenticated_context`; App บังคับหน้า Login | `test_AC_SBH_06_reject_unauthenticated_access`, `test_AC_SBH_04_rejects_unauthenticated_activity_data_access` (ผ่าน) | ครบ |
| CON-NFR-21 | AC-SBH-06 | T-04 เสร็จ; T-05 ทำบางส่วน | guard สำหรับ API กิจกรรม/ข้อมูลชั่วโมง และหน้า Login | test unauthenticated API ทั้ง list/detail/participants/hour-types (ผ่าน) | ครบ |
| IF-TPL-01 | AC-SBH-04 | T-07/T-08/T-10 พร้อมทำ | mock ฝัง `HOURS-SCI` / `1.0`; ไม่มี registry/config/admin สำหรับ template | ไม่มี test config/template หรือไฟล์ Excel | ช่องโหว่ (F-005) |
| IF-PRJNUM-01 | AC-SBH-02 | T-03 เสร็จ; T-14/T-15/T-17 รอ mapping สถานะ UC-04 | field `Activity.project_number_status` ถูกส่งกลับ แต่ไม่มี client/API เชื่อม UC-04 | ไม่มี test การอ่าน/แปลสถานะ UC-04 | รอ mapping (ยังไม่มี Q-ID) |
| IF-UC07-01 | AC-SBH-01 | T-03 เสร็จ; T-11 พร้อมทำ; T-17 รอ Q-03 | mock เพิ่มเอกสารเข้า `activityHoursMock` ในหน่วยความจำ; ไม่มีการส่งเข้าคิวจริง | ไม่มี test เชื่อมรายการส่งเข้าคิว UC-07 | ช่องโหว่ (F-003) |

สรุป: ครบ 2 | ยังไม่ถึง 0 | รอ 2 | ช่องโหว่ 8

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
| `HoursSubmission.jsx`: `ActivitySelector`, `HoursSubmission` | FR-SBH-01/03/04/06/07 | UI ใช้ dropdown, preview mock, checkbox, status text; ไม่มีไฟล์ Excel จริง และไม่มี link/ปุ่ม UC-11 | F-002, F-004, F-005, F-007 |
| `api/client.js`: `createHoursSubmissionClient` | FR-SBH-01, FR-SBH-07, CON-NFR-21 | เรียก authenticated GET สำหรับ list/detail ได้ | App ไม่ได้สร้าง client นี้เป็นค่าเริ่มต้น; F-001 |
| `App.jsx`: `sessionHoursSubmissionClient` | FR-SBH-01 | ค่าเริ่มต้นเป็น `hoursSubmissionMock`, ไม่ได้เชื่อม API client จริง | F-001 |
| `hoursSubmissionMock.getFinishedActivities`, `getSubmission` | FR-SBH-01/03/04/06 | ใช้ข้อมูล/preview ตัวอย่างที่ฝังใน source | ผู้ใช้เห็นข้อมูลจำลองแทนข้อมูลกิจกรรมจริง; F-001, F-002 |
| `hoursSubmissionMock.submitHours` / `activityHoursMock.addSubmittedDocument` | FR-SBH-05, IF-UC07-01 | จำลองการส่งเข้าคิวทันที ทั้งที่ Q-03 ยังเปิด และเพียงเพิ่มข้อมูลใน memory | F-003 |
| `POST /hours-submissions/preview`, `GET /config/templates`, `POST /hours-submissions/submit`, `GET /project-number/status/{activityId}`, `POST /review-queue/submit` | FR-SBH-03/05, FR-SBH-06, IF-TPL-01, IF-PRJNUM-01, IF-UC07-01 | ไม่มี endpoint เหล่านี้ใน app wiring; เส้น `/review-queue` ที่มีเป็น GET ของ UC-01/คิวเอกสาร ไม่ใช่การส่ง UC-02 เข้า UC-07 | T-07 ถึง T-11/T-14/T-17 ยังไม่เสร็จ; F-002, F-003, F-005 |
| `LateSubmissionPage.jsx` / `late_submissions.py` | UC-11 | flow ขอผ่อนผันเป็น Out of scope ของ UC-02; หน้า/endpoint แยกและไม่ได้ต่อจากหน้าส่งชั่วโมง | AC-SBH-05 ต้องเสนอทางเลือก/ลิงก์เท่านั้น; ปัจจุบันไม่มีทางเลือกจากหน้าส่งชั่วโมง (F-004) |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-001 | โค้ดไม่มี FR | `backend/app/api/hours_submission.py:get_activity_session`, `backend/app/main.py`, `frontend/src/App.jsx` | FR-SBH-01, FR-SBH-02, T-05 | API จริงไม่มี `app.state.activity_session` จึงตอบ 503; หน้ากรรมการใช้ `hoursSubmissionMock` เป็นค่าเริ่มต้น แม้มี authenticated client และ tests ผ่านเพราะ override dependency/ฉีด client เอง จึงยังไม่มี flow ใช้ข้อมูลกิจกรรมจริงตาม T-05 | |
| F-002 | อ้าง ID ผิดเรื่อง | `test_AC_SBH_04_generate_excel_from_activity_data`, `hoursSubmissionMock.js`, ไม่มี generator/registry | FR-SBH-03, AC-SBH-04, IF-TPL-01 | test ชื่อสร้าง Excel แต่ตรวจแค่ participant/Staff/hour type; ไม่มีการสร้างไฟล์หรือใช้ template config ส่วนหน้าจอแสดง preview object จาก mock เสมือนเป็นไฟล์จริง และ endpoint preview/template registry ยังไม่มี | |
| F-003 | เดา Q-03 | `hoursSubmissionMock.js:submitHours`, `activityHoursMock.addSubmittedDocument` | Q-03, FR-SBH-05, IF-UC07-01 | หน้าจอจำลองยืนยันส่งแล้วเพิ่มรายการเข้า UC-07 ใน memory ทันที ทั้งที่ Q-03 ยังเปิดและ T-11/T-17 ยังไม่ทำ; ไม่มี API/การบันทึกรายการส่งจริง | |
| F-005 | ละเมิด Constraint | `frontend/src/services/hoursSubmissionMock.js`: `template` | IF-TPL-01 | ค่า `HOURS-SCI` / version `1.0` hardcode ใน mock และถูกแสดงบนหน้าจอ ขัดกับข้อกำหนดอ่าน template ID/เวอร์ชันจาก config และไม่ hardcode แม้เป็น mock ที่ถูกใช้เป็นค่าเริ่มต้นของ App | |
| F-006 | test อ่อน | `frontend/src/__tests__/hours-submission-navigation.test.jsx:96-125` | AC-SBH-03, TC-SBH-03-1, TC-SBH-03-2 | test ทั้งสองสร้างตัวแปรกิจกรรมยังไม่จบ แต่ส่งให้ client เฉพาะ `[finished]`; Given ที่มีสถานะปะปนจึงไม่เกิดจริงและ assertions ซ้ำกัน จึงไม่พิสูจน์พฤติกรรมหน้าจอเมื่อได้รับข้อมูลปะปน (แม้ backend test เดิมจะตรวจการกรอง API ได้) | |
| F-007 | FR ไม่มี AC | `spec.md:FR-SBH-04 / AC-SBH-01`, `HoursSubmission.jsx` | FR-SBH-04 | Traceability ผูก FR-SBH-04 กับ AC-SBH-01 แต่ AC-01 ระบุเพียงว่ากรรมการตรวจไฟล์เรียบร้อยแล้วใน Given และ Then ไม่ตรวจว่าระบบให้ตรวจความครบถ้วนก่อนยืนยันได้; ไม่มี test ยืนยัน checkbox/การบล็อกยืนยันจนตรวจ และ T-09 ยังพร้อมทำ | |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| F-004 | เพิ่มลิงก์จากหน้าส่งข้อมูลชั่วโมงไปหน้า UC-11 เมื่อ deadline เกินกำหนด; กำหนด `deadlineExceeded: false` ให้ mock ที่ไม่มี deadline และทำให้ `Activity.regular_submission_deadline` รับค่า `None` ตาม ASM-03 | Frontend tests ตรวจว่ามีลิงก์และนำทางไปหน้า UC-11 เมื่อเกินกำหนด และไม่แสดงลิงก์เมื่อไม่เกินกำหนด; backend `pytest -v` ผ่าน 155 tests รวมกรณีไม่มี deadline ที่คืน `deadline_exceeded: false` |

## 5. คำตอบที่เสนอสำหรับ Open Questions (รอทีมยืนยัน ยังไม่ใช่คำตอบทีม)
| Q | คำตอบที่เสนอ | หลักฐาน | ความมั่นใจ |
|---|---|---|---|
| Q-01 | ยังไม่ต้องเพิ่มมาตรการในโปรโตไทป์ บล็อกหน้าจอตาม FR-SBH-06 ก็พอ ไม่พบเอกสารของกองกิจที่กำหนดการแจ้งเตือนเพื่อเร่งเลข | ผังกองกิจกำหนดแต่ละขั้น 3-5 วันทำการ | กลาง: เป็นการไม่พบข้อกำหนด |
| Q-02 | ควรแก้ที่ไฟล์ต้นทางแล้วส่งใหม่ ไม่ควรแก้ในหน้าส่ง แนวทางกองกิจให้ผู้รับผิดชอบรวบรวมไฟล์เอง และติดต่อกลับเพื่อแก้ข้อมูลที่ไม่สมบูรณ์ | แนวทางการตรวจโครงการ | กลาง |
| Q-03 | เอกสารจริงมีขั้นคั่นก่อนบันทึก: สรุปโครงการต้องได้รับอนุมัติก่อน กองกิจจึงบันทึกชั่วโมงให้ แต่ขั้นนั้นเกิดนอกระบบ จึงเสนอให้ส่งเข้าคิว UC-07 ทันทีหลังยืนยัน | แนวทางการตรวจโครงการ, ผังขั้นตอน | สูงสำหรับลำดับงาน, ทีมต้องตัดสินว่าจะจำลองขั้นนี้ไหม |

ประเด็นที่ควรเสนอเป็นคำถามใหม่ (ยังไม่สร้าง ID):
- ASM-03 เขียนว่าไม่มีกำหนดส่งคงที่ แต่ผังกองกิจทุกแบบระบุว่าส่งสรุปโครงการ "หลังเสร็จสิ้นโครงการไม่เกิน 15 วัน" และ กศ.011 มีช่องจำนวนวันหลังสิ้นสุดโครงการ
- เอกสารจริงเรียก "รหัสโครงการ" ซึ่งสร้างตั้งแต่เขียนโครงการ และไม่พบคำว่า "เลขสรุปโครงการ" ต้องถามว่าเงื่อนไขจริงคือสรุปโครงการอนุมัติแล้วใช่ไหม
- spec ใช้ประเภทชั่วโมง "จิตอาสา/กศ." แต่แนวทางกองกิจเรียก "ชั่วโมงกิจกรรมนักศึกษา" และ "ชั่วโมงจิตอาสา" ส่วน "กศ." เป็นรหัสแบบฟอร์ม

แหล่งอ้างอิง:
- [เอกสารกิจกรรมนักศึกษา กองกิจ ม.ศิลปากร](https://dsa.su.ac.th/ksu/?page_id=306)
- [ผังขั้นตอนการขออนุมัติโครงการและชั่วโมงกิจกรรม](https://drive.google.com/file/d/1aVeGJRqKh0b7_z4vAuG7PpghfxCIe7Nk/view?usp=drive_link)
- [แนวทางการตรวจโครงการนักศึกษา (2565)](https://dsa.su.ac.th/ksu/wp-content/uploads/2022/03/%e0%b9%81%e0%b8%99%e0%b8%a7%e0%b8%97%e0%b8%b2%e0%b8%87%e0%b8%81%e0%b8%b2%e0%b8%a3%e0%b8%95%e0%b8%a3%e0%b8%a7%e0%b8%88%e0%b9%82%e0%b8%84%e0%b8%a3%e0%b8%87%e0%b8%81%e0%b8%b2%e0%b8%a3%e0%b8%99%e0%b8%b1%e0%b8%81%e0%b8%a8%e0%b8%b6%e0%b8%81%e0%b8%a9%e0%b8%b2.pdf)
- [กศ.011 แบบขออนุมัติสรุปผลการดำเนินโครงการ](https://dsa.su.ac.th/ksu/wp-content/uploads/2025/03/%E0%B8%81%E0%B8%A8.011.pdf)
