# Tasks: ขอบันทึกชั่วโมงย้อนหลัง

- Feature: ขอบันทึกชั่วโมงย้อนหลัง (Request Late Activity-Hours Submission)
- Spec ID: SPEC-LATE-011
- อ้างอิง: `specs/011-ขอบันทึกชั่วโมงย้อนหลัง/plan.md`
- วันที่: 2569-10-13
- สรุป: มี 1 เฟสฐานราก, 8 เฟสตาม AC, 1 เฟสต่อ flow จริง และ 1 เฟสรอคำตอบ รวม 20 tasks
- มี 14 tasks ที่ต้องรอ Open Questions; เฟสแรกที่ลองใช้งานได้จริงคือเฟส 1: แสดงกิจกรรมที่เลยกำหนด
- การแบ่งเฟสนี้ยังไม่เริ่มเขียนโค้ด แต่ใช้กำหนดลำดับและจุดตรวจสำหรับ `/implement-all`

## เฟส 0: ฐานรากของฟีเจอร์ (ไม่มี AC)

### T-01 สร้างโมเดลกิจกรรมที่เลยกำหนด
- รองรับ: FR-LATE-01, IF-DEADLINE-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-05 และ T-09
- ไฟล์ที่แตะ: `backend/app/models/activity.py`, `backend/app/repositories/activity.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: มีโมเดลและ query ที่ระบุรายการกิจกรรมที่เลยกำหนดปกติของกรรมการแต่ละคนได้ โดยไม่ใช้ระยะเวลาสูงสุดเป็นเงื่อนไขปฏิเสธ
- สถานะ: เสร็จ

### T-02 บังคับยืนยันตัวตนสำหรับฟีเจอร์
- รองรับ: CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-05 และ T-19
- ไฟล์ที่แตะ: `backend/app/middleware/auth.py`, `frontend/src/auth/AuthGuard.jsx`, `backend/app/api/late_submissions.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: API และ route ของฟีเจอร์ขอบันทึกชั่วโมงย้อนหลังปฏิเสธผู้ไม่มี session และอนุญาตเฉพาะผู้ใช้ที่ยืนยันตัวตนแล้ว
- สถานะ: เสร็จ

#### จุดตรวจเฟส 0
- test ที่ต้องผ่านทั้งหมด: test เดิมของ backend และ frontend ต้องยังผ่าน
- เปิดระบบ: ใช้คำสั่งตาม `plan.md`; backend ใช้ `PYTHONPATH=. pytest -v backend/tests` สำหรับตรวจ และ frontend ใช้ `cd frontend && npm test`
- คนลองเองตามฐานราก:
  Given ผู้ใช้ไม่มี session และมี session ที่ยืนยันตัวตนแล้ว
  When เรียก route ของฟีเจอร์ด้วยสถานะทั้งสองแบบ
  Then ผู้ไม่มี session ถูกปฏิเสธ และผู้ที่ยืนยันตัวตนแล้วผ่าน middleware
- ยังขาด: รายละเอียด audit log รอ Q-04/Q-08

## เฟส 1: แสดงกิจกรรมที่เลยกำหนด (AC-LATE-03)

### T-05 สร้าง API รายการกิจกรรมที่เลยกำหนด
- รองรับ: FR-LATE-01, CON-NFR-21, IF-DEADLINE-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-09
- ไฟล์ที่แตะ: `backend/app/api/late_submissions.py`, `backend/app/schemas/late_submission.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: `GET /late-submissions/activities` คืนกิจกรรมที่เลยกำหนดทั้งหมดของกรรมการที่ยืนยันตัวตนแล้ว และไม่กรองด้วย maximum deadline
- สถานะ: เสร็จ รอทีมตรวจ

### T-06 สร้างหน้ารายการกิจกรรมด้วย API จำลอง
- รองรับ: FR-LATE-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-09
- ไฟล์ที่แตะ: `frontend/src/pages/LateSubmissionPage.jsx`, `frontend/src/api/lateSubmissionMock.js`, `frontend/src/App.jsx`
- แบบหน้าจอ: ไม่มี mockup; ใช้ข้อความตาม spec
- ต้องทำหลัง: T-05
- เสร็จเมื่อ: หน้า mock แสดงรายการกิจกรรมที่เลยกำหนดของกรรมการและให้เลือกกิจกรรมเพื่อเริ่มคำขอได้
- สถานะ: เสร็จ รอทีมตรวจ

### T-09 ทดสอบรายการกิจกรรมที่เลยกำหนดครบถ้วน
- รองรับ: FR-LATE-01, AC-LATE-03
- ตรวจด้วย: AC-LATE-03
- ไฟล์ที่แตะ: `backend/tests/test_AC_LATE_03_list_all_late_activities.py`, `frontend/src/__tests__/late-submission-activities.test.jsx`
- แบบหน้าจอ: ไม่มี mockup
- ต้องทำหลัง: T-05, T-06
- เสร็จเมื่อ: `test_AC_LATE_03_list_all_late_activities` และ test หน้าจอผ่าน โดยยืนยันว่ากิจกรรมที่เลยกำหนดหลายรายการแสดงครบและไม่รวมกิจกรรมที่ยังไม่เลยกำหนด
- สถานะ: เสร็จ

#### จุดตรวจเฟส 1
- test ที่ต้องผ่านทั้งหมด: `test_AC_LATE_03_list_all_late_activities`, test `test_TC_LATE_03_*` และ test ของเฟส 0
- เปิดระบบ: backend ใช้ `PYTHONPATH=. pytest -v backend/tests`; frontend ใช้ `cd frontend && npm test`
- คนลองเองตาม AC-LATE-03:
  Given กรรมการมีกิจกรรมที่เลยกำหนดหลายรายการและมีกิจกรรมที่ยังไม่เลยกำหนด
  When เปิดหน้าคำขอบันทึกชั่วโมงย้อนหลัง
  Then ระบบแสดงกิจกรรมที่เลยกำหนดทั้งหมดของกรรมการ และไม่แสดงกิจกรรมที่ยังไม่เลยกำหนด
- ยังขาด: การส่งคำขอหลังเลือกกิจกรรมอยู่ใน AC-LATE-01 และรอ Q-03/Q-04/Q-05

## เฟส 2: ส่งคำขอไปยังคณะ (AC-LATE-01)

### T-03 สร้างโมเดลคำขอและเอกสารประกอบ
- รองรับ: FR-LATE-02, FR-LATE-03, FR-LATE-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-08 และ T-12
- ไฟล์ที่แตะ: `backend/app/models/late_submission_request.py`, `backend/app/models/supporting_document.py`, `backend/app/repositories/late_submission.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: มี entity `LateSubmissionRequest` เก็บกิจกรรม เหตุผล สถานะ และเอกสารประกอบได้ โดยไม่ล็อกชนิดเอกสารหรือกติกาการใช้คำขอเดิม/ใหม่แทน Q-05
- สถานะ: รอ Q-05

### T-07 สร้างหน้ากรอกเหตุผลและแนบเอกสารด้วย API จำลอง
- รองรับ: FR-LATE-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-14
- ไฟล์ที่แตะ: `frontend/src/pages/LateSubmissionForm.jsx`, `frontend/src/api/lateSubmissionMock.js`
- แบบหน้าจอ: ไม่มี mockup; ใช้ข้อความตาม spec
- ต้องทำหลัง: T-06
- เสร็จเมื่อ: กรรมการเลือกกิจกรรม กรอกเหตุผล และแนบเอกสารประกอบผ่าน mock ได้ โดยไม่กำหนดชนิดเอกสารแทน Q-05
- สถานะ: รอ Q-05

### T-08 สร้าง API ส่งคำขอและเรียก UC-04
- รองรับ: FR-LATE-02, FR-LATE-03, IF-UC04-01, IF-DEADLINE-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-14
- ไฟล์ที่แตะ: `backend/app/api/late_submissions.py`, `backend/app/services/late_submission.py`, `backend/app/integrations/uc04.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-02, T-03, T-05
- เสร็จเมื่อ: `POST /late-submissions` บันทึกเหตุผล/เอกสาร ส่งคำขอไป UC-04 และตั้งสถานะ `ยื่นย้อนหลัง - รอตรวจสอบ` โดยไม่ปฏิเสธเพราะอายุคำขอ
- สถานะ: รอ Q-03/Q-04/Q-05

### T-14 ทดสอบการส่งคำขอและการเรียก UC-04
- รองรับ: FR-LATE-02, FR-LATE-03, IF-UC04-01, AC-LATE-01
- ตรวจด้วย: AC-LATE-01
- ไฟล์ที่แตะ: `backend/tests/test_AC_LATE_01_submit_request_to_faculty.py`, `frontend/src/__tests__/late-submission-create.test.jsx`
- แบบหน้าจอ: ไม่มี mockup
- ต้องทำหลัง: T-07, T-08
- เสร็จเมื่อ: test ผ่านโดยใช้ stub/mock UC-04 และตรวจเหตุผล สถานะ `ยื่นย้อนหลัง - รอตรวจสอบ` และการส่งคำขอครบถ้วน
- สถานะ: รอ Q-03/Q-04/Q-05

#### จุดตรวจเฟส 2
- test ที่ต้องผ่านทั้งหมด: test ของเฟส 0-1 และ test AC-LATE-01 ของ T-14
- เปิดระบบ: ใช้คำสั่งเปิด backend/frontend ตาม `plan.md`
- คนลองเองตาม AC-LATE-01:
  Given กิจกรรมเลยกำหนดและกรรมการกรอกเหตุผลพร้อมเอกสารประกอบตามกติกาที่ทีมยืนยัน
  When กดส่งคำขอย้อนหลัง
  Then ระบบส่งคำขอไปเจ้าหน้าที่คณะและเปลี่ยนสถานะเป็น `ยื่นย้อนหลัง - รอตรวจสอบ`
- ยังขาด: T-07, T-08 และ T-14 รอ Q-03/Q-04/Q-05

## เฟส 3: ไม่ปฏิเสธคำขอเพราะอายุสูงสุด (AC-LATE-02)

### T-15 ทดสอบการไม่ปฏิเสธด้วย maximum deadline
- รองรับ: FR-LATE-08, IF-DEADLINE-01, AC-LATE-02
- ตรวจด้วย: AC-LATE-02
- ไฟล์ที่แตะ: `backend/tests/test_AC_LATE_02_do_not_reject_by_maximum_period.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-08
- เสร็จเมื่อ: test ผ่าน โดยคำขอที่มีอายุหลังวันกิจกรรมสิ้นสุดไม่ถูกปฏิเสธเพราะระยะเวลาสูงสุด
- สถานะ: รอ Q-07

#### จุดตรวจเฟส 3
- test ที่ต้องผ่านทั้งหมด: test ของเฟสก่อนหน้าและ `test_AC_LATE_02_do_not_reject_by_maximum_period`
- เปิดระบบ: ใช้คำสั่งเปิด backend/frontend ตาม `plan.md`
- คนลองเองตาม AC-LATE-02:
  Given คำขอย้อนหลังมีอายุหลังวันกิจกรรมสิ้นสุด
  When เจ้าหน้าที่กองกิจตรวจสอบคำขอ
  Then ระบบไม่ปฏิเสธด้วยเหตุผลเรื่องระยะเวลาสูงสุด
- ยังขาด: ขอบเขตว่าการตรวจรวมการตรวจไฟล์ UC-07 หรือไม่ รอ Q-07

## เฟส 4: แจ้งแก้ไขเมื่อเอกสารไม่ครบ (AC-LATE-04)

### T-12 รองรับผลปฏิเสธจาก UC-04 และการแก้ไขคำขอ
- รองรับ: FR-LATE-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-16
- ไฟล์ที่แตะ: `backend/app/integrations/uc04.py`, `backend/app/services/late_submission.py`, `backend/app/api/late_submissions.py`, `frontend/src/pages/LateSubmissionForm.jsx`
- แบบหน้าจอ: ไม่มี mockup; ใช้ข้อความตาม spec
- ต้องทำหลัง: T-07, T-08
- เสร็จเมื่อ: เมื่อ UC-04 ปฏิเสธเพราะเอกสารต้นทางไม่ครบ ระบบแจ้งกรรมการและนำกลับไปขั้นกรอกเหตุผล/แนบเอกสารตามกติกาคำขอที่ทีมยืนยัน
- สถานะ: รอ Q-03/Q-04/Q-05

### T-16 ทดสอบการแจ้งแก้ไขเอกสารเมื่อ UC-04 ปฏิเสธ
- รองรับ: FR-LATE-06, AC-LATE-04
- ตรวจด้วย: AC-LATE-04
- ไฟล์ที่แตะ: `backend/tests/test_AC_LATE_04_return_request_for_missing_documents.py`, `frontend/src/__tests__/late-submission-return.test.jsx`
- แบบหน้าจอ: ไม่มี mockup
- ต้องทำหลัง: T-12
- เสร็จเมื่อ: test ผ่าน โดยข้อความแจ้งเตือนและการกลับไปขั้นกรอกเหตุผล/แนบเอกสารถูกต้อง
- สถานะ: รอ Q-03/Q-04/Q-05

#### จุดตรวจเฟส 4
- test ที่ต้องผ่านทั้งหมด: test ของเฟสก่อนหน้าและ test AC-LATE-04 ของ T-16
- เปิดระบบ: ใช้คำสั่งเปิด backend/frontend ตาม `plan.md`
- คนลองเองตาม AC-LATE-04:
  Given UC-04 ปฏิเสธเพราะเอกสารต้นทางไม่ครบ
  When ระบบได้รับผลปฏิเสธ
  Then ระบบแจ้งกรรมการและพากลับไปกรอกเหตุผล/แนบเอกสาร
- ยังขาด: กติกาการแก้ไขและยื่นซ้ำรอ Q-03/Q-04/Q-05

## เฟส 5: ติดตามสถานะเล่มสรุป (AC-LATE-05)

### T-10 สร้าง API และหน้าติดตามสถานะคำขอ
- รองรับ: FR-LATE-07
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-17
- ไฟล์ที่แตะ: `backend/app/api/late_submissions.py`, `backend/app/services/late_submission.py`, `frontend/src/pages/LateSubmissionStatus.jsx`
- แบบหน้าจอ: ไม่มี mockup; ใช้ข้อความตาม spec
- ต้องทำหลัง: T-08
- เสร็จเมื่อ: `GET /late-submissions/{request_id}` และหน้าติดตามแสดงสถานะคำขอ รวมถึง `รอเล่มสรุปจากคณะ` ตาม contract ที่ทีมยืนยัน
- สถานะ: รอ Q-03/Q-04

### T-17 ทดสอบสถานะรอเล่มสรุปจากคณะ
- รองรับ: FR-LATE-07, AC-LATE-05
- ตรวจด้วย: AC-LATE-05
- ไฟล์ที่แตะ: `backend/tests/test_AC_LATE_05_show_waiting_summary_book_status.py`, `frontend/src/__tests__/late-submission-status.test.jsx`
- แบบหน้าจอ: ไม่มี mockup
- ต้องทำหลัง: T-10
- เสร็จเมื่อ: test ผ่านด้วย stub/mock UC-04 ที่ยังทำเล่มไม่เสร็จ และหน้าติดตามแสดง `รอเล่มสรุปจากคณะ`
- สถานะ: รอ Q-03/Q-04

#### จุดตรวจเฟส 5
- test ที่ต้องผ่านทั้งหมด: test ของเฟสก่อนหน้าและ test AC-LATE-05 ของ T-17
- เปิดระบบ: ใช้คำสั่งเปิด backend/frontend ตาม `plan.md`
- คนลองเองตาม AC-LATE-05:
  Given สำนักงานคณะยังทำเล่มสรุปโครงการใหม่ไม่เสร็จ
  When กรรมการเปิดดูสถานะคำขอ
  Then ระบบแสดง `รอเล่มสรุปจากคณะ`
- ยังขาด: contract การจัดทำเล่มสรุปใหม่รอ Q-03/Q-04

## เฟส 6: ส่งไฟล์ชั่วโมงเข้าคิว UC-07 (ไม่มี AC ที่ระบุเฉพาะ FR-LATE-04/05)

### T-11 สร้าง API อัปโหลด Excel และส่งเข้า UC-07
- รองรับ: FR-LATE-04, FR-LATE-05, IF-UC07-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-20
- ไฟล์ที่แตะ: `backend/app/api/late_submissions.py`, `backend/app/services/late_submission.py`, `backend/app/integrations/uc07.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-10
- เสร็จเมื่อ: ระบบรับไฟล์ Excel พร้อมรหัสอ้างอิงคำขอย้อนหลังและส่งเข้า UC-07 พร้อม flag `ยื่นย้อนหลัง` โดยไม่ตรวจรายละเอียดแทน UC-07
- สถานะ: รอ Q-06/Q-07

#### จุดตรวจเฟส 6
- test ที่ต้องผ่านทั้งหมด: test ของเฟสก่อนหน้าและ test ของการส่งต่อ UC-07 ตาม contract ที่ทีมยืนยัน
- เปิดระบบ: ใช้คำสั่งเปิด backend/frontend ตาม `plan.md`
- คนลองเองตาม FR-LATE-04/05:
  Given เล่มสรุปโครงการใหม่เสร็จและมีไฟล์ Excel ชั่วโมงกิจกรรม
  When กรรมการอัปโหลดไฟล์พร้อมอ้างอิงคำขอย้อนหลัง
  Then ระบบส่งไฟล์เข้าคิว UC-07 พร้อม flag `ยื่นย้อนหลัง`
- ยังขาด: รูปแบบ/ขนาด/ข้อมูลอ้างอิงของ Excel และขอบเขตตรวจไฟล์รอ Q-06/Q-07

## เฟส 7: บันทึกและแสดง audit log (AC-LATE-06)

### T-04 สร้างโมเดล audit log แยกคำขอย้อนหลัง
- รองรับ: FR-LATE-09, DOM-PDPA-03, DOM-AUDIT-02, NFR-SEC-03
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-13 และ T-18
- ไฟล์ที่แตะ: `backend/app/models/audit_log.py`, `backend/app/services/audit_log.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: มี `AuditLog` ที่แยกประเภท `ยื่นย้อนหลัง` จากกรณีปกติและบันทึกเหตุการณ์ตามรายละเอียดที่ทีมยืนยันแล้ว
- สถานะ: รอ Q-04/Q-08

### T-13 สร้าง API และหน้าดู audit log แยกประเภท
- รองรับ: FR-LATE-09, DOM-PDPA-03, DOM-AUDIT-02, NFR-SEC-03
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-18
- ไฟล์ที่แตะ: `backend/app/api/audit_logs.py`, `backend/app/services/audit_log.py`, `frontend/src/pages/LateSubmissionAuditLog.jsx`
- แบบหน้าจอ: ไม่มี mockup; ใช้ข้อความตาม spec
- ต้องทำหลัง: T-04, T-08
- เสร็จเมื่อ: ผู้มีสิทธิ์เปิดดู log แล้วเห็นรายการยื่นย้อนหลังแยกจากกรณีปกติ ตามสิทธิ์และ retention ที่ทีมยืนยัน
- สถานะ: รอ Q-04/Q-08

### T-18 ทดสอบ audit log แยกคำขอย้อนหลังจากปกติ
- รองรับ: FR-LATE-09, DOM-PDPA-03, DOM-AUDIT-02, NFR-SEC-03, AC-LATE-06
- ตรวจด้วย: AC-LATE-06
- ไฟล์ที่แตะ: `backend/tests/test_AC_LATE_06_separate_late_submission_audit_log.py`, `frontend/src/__tests__/late-submission-audit-log.test.jsx`
- แบบหน้าจอ: ไม่มี mockup
- ต้องทำหลัง: T-13
- เสร็จเมื่อ: test ผ่าน โดย log ระบุประเภทคำขอและแสดงเฉพาะข้อมูลตามสิทธิ์/retention ที่ทีมยืนยัน
- สถานะ: รอ Q-04/Q-08

#### จุดตรวจเฟส 7
- test ที่ต้องผ่านทั้งหมด: test ของเฟสก่อนหน้าและ test AC-LATE-06 ของ T-18
- เปิดระบบ: ใช้คำสั่งเปิด backend/frontend ตาม `plan.md`
- คนลองเองตาม AC-LATE-06:
  Given มีคำขอปกติและคำขอย้อนหลังปะปนกัน
  When เจ้าหน้าที่ผู้มีสิทธิ์เปิดดู log
  Then log ระบุชัดว่ารายการใดเป็น `ยื่นย้อนหลัง` และแสดงข้อมูลตามสิทธิ์
- ยังขาด: รายละเอียดข้อมูล สิทธิ์การดู และ retention รอ Q-04/Q-08

## เฟส 8: ปฏิเสธผู้ที่ยังไม่เข้าสู่ระบบ (AC-LATE-07)

### T-19 ทดสอบการปฏิเสธผู้ใช้ที่ยังไม่เข้าสู่ระบบ
- รองรับ: CON-NFR-21, NFR-SEC-01, AC-LATE-07
- ตรวจด้วย: AC-LATE-07
- ไฟล์ที่แตะ: `backend/tests/test_AC_LATE_07_require_login_before_access.py`, `frontend/src/__tests__/late-submission-auth.test.jsx`
- แบบหน้าจอ: ไม่มี mockup
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: test ผ่าน และผู้ไม่มี session ไม่สามารถเปิดหน้า/API ขอบันทึกชั่วโมงย้อนหลังได้
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 8
- test ที่ต้องผ่านทั้งหมด: test ของเฟสก่อนหน้าและ `test_AC_LATE_07_require_login_before_access`
- เปิดระบบ: ใช้คำสั่งเปิด backend/frontend ตาม `plan.md`
- คนลองเองตาม AC-LATE-07:
  Given ผู้ใช้ยังไม่ได้เข้าสู่ระบบ
  When พยายามเข้าถึงฟีเจอร์ขอบันทึกชั่วโมงย้อนหลัง
  Then ระบบปฏิเสธการเข้าถึงจนกว่าจะยืนยันตัวตนสำเร็จ
- ยังขาด: ไม่มีสำหรับเงื่อนไขการยืนยันตัวตนของ AC นี้

## เฟส 9: ต่อหน้าจอกับ API จริงและตรวจ flow ครบ

### T-20 ต่อหน้าจอกับ API จริงและตรวจ flow ครบ
- รองรับ: FR-LATE-01, FR-LATE-02, FR-LATE-03, FR-LATE-04, FR-LATE-05, FR-LATE-06, FR-LATE-07, FR-LATE-08, FR-LATE-09, CON-NFR-21, DOM-PDPA-03, DOM-AUDIT-02, IF-UC04-01, IF-UC07-02, IF-DEADLINE-01
- ตรวจด้วย: AC-LATE-01, AC-LATE-02, AC-LATE-03, AC-LATE-04, AC-LATE-05, AC-LATE-06, AC-LATE-07
- ไฟล์ที่แตะ: `frontend/src/api/client.js`, `frontend/src/pages/LateSubmissionPage.jsx`, `frontend/src/pages/LateSubmissionForm.jsx`, `frontend/src/pages/LateSubmissionStatus.jsx`, `frontend/src/pages/LateSubmissionAuditLog.jsx`, `backend/app/api/late_submissions.py`
- แบบหน้าจอ: ไม่มี mockup; ใช้ข้อความตาม spec
- ต้องทำหลัง: T-05, T-08, T-09, T-10, T-11, T-12, T-13, T-14, T-15, T-16, T-17, T-18, T-19
- เสร็จเมื่อ: flow ปกติของหน้าจอใช้ API จริงตั้งแต่เลือกกิจกรรม ส่งคำขอ ติดตามสถานะ อัปโหลด Excel ส่งต่อ UC-07 และดู log ได้ตาม contract ที่ทีมยืนยัน โดย test AC ที่เกี่ยวข้องผ่าน
- สถานะ: รอ Q-03/Q-04/Q-05/Q-06/Q-07/Q-08

#### จุดตรวจเฟส 9
- test ที่ต้องผ่านทั้งหมด: test AC-LATE-01 ถึง AC-LATE-07 และ test ทั้งหมดของโปรเจกต์
- เปิดระบบ: ใช้คำสั่งเปิด backend/frontend ตาม `plan.md`
- คนลองเองตาม flow รวม:
  Given ทีมตอบ Open Questions ที่เกี่ยวข้องและมีข้อมูลตัวอย่างครบ
  When เดิน flow ตั้งแต่เลือกกิจกรรม ส่งคำขอ ติดตามสถานะ อัปโหลด Excel และเปิด log
  Then ทุกขั้นใช้ API จริงและแสดงสถานะ/flag ตาม spec
- ยังขาด: Q-03/Q-04/Q-05/Q-06/Q-07/Q-08

## เฟสรอคำตอบ

เฟสนี้ยังไม่ให้ implement จนกว่าจะปิด Q-02 ถึง Q-08 ใน spec:

- T-07, T-08, T-12, T-14 รอ Q-03/Q-04/Q-05
- T-10, T-17 รอ Q-03/Q-04
- T-11 รอ Q-06/Q-07
- T-04, T-13, T-18 รอ Q-04/Q-08
- T-15 รอ Q-07
- T-20 รอ Q-03/Q-04/Q-05/Q-06/Q-07/Q-08

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
| NFR-SEC-01 | T-02, T-19, T-20 |
| NFR-SEC-03 | T-04, T-13, T-18, T-20 |

### FR Traceability

| FR ID | AC ที่ตรวจ FR นี้ | เฟส |
|---|---|---|
| FR-LATE-01 | AC-LATE-03 | เฟส 0, 1, 9 |
| FR-LATE-02 | AC-LATE-01 | เฟส 2, 9 |
| FR-LATE-03 | AC-LATE-01 | เฟส 2, 9 |
| FR-LATE-04 | ไม่มี AC ควรเสนอทีมเพิ่ม | เฟส 6, 9 |
| FR-LATE-05 | ไม่มี AC ควรเสนอทีมเพิ่ม | เฟส 6, 9 |
| FR-LATE-06 | AC-LATE-04 | เฟส 4, 9 |
| FR-LATE-07 | AC-LATE-05 | เฟส 5, 9 |
| FR-LATE-08 | AC-LATE-02 | เฟส 3, 9 |
| FR-LATE-09 | AC-LATE-06 | เฟส 7, 9 |

## สิ่งที่ยังไม่ทำ

- Q-02 หากเจ้าหน้าที่กองกิจปฏิเสธคำขอ กรรมการมีทางเลือกอื่น เช่น อุทธรณ์ หรือจบกระบวนการทันที
- Q-03 การจัดทำเล่มสรุปโครงการใหม่ใช้ฟอร์ม/ฟีเจอร์เดียวกับการสร้างโครงการใหม่ปกติหรือมีเวอร์ชันเฉพาะ
- Q-04 NFR ข้อ 20 (DOMAIN/PDPA log) จะเพิ่มอย่างเป็นทางการในเอกสาร NFR หลักหรือไม่
- Q-05 กรรมการยื่นคำขอย้อนหลังได้กี่ครั้งต่อกิจกรรมหนึ่ง และหลังถูกปฏิเสธยื่นใหม่ได้หรือไม่
- Q-06 ไฟล์ Excel ต้องมีรูปแบบ ขนาด และข้อมูลอ้างอิงใดบ้างก่อนส่งเข้า UC-07
- Q-07 การตรวจของเจ้าหน้าที่กองกิจใน AC-LATE-02 รวมการตรวจไฟล์ตาม UC-07 หรือไม่
- Q-08 Log ต้องบันทึกเหตุการณ์/ข้อมูลใด ใครมีสิทธิ์ดู และเก็บไว้นานเท่าใด
