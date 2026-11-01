# แผนการพัฒนา: ตรวจสอบและบันทึกชั่วโมงกิจกรรม

## 1. สรุปแนวทาง

1. ฟีเจอร์นี้ให้เจ้าหน้าที่กองการนักศึกษาดูคิวและตรวจสอบใบสรุปชั่วโมงกิจกรรมตาม FR-HRS-01 ถึง FR-HRS-03
2. ระบบจะอ่านไฟล์ Excel แสดงผู้เข้าร่วมและประเภทชั่วโมง พร้อมทำเครื่องหมายรายการที่ไม่ตรงเกณฑ์ตาม FR-HRS-02, FR-HRS-06 และ ASM-03
3. เมื่อข้อมูลผ่านการตรวจสอบ ระบบจะส่งชั่วโมงไป REG เปลี่ยนสถานะเอกสาร และเรียก UC-10 ตาม FR-HRS-04 และ FR-HRS-05
4. การเข้าถึงคิวและข้อมูลนักศึกษาจะผ่าน Login และบันทึก audit log ตาม CON-NFR-21, DOM-PDPA-01, NFR-SEC-01 และ NFR-SEC-02
5. ส่ง REG ด้วย timeout 5 วินาที และให้เจ้าหน้าที่ส่งซ้ำด้วยตนเองได้ 1 ครั้งโดยไม่มี auto-retry; ใช้ตารางเกณฑ์เดิมที่กองการนักศึกษาดูแลตามคำตอบ Q-03/Q-05

## 2. เทคโนโลยีที่ใช้

| สิ่งที่เลือก | มาจาก | หมายเหตุ |
|---|---|---|
| React (Vite) สำหรับหน้าบ้าน | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สร้างหน้าคิว หน้าตรวจสอบ และการแสดงรายการที่ผิดตาม FR-HRS-01 ถึง FR-HRS-03 และ FR-HRS-06 |
| Python FastAPI สำหรับหลังบ้าน | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้จัดการ API อ่านเอกสาร ตรวจเกณฑ์ บันทึกสถานะ และส่งข้อมูลตาม FR-HRS-01 ถึง FR-HRS-07 |
| ฐานข้อมูลเชิงสัมพันธ์ | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้เก็บข้อมูลเอกสาร รายการชั่วโมง สถานะ ผลการส่ง และ audit log ตาม FR-HRS-04, DOM-PDPA-01 |
| ตัวอ่านไฟล์ Excel | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้อ่านข้อมูลตามโครงสร้างที่ได้รับจาก UC-02 ตาม IF-XLS-01; spec ยังไม่กำหนดพฤติกรรมเพิ่มเติมสำหรับไฟล์ผิดรูปแบบ |
| Client สำหรับเชื่อมต่อ REG | IF-REG-01, Q-03 | ส่งข้อมูลและรอ success response ไม่เกิน 5 วินาที; หากหมดเวลาให้เจ้าหน้าที่ส่งซ้ำด้วยตนเองได้ 1 ครั้ง ไม่มี auto-retry |
| การเรียก UC-04 และ UC-10 | FR-HRS-05, FR-HRS-08 | ใช้เป็นจุดเชื่อมต่อกับ use case อื่น โดยไม่สร้างเนื้อหาภายใน UC-04 หรือ UC-10 ตาม Out of scope |

คำสั่งเปิดระบบสำหรับจุดตรวจ (อิงโครงสร้าง repository; ทีมเลือกเอง ไม่ได้มาจาก spec):
- หลังบ้าน: `cd backend && PYTHONPATH=. uvicorn app.main:app --reload`
- หน้าจอ: `cd frontend && npm run dev`
- test หลังบ้านจาก root: `PYTHONPATH=. pytest -q backend/tests`
- test หน้าจอ: `cd frontend && npm test`

## 3. โมเดลข้อมูล

| Entity | ฟิลด์หลัก | รองรับ |
|---|---|---|
| Activity (ข้อมูลกิจกรรมเดิม) | activity_id, academic_year | ASM-01, FR-HRS-03 |
| ActivityHourDocument | document_id, activity_id, source_file_reference, submitted_at, status, returned_at | FR-HRS-01, FR-HRS-04, FR-HRS-06 |
| ActivityParticipantHour | item_id, document_id, student_reference, participant_name, reported_hour_type, reported_hours, validation_status, validation_message | FR-HRS-02, FR-HRS-03, FR-HRS-06, FR-HRS-08 |
| HourCriteria | criteria_id, academic_year, hour_type, criteria_definition, active_status | FR-HRS-03, ASM-01, ASM-02 |
| RegSubmission | submission_id, document_id, submitted_at, response_status, error_message, last_attempt_at, attempt_count | FR-HRS-04, FR-HRS-07, IF-REG-01, Q-03 |
| StudentAccessLog | log_id, accessor_id, accessed_at, access_item | DOM-PDPA-01, NFR-SEC-02, AC-HRS-09 |
| NotificationRequest | notification_id, document_id, use_case, requested_at, delivery_status | FR-HRS-05, AC-HRS-05 |

หมายเหตุ:
- `ActivityParticipantHour` เก็บเฉพาะข้อมูลที่จำเป็นต่อการแสดง ตรวจสอบ และส่งชั่วโมงตาม FR-HRS-02 ถึง FR-HRS-04; รายละเอียดข้อมูลรายบุคคลเพิ่มเติมให้ UC-04 จัดการตาม FR-HRS-08 และ Out of scope
- ตาราง `HourCriteria` เป็นแหล่งเกณฑ์เดิมที่กองการนักศึกษาดูแล; UC-07 อ่านอย่างเดียวและไม่สร้างกลไกจัดการเกณฑ์
- ใช้ `Activity.academic_year` ของกิจกรรมที่เอกสารอ้างถึงเพื่อค้นหา `HourCriteria.academic_year` โดยตรง; ไม่อนุมานปีการศึกษาจากวันที่
- หากไม่พบปีการศึกษาหรือเกณฑ์ active ของปีนั้น ให้หยุดด้วยข้อผิดพลาดและคงเอกสาร/รายการเดิม ไม่ mark ผิดหรือคืนเอกสาร ตาม ASM-01
- `RegSubmission.attempt_count` ใช้จำกัดการส่งซ้ำด้วยตนเองให้ได้ 1 ครั้งหลังการส่งครั้งแรกตาม Q-03

## 4. API / หน้าจอ

| รายการ | Input / Output หลัก | รองรับ |
|---|---|---|
| `GET /activity-hours/documents/pending` | Input: userSession; Output: เอกสารรอตรวจสอบเรียงตาม submitted_at | FR-HRS-01, NFR-SEC-01 |
| `GET /activity-hours/documents/{documentId}` | Input: documentId, userSession; Output: รายชื่อผู้เข้าร่วม ประเภทชั่วโมง และผลตรวจสอบ | FR-HRS-02, FR-HRS-03, NFR-SEC-01 |
| `POST /activity-hours/documents/{documentId}/validate` | Input: documentId, academicYear; Output: ผลตรวจสอบแต่ละรายการและรายการที่ต้องแก้ไข | FR-HRS-03, FR-HRS-06, ASM-03 |
| `POST /activity-hours/documents/{documentId}/approve` | Input: documentId, userSession; Output: สถานะการอนุมัติและผลการส่ง REG | FR-HRS-04, FR-HRS-07, AC-HRS-01, AC-HRS-06 |
| `POST /activity-hours/documents/{documentId}/reg-retry` | Input: documentId, userSession; Output: ผลการส่งซ้ำ | FR-HRS-07, AC-HRS-06; ให้ส่งซ้ำด้วยตนเองได้ 1 ครั้ง ไม่มี auto-retry |
| `GET /activity-hours/documents/{documentId}/individual-summary` | Input: documentId, participantId; Output: ผลการเรียกดูสรุปข้อมูลจาก UC-04 | FR-HRS-08, AC-HRS-07 |
| `POST /activity-hours/documents/{documentId}/notify-club` | Input: documentId, notificationContext; Output: ผลการเรียก UC-10 | FR-HRS-05, AC-HRS-05 |
| หน้าคิวตรวจสอบชั่วโมง | Input: userSession; Output: รายการเอกสารรอตรวจสอบ | FR-HRS-01, AC-HRS-03, NFR-SEC-01 |
| หน้าตรวจสอบไฟล์ Excel | Input: เลือกเอกสาร/ไฟล์; Output: รายการผู้เข้าร่วม ประเภทชั่วโมง และจุดที่ผิด | FR-HRS-02, FR-HRS-03, FR-HRS-06, AC-HRS-02, AC-HRS-04 |
| Middleware Login และ audit log | Input: userSession, accessContext; Output: อนุญาต/ปฏิเสธ และบันทึก StudentAccessLog | CON-NFR-21, DOM-PDPA-01, NFR-SEC-01, NFR-SEC-02, AC-HRS-08, AC-HRS-09 |

## 5. ตารางตรวจ Constraints

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| CON-NFR-21 | Middleware Login และ route/API guard ก่อนเข้าคิวหรือข้อมูลชั่วโมง | ใช้แล้ว |
| DOM-PDPA-01 | StudentAccessLog ในทุก endpoint ที่อ่านข้อมูลนักศึกษา และ middleware audit log | ใช้แล้ว |
| IF-REG-01 | RegSubmission, client เชื่อมต่อ REG, endpoint approve/retry และการแสดงผลส่งไม่สำเร็จ | ใช้แล้ว; timeout 5 วินาทีและส่งซ้ำด้วยตนเองได้ 1 ครั้งตาม Q-03 |
| IF-XLS-01 | ตัวอ่านไฟล์ Excel, ActivityParticipantHour และหน้าตรวจสอบไฟล์ | ใช้แล้ว; spec ยังไม่กำหนดพฤติกรรมเพิ่มเติมสำหรับไฟล์ผิดรูปแบบหรือข้อมูลซ้ำ |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| AC-HRS-01 | `test_AC_HRS_01_approve_matching_hours` | เตรียมเอกสารที่ประเภทชั่วโมงตรงเกณฑ์ทุกคน กดยืนยัน ตรวจว่าข้อมูลถูกส่ง REG สำเร็จและสถานะเป็น "บันทึกชั่วโมงสำเร็จ" |
| AC-HRS-02 | `test_AC_HRS_02_return_document_and_mark_invalid_items` | เตรียมเอกสารที่มีรายการผิดอย่างน้อยหนึ่งรายการ กดยืนยัน ตรวจว่าปฏิเสธการบันทึก คืนทั้งฉบับไป UC-02 และทำเครื่องหมายรายการผิดโดยไม่มีชั่วโมงถูกบันทึก |
| AC-HRS-03 | `test_AC_HRS_03_pending_documents_sorted_by_submitted_at` | เตรียมเอกสารรอตรวจหลายฉบับ เปิดคิว ตรวจว่าลำดับเป็นวันที่ส่งก่อน-หลัง |
| AC-HRS-04 | `test_AC_HRS_04_display_all_excel_participants_and_hour_types` | เลือกไฟล์ Excel ของกิจกรรม ตรวจว่ารายชื่อและประเภทชั่วโมงแสดงครบทุกรายการ |
| AC-HRS-05 | `test_AC_HRS_05_notify_club_after_reg_success` | จำลอง REG บันทึกสำเร็จ ตรวจว่าสถานะเปลี่ยนและระบบเรียก UC-10 เพื่อแจ้งสโมสร |
| AC-HRS-06 | `test_AC_HRS_06_reg_timeout_retry_and_failure_alert` | จำลอง REG ไม่ตอบสนองเกิน 5 วินาที ตรวจข้อความ "ส่งข้อมูลไม่สำเร็จ", การส่งซ้ำด้วยตนเองได้ 1 ครั้งโดยไม่มี auto-retry และการแจ้งเตือนเมื่อส่งซ้ำไม่สำเร็จ |
| AC-HRS-07 | `test_AC_HRS_07_open_individual_summary_and_return` | เลือกดูสรุปข้อมูลผู้เข้าร่วม ตรวจว่าเรียก UC-04 แสดงข้อมูลแล้วกลับสู่ขั้นตรวจสอบเกณฑ์ |
| AC-HRS-08 | `test_AC_HRS_08_unauthenticated_user_is_denied` | พยายามเปิดคิวโดยไม่มี Login ตรวจว่าระบบปฏิเสธการเข้าถึง |
| AC-HRS-09 | `test_AC_HRS_09_student_access_is_logged` | เปิดข้อมูลรายชื่อหรือชั่วโมง ตรวจว่า StudentAccessLog มีผู้เข้าถึง เวลา และรายการที่เข้าถึง |

## 7. ลำดับงาน

1. กำหนด entity เอกสาร รายการชั่วโมง เกณฑ์ ผลการส่ง และ access log ตาม FR-HRS-01 ถึง FR-HRS-04 และ DOM-PDPA-01
2. สร้าง middleware Login และ audit log ก่อนเปิด API/หน้าจอ ตาม CON-NFR-21, NFR-SEC-01, NFR-SEC-02 และ AC-HRS-08, AC-HRS-09
3. สร้างตัวอ่าน Excel และหน้าคิว/หน้าตรวจสอบรายการ ตาม IF-XLS-01, FR-HRS-01, FR-HRS-02 และ AC-HRS-03, AC-HRS-04
4. สร้างกลไกตรวจประเภทชั่วโมงและแสดงจุดที่ผิด โดยไม่บันทึกข้อมูลเมื่อไม่ผ่าน ตาม FR-HRS-03, FR-HRS-06, ASM-03 และ AC-HRS-02
5. สร้าง integration ส่งข้อมูลไป REG และการเปลี่ยนสถานะสำเร็จ ตาม IF-REG-01, FR-HRS-04 และ AC-HRS-01
6. เพิ่มการเรียก UC-10 หลัง REG สำเร็จ และการเรียก UC-04 ระหว่างตรวจสอบ ตาม FR-HRS-05, FR-HRS-08 และ AC-HRS-05, AC-HRS-07
7. เพิ่ม timeout 5 วินาที การส่งซ้ำด้วยตนเอง 1 ครั้ง และการแจ้งเตือนกรณี REG ไม่ตอบสนองตาม FR-HRS-07 และ AC-HRS-06
8. ทดสอบตาม AC-HRS-01 ถึง AC-HRS-09 และตรวจ traceability กับ spec.md ก่อนส่งมอบแผน

## 8. สถานะหลังดำเนินงานและสิ่งที่ยังต้องตรวจสอบ

- Q-01 ปิดแล้ว: ภาพต้นฉบับยืนยันว่าเมื่อยื่นล่าช้าให้เรียก UC-11; UC-11 อยู่นอก scope ของ UC-07 จึงไม่เพิ่ม FR/AC หรือสร้าง integration สำหรับ UC-11 ในแผนนี้
- Q-02 ปิดแล้ว: DOM-PDPA-01 และ NFR-SEC-02 เป็นข้อกำหนด audit log เฉพาะ UC-07 ไม่อ้างเป็น NFR หลัก
- Q-03 ปิดแล้ว: timeout 5 วินาทีและส่งซ้ำด้วยตนเองได้ 1 ครั้งโดยไม่มี auto-retry
- Q-05 ปิดแล้ว: ใช้ตารางเกณฑ์เดิมที่กองการนักศึกษาดูแล; UC-07 อ่านอย่างเดียว
- Q-06 ปิดแล้ว: คง FR-HRS-06 และปรับ Goal ให้ชัดว่าคืนเอกสารก่อนบันทึก; การลดการแก้ไขซ้ำหมายถึงหลังบันทึกสำเร็จ
- สถานะงาน: tasks.md ระบุ T-01 ถึง T-24 ว่าเสร็จแล้ว; automated tests ครอบคลุม AC-HRS-01 ถึง AC-HRS-09 ตามรายการทดสอบข้างต้น
- ข้อจำกัด runtime: หน้าเว็บใช้ mock เป็นค่าเริ่มต้นชั่วคราว; backend ต้องกำหนด `app.state.activity_session` และ `app.state.reg_timeout_transport` ก่อนเชื่อมข้อมูลและ REG จริง
- การทดสอบ REG ใช้ transport จำลอง จึงยังไม่ใช่การยืนยัน end-to-end กับระบบ REG จริง
