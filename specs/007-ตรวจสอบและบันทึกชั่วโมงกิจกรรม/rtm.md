# RTM: ตรวจสอบและบันทึกชั่วโมงกิจกรรม
อ้างอิง: spec.md Draft v2 | tasks.md | test-cases.md ไม่มีแถวของ AC-HRS
สร้างด้วย /verify เมื่อ 2569-11-02 | test: 217 ผ่าน 0 ไม่ผ่าน (backend 147, frontend 70 ทั้งระบบ)

หมายเหตุการรัน: ใช้ `PYTHONPATH=. pytest -q backend/tests` เพราะ `cd backend && pytest` ใช้กับ package path นี้ไม่ได้
ไม่มี `specs/000-shared/` และไม่มี `mockups/`

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-HRS-01 | AC-HRS-03 | T-05, T-06, T-18, T-20 | `api/activity_hours.py`: `list_pending_activity_hour_documents`; `ActivityHoursQueue.jsx` | `test_AC_HRS_03_pending_documents_sorted_by_submitted_at` (ผ่าน) | ช่องโหว่ (F-001) |
| FR-HRS-02 | AC-HRS-04 | T-04, T-07, T-08 | `list_activity_hour_document_participants`; `importers/activity_hours_excel.py` | `test_AC_HRS_04_display_all_excel_participants_and_hour_types` (ผ่าน) | ช่องโหว่ (F-001, F-002) |
| FR-HRS-03 | AC-HRS-01, AC-HRS-02 | T-09, T-10, T-11 | `validate_activity_hour_document`; `hour_validation.py` | `test_AC_HRS_02_return_document_and_mark_invalid_items` (ผ่าน) | ช่องโหว่ (F-002) |
| FR-HRS-04 | AC-HRS-01 | T-12, T-13 | `approve_activity_hour_document`; `ActivityHoursReview.jsx`: `handleApprove` | `test_AC_HRS_01_approve_matching_hours` (ผ่าน) | ช่องโหว่ (F-001, F-002) |
| FR-HRS-05 | AC-HRS-05 | T-15 | `integrations/uc10_notification_client.py` | `test_AC_HRS_05_notify_club_after_reg_success` (ผ่าน) | ช่องโหว่ (F-001) |
| FR-HRS-06 | AC-HRS-02 | T-10, T-11 | `validate_activity_hour_document`: เปลี่ยนสถานะเป็น `ส่งคืน UC-02` | `test_AC_HRS_02_return_document_and_mark_invalid_items` (ผ่าน) | ช่องโหว่ (F-003) |
| FR-HRS-07 | AC-HRS-06 | T-14 | `services/reg_retry.py`; `config.py`: `REG_MAX_ATTEMPTS` | `test_AC_HRS_06_reg_timeout_retry_and_failure_alert` (ผ่าน) | ช่องโหว่ (F-004) |
| FR-HRS-08 | AC-HRS-07 | T-16 | `get_activity_hours_individual_summary`; `uc04_summary_client.py` | `test_AC_HRS_07_open_individual_summary_and_return` (ผ่าน) | ช่องโหว่ (F-001) |
| NFR-SEC-01 | AC-HRS-08 | T-02, T-24 | `backend/auth/activity_hours_guard.py`: `require_activity_hours_user` | `test_AC_HRS_08_unauthenticated_user_is_denied` (ผ่าน) | ครบ |
| NFR-SEC-02 | AC-HRS-09 | T-03, T-17, T-24 | `audit/activity_hours_access.py`, `audit/student_access_log.py` | `test_AC_HRS_09_*` 3 ตัว (ผ่าน) | ช่องโหว่ (F-001) |
| NFR-PERF-01 | AC-HRS-01, AC-HRS-06 | T-19 | `config.py`: `REG_TIMEOUT_SECONDS`; `integrations/reg_client.py` | `test_reg_performance_nfr_perf_01_success_within_configured_timeout` (ผ่าน) | ครบ |
| CON-NFR-21 | AC-HRS-08 | T-02, T-24 | เหมือน NFR-SEC-01 | เหมือน NFR-SEC-01 (ผ่าน) | ครบ |
| DOM-PDPA-01 | AC-HRS-09 | T-03, T-17, T-24 | เหมือน NFR-SEC-02 | เหมือน NFR-SEC-02 (ผ่าน) | ช่องโหว่ (F-001) |
| IF-REG-01 | AC-HRS-01, AC-HRS-06 | T-12, T-14 | `integrations/reg_client.py`: `RegClient` | `test_reg_client_contract.py` (ผ่าน) | ช่องโหว่ (F-001, F-004) |
| IF-XLS-01 | AC-HRS-04 | T-04, T-07 | `activity_hours_reader.py`: `get_activity_hours_excel_config` | `test_activity_hours_excel_reader.py` (ผ่าน) | ช่องโหว่ (F-002) |

สรุป: ครบ 3 | ยังไม่ถึง 0 | รอ 0 | ช่องโหว่ 12

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `GET /activity-hours/documents/pending` | FR-HRS-01 | ตรง แต่ตอบ 503 ในเซิร์ฟเวอร์จริง | F-001 |
| `GET .../participants` | FR-HRS-02, IF-XLS-01 | อ่านจาก Excel แต่ตรวจเกณฑ์จากตาราง | F-002 |
| `POST .../validate` | FR-HRS-03, FR-HRS-06 | เปลี่ยนสถานะเอกสารตั้งแต่เปิดหน้า | F-003 |
| `POST .../approve` | FR-HRS-04 | ตรง แต่ส่งซ้ำได้ไม่จำกัด | F-004 |
| `POST .../reg-retry` | FR-HRS-07 | ตรงในกรณีปกติ | F-004 |
| `GET .../individual-summary` | FR-HRS-08 | ตรง แต่ไม่มี provider ในเซิร์ฟเวอร์จริง | F-001 |
| `App.jsx`: `sessionActivityHoursClient` | FR-HRS-01 | ใช้ `activityHoursMock` เสมอ ไม่เรียก `createActivityHoursClient` | F-001 |
| `get_activity_hours_excel_config` | IF-XLS-01 | ชื่อชีตและหัวคอลัมน์เป็นค่า `__PLACEHOLDER_...` | F-002 |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-001 | ละเมิด Constraint | `App.jsx`: `activityHoursMock`, `main.py` | DOM-PDPA-01, NFR-SEC-02, IF-REG-01, T-20 | ลองเรียกจริงด้วย Token กองกิจแล้วคิวตอบ 503 เพราะไม่มีการตั้ง `activity_session`, `reg_timeout_transport`, `activity_hours_upload_directory`, `uc04_summary_provider` หน้าเว็บทั้งหมดจึงทำงานบน mock ดังนั้นการเปิดดูข้อมูลนักศึกษาบนเว็บจริงไม่มี log เลย และไม่มีการส่ง REG แม้ T-20 จะเขียนว่า "เสร็จ" test ผ่านเพราะ override dependency ทุกตัว | |
| F-002 | test อ่อน | `api/activity_hours.py`: `participants`, `validate`, `approve`; `activity_hours_reader.py`: placeholder | FR-HRS-02, FR-HRS-03, FR-HRS-04, IF-XLS-01 | หน้าจออ่านรายชื่อจาก Excel แต่ตรวจเกณฑ์และส่ง REG จากตาราง โดยไม่มีโค้ดนำแถวจาก Excel ลงตาราง ทดลองแล้วเอกสารที่ไม่มีแถวในตาราง `validate` ตอบว่าไม่มีรายการผิด และ `approve` ส่ง REG ด้วยรายการ 0 รายการ ไม่มี test กรณีนี้ นอกจากนี้ schema Excel ยังเป็น placeholder ควรถามเจ้าของไฟล์ | |
| F-003 | ตัวเลขไม่ตรง spec | `ActivityHoursReview.jsx`: `getDocumentValidationResult`, `validate_activity_hour_document` | FR-HRS-06, AC-HRS-02 | AC ระบุว่าคืนเอกสารเมื่อ "เจ้าหน้าที่พยายามยืนยันอนุมัติ" แต่หน้าเรียก `validate` ทันทีเมื่อเปิดเอกสาร API จะเปลี่ยนสถานะเป็นส่งคืนโดยที่เจ้าหน้าที่ยังไม่กดอะไร ส่วน `approve` ตอบ 409 เฉย ๆ ไม่คืนเอกสาร ควรให้ตรวจแบบอ่านอย่างเดียวตอนเปิด และคืนเมื่อกดยืนยัน หรือแก้ AC | |
| F-004 | test อ่อน | `activity_hours_approval.py`: `approve_activity_hour_document` | FR-HRS-07, Q-03 | ทดลองแล้วเรียก `approve` ซ้ำหลังล้มเหลวได้เรื่อย ๆ ได้ 3 รอบส่ง REG 6 ครั้ง เพราะเอกสารยังเป็น "รอตรวจสอบ" และทุกครั้งสร้างคำขอใหม่ นับจำนวนใหม่ จึงเลี่ยงกติกาส่งซ้ำได้ 1 ครั้ง หน้าเว็บทำได้โดยรีเฟรช test ตรวจแค่ `reg-retry` ควรตรวจคำขอที่ล้มเหลวก่อนใน `approve` | |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| ไม่มี | rtm.md ของฟีเจอร์นี้สร้างครั้งแรก | |

## 5. คำตอบที่เสนอสำหรับ Open Questions (รอทีมยืนยัน ยังไม่ใช่คำตอบทีม)
ฟีเจอร์นี้ไม่มีคำถามที่ยังเปิด Q-01, Q-02, Q-03, Q-05, Q-06 ปิดแล้ว และ spec ไม่มี Q-04

ข้อมูลประกอบ:
- ผังกองกิจให้บันทึกชั่วโมงหลังรองอธิการบดีอนุมัติสรุปโครงการ และปลายทางคือ reg.su.ac.th ตรงกับที่ spec ระบุว่าส่งเข้า REG
- ฟอร์มที่เกี่ยวข้องคือ กศ.012, กศ.013, กศ.013.1 และไฟล์ Excel คือ "แบบบันทึกรหัสนักศึกษาผู้เข้าร่วมโครงการ" ใช้แทนค่า placeholder ใน F-002 ได้เมื่อได้ไฟล์จริง

แหล่งอ้างอิง:
- [เอกสารกิจกรรมนักศึกษา กองกิจ ม.ศิลปากร](https://dsa.su.ac.th/ksu/?page_id=306)
- [ผังขั้นตอนการขออนุมัติโครงการและชั่วโมงกิจกรรม](https://drive.google.com/file/d/1aVeGJRqKh0b7_z4vAuG7PpghfxCIe7Nk/view?usp=drive_link)
- [แนวทางการตรวจโครงการนักศึกษา (2565)](https://dsa.su.ac.th/ksu/wp-content/uploads/2022/03/%e0%b9%81%e0%b8%99%e0%b8%a7%e0%b8%97%e0%b8%b2%e0%b8%87%e0%b8%81%e0%b8%b2%e0%b8%a3%e0%b8%95%e0%b8%a3%e0%b8%a7%e0%b8%88%e0%b9%82%e0%b8%84%e0%b8%a3%e0%b8%87%e0%b8%81%e0%b8%b2%e0%b8%a3%e0%b8%99%e0%b8%b1%e0%b8%81%e0%b8%a8%e0%b8%b6%e0%b8%81%e0%b8%a9%e0%b8%b2.pdf)
