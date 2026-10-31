# Tasks: ส่งข้อมูลชั่วโมง

- Feature: ส่งข้อมูลชั่วโมง (Submit Activity-Hours File)
- Spec ID: SPEC-SBH-002
- อ้างอิง: `specs/002-ส่งข้อมูลชั่วโมง/plan.md`
- วันที่: 2569-10-31
- สรุป: มี 6 เฟส รวม 17 tasks โดยเฟส 0 มี 3 tasks และเฟสใช้งานแรกคือเฟส 1
- งานรอ Open Questions: 2 tasks รอ Q-02/Q-03 และอีก 3 tasks รอทีมกำหนด mapping สถานะ UC-04 ซึ่งยังไม่มี Q-ID ใน spec
- เฟสแรกที่ลองใช้งานได้จริง: เฟส 1 เปิดหน้าส่งข้อมูลชั่วโมงได้เฉพาะกิจกรรมจบแล้ว และปฏิเสธผู้ที่ยังไม่ Login

## เฟส 0: ฐานรากข้อมูลและบริการ (FR-SBH-01, FR-SBH-02, FR-SBH-05, FR-SBH-06)

### T-01 สร้างโมเดลกิจกรรมและผู้เกี่ยวข้อง
- รองรับ: FR-SBH-01, FR-SBH-02, ASM-05
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-04 และ T-06
- ไฟล์ที่แตะ: `backend/app/models/hours_submission.py`, `backend/app/models/activity.py`, `backend/app/repositories/activity.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: มีโมเดลกิจกรรม ผู้เข้าร่วม Staff และประเภทชั่วโมงที่ผูกระดับกิจกรรม ไม่ใช่รายบุคคล
- สถานะ: เสร็จ

### T-02 สร้าง query กิจกรรมจบแล้วและข้อมูลชั่วโมง
- รองรับ: FR-SBH-01, FR-SBH-02, ASM-05
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-04 และ T-06
- ไฟล์ที่แตะ: `backend/app/repositories/activity.py`, `backend/app/services/activity_access.py`, `backend/app/services/hours_data.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: query คืนเฉพาะกิจกรรมสถานะ “จบแล้ว” และ service คืนผู้เข้าร่วม Staff และประเภทชั่วโมงระดับกิจกรรมทั้งหมด
- สถานะ: เสร็จ

### T-03 สร้างโมเดลสถานะเลขและรายการส่ง
- รองรับ: FR-SBH-05, FR-SBH-06, IF-PRJNUM-01, IF-UC07-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-11 และ T-14
- ไฟล์ที่แตะ: `backend/app/models/hours_submission.py`, `backend/app/repositories/submission.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: มีโมเดลสถานะเลขสรุป รายการส่ง และรายการเข้าคิว พร้อม repository สำหรับบันทึกข้อมูลโดยไม่ commit แทนผู้เรียก
- สถานะ: เสร็จ

#### จุดตรวจเฟส 0
- test ที่ต้องผ่านทั้งหมด: `test_submission_repository.py`, `test_hours_data_service.py`, `test_AC_LATE_03_list_all_late_activities.py`
- เปิดระบบ: ยังไม่ใช่เฟสใช้งาน; ทดสอบ backend ด้วย `cd backend && PYTHONPATH=.. pytest`
- คนลองเองตาม FR-SBH-01 และ FR-SBH-02:
  Given มีข้อมูลกิจกรรมทั้งสถานะ “จบแล้ว” และสถานะอื่น พร้อมผู้เข้าร่วม Staff และประเภทชั่วโมง
  When เรียก query และ service ของข้อมูลกิจกรรม
  Then ได้เฉพาะกิจกรรมที่จบแล้วและได้ข้อมูลผู้เข้าร่วม Staff และประเภทชั่วโมงของกิจกรรมครบ
- ยังขาด: ไม่มี

## เฟส 1: เปิดหน้าส่งชั่วโมงเฉพาะกิจกรรมจบแล้วและผู้ใช้ที่ Login (AC-SBH-03, AC-SBH-06)

### T-04 ป้องกันและเปิดข้อมูลกิจกรรมที่จบแล้วผ่าน API
- รองรับ: FR-SBH-01, CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: AC-SBH-03, AC-SBH-06
- ไฟล์ที่แตะ: `backend/app/middleware/auth.py`, `backend/app/api/hours_submission.py`, `backend/app/schemas/hours_submission.py`, `backend/app/main.py`, `backend/tests/test_hours_submission_access.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: API เปิดข้อมูลของกิจกรรมที่จบแล้วแก่ผู้ใช้ที่ยืนยันตัวตน และปฏิเสธผู้ใช้ที่ไม่ Login หรือกิจกรรมที่ไม่เข้าเงื่อนไข
- สถานะ: เสร็จ

### T-05 เชื่อมหน้าส่งชั่วโมงกับ API จริง
- รองรับ: FR-SBH-01, CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: AC-SBH-03, AC-SBH-06
- ไฟล์ที่แตะ: `backend/app/api/hours_submission.py`, `backend/app/schemas/hours_submission.py`, `backend/tests/test_hours_submission_access.py`, `frontend/src/api/client.js`, `frontend/src/pages/HoursSubmission.jsx`, `frontend/src/App.jsx`, `frontend/src/__tests__/hours-submission-navigation.test.jsx`
- แบบหน้าจอ: ไม่มี mockup ใน feature นี้
- ต้องทำหลัง: T-04
- เสร็จเมื่อ: หน้ากรรมการเรียก API ผ่าน `frontend/src/api/client.js` และแสดง/เปิดได้เฉพาะกิจกรรมที่จบแล้ว โดยผู้ไม่ Login เข้าใช้งานไม่ได้
- สถานะ: เสร็จ 

#### จุดตรวจเฟส 1
- test ที่ต้องผ่านทั้งหมด: `test_AC_SBH_03_only_finished_activity_allowed`, `test_AC_SBH_06_reject_unauthenticated_access`, `hours-submission-navigation.test.jsx` และ test เฟส 0 ทั้งหมด
- เปิดระบบ: backend `cd backend && PYTHONPATH=.. uvicorn app.main:app --reload`; frontend `cd frontend && npm run dev -- --host 0.0.0.0`
- คนลองเองตาม AC-SBH-03 และ AC-SBH-06:
  Given มีทั้งกิจกรรมที่จบแล้วและยังไม่จบ และเปิดหน้าด้วยบัญชีกรรมการสโมสร
  When เลือกเมนูส่งข้อมูลชั่วโมง แล้วลองเปิดกิจกรรมที่ยังไม่จบและลองเข้าโดยไม่ Login
  Then เปิดข้อมูลได้เฉพาะกิจกรรมที่จบแล้ว และผู้ที่ไม่ Login ถูกปฏิเสธ
- ยังขาด: ไม่มี

## เฟส 2: สร้างและตรวจ preview ไฟล์จากข้อมูลกิจกรรม (AC-SBH-04)

### T-06 เปิด API ข้อมูลผู้เข้าร่วม Staff และประเภทชั่วโมง
- รองรับ: FR-SBH-02, ASM-05
- ตรวจด้วย: AC-SBH-04
- ไฟล์ที่แตะ: `backend/app/api/activity_data.py`, `backend/app/schemas/hours_submission.py`, `backend/app/main.py`, `backend/tests/test_AC_SBH_04_generate_excel_from_activity_data.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-04
- เสร็จเมื่อ: API คืนข้อมูลผู้เข้าร่วม Staff และประเภทชั่วโมงทั้งหมดระดับกิจกรรมเฉพาะกิจกรรมที่จบแล้ว
- สถานะ: เสร็จ

### T-07 เปิด template registry จาก config
- รองรับ: FR-SBH-03, IF-TPL-01, ASM-04
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-08 และ T-10
- ไฟล์ที่แตะ: `backend/app/models/template_config.py`, `backend/app/services/template_registry.py`, `backend/app/api/template_config.py`, `backend/app/main.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: registry อ่าน template ID/เวอร์ชันจาก config และ API คืนเฉพาะ template ที่พร้อมใช้โดยไม่ hardcode template ในโค้ด
- สถานะ: พร้อมทำ

### T-08 สร้างไฟล์ Excel และ preview ผ่าน API
- รองรับ: FR-SBH-03, FR-SBH-04, IF-TPL-01
- ตรวจด้วย: AC-SBH-04
- ไฟล์ที่แตะ: `backend/app/services/excel_generator.py`, `backend/app/api/hours_submission.py`, `backend/app/schemas/hours_submission.py`, `backend/tests/test_AC_SBH_04_generate_excel_from_activity_data.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-06, T-07
- เสร็จเมื่อ: `POST /hours-submissions/preview` สร้างไฟล์/ข้อมูล preview จากข้อมูลกิจกรรมโดยใช้ template ID/เวอร์ชันจาก registry ได้
- สถานะ: พร้อมทำ

### T-09 แสดง preview และให้กรรมการตรวจความครบถ้วน
- รองรับ: FR-SBH-03, FR-SBH-04
- ตรวจด้วย: AC-SBH-04 และเป็นส่วนเตรียมข้อมูลของ AC-SBH-01
- ไฟล์ที่แตะ: `frontend/src/api/client.js`, `frontend/src/pages/HoursSubmission.jsx`, `frontend/src/__tests__/hours-submission.test.jsx`
- แบบหน้าจอ: ไม่มี mockup ใน feature นี้
- ต้องทำหลัง: T-08
- เสร็จเมื่อ: หน้าส่งชั่วโมงเรียก preview API จริงผ่าน client และแสดงข้อมูลจากไฟล์ให้กรรมการตรวจสอบก่อนยืนยัน
- สถานะ: พร้อมทำ

### T-10 แสดงและจัดการ template ที่พร้อมใช้สำหรับแอดมิน
- รองรับ: FR-SBH-03, IF-TPL-01, ASM-04
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ AC-SBH-04
- ไฟล์ที่แตะ: `frontend/src/api/client.js`, `frontend/src/pages/TemplateAdmin.jsx`, `frontend/src/App.jsx`, `frontend/src/__tests__/template-admin.test.jsx`
- แบบหน้าจอ: ไม่มี mockup ใน feature นี้
- ต้องทำหลัง: T-07
- เสร็จเมื่อ: หน้าแอดมินแสดง template ID/เวอร์ชันจาก registry และเลือกใช้งานได้โดยไม่ฝังรายการ template ในหน้า
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 2
- test ที่ต้องผ่านทั้งหมด: `test_AC_SBH_04_generate_excel_from_activity_data`, `hours-submission.test.jsx`, `template-admin.test.jsx` และ test ของเฟสก่อนหน้าทั้งหมด
- เปิดระบบ: backend `cd backend && PYTHONPATH=.. uvicorn app.main:app --reload`; frontend `cd frontend && npm run dev -- --host 0.0.0.0`
- คนลองเองตาม AC-SBH-04:
  Given กิจกรรมจบแล้วมีผู้เข้าร่วม Staff ประเภทชั่วโมง และ template ที่พร้อมใช้งานใน config
  When กรรมการเปิดกิจกรรมและระบบสร้าง preview
  Then เห็นข้อมูลผู้เข้าร่วม/Staff ประเภทชั่วโมงระดับกิจกรรม และ preview ใช้ template ID/เวอร์ชันที่กำหนดใน config
- ยังขาด: Q-02 ยังไม่กำหนดช่องทางแก้ข้อมูลผิดก่อนส่ง; การแก้ไขข้อมูลใน preview จึงยังไม่รวมในเฟสนี้

## เฟส 3: เตรียมส่วนส่งเข้าคิวของ flow ส่งชั่วโมง (AC-SBH-01 บางส่วนที่ไม่ติด Q-03)

### T-11 เปิด API ส่งรายการเข้าสู่คิว UC-07
- รองรับ: FR-SBH-05, IF-UC07-01, CON-NFR-21
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-17
- ไฟล์ที่แตะ: `backend/app/api/review_queue.py`, `backend/app/services/review_queue_service.py`, `backend/app/main.py`, `backend/tests/test_review_queue_service.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: API ที่ผ่านการยืนยันตัวตนรับรายการส่งที่สร้างแล้วและเพิ่มรายการนั้นในคิว UC-07 ได้ โดยไม่ตัดสินสถานะพร้อมของ UC-04 แทนทีม
- สถานะ: พร้อมทำ

#### จุดตรวจเฟส 3
- test ที่ต้องผ่านทั้งหมด: `test_review_queue_service.py` และ test ของเฟสก่อนหน้าทั้งหมด
- เปิดระบบ: backend `cd backend && PYTHONPATH=.. uvicorn app.main:app --reload`; frontend `cd frontend && npm run dev -- --host 0.0.0.0`
- คนลองเองตาม IF-UC07-01:
  Given มีรายการส่งที่บันทึกแล้วและผู้ใช้ยืนยันตัวตน
  When เรียก API ส่งรายการนั้นเข้าคิว
  Then มีรายการในคิว UC-07 อ้างถึงรายการส่งที่ถูกต้อง
- ยังขาด: AC-SBH-01 ยังไม่ครบ ต้องรอการกำหนดสถานะพร้อมจาก UC-04 และคำตอบ Q-03 ก่อนเชื่อมการยืนยันจากหน้าจอ

## เฟส 4: เสนอทางเลือก UC-11 เมื่อเกินกำหนด (AC-SBH-05)

### T-12 ตรวจ deadline ของกิจกรรม
- รองรับ: FR-SBH-07, ASM-03
- ตรวจด้วย: AC-SBH-05
- ไฟล์ที่แตะ: `backend/app/services/deadline_check.py`, `backend/app/api/hours_submission.py`, `backend/app/schemas/hours_submission.py`, `backend/tests/test_AC_SBH_05_show_exception_link_when_deadline_exceeded.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-04
- เสร็จเมื่อ: service ระบุกรณีที่มี deadline ชัดเจนและเกินกำหนด โดยไม่กำหนด deadline ปกติขึ้นเอง
- สถานะ: เสร็จ 

### T-13 แสดงทางเลือกไป UC-11 ในหน้าส่งชั่วโมง
- รองรับ: FR-SBH-07, ASM-03
- ตรวจด้วย: AC-SBH-05
- ไฟล์ที่แตะ: `frontend/src/api/client.js`, `frontend/src/pages/HoursSubmission.jsx`, `frontend/src/__tests__/hours-submission.test.jsx`
- แบบหน้าจอ: ไม่มี mockup ใน feature นี้
- ต้องทำหลัง: T-12
- เสร็จเมื่อ: เมื่อ API แจ้งว่ากำหนดส่งของกิจกรรมเลยแล้ว หน้าจอเสนอทางเลือก/ลิงก์ไป UC-11 โดยไม่สร้าง workflow ขอผ่อนผันในฟีเจอร์นี้
- สถานะ: เสร็จ

#### จุดตรวจเฟส 4
- test ที่ต้องผ่านทั้งหมด: `test_AC_SBH_05_show_exception_link_when_deadline_exceeded`, `hours-submission.test.jsx` และ test ของเฟสก่อนหน้าทั้งหมด
- เปิดระบบ: backend `cd backend && PYTHONPATH=.. uvicorn app.main:app --reload`; frontend `cd frontend && npm run dev -- --host 0.0.0.0`
- คนลองเองตาม AC-SBH-05:
  Given กิจกรรมมี deadline ที่กองกิจระบุไว้และกำหนดนั้นผ่านไปแล้ว
  When กรรมการเปิดหน้าส่งข้อมูลชั่วโมง
  Then หน้าจอเสนอทางเลือกไป UC-11 โดยไม่เริ่มคำขอผ่อนผันในฟีเจอร์นี้
- ยังขาด: ไม่มี หากไม่มี deadline ที่กำหนด ระบบไม่ควรแสดงข้อเสนอจากเงื่อนไขนี้

## เฟส 5: รอคำตอบทีมก่อนทำ flow ส่งและจัดการข้อมูลผิด

### T-14 กำหนด mapping สถานะเลขสรุปจาก UC-04
- รองรับ: FR-SBH-06, IF-PRJNUM-01
- ตรวจด้วย: AC-SBH-01, AC-SBH-02
- ไฟล์ที่แตะ: `backend/app/api/project_number.py`, `backend/app/schemas/hours_submission.py`, `backend/app/main.py`, `backend/tests/test_project_number_status.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: spec ระบุค่า status ของ UC-04 ที่หมายถึงพร้อม/ไม่พร้อม และเงื่อนไข `is_ready` ทั้งกรณีมีและไม่มีข้อมูล ก่อนสร้าง API mapping
- สถานะ: รอคำตอบจากทีม (ยังไม่มี Q-ID สำหรับประเด็นนี้)

### T-15 แสดงสถานะเลขและบล็อกการส่งเมื่อยังไม่พร้อม
- รองรับ: FR-SBH-06, IF-PRJNUM-01
- ตรวจด้วย: AC-SBH-02
- ไฟล์ที่แตะ: `backend/app/api/hours_submission.py`, `backend/app/services/submission_guard.py`, `frontend/src/api/client.js`, `frontend/src/pages/HoursSubmission.jsx`, `backend/tests/test_AC_SBH_02_block_when_project_number_missing.py`, `frontend/src/__tests__/hours-submission.test.jsx`
- แบบหน้าจอ: ไม่มี mockup ใน feature นี้
- ต้องทำหลัง: T-14
- เสร็จเมื่อ: เมื่อสถานะจาก UC-04 ระบุว่าเลขยังไม่พร้อม ระบบแสดง “ขอเลขสรุปจากกองกิจ” และบล็อกทั้งตอนเปิดหน้าและตอนส่ง
- สถานะ: รอคำตอบจากทีมเรื่อง mapping สถานะ UC-04

### T-16 กำหนดช่องทางแก้ข้อมูลผิดก่อนส่ง
- รองรับ: FR-SBH-04, Q-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานต่อยอดของ T-09 และ T-17
- ไฟล์ที่แตะ: `backend/app/services/hours_review.py`, `frontend/src/api/client.js`, `frontend/src/pages/HoursSubmission.jsx`, `frontend/src/__tests__/hours-submission.test.jsx`
- แบบหน้าจอ: ไม่มี mockup ใน feature นี้
- ต้องทำหลัง: T-09
- เสร็จเมื่อ: ทีมตอบ Q-02 แล้ว และ flow แก้ไข/ย้อนกลับต้นทางทำตามคำตอบโดยไม่แต่งช่องทางแทนทีม
- สถานะ: รอ Q-02

### T-17 ยืนยันและส่งไฟล์เข้าสู่คิว UC-07
- รองรับ: FR-SBH-04, FR-SBH-05, IF-PRJNUM-01, IF-UC07-01
- ตรวจด้วย: AC-SBH-01
- ไฟล์ที่แตะ: `backend/app/api/hours_submission.py`, `backend/app/services/submission_workflow.py`, `frontend/src/api/client.js`, `frontend/src/pages/HoursSubmission.jsx`, `backend/tests/test_AC_SBH_01_submit_success.py`, `frontend/src/__tests__/hours-submission.test.jsx`
- แบบหน้าจอ: ไม่มี mockup ใน feature นี้
- ต้องทำหลัง: T-08, T-11, T-14 และ T-16
- เสร็จเมื่อ: หลังทีมตอบ Q-03 และกำหนด mapping สถานะพร้อมแล้ว กรรมการยืนยันส่งหลังตรวจ preview ระบบสร้างไฟล์และส่งรายการเข้าคิว UC-07 สำเร็จ
- สถานะ: รอ Q-03 และคำตอบเรื่อง mapping สถานะ UC-04

## ตารางตรวจความครบ

### Acceptance Criteria

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-SBH-01 | T-17 |
| AC-SBH-02 | T-15 |
| AC-SBH-03 | T-04, T-05 |
| AC-SBH-04 | T-06, T-08, T-09 |
| AC-SBH-05 | T-12, T-13 |
| AC-SBH-06 | T-04, T-05 |

### Constraints

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-NFR-21 | T-04, T-05, T-11, T-15, T-17 |
| IF-TPL-01 | T-07, T-08, T-10 |
| IF-PRJNUM-01 | T-03, T-14, T-15, T-17 |
| IF-UC07-01 | T-03, T-11, T-17 |

### Functional Requirements

| FR ID | AC ที่ตรวจ FR นี้ | เฟส |
|---|---|---|
| FR-SBH-01 | AC-SBH-03 | เฟส 0, เฟส 1 |
| FR-SBH-02 | AC-SBH-04 | เฟส 0, เฟส 2 |
| FR-SBH-03 | AC-SBH-04 | เฟส 2 |
| FR-SBH-04 | AC-SBH-01 | เฟส 2, เฟส 5 |
| FR-SBH-05 | AC-SBH-01 | เฟส 0, เฟส 3, เฟส 5 |
| FR-SBH-06 | AC-SBH-02 | เฟส 0, เฟส 5 |
| FR-SBH-07 | AC-SBH-05 | เฟส 4 |

## สิ่งที่ยังไม่ทำ

- Q-01 Exception 2a ระบุว่าเป็น “จุด bottleneck ที่มีความเสี่ยงสูง” - ต้องการมาตรการเพิ่มเติม (เช่น แจ้งเตือนกองกิจให้ออกเลขเร็วขึ้น) นอกเหนือจากการบล็อกหน้าจอหรือไม่? ยังไม่มี FR รองรับ จึงไม่มี task implementation
- Q-02 หากกรรมการตรวจสอบไฟล์ (ขั้นที่ 4) แล้วพบข้อมูลผิด (เช่น รายชื่อ/ประเภทชั่วโมงไม่ถูกต้อง) มีช่องทางแก้ไขก่อนส่งหรือไม่ หรือต้องย้อนกลับไปแก้จากต้นทาง (ระบบรายชื่อผู้เข้าร่วม/Staff)? รอ T-16
- Q-03 ขั้นที่ 5 ของ Main Flow (“ระบบส่ง/แสดงเอกสารของเจ้าหน้าที่กองกิจ”) หมายถึงส่งเข้าคิว UC-07 ทันทีหลังกรรมการยืนยัน หรือมีขั้นตอนยืนยันเพิ่มเติมอีกขั้นหนึ่งหรือไม่? รอ T-17
- การแปลค่า `ProjectNumberStatus.status` จาก UC-04 เป็นพร้อม/ไม่พร้อม และการกำหนด `is_ready` เมื่อไม่มีข้อมูลยังไม่ระบุใน spec และไม่พบหลักฐานในโค้ด UC-04; รอทีมตรวจสอบและบันทึกข้อกำหนดลง `spec.md` ก่อน T-14 และ T-15
