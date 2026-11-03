# RTM: ส่งข้อมูลชั่วโมง
อ้างอิง: spec.md Draft v2 | tasks.md | test-cases.md ไม่มีแถวของ AC-SBH
สร้างด้วย /verify เมื่อ 2569-11-02 | test: 217 ผ่าน 0 ไม่ผ่าน (backend 147, frontend 70 ทั้งระบบ)

หมายเหตุการรัน: ใช้ `PYTHONPATH=. pytest -q backend/tests` เพราะ `cd backend && pytest` ใช้กับ package path นี้ไม่ได้
ไม่มี `specs/000-shared/` และไม่มี `mockups/`

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-SBH-01 | AC-SBH-03 | T-01, T-02, T-04, T-05 เสร็จ | `api/hours_submission.py`: `list_hours_submission_activities`, `get_hours_submission_activity`; `HoursSubmission.jsx`: `ActivitySelector` | `test_AC_SBH_03_only_finished_activity_allowed`, `AC-SBH-03 only finished activities are loaded...` (ผ่าน) | ช่องโหว่ (F-001) |
| FR-SBH-02 | AC-SBH-04 | T-06 เสร็จ | `api/activity_data.py`: `get_activity_people`, `get_activity_hour_types`; `services/hours_data.py` | `test_AC_SBH_04_generate_excel_from_activity_data`, `test_hours_data_service_returns_activity_people_and_all_hour_types` (ผ่าน) | ช่องโหว่ (F-001) |
| FR-SBH-03 | AC-SBH-04 | T-07, T-08 พร้อมทำ | ไม่มีโค้ดสร้าง Excel; หน้าจอแสดงตารางจาก `hoursSubmissionMock.js` | ไม่มี test สร้างไฟล์ | ช่องโหว่ (F-002) |
| FR-SBH-04 | AC-SBH-01 | T-09 พร้อมทำ | `HoursSubmission.jsx`: ช่องติ๊กตรวจความครบถ้วน | ไม่มี | ยังไม่ถึง |
| FR-SBH-05 | AC-SBH-01 | T-11 พร้อมทำ, T-17 รอ Q-03 | `hoursSubmissionMock.js`: `submitHours`; ไม่มี API ส่งจริง | ไม่มี | ช่องโหว่ (F-003) |
| FR-SBH-06 | AC-SBH-02 | T-14 รอคำตอบทีม, T-15 รอคำตอบทีม | `HoursSubmission.jsx`: กล่อง "ขอเลขสรุปจากกองกิจ" จากข้อมูล mock | ไม่มี | รอ mapping สถานะ UC-04 (ยังไม่มี Q-ID) |
| FR-SBH-07 | AC-SBH-05 | T-12, T-13 เสร็จ | `services/deadline_check.py`; `HoursSubmission.jsx`: กล่องกำหนดส่งผ่านแล้ว | `test_AC_SBH_05_show_exception_link_when_deadline_exceeded` หลังบ้านและหน้าจอ (ผ่าน) | ช่องโหว่ (F-004) |
| NFR-SEC-01 | AC-SBH-06 | T-04, T-05 เสร็จ | `middleware/auth.py`: `require_roles` | `test_AC_SBH_06_reject_unauthenticated_access`, `test_AC_SBH_04_rejects_unauthenticated_activity_data_access` (ผ่าน) | ครบ |
| CON-NFR-21 | AC-SBH-06 | T-04, T-05 เสร็จ | เหมือน NFR-SEC-01 | เหมือน NFR-SEC-01 (ผ่าน) | ครบ |
| IF-TPL-01 | AC-SBH-04 | T-07, T-10 พร้อมทำ | ค่าคงที่ `HOURS-SCI` ใน `hoursSubmissionMock.js` | ไม่มี | ช่องโหว่ (F-005) |
| IF-PRJNUM-01 | AC-SBH-02 | T-14, T-15 รอคำตอบทีม | `Activity.project_number_status` แสดงเฉย ๆ | ไม่มี | รอ mapping สถานะ UC-04 (ยังไม่มี Q-ID) |
| IF-UC07-01 | AC-SBH-01 | T-11 พร้อมทำ, T-17 รอ Q-03 | `activityHoursMock.addSubmittedDocument` ในเบราว์เซอร์ | ไม่มี | ช่องโหว่ (F-003) |

สรุป: ครบ 2 | ยังไม่ถึง 1 | รอ 2 | ช่องโหว่ 7

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `GET /activities/hours-submission` | FR-SBH-01 | ตรง แต่ตอบ 503 ในเซิร์ฟเวอร์จริง | F-001 |
| `GET /activities/{id}/hours-submission` | FR-SBH-01, FR-SBH-07 | ตรง แต่ตอบ 503 ในเซิร์ฟเวอร์จริง | F-001 |
| `GET /activities/{id}/participants`, `/hour-types` | FR-SBH-02 | ตรง แต่ตอบ 503 ในเซิร์ฟเวอร์จริง | F-001 |
| `App.jsx`: `sessionHoursSubmissionClient` | FR-SBH-01 | ใช้ mock เสมอ ไม่เรียก `createHoursSubmissionClient` | F-001 |
| `hoursSubmissionMock.js`: `submitHours` | FR-SBH-05, IF-UC07-01 | ทำงานแทน T-11 และ T-17 ที่ยังไม่เสร็จ | F-003 |
| `api/client.js`: `createHoursSubmissionClient` | FR-SBH-01, FR-SBH-07 | ใช้เฉพาะใน test | F-001 |
| `pages/LateSubmissionPage.jsx`, `api/late_submissions.py` | UC-11 | อยู่ใน Out of scope ของ UC-02 และไม่ได้ต่อเข้า `App.jsx` หรือ `main.py` | F-004 |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-001 | โค้ดไม่มี FR | `main.py`, `App.jsx`: `hoursSubmissionMock` | FR-SBH-01, FR-SBH-02, T-05 | ลองเรียกจริงด้วย Token กรรมการแล้ว API ของฟีเจอร์นี้ตอบ 503 "ยังไม่มีแหล่งข้อมูลกิจกรรม" เพราะไม่มีใครตั้ง `app.state.activity_session` test ผ่านเพราะ override dependency และ T-05 บอกว่า "เสร็จ" แต่หน้าจริงใช้ mock วิธีแก้: ตั้งแหล่งข้อมูลตอนเริ่มระบบแล้วส่ง `createHoursSubmissionClient(session)` เข้าหน้า | |
| F-002 | อ้าง ID ผิดเรื่อง | `test_AC_SBH_04_generate_excel_from_activity_data` | AC-SBH-04 | ชื่อบอกว่าสร้าง Excel แต่ assert แค่รายชื่อและประเภทชั่วโมง ไม่มีไฟล์ ไม่มี template ส่วนหน้าจอเขียน "Preview ไฟล์ Excel" ทั้งที่ไม่มีไฟล์จริง T-08 ยังไม่ทำ | |
| F-003 | เดา Q-03 | `hoursSubmissionMock.js`: `submitHours` | Q-03, Q-02 ยังเปิด | ส่งเข้าคิว UC-07 ทันทีหลังยืนยัน ทั้งที่ Q-03 ยังเปิดและ T-11, T-17 ยังไม่ทำ ข้อมูลอยู่ในเบราว์เซอร์เท่านั้น | |
| F-004 | test อ่อน | `HoursSubmission.jsx`: กล่องกำหนดส่ง, `hours-submission.test.jsx` | FR-SBH-07, AC-SBH-05 | ชื่อ test บอกว่ามีลิงก์ แต่หน้าจอมีแค่ข้อความ ไม่มีปุ่มหรือลิงก์ไป UC-11 และ mock ไม่มีค่า `deadlineExceeded` กล่องนี้จึงไม่ขึ้นในการใช้งานจริง | |
| F-005 | ละเมิด Constraint | `hoursSubmissionMock.js`: `template` | IF-TPL-01 | ค่า template `HOURS-SCI` เวอร์ชัน `1.0` ถูกเขียนในโค้ดและแสดงบนหน้าจอ ขัดกับข้อความ "ไม่ hardcode template ในโค้ด" แม้เป็น mock | |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| ไม่มี | rtm.md ของฟีเจอร์นี้สร้างครั้งแรก | |

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
