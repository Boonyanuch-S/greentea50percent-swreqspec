# แผนการพัฒนา: ตรวจสอบและบันทึกชั่วโมงกิจกรรม

## 1. สรุปแนวทาง

1. ฟีเจอร์นี้ให้เจ้าหน้าที่กองการนักศึกษาดูคิวและตรวจสอบใบสรุปชั่วโมงกิจกรรมตาม FR-HRS-01 ถึง FR-HRS-03
2. ระบบจะอ่านไฟล์ Excel แสดงผู้เข้าร่วมและประเภทชั่วโมง พร้อมทำเครื่องหมายรายการที่ไม่ตรงเกณฑ์ตาม FR-HRS-02, FR-HRS-06 และ ASM-03
3. เมื่อข้อมูลผ่านการตรวจสอบ ระบบจะส่งชั่วโมงไป REG เปลี่ยนสถานะเอกสาร และเรียก UC-10 ตาม FR-HRS-04 และ FR-HRS-05
4. การเข้าถึงคิวและข้อมูลนักศึกษาจะผ่าน Login และบันทึก audit log ตาม CON-NFR-21, DOM-PDPA-01, NFR-SEC-01 และ NFR-SEC-02
5. รายละเอียด retry, timeout, สถานะเมื่อส่งไม่สำเร็จ และเจ้าของเกณฑ์จะยังไม่กำหนดจนกว่าจะได้รับคำตอบ Open Questions ที่เกี่ยวข้อง

## 2. เทคโนโลยีที่ใช้

| สิ่งที่เลือก | มาจาก | หมายเหตุ |
|---|---|---|
| React (Vite) สำหรับหน้าบ้าน | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สร้างหน้าคิว หน้าตรวจสอบ และการแสดงรายการที่ผิดตาม FR-HRS-01 ถึง FR-HRS-03 และ FR-HRS-06 |
| Python FastAPI สำหรับหลังบ้าน | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้จัดการ API อ่านเอกสาร ตรวจเกณฑ์ บันทึกสถานะ และส่งข้อมูลตาม FR-HRS-01 ถึง FR-HRS-07 |
| ฐานข้อมูลเชิงสัมพันธ์ | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้เก็บข้อมูลเอกสาร รายการชั่วโมง สถานะ ผลการส่ง และ audit log ตาม FR-HRS-04, DOM-PDPA-01 |
| ตัวอ่านไฟล์ Excel | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้อ่านข้อมูลตามโครงสร้างที่ได้รับจาก UC-02 ตาม IF-XLS-01; การจัดการไฟล์ผิดรูปแบบรอ Q-06 |
| Client สำหรับเชื่อมต่อ REG | IF-REG-01 | ใช้ส่งข้อมูลชั่วโมงไป REG และรับผลสำเร็จ/ไม่ตอบสนอง โดยยังไม่กำหนด retry และ timeout จนกว่าจะตอบ Q-01, Q-02 และ Q-03 |
| การเรียก UC-04 และ UC-10 | FR-HRS-05, FR-HRS-08 | ใช้เป็นจุดเชื่อมต่อกับ use case อื่น โดยไม่สร้างเนื้อหาภายใน UC-04 หรือ UC-10 ตาม Out of scope |

## 3. โมเดลข้อมูล

| Entity | ฟิลด์หลัก | รองรับ |
|---|---|---|
| ActivityHourDocument | document_id, activity_id, source_file_reference, submitted_at, status, returned_at | FR-HRS-01, FR-HRS-04, FR-HRS-06 |
| ActivityParticipantHour | item_id, document_id, student_reference, participant_name, reported_hour_type, reported_hours, validation_status, validation_message | FR-HRS-02, FR-HRS-03, FR-HRS-06, FR-HRS-08 |
| HourCriteria | criteria_id, academic_year, hour_type, criteria_definition, active_status | FR-HRS-03, ASM-01, ASM-02, Q-05 |
| RegSubmission | submission_id, document_id, submitted_at, response_status, error_message, last_attempt_at | FR-HRS-04, FR-HRS-07, IF-REG-01, Q-01, Q-02 |
| StudentAccessLog | log_id, accessor_id, accessed_at, access_item | DOM-PDPA-01, NFR-SEC-02, AC-HRS-09 |
| NotificationRequest | notification_id, document_id, use_case, requested_at, delivery_status | FR-HRS-05, AC-HRS-05 |

หมายเหตุ:
- `ActivityParticipantHour` เก็บเฉพาะข้อมูลที่จำเป็นต่อการแสดง ตรวจสอบ และส่งชั่วโมงตาม FR-HRS-02 ถึง FR-HRS-04; รายละเอียดข้อมูลรายบุคคลเพิ่มเติมให้ UC-04 จัดการตาม FR-HRS-08 และ Out of scope
- ไม่กำหนดฟิลด์หรือข้อมูลเพิ่มเติมนอกเหนือจาก spec; รายละเอียดเกณฑ์และปีการศึกษาที่ใช้จริงยังต้องรอ Q-05 ที่ยังเปิดอยู่
- สถานะและรายละเอียดการส่งซ้ำของ `RegSubmission` ยังไม่สรุปจนกว่าจะได้รับ Q-01 และ Q-02

## 4. API / หน้าจอ

| รายการ | Input / Output หลัก | รองรับ |
|---|---|---|
| `GET /activity-hours/documents/pending` | Input: userSession; Output: เอกสารรอตรวจสอบเรียงตาม submitted_at | FR-HRS-01, NFR-SEC-01 |
| `GET /activity-hours/documents/{documentId}` | Input: documentId, userSession; Output: รายชื่อผู้เข้าร่วม ประเภทชั่วโมง และผลตรวจสอบ | FR-HRS-02, FR-HRS-03, NFR-SEC-01 |
| `POST /activity-hours/documents/{documentId}/validate` | Input: documentId, academicYear; Output: ผลตรวจสอบแต่ละรายการและรายการที่ต้องแก้ไข | FR-HRS-03, FR-HRS-06, ASM-03 |
| `POST /activity-hours/documents/{documentId}/approve` | Input: documentId, userSession; Output: สถานะการอนุมัติและผลการส่ง REG | FR-HRS-04, FR-HRS-07, AC-HRS-01, AC-HRS-06 |
| `POST /activity-hours/documents/{documentId}/reg-retry` | Input: documentId, userSession; Output: ผลการส่งซ้ำ | FR-HRS-07, AC-HRS-06; จำนวนและช่วงเวลาการ retry รอ Q-01, Q-02 |
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
| IF-REG-01 | RegSubmission, client เชื่อมต่อ REG, endpoint approve/retry และการแสดงผลส่งไม่สำเร็จ | ใช้แล้ว; รายละเอียด retry, timeout และสถานะหลังล้มเหลวรอ Q-01, Q-02 และ Q-03 |
| IF-XLS-01 | ตัวอ่านไฟล์ Excel, ActivityParticipantHour และหน้าตรวจสอบไฟล์ | ใช้แล้ว; กติกาไฟล์ผิดรูปแบบ/ข้อมูลซ้ำรอ Q-06 |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| AC-HRS-01 | `test_AC_HRS_01_approve_matching_hours` | เตรียมเอกสารที่ประเภทชั่วโมงตรงเกณฑ์ทุกคน กดยืนยัน ตรวจว่าข้อมูลถูกส่ง REG สำเร็จและสถานะเป็น "บันทึกชั่วโมงสำเร็จ" |
| AC-HRS-02 | `test_AC_HRS_02_return_document_and_mark_invalid_items` | เตรียมเอกสารที่มีรายการผิดอย่างน้อยหนึ่งรายการ กดยืนยัน ตรวจว่าปฏิเสธการบันทึก คืนทั้งฉบับไป UC-02 และทำเครื่องหมายรายการผิดโดยไม่มีชั่วโมงถูกบันทึก |
| AC-HRS-03 | `test_AC_HRS_03_pending_documents_sorted_by_submitted_at` | เตรียมเอกสารรอตรวจหลายฉบับ เปิดคิว ตรวจว่าลำดับเป็นวันที่ส่งก่อน-หลัง |
| AC-HRS-04 | `test_AC_HRS_04_display_all_excel_participants_and_hour_types` | เลือกไฟล์ Excel ของกิจกรรม ตรวจว่ารายชื่อและประเภทชั่วโมงแสดงครบทุกรายการ |
| AC-HRS-05 | `test_AC_HRS_05_notify_club_after_reg_success` | จำลอง REG บันทึกสำเร็จ ตรวจว่าสถานะเปลี่ยนและระบบเรียก UC-10 เพื่อแจ้งสโมสร |
| AC-HRS-06 | `test_AC_HRS_06_reg_timeout_retry_and_failure_alert` | จำลอง REG ไม่ตอบสนอง ตรวจข้อความ "ส่งข้อมูลไม่สำเร็จ" การส่งซ้ำ และการแจ้งเตือนเมื่อส่งซ้ำไม่สำเร็จ; จำนวน retry/ช่วงเวลาต้องรอ Q-01, Q-02 |
| AC-HRS-07 | `test_AC_HRS_07_open_individual_summary_and_return` | เลือกดูสรุปข้อมูลผู้เข้าร่วม ตรวจว่าเรียก UC-04 แสดงข้อมูลแล้วกลับสู่ขั้นตรวจสอบเกณฑ์ |
| AC-HRS-08 | `test_AC_HRS_08_unauthenticated_user_is_denied` | พยายามเปิดคิวโดยไม่มี Login ตรวจว่าระบบปฏิเสธการเข้าถึง |
| AC-HRS-09 | `test_AC_HRS_09_student_access_is_logged` | เปิดข้อมูลรายชื่อหรือชั่วโมง ตรวจว่า StudentAccessLog มีผู้เข้าถึง เวลา และรายการที่เข้าถึง |

## 7. ลำดับงาน

1. กำหนด entity เอกสาร รายการชั่วโมง เกณฑ์ ผลการส่ง และ access log ตาม FR-HRS-01 ถึง FR-HRS-04 และ DOM-PDPA-01
2. สร้าง middleware Login และ audit log ก่อนเปิด API/หน้าจอ ตาม CON-NFR-21, NFR-SEC-01, NFR-SEC-02 และ AC-HRS-08, AC-HRS-09
3. สร้างตัวอ่าน Excel และหน้าคิว/หน้าตรวจสอบรายการ ตาม IF-XLS-01, FR-HRS-01, FR-HRS-02 และ AC-HRS-03, AC-HRS-04
4. สร้างกลไกตรวจประเภทชั่วโมงและแสดงจุดที่ผิด โดยไม่บันทึกข้อมูลเมื่อไม่ผ่าน ตาม FR-HRS-03, FR-HRS-06, ASM-03 และ AC-HRS-02
5. สร้าง integration ส่งข้อมูลไป REG และการเปลี่ยนสถานะสำเร็จ ตาม IF-REG-01, FR-HRS-04 และ AC-HRS-01; รายละเอียด timeout/retry รอคำตอบที่เกี่ยวข้อง
6. เพิ่มการเรียก UC-10 หลัง REG สำเร็จ และการเรียก UC-04 ระหว่างตรวจสอบ ตาม FR-HRS-05, FR-HRS-08 และ AC-HRS-05, AC-HRS-07
7. เพิ่มการส่งซ้ำและแจ้งเตือนกรณี REG ไม่ตอบสนองตาม FR-HRS-07 และ AC-HRS-06 หลังได้คำตอบ Q-01, Q-02 และ Q-03
8. ทดสอบตาม AC-HRS-01 ถึง AC-HRS-09 และตรวจ traceability กับ spec.md ก่อนส่งมอบแผน

## 8. สิ่งที่ยังไม่ทำ

- Q-01 ข้อความ Exception Flow ขั้น 6b ในตารางต้นฉบับอ่านไม่ชัดเจน และยังไม่ได้แปลงเป็น FR -> ส่วนที่เกี่ยวข้องกับเงื่อนไขและพฤติกรรมนี้จะยังไม่สร้างจนกว่าจะได้ภาพ/เอกสารต้นฉบับหรือคำตอบจากผู้เขียน use case
- Q-02 ต้องยืนยันว่า NFR เรื่องการ log การเข้าถึงข้อมูลนักศึกษาเป็นข้อกำหนดใหม่หรือมีอยู่แล้วใน NFR หลัก -> ส่วนที่เกี่ยวข้องกับสถานะการอ้างอิง NFR นี้จะยังไม่สรุปจนกว่าจะได้คำตอบจากทีมดูแล NFR หลัก
- Q-03 ยังไม่มีตัวเลขเวลาสำหรับ NFR-PERF-01 -> ส่วนที่เกี่ยวข้องกับค่า timeout และเกณฑ์ performance จะยังไม่สร้างจนกว่าจะได้ค่าตัวเลข
- Q-05 ยังไม่ทราบ use case หรือเจ้าของที่ดูแลเกณฑ์รายประเภทชั่วโมง -> ส่วนที่เกี่ยวข้องกับการกำหนดแหล่งข้อมูลและการจัดการเกณฑ์จะยังไม่สร้างจนกว่าจะยืนยัน owner
- Q-06 Goal ขัดกับ FR-HRS-06 เรื่องการคืนเอกสารเพื่อแก้ไข -> ส่วนที่เกี่ยวข้องกับการปรับ Goal หรือสถานะกระบวนการจะยังไม่สร้างจนกว่าจะได้คำตอบจากทีมเจ้าของกระบวนการ/ผู้เขียน spec

ส่วนที่เกี่ยวข้องกับ Open Questions ทุกข้อจะยังไม่สร้างจนกว่าจะได้คำตอบ และจะไม่กำหนดพฤติกรรมแทนทีม
