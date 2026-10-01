# Tasks: ตรวจสอบและบันทึกชั่วโมงกิจกรรม

- Feature: ตรวจสอบและบันทึกชั่วโมงกิจกรรม
- Spec ID: SPEC-HRS-007
- อ้างอิง: [plan.md](plan.md)
- วันที่: 2569-10-01

สรุป: มีทั้งหมด 24 tasks เรียงตามการพึ่งพา ตั้งแต่โมเดลข้อมูลและสิทธิ์ ไปจนถึง Excel, validation, การเชื่อมต่อภายนอก, หน้าจอ และการทดสอบตาม AC
มี 17 tasks ที่ต้องรอคำตอบ Open Questions ได้แก่ Q-01, Q-02, Q-03, Q-05 และ Q-06 โดย Q-04 ไม่ปรากฏใน spec ฉบับนี้

### T-01 สร้างโมเดลเอกสารและรายการชั่วโมง
- รองรับ: FR-HRS-01, FR-HRS-02, FR-HRS-03, FR-HRS-04, FR-HRS-06, IF-XLS-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-05, T-07 และ T-10
- ไฟล์ที่แตะ: `backend/models/activity_hours.py`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: มีโมเดล ActivityHourDocument และ ActivityParticipantHour รองรับฟิลด์ตาม plan.md
- สถานะ: พร้อมทำ

### T-02 ตรวจสิทธิ์เจ้าหน้าที่ก่อนเข้าถึงข้อมูล
- รองรับ: CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: AC-HRS-08
- ไฟล์ที่แตะ: `backend/auth/activity_hours_guard.py`, `backend/tests/test_AC_HRS_08_unauthenticated_user_is_denied.py`
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: `test_AC_HRS_08_unauthenticated_user_is_denied` ผ่านและคำขอที่ไม่มี userSession ถูกปฏิเสธ
- สถานะ: พร้อมทำ

### T-03 บันทึก audit log การเข้าถึงข้อมูลนักศึกษา
- รองรับ: DOM-PDPA-01, NFR-SEC-02
- ตรวจด้วย: AC-HRS-09
- ไฟล์ที่แตะ: `backend/models/student_access_log.py`, `backend/audit/student_access_log.py`, `backend/tests/test_AC_HRS_09_student_access_is_logged.py`
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: `test_AC_HRS_09_student_access_is_logged` ผ่านและ log มี accessor_id, accessed_at และ access_item
- สถานะ: รอ Q-02

### T-04 สร้างตัวอ่านไฟล์ Excel
- รองรับ: IF-XLS-01, FR-HRS-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-07
- ไฟล์ที่แตะ: `backend/importers/activity_hours_excel.py`, `backend/tests/test_activity_hours_excel_reader.py`
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: ตัวอ่านแปลงรายชื่อผู้เข้าร่วมและประเภทชั่วโมงจากไฟล์ Excel เป็น ActivityParticipantHour ได้
- สถานะ: รอ Q-06

### T-05 สร้าง API คิวเอกสารรอตรวจ
- รองรับ: FR-HRS-01, CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: AC-HRS-03
- ไฟล์ที่แตะ: `backend/api/activity_hours.py`, `backend/tests/test_AC_HRS_03_pending_documents_sorted_by_submitted_at.py`
- ต้องทำหลัง: T-01 และ T-02
- เสร็จเมื่อ: `test_AC_HRS_03_pending_documents_sorted_by_submitted_at` ผ่านและ API เรียงเอกสารตาม submitted_at ก่อน-หลัง
- สถานะ: พร้อมทำ

### T-06 สร้างหน้าคิวเอกสารด้วย API จำลอง
- รองรับ: FR-HRS-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-18
- ไฟล์ที่แตะ: `frontend/src/pages/ActivityHoursQueue.jsx`, `frontend/src/api/activityHoursMock.js`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: หน้าคิวแสดงเอกสารรอตรวจจาก API จำลองและเรียงตามวันที่ส่งได้
- สถานะ: เสร็จ รอทีมตรวจ

### T-07 สร้าง API แสดงรายการจาก Excel
- รองรับ: FR-HRS-02, IF-XLS-01, CON-NFR-21
- ตรวจด้วย: AC-HRS-04
- ไฟล์ที่แตะ: `backend/api/activity_hours.py`, `backend/services/activity_hours_reader.py`, `backend/tests/test_AC_HRS_04_display_all_excel_participants_and_hour_types.py`
- ต้องทำหลัง: T-02 และ T-04
- เสร็จเมื่อ: `test_AC_HRS_04_display_all_excel_participants_and_hour_types` ผ่านและ API ส่งรายชื่อกับประเภทชั่วโมงครบทุกรายการ
- สถานะ: รอ Q-06

### T-08 สร้างหน้าตรวจสอบรายการชั่วโมงด้วย API จำลอง
- รองรับ: FR-HRS-02, FR-HRS-03, FR-HRS-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-11 และ T-18
- ไฟล์ที่แตะ: `frontend/src/pages/ActivityHoursReview.jsx`, `frontend/src/api/activityHoursMock.js`
- ต้องทำหลัง: T-06
- เสร็จเมื่อ: หน้าจอแสดงรายชื่อ ประเภทชั่วโมง และตำแหน่งรายการที่ต้องแก้จากข้อมูลจำลองได้
- สถานะ: รอ Q-05 และ Q-06

### T-09 สร้างโมเดลเกณฑ์ประเภทชั่วโมง
- รองรับ: FR-HRS-03, ASM-01, ASM-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-10
- ไฟล์ที่แตะ: `backend/models/hour_criteria.py`
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: มีโมเดล HourCriteria รองรับ academic_year, hour_type, criteria_definition และ active_status โดยไม่เพิ่มกติกาเกณฑ์
- สถานะ: รอ Q-05

### T-10 ตรวจประเภทชั่วโมงเทียบเกณฑ์
- รองรับ: FR-HRS-03, FR-HRS-06, ASM-03
- ตรวจด้วย: AC-HRS-02
- ไฟล์ที่แตะ: `backend/services/hour_validation.py`, `backend/api/activity_hours.py`, `backend/tests/test_AC_HRS_02_return_document_and_mark_invalid_items.py`
- ต้องทำหลัง: T-01, T-04 และ T-09
- เสร็จเมื่อ: `test_AC_HRS_02_return_document_and_mark_invalid_items` ผ่าน โดยทำเครื่องหมายรายการผิด คืนทั้งเอกสาร และไม่บันทึกชั่วโมง
- สถานะ: รอ Q-05 และ Q-06

### T-11 แสดงผลการตรวจและรายการผิดบนหน้าจอ
- รองรับ: FR-HRS-03, FR-HRS-06, ASM-03
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-18
- ไฟล์ที่แตะ: `frontend/src/pages/ActivityHoursReview.jsx`
- ต้องทำหลัง: T-08 และ T-10
- เสร็จเมื่อ: เจ้าหน้าที่เห็นผลตรวจและรายการที่ไม่ตรงเกณฑ์พร้อมสถานะคืนเอกสารในหน้าจอจำลอง
- สถานะ: รอ Q-05 และ Q-06

### T-12 สร้างสัญญาการส่งข้อมูลไป REG
- รองรับ: IF-REG-01, FR-HRS-04
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-13 และ T-14
- ไฟล์ที่แตะ: `backend/integrations/reg_client.py`, `backend/models/reg_submission.py`, `backend/tests/test_reg_client_contract.py`
- ต้องทำหลัง: T-01 และ T-02
- เสร็จเมื่อ: client และ RegSubmission รองรับข้อมูลส่ง ผลตอบกลับ error และเวลาพยายามล่าสุดตาม plan.md โดยไม่กำหนด retry/timeout เอง
- สถานะ: รอ Q-01 และ Q-03

### T-13 บันทึกชั่วโมงสำเร็จและเปลี่ยนสถานะ
- รองรับ: FR-HRS-04, IF-REG-01
- ตรวจด้วย: AC-HRS-01
- ไฟล์ที่แตะ: `backend/services/activity_hours_approval.py`, `backend/api/activity_hours.py`, `backend/tests/test_AC_HRS_01_approve_matching_hours.py`
- ต้องทำหลัง: T-09, T-10 และ T-12
- เสร็จเมื่อ: `test_AC_HRS_01_approve_matching_hours` ผ่านและข้อมูลถูกส่ง REG พร้อมสถานะ "บันทึกชั่วโมงสำเร็จ"
- สถานะ: รอ Q-05 และ Q-03

### T-14 จัดการ REG ไม่ตอบสนองและการส่งซ้ำ
- รองรับ: FR-HRS-07, IF-REG-01
- ตรวจด้วย: AC-HRS-06
- ไฟล์ที่แตะ: `backend/services/reg_retry.py`, `backend/api/activity_hours.py`, `backend/tests/test_AC_HRS_06_reg_timeout_retry_and_failure_alert.py`
- ต้องทำหลัง: T-12 และ T-13
- เสร็จเมื่อ: `test_AC_HRS_06_reg_timeout_retry_and_failure_alert` ผ่านตามจำนวนครั้ง ช่วงเวลา และสถานะที่ทีมยืนยันแล้ว
- สถานะ: รอ Q-01 และ Q-03

### T-15 เรียก UC-10 หลังบันทึก REG สำเร็จ
- รองรับ: FR-HRS-05
- ตรวจด้วย: AC-HRS-05
- ไฟล์ที่แตะ: `backend/integrations/uc10_notification_client.py`, `backend/api/activity_hours.py`, `backend/tests/test_AC_HRS_05_notify_club_after_reg_success.py`
- ต้องทำหลัง: T-13
- เสร็จเมื่อ: `test_AC_HRS_05_notify_club_after_reg_success` ผ่านและมีการเรียก UC-10 หลังสถานะเป็น "บันทึกชั่วโมงสำเร็จ"
- สถานะ: พร้อมทำ

### T-16 เรียก UC-04 และกลับสู่ขั้นตรวจสอบ
- รองรับ: FR-HRS-08
- ตรวจด้วย: AC-HRS-07
- ไฟล์ที่แตะ: `backend/integrations/uc04_summary_client.py`, `backend/api/activity_hours.py`, `backend/tests/test_AC_HRS_07_open_individual_summary_and_return.py`
- ต้องทำหลัง: T-02 และ T-07
- เสร็จเมื่อ: `test_AC_HRS_07_open_individual_summary_and_return` ผ่าน โดยแสดงผลสรุปจาก UC-04 แล้วกลับไปขั้นตรวจสอบเกณฑ์
- สถานะ: พร้อมทำ

### T-17 บันทึกการตรวจสอบลง audit log
- รองรับ: DOM-PDPA-01, NFR-SEC-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-19
- ไฟล์ที่แตะ: `backend/audit/activity_hours_access.py`, `backend/api/activity_hours.py`
- ต้องทำหลัง: T-03, T-05 และ T-07
- เสร็จเมื่อ: endpoint ที่อ่านข้อมูลนักศึกษาส่ง access context ให้ StudentAccessLog ครบทุกครั้ง
- สถานะ: รอ Q-02

### T-18 เชื่อมหน้าจอคิวและตรวจสอบกับ API จำลอง
- รองรับ: FR-HRS-01, FR-HRS-02, FR-HRS-03, FR-HRS-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-20
- ไฟล์ที่แตะ: `frontend/src/pages/ActivityHoursQueue.jsx`, `frontend/src/pages/ActivityHoursReview.jsx`, `frontend/src/api/activityHoursMock.js`
- ต้องทำหลัง: T-06, T-08 และ T-11
- เสร็จเมื่อ: workflow คิวและตรวจสอบทำงานครบด้วย API จำลองโดยไม่ต้องรอ API จริง
- สถานะ: รอ Q-05 และ Q-06

### T-19 กำหนดเกณฑ์ performance การส่ง REG
- รองรับ: NFR-PERF-01, IF-REG-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-14 และ T-21
- ไฟล์ที่แตะ: `backend/config/reg_performance.py`, `backend/tests/test_reg_performance.py`
- ต้องทำหลัง: T-12
- เสร็จเมื่อ: มีค่าตัวเลขของเวลาที่กำหนดและ test ตรวจค่า performance ตามคำตอบของ Q-03
- สถานะ: รอ Q-03

### T-20 เชื่อมหน้าจอกับ API จริง
- รองรับ: FR-HRS-01, FR-HRS-02, FR-HRS-03, FR-HRS-04, FR-HRS-05, FR-HRS-06, FR-HRS-07, FR-HRS-08, CON-NFR-21, DOM-PDPA-01, IF-REG-01, IF-XLS-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-21 ถึง T-24
- ไฟล์ที่แตะ: `frontend/src/api/activityHoursClient.js`, `frontend/src/pages/ActivityHoursQueue.jsx`, `frontend/src/pages/ActivityHoursReview.jsx`
- ต้องทำหลัง: T-05, T-07, T-10, T-13, T-14, T-15, T-16, T-17 และ T-18
- เสร็จเมื่อ: หน้าคิวและหน้าตรวจสอบทำงานกับ API จริงครบตามสัญญา และยังคงตรวจสิทธิ์กับ audit log ได้
- สถานะ: รอ Q-01, Q-02, Q-03, Q-05 และ Q-06

### T-21 ทดสอบคิวและการอ่านไฟล์
- รองรับ: FR-HRS-01, FR-HRS-02, IF-XLS-01
- ตรวจด้วย: AC-HRS-03 และ AC-HRS-04
- ไฟล์ที่แตะ: `backend/tests/test_AC_HRS_03_pending_documents_sorted_by_submitted_at.py`, `backend/tests/test_AC_HRS_04_display_all_excel_participants_and_hour_types.py`
- ต้องทำหลัง: T-05, T-07 และ T-20
- เสร็จเมื่อ: tests ของ AC-HRS-03 และ AC-HRS-04 ผ่านและยืนยันลำดับคิวกับรายการ Excel ครบถ้วน
- สถานะ: รอ Q-06

### T-22 ทดสอบ approval, validation และ REG
- รองรับ: FR-HRS-03, FR-HRS-04, FR-HRS-06, FR-HRS-07, IF-REG-01
- ตรวจด้วย: AC-HRS-01, AC-HRS-02 และ AC-HRS-06
- ไฟล์ที่แตะ: `backend/tests/test_AC_HRS_01_approve_matching_hours.py`, `backend/tests/test_AC_HRS_02_return_document_and_mark_invalid_items.py`, `backend/tests/test_AC_HRS_06_reg_timeout_retry_and_failure_alert.py`
- ต้องทำหลัง: T-10, T-13, T-14 และ T-20
- เสร็จเมื่อ: tests ของ AC-HRS-01, AC-HRS-02 และ AC-HRS-06 ผ่านตามเกณฑ์ที่ทีมยืนยัน
- สถานะ: รอ Q-01, Q-03, Q-05 และ Q-06

### T-23 ทดสอบการแจ้งเตือนและ UC-04
- รองรับ: FR-HRS-05, FR-HRS-08
- ตรวจด้วย: AC-HRS-05 และ AC-HRS-07
- ไฟล์ที่แตะ: `backend/tests/test_AC_HRS_05_notify_club_after_reg_success.py`, `backend/tests/test_AC_HRS_07_open_individual_summary_and_return.py`
- ต้องทำหลัง: T-15, T-16 และ T-20
- เสร็จเมื่อ: tests ของ AC-HRS-05 และ AC-HRS-07 ผ่านและยืนยันลำดับการเรียก UC-10 กับการกลับจาก UC-04
- สถานะ: พร้อมทำ

### T-24 ทดสอบสิทธิ์และ audit log
- รองรับ: CON-NFR-21, DOM-PDPA-01, NFR-SEC-01, NFR-SEC-02
- ตรวจด้วย: AC-HRS-08 และ AC-HRS-09
- ไฟล์ที่แตะ: `backend/tests/test_AC_HRS_08_unauthenticated_user_is_denied.py`, `backend/tests/test_AC_HRS_09_student_access_is_logged.py`
- ต้องทำหลัง: T-02, T-03, T-17 และ T-20
- เสร็จเมื่อ: tests ของ AC-HRS-08 และ AC-HRS-09 ผ่านตามข้อกำหนดสิทธิ์และ audit log ที่ทีมยืนยัน
- สถานะ: รอ Q-02

## ตารางตรวจความครบ: Acceptance Criteria

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-HRS-01 | T-13, T-22 |
| AC-HRS-02 | T-10, T-22 |
| AC-HRS-03 | T-05, T-21 |
| AC-HRS-04 | T-07, T-21 |
| AC-HRS-05 | T-15, T-23 |
| AC-HRS-06 | T-14, T-22 |
| AC-HRS-07 | T-16, T-23 |
| AC-HRS-08 | T-02, T-24 |
| AC-HRS-09 | T-03, T-24 |

## ตารางตรวจความครบ: Constraints

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-NFR-21 | T-02, T-05, T-07, T-20, T-24 |
| DOM-PDPA-01 | T-03, T-17, T-20, T-24 |
| IF-REG-01 | T-12, T-13, T-14, T-19, T-20, T-22 |
| IF-XLS-01 | T-04, T-07, T-21, T-20 |

## สิ่งที่ยังไม่ทำ

- Q-01 ข้อความ Exception Flow ขั้น 6b ในตารางต้นฉบับอ่านไม่ชัดเจน และยังไม่ได้แปลงเป็น FR — งานที่รอ: T-12, T-13, T-14, T-20 และ T-22
- Q-02 ต้องยืนยันว่า NFR เรื่องการ log การเข้าถึงข้อมูลนักศึกษาเป็นข้อกำหนดใหม่หรือมีอยู่แล้วใน NFR หลัก — งานที่รอ: T-03, T-17, T-20 และ T-24
- Q-03 ยังไม่มีตัวเลขเวลาสำหรับ NFR-PERF-01 — งานที่รอ: T-12, T-13, T-14, T-19, T-20 และ T-22
- Q-05 ยังไม่ทราบ use case หรือเจ้าของที่ดูแลเกณฑ์รายประเภทชั่วโมง — งานที่รอ: T-08, T-09, T-10, T-11, T-13, T-18, T-20 และ T-22
- Q-06 Goal ขัดกับ FR-HRS-06 เรื่องการคืนเอกสารเพื่อแก้ไข — งานที่รอ: T-04, T-07, T-08, T-10, T-11, T-18, T-20, T-21 และ T-22

หมายเหตุ: spec.md ไม่มี Q-04 จึงไม่มีการสร้าง task หรืออ้างอิง Q-04 เพิ่ม
