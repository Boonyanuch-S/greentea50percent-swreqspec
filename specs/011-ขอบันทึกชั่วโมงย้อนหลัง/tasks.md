# Tasks: ขอบันทึกชั่วโมงย้อนหลัง

- Feature: ขอบันทึกชั่วโมงย้อนหลัง (Request Late Activity-Hours Submission)
- Spec ID: SPEC-LATE-011
- อ้างอิง: `specs/011-ขอบันทึกชั่วโมงย้อนหลัง/plan.md`
- วันที่: 2569-10-01
- สรุป: มีทั้งหมด 20 tasks และมี 14 tasks ที่ต้องรอ Open Questions
- งานที่ต้องรอ Open Question: T-03, T-04, T-07, T-08, T-10, T-11, T-12, T-13, T-14, T-15, T-16, T-17, T-18 และ T-20 รอ Q-02 ถึง Q-08 ตามขอบเขตของแต่ละงาน

## รายการ task

### T-01 สร้างโมเดลกิจกรรมที่เลยกำหนด
- รองรับ: FR-LATE-01, AC-LATE-03
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-05 และ T-06
- ไฟล์ที่แตะ: `backend/app/models/activity.py`, `backend/app/repositories/activity.py`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: มีโมเดลและ query ที่ระบุรายการกิจกรรมที่เลยกำหนดปกติของกรรมการแต่ละคนได้ โดยไม่ใช้ระยะเวลาสูงสุดเป็นเงื่อนไขปฏิเสธ
- สถานะ: พร้อมทำ

### T-02 บังคับยืนยันตัวตนสำหรับฟีเจอร์
- รองรับ: CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-05, T-08 และ T-19
- ไฟล์ที่แตะ: `backend/app/middleware/auth.py`, `frontend/src/auth/AuthGuard.jsx`, `backend/app/api/late_submissions.py`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: API และ route ของฟีเจอร์ขอบันทึกชั่วโมงย้อนหลังปฏิเสธผู้ไม่มี session และอนุญาตเฉพาะผู้ใช้ที่ยืนยันตัวตนแล้ว
- สถานะ: พร้อมทำ

### T-03 สร้างโมเดลคำขอและเอกสารประกอบ
- รองรับ: FR-LATE-02, FR-LATE-03, FR-LATE-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-08 และ T-12
- ไฟล์ที่แตะ: `backend/app/models/late_submission_request.py`, `backend/app/models/supporting_document.py`, `backend/app/repositories/late_submission.py`
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: มี entity `LateSubmissionRequest` เก็บกิจกรรม เหตุผล สถานะ และเอกสารประกอบได้ โดยไม่ล็อกชนิดเอกสารหรือกติกาการใช้คำขอเดิม/ใหม่แทน Q-05
- สถานะ: รอ Q-05

### T-04 สร้างโมเดล audit log แยกคำขอย้อนหลัง
- รองรับ: FR-LATE-09, DOM-PDPA-03, DOM-AUDIT-02, NFR-SEC-03
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-13 และ T-18
- ไฟล์ที่แตะ: `backend/app/models/audit_log.py`, `backend/app/services/audit_log.py`
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: มี `AuditLog` ที่แยกประเภท `ยื่นย้อนหลัง` จากกรณีปกติและบันทึกเหตุการณ์การเข้าถึง/เปลี่ยนสถานะตามรายละเอียดที่ทีมยืนยันแล้ว
- สถานะ: รอ Q-04/Q-08

### T-05 สร้าง API รายการกิจกรรมที่เลยกำหนด
- รองรับ: FR-LATE-01, CON-NFR-21
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-09
- ไฟล์ที่แตะ: `backend/app/api/late_submissions.py`, `backend/app/schemas/late_submission.py`
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: `GET /late-submissions/activities` คืนกิจกรรมที่เลยกำหนดทั้งหมดของกรรมการที่ยืนยันตัวตนแล้ว และไม่กรองด้วย maximum deadline
- สถานะ: พร้อมทำ

### T-06 สร้างหน้ารายการกิจกรรมด้วย API จำลอง
- รองรับ: FR-LATE-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-09
- ไฟล์ที่แตะ: `frontend/src/pages/LateSubmissionPage.jsx`, `frontend/src/api/lateSubmissionMock.js`, `frontend/src/App.jsx`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: หน้า mock แสดงรายการกิจกรรมที่เลยกำหนดของกรรมการและให้เลือกกิจกรรมเพื่อเริ่มคำขอได้
- สถานะ: เสร็จ รอทีมตรวจ

### T-07 สร้างหน้ากรอกเหตุผลและแนบเอกสารด้วย API จำลอง
- รองรับ: FR-LATE-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-14 และ T-16
- ไฟล์ที่แตะ: `frontend/src/pages/LateSubmissionForm.jsx`, `frontend/src/api/lateSubmissionMock.js`
- ต้องทำหลัง: T-06
- เสร็จเมื่อ: กรรมการเลือกกิจกรรม กรอกเหตุผล และแนบเอกสารประกอบผ่าน mock ได้ โดยไม่กำหนดชนิดเอกสารแทน Q-05
- สถานะ: รอ Q-05

### T-08 สร้าง API ส่งคำขอและเรียก UC-04
- รองรับ: FR-LATE-02, FR-LATE-03, IF-UC04-01, IF-DEADLINE-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-14
- ไฟล์ที่แตะ: `backend/app/api/late_submissions.py`, `backend/app/services/late_submission.py`, `backend/app/integrations/uc04.py`
- ต้องทำหลัง: T-02, T-03, T-05
- เสร็จเมื่อ: `POST /late-submissions` บันทึกเหตุผล/เอกสาร ส่งคำขอไป UC-04 และตั้งสถานะ `ยื่นย้อนหลัง - รอตรวจสอบ` โดยไม่ปฏิเสธเพราะอายุคำขอ
- สถานะ: รอ Q-03/Q-04/Q-05

### T-09 ทดสอบรายการกิจกรรมที่เลยกำหนดครบถ้วน
- รองรับ: FR-LATE-01
- ตรวจด้วย: AC-LATE-03
- ไฟล์ที่แตะ: `backend/tests/test_AC_LATE_03_list_all_late_activities.py`, `frontend/src/__tests__/late-submission-activities.test.jsx`
- ต้องทำหลัง: T-05, T-06
- เสร็จเมื่อ: `test_AC_LATE_03_list_all_late_activities` ผ่านและยืนยันว่ากิจกรรมที่เลยกำหนดหลายรายการของกรรมการแสดงครบ โดยไม่รวมกิจกรรมที่ยังไม่เลยกำหนด
- สถานะ: พร้อมทำ

### T-10 สร้าง API และหน้าติดตามสถานะคำขอ
- รองรับ: FR-LATE-07, FR-LATE-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-12 และ T-17
- ไฟล์ที่แตะ: `backend/app/api/late_submissions.py`, `frontend/src/pages/LateSubmissionStatus.jsx`, `frontend/src/api/lateSubmissionMock.js`
- ต้องทำหลัง: T-03, T-06
- เสร็จเมื่อ: `GET /late-submissions/{request_id}` และหน้าติดตามแสดงสถานะคำขอ รวมถึง `รอเล่มสรุปจากคณะ` ได้ตาม contract ที่ทีมยืนยัน
- สถานะ: รอ Q-03/Q-04

### T-11 สร้าง API อัปโหลด Excel และส่งเข้า UC-07
- รองรับ: FR-LATE-04, FR-LATE-05, IF-UC07-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-15 และ T-20
- ไฟล์ที่แตะ: `backend/app/api/late_submissions.py`, `backend/app/services/hour_file_submission.py`, `backend/app/integrations/uc07.py`
- ต้องทำหลัง: T-03, T-10
- เสร็จเมื่อ: `POST /late-submissions/{request_id}/hour-file` รับไฟล์ที่ผ่านเงื่อนไขที่ทีมยืนยัน อ้างอิงคำขอเดิม และส่งเข้า UC-07 พร้อม flag `ยื่นย้อนหลัง`
- สถานะ: รอ Q-06/Q-07

### T-12 รองรับผลปฏิเสธจาก UC-04 และการแก้ไขคำขอ
- รองรับ: FR-LATE-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-16
- ไฟล์ที่แตะ: `backend/app/integrations/uc04.py`, `backend/app/services/late_submission.py`, `backend/app/api/late_submissions.py`, `frontend/src/pages/LateSubmissionForm.jsx`
- ต้องทำหลัง: T-07, T-08, T-10
- เสร็จเมื่อ: เมื่อ UC-04 ปฏิเสธเพราะเอกสารต้นทางไม่ครบ ระบบแจ้งกรรมการและนำกลับไปขั้นกรอกเหตุผล/แนบเอกสารตามกติกาคำขอที่ทีมยืนยัน
- สถานะ: รอ Q-03/Q-04/Q-05

### T-13 สร้าง API และหน้าดู audit log แยกประเภท
- รองรับ: FR-LATE-09, DOM-PDPA-03, DOM-AUDIT-02, NFR-SEC-03
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-18
- ไฟล์ที่แตะ: `backend/app/api/audit_logs.py`, `backend/app/services/audit_log.py`, `frontend/src/pages/LateSubmissionAuditLog.jsx`
- ต้องทำหลัง: T-04, T-08
- เสร็จเมื่อ: ผู้มีสิทธิ์เปิดดู log แล้วเห็นรายการยื่นย้อนหลังแยกจากกรณีปกติ พร้อมรายละเอียด สิทธิ์ และระยะเวลาเก็บตามคำตอบของทีม
- สถานะ: รอ Q-04/Q-08

### T-14 ทดสอบการส่งคำขอและการเรียก UC-04
- รองรับ: FR-LATE-02, FR-LATE-03, IF-UC04-01
- ตรวจด้วย: AC-LATE-01
- ไฟล์ที่แตะ: `backend/tests/test_AC_LATE_01_submit_request_to_faculty.py`, `frontend/src/__tests__/late-submission-create.test.jsx`
- ต้องทำหลัง: T-07, T-08
- เสร็จเมื่อ: `test_AC_LATE_01_submit_request_to_faculty` ผ่าน โดยใช้ stub/mock UC-04 และตรวจเหตุผล สถานะ `ยื่นย้อนหลัง - รอตรวจสอบ` และการส่งคำขอครบถ้วน
- สถานะ: รอ Q-03/Q-04/Q-05

### T-15 ทดสอบการไม่ปฏิเสธด้วย maximum deadline
- รองรับ: FR-LATE-08, IF-DEADLINE-01
- ตรวจด้วย: AC-LATE-02
- ไฟล์ที่แตะ: `backend/tests/test_AC_LATE_02_do_not_reject_by_maximum_period.py`
- ต้องทำหลัง: T-08
- เสร็จเมื่อ: `test_AC_LATE_02_do_not_reject_by_maximum_period` ผ่าน โดยคำขอที่มีอายุหลังวันกิจกรรมสิ้นสุดไม่ถูกปฏิเสธเพราะระยะเวลาสูงสุด
- สถานะ: รอ Q-07

### T-16 ทดสอบการแจ้งแก้ไขเอกสารเมื่อ UC-04 ปฏิเสธ
- รองรับ: FR-LATE-06
- ตรวจด้วย: AC-LATE-04
- ไฟล์ที่แตะ: `backend/tests/test_AC_LATE_04_return_request_for_missing_documents.py`, `frontend/src/__tests__/late-submission-return.test.jsx`
- ต้องทำหลัง: T-12
- เสร็จเมื่อ: `test_AC_LATE_04_return_request_for_missing_documents` ผ่าน โดยข้อความแจ้งเตือนและการกลับไปขั้นกรอกเหตุผล/แนบเอกสารถูกต้อง
- สถานะ: รอ Q-03/Q-04/Q-05

### T-17 ทดสอบสถานะรอเล่มสรุปจากคณะ
- รองรับ: FR-LATE-07
- ตรวจด้วย: AC-LATE-05
- ไฟล์ที่แตะ: `backend/tests/test_AC_LATE_05_show_waiting_summary_book_status.py`, `frontend/src/__tests__/late-submission-status.test.jsx`
- ต้องทำหลัง: T-10
- เสร็จเมื่อ: `test_AC_LATE_05_show_waiting_summary_book_status` ผ่านด้วย stub/mock UC-04 ที่ยังทำเล่มไม่เสร็จ และหน้าติดตามแสดง `รอเล่มสรุปจากคณะ`
- สถานะ: รอ Q-03/Q-04

### T-18 ทดสอบ audit log แยกคำขอย้อนหลังจากปกติ
- รองรับ: FR-LATE-09, DOM-PDPA-03, DOM-AUDIT-02, NFR-SEC-03
- ตรวจด้วย: AC-LATE-06
- ไฟล์ที่แตะ: `backend/tests/test_AC_LATE_06_separate_late_submission_audit_log.py`, `frontend/src/__tests__/late-submission-audit-log.test.jsx`
- ต้องทำหลัง: T-13
- เสร็จเมื่อ: `test_AC_LATE_06_separate_late_submission_audit_log` ผ่าน โดย log ระบุประเภทคำขอและแสดงเฉพาะข้อมูลตามสิทธิ์/retention ที่ทีมยืนยัน
- สถานะ: รอ Q-04/Q-08

### T-19 ทดสอบการปฏิเสธผู้ใช้ที่ยังไม่เข้าสู่ระบบ
- รองรับ: CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: AC-LATE-07
- ไฟล์ที่แตะ: `backend/tests/test_AC_LATE_07_require_login_before_access.py`, `frontend/src/__tests__/late-submission-auth.test.jsx`
- ต้องทำหลัง: T-02, T-06
- เสร็จเมื่อ: `test_AC_LATE_07_require_login_before_access` ผ่าน และผู้ไม่มี session ไม่สามารถเปิดหน้า/API ขอบันทึกชั่วโมงย้อนหลังได้
- สถานะ: พร้อมทำ

### T-20 ต่อหน้าจอกับ API จริงและตรวจ flow ครบ
- รองรับ: FR-LATE-01, FR-LATE-02, FR-LATE-03, FR-LATE-04, FR-LATE-05, FR-LATE-06, FR-LATE-07, FR-LATE-08, FR-LATE-09, CON-NFR-21, DOM-PDPA-03, DOM-AUDIT-02, IF-UC04-01, IF-UC07-02, IF-DEADLINE-01
- ตรวจด้วย: AC-LATE-01, AC-LATE-02, AC-LATE-03, AC-LATE-04, AC-LATE-05, AC-LATE-06, AC-LATE-07
- ไฟล์ที่แตะ: `frontend/src/api/client.js`, `frontend/src/pages/LateSubmissionPage.jsx`, `frontend/src/pages/LateSubmissionForm.jsx`, `frontend/src/pages/LateSubmissionStatus.jsx`, `frontend/src/pages/LateSubmissionAuditLog.jsx`, `backend/app/api/late_submissions.py`
- ต้องทำหลัง: T-05, T-08, T-09, T-11, T-12, T-13, T-14, T-15, T-16, T-17, T-18, T-19
- เสร็จเมื่อ: flow ปกติของหน้าจอใช้ API จริง ตั้งแต่เลือกกิจกรรม ส่งคำขอ ติดตามสถานะ อัปโหลด Excel ส่งต่อ UC-07 และดู log ได้ตาม contract ที่ทีมยืนยัน โดย test AC ที่เกี่ยวข้องผ่าน
- สถานะ: รอ Q-03/Q-04/Q-05/Q-06/Q-07/Q-08

## ตารางตรวจความครบ

### Acceptance Criteria

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-LATE-01 | T-14, T-20 |
| AC-LATE-02 | T-15, T-20 |
| AC-LATE-03 | T-09, T-20 |
| AC-LATE-04 | T-16, T-20 |
| AC-LATE-05 | T-17, T-20 |
| AC-LATE-06 | T-18, T-20 |
| AC-LATE-07 | T-19, T-20 |

### Constraints

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-NFR-21 | T-02, T-05, T-19, T-20 |
| DOM-PDPA-03 | T-04, T-13, T-18, T-20 |
| DOM-AUDIT-02 | T-04, T-13, T-18, T-20 |
| IF-UC04-01 | T-08, T-14, T-20 |
| IF-UC07-02 | T-11, T-20 |
| IF-DEADLINE-01 | T-01, T-08, T-15, T-20 |

## สิ่งที่ยังไม่ทำ

- **Q-02:** หากเจ้าหน้าที่กองกิจปฏิเสธคำขอ กรรมการสโมสรมีทางเลือกอื่น เช่น อุทธรณ์ หรือจบกระบวนการทันที?
  - task ที่รอ: ไม่มี task เฉพาะ เนื่องจาก spec ไม่มี FR สำหรับทางเลือกหลังการปฏิเสธของกองกิจ
- **Q-03:** การจัดทำเล่มสรุปโครงการใหม่ใช้ฟอร์ม/ฟีเจอร์เดียวกับการสร้างโครงการใหม่ปกติ หรือมีเวอร์ชันเฉพาะสำหรับกรณีย้อนหลัง?
  - task ที่รอ: T-08, T-10, T-12, T-14, T-16, T-17 และ T-20
- **Q-04:** NFR ข้อ 20 (DOMAIN/PDPA log) จะเพิ่มอย่างเป็นทางการในเอกสาร NFR หลักหรือไม่?
  - task ที่รอ: T-04, T-08, T-10, T-12, T-13, T-14, T-16, T-17, T-18 และ T-20
- **Q-05:** กรรมการสโมสรยื่นคำขอย้อนหลังได้กี่ครั้งต่อกิจกรรมหนึ่ง และหลังถูกปฏิเสธยื่นใหม่ได้หรือไม่?
  - task ที่รอ: T-03, T-07, T-08, T-12, T-14, T-16 และ T-20
- **Q-06:** ไฟล์ Excel ต้องมีรูปแบบ ขนาด และข้อมูลอ้างอิงใดบ้างก่อนส่งเข้า UC-07?
  - task ที่รอ: T-11 และ T-20
- **Q-07:** การตรวจสอบของเจ้าหน้าที่กองกิจใน AC-LATE-02 รวมการตรวจไฟล์ตาม UC-07 ด้วยหรือไม่?
  - task ที่รอ: T-11, T-15 และ T-20
- **Q-08:** Log ของคำขอย้อนหลังต้องบันทึกเหตุการณ์และข้อมูลใดบ้าง รวมถึงใครมีสิทธิ์ดูและเก็บไว้นานเท่าใด?
  - task ที่รอ: T-04, T-13, T-18 และ T-20
