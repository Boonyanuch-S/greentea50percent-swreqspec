# Tasks: ส่งข้อมูลชั่วโมง

- Feature: ส่งข้อมูลชั่วโมง (Submit Activity-Hours File)
- Spec ID: SPEC-SBH-002
- อ้างอิง: `specs/002-ส่งข้อมูลชั่วโมง/plan.md`
- วันที่: 2569-10-01
- สรุป: มีทั้งหมด 17 tasks และมี 4 tasks ที่ต้องรอ Open Questions
- งานที่ต้องรอ Open Questions: T-08 รอ Q-02, T-14 รอ Q-03, T-15 รอ Q-02 และ Q-03 และ T-17 รอ Q-02 และ Q-03; Q-01 ยังไม่มี task implementation เพราะ spec ยังไม่ได้กำหนดมาตรการเพิ่มเติมเป็น FR

## รายการ task

### T-01 สร้างโมเดลกิจกรรมและผู้เกี่ยวข้อง
- รองรับ: FR-SBH-01, FR-SBH-02, ASM-05
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-02, T-03 และ T-04
- ไฟล์ที่แตะ: `backend/app/models/hours_submission.py`, `backend/app/repositories/activity.py`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: มีโมเดล Activity, ActivityParticipant, ActivityStaff และ ActivityHourType โดยประเภทชั่วโมงผูกกับกิจกรรม ไม่ใช่รายบุคคล
- สถานะ: พร้อมทำ

### T-02 สร้าง query กิจกรรมที่จบแล้ว
- รองรับ: FR-SBH-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-05
- ไฟล์ที่แตะ: `backend/app/repositories/activity.py`, `backend/app/services/activity_access.py`
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: query คืนเฉพาะกิจกรรมที่มีสถานะ "จบแล้ว" และไม่คืนกิจกรรมที่ยังไม่จบ
- สถานะ: พร้อมทำ

### T-03 สร้างบริการดึงรายชื่อและประเภทชั่วโมง
- รองรับ: FR-SBH-02, ASM-05
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-07
- ไฟล์ที่แตะ: `backend/app/services/hours_data.py`, `backend/app/repositories/activity.py`
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: บริการคืนรายชื่อผู้เข้าร่วมและ Staff พร้อมประเภทชั่วโมงเดียวที่ผูกระดับกิจกรรม โดยไม่มีการกำหนดประเภทแยกรายบุคคล
- สถานะ: พร้อมทำ

### T-04 สร้างโมเดลเลขสรุปและรายการส่ง
- รองรับ: FR-SBH-05, FR-SBH-06, IF-PRJNUM-01, IF-UC07-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-06 และ T-14
- ไฟล์ที่แตะ: `backend/app/models/hours_submission.py`, `backend/app/repositories/submission.py`
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: มีโมเดล ProjectNumberStatus, HoursSubmission และ ReviewQueueEntry สำหรับบันทึกสถานะเลขสรุป รายการส่ง และรายการเข้าคิว
- สถานะ: พร้อมทำ

### T-05 สร้าง API ตรวจสิทธิ์และเปิดหน้าส่งชั่วโมง
- รองรับ: FR-SBH-01, CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: AC-SBH-03, AC-SBH-06
- ไฟล์ที่แตะ: `backend/app/middleware/auth.py`, `backend/app/api/hours_submission.py`, `backend/app/schemas/hours_submission.py`
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: `GET /activities/{activityId}/hours-submission` เปิดได้เฉพาะกิจกรรมที่จบแล้วสำหรับผู้ใช้ที่ยืนยันตัวตน และปฏิเสธผู้ใช้ที่ไม่มี Login
- สถานะ: พร้อมทำ

### T-06 สร้าง API ตรวจสถานะเลขสรุปโครงการ
- รองรับ: FR-SBH-06, IF-PRJNUM-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-13 และ T-14
- ไฟล์ที่แตะ: `backend/app/api/project_number.py`, `backend/app/schemas/hours_submission.py`
- ต้องทำหลัง: T-04
- เสร็จเมื่อ: `GET /project-number/status/{activityId}` คืนสถานะเลขสรุปจาก UC-04 และระบุได้ว่าเลขพร้อมหรือยังไม่พร้อม
- สถานะ: พร้อมทำ

### T-07 สร้าง API ดึงข้อมูลผู้เข้าร่วม Staff และประเภทชั่วโมง
- รองรับ: FR-SBH-02, ASM-05
- ตรวจด้วย: AC-SBH-04
- ไฟล์ที่แตะ: `backend/app/api/activity_data.py`, `backend/app/schemas/hours_submission.py`
- ต้องทำหลัง: T-03, T-05
- เสร็จเมื่อ: API คืนรายชื่อผู้เข้าร่วม/Staff และประเภทชั่วโมงระดับกิจกรรมสำหรับกิจกรรมที่จบแล้วครบถ้วน
- สถานะ: พร้อมทำ

### T-08 กำหนดช่องทางแก้ข้อมูลก่อนส่ง
- รองรับ: FR-SBH-04, Q-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานที่ต้องรอ Q-02
- ไฟล์ที่แตะ: `backend/app/services/hours_review.py`, `frontend/src/pages/HoursSubmission.jsx`
- ต้องทำหลัง: T-07
- เสร็จเมื่อ: ทีมกำหนดแล้วว่าข้อมูลผิดใน preview แก้ในหน้านี้หรือย้อนกลับต้นทาง และมี flow ตามคำตอบนั้น
- สถานะ: รอ Q-02

### T-09 สร้าง template registry จาก config
- รองรับ: FR-SBH-03, IF-TPL-01, ASM-04
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-10 และ T-11
- ไฟล์ที่แตะ: `backend/app/models/template_config.py`, `backend/app/services/template_registry.py`, `backend/app/api/template_config.py`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: ระบบอ่าน template ID/เวอร์ชันจาก config และ `GET /config/templates` คืนเฉพาะ template ที่พร้อมใช้โดยไม่ hardcode template ในโค้ด
- สถานะ: พร้อมทำ

### T-10 สร้างบริการสร้างไฟล์ Excel และ preview
- รองรับ: FR-SBH-03, FR-SBH-04, IF-TPL-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-11 และ T-16
- ไฟล์ที่แตะ: `backend/app/services/excel_generator.py`, `backend/app/api/hours_submission.py`, `backend/app/schemas/hours_submission.py`
- ต้องทำหลัง: T-07, T-09
- เสร็จเมื่อ: `POST /hours-submissions/preview` สร้าง preview จากข้อมูลกิจกรรมและ template config พร้อมรายการข้อมูลให้กรรมการตรวจสอบก่อนส่ง
- สถานะ: พร้อมทำ

### T-11 สร้างหน้าจอส่งชั่วโมงด้วย API จำลอง
- รองรับ: FR-SBH-01, FR-SBH-03, FR-SBH-04, FR-SBH-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-12, T-13 และ T-16
- ไฟล์ที่แตะ: `frontend/src/pages/HoursSubmission.jsx`, `frontend/src/api/hoursSubmissionMock.js`, `frontend/src/App.jsx`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: หน้าจอเลือกกิจกรรมที่จบแล้ว แสดง preview ไฟล์ สถานะเลขสรุป และปุ่มส่งที่ถูกบล็อกเมื่อเลขยังไม่พร้อมจาก mock API ตาม plan.md
- สถานะ: เสร็จ รอทีมตรวจ

### T-12 สร้างหน้าจอจัดการ template สำหรับแอดมิน
- รองรับ: IF-TPL-01, ASM-04
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-16
- ไฟล์ที่แตะ: `frontend/src/pages/TemplateAdmin.jsx`, `frontend/src/api/hoursSubmissionMock.js`
- ต้องทำหลัง: T-09
- เสร็จเมื่อ: หน้าแอดมินแสดง template ID/เวอร์ชันที่พร้อมใช้งานและรองรับการเลือก template จาก registry โดยไม่ฝัง template ในหน้า
- สถานะ: พร้อมทำ

### T-13 แสดงสถานะเลขสรุปและบล็อกการส่ง
- รองรับ: FR-SBH-06, IF-PRJNUM-01
- ตรวจด้วย: AC-SBH-02
- ไฟล์ที่แตะ: `backend/app/api/hours_submission.py`, `backend/app/services/submission_guard.py`, `frontend/src/pages/HoursSubmission.jsx`
- ต้องทำหลัง: T-06, T-11
- เสร็จเมื่อ: เมื่อเลขสรุปยังไม่พร้อม ระบบแสดง "ขอเลขสรุปจากกองกิจ" และไม่อนุญาตให้ยืนยันส่งทั้งตอนเปิดหน้าและตอน submit
- สถานะ: พร้อมทำ

### T-14 กำหนดขั้นตอนยืนยันส่งและคิว UC-07
- รองรับ: FR-SBH-05, IF-UC07-01, Q-03
- ตรวจด้วย: AC-SBH-01
- ไฟล์ที่แตะ: `backend/app/api/hours_submission.py`, `backend/app/api/review_queue.py`, `backend/app/services/submission_workflow.py`
- ต้องทำหลัง: T-04, T-06, T-10, T-13
- เสร็จเมื่อ: หลังทีมตอบ Q-03 แล้ว `POST /hours-submissions/submit` สร้างไฟล์และส่งรายการเข้าสู่คิว UC-07 ตามขั้นตอนยืนยันที่ตกลง
- สถานะ: รอ Q-03

### T-15 ต่อ flow ยืนยันส่งในหน้าจอ
- รองรับ: FR-SBH-04, FR-SBH-05, Q-02, Q-03
- ตรวจด้วย: AC-SBH-01
- ไฟล์ที่แตะ: `frontend/src/pages/HoursSubmission.jsx`, `frontend/src/api/hoursSubmissionMock.js`, `frontend/src/App.jsx`
- ต้องทำหลัง: T-08, T-11, T-14
- เสร็จเมื่อ: หน้าจอให้ตรวจข้อมูลก่อนส่งและดำเนินขั้นตอนยืนยัน/ส่งเข้าคิวตามคำตอบ Q-02 และ Q-03 ได้ครบ
- สถานะ: รอ Q-02 และ Q-03

### T-16 เสนอทางเลือกไป UC-11 เมื่อเกินกำหนด
- รองรับ: FR-SBH-07, ASM-03
- ตรวจด้วย: AC-SBH-05
- ไฟล์ที่แตะ: `backend/app/services/deadline_check.py`, `frontend/src/pages/HoursSubmission.jsx`
- ต้องทำหลัง: T-11
- เสร็จเมื่อ: เมื่อกิจกรรมมี deadline ที่กำหนดไว้และเลยกำหนด หน้าจอเสนอทางเลือก/ลิงก์ไป UC-11 โดยไม่สร้าง workflow ขอผ่อนผันในฟีเจอร์นี้
- สถานะ: พร้อมทำ

### T-17 ทดสอบ flow ส่งชั่วโมงครบทุก AC
- รองรับ: FR-SBH-01, FR-SBH-02, FR-SBH-03, FR-SBH-04, FR-SBH-05, FR-SBH-06, FR-SBH-07, NFR-SEC-01
- ตรวจด้วย: AC-SBH-01, AC-SBH-02, AC-SBH-03, AC-SBH-04, AC-SBH-05, AC-SBH-06
- ไฟล์ที่แตะ: `backend/tests/test_AC_SBH_01_submit_success.py`, `backend/tests/test_AC_SBH_02_block_when_project_number_missing.py`, `backend/tests/test_AC_SBH_03_only_finished_activity_allowed.py`, `backend/tests/test_AC_SBH_04_generate_excel_from_activity_data.py`, `backend/tests/test_AC_SBH_05_show_exception_link_when_deadline_exceeded.py`, `backend/tests/test_AC_SBH_06_reject_unauthenticated_access.py`, `frontend/src/__tests__/hours-submission.test.jsx`
- ต้องทำหลัง: T-05, T-07, T-10, T-13, T-14, T-15, T-16
- เสร็จเมื่อ: test ที่ตั้งชื่อตาม AC-SBH-01 ถึง AC-SBH-06 ผ่านและ trace กลับไปยัง FR/constraint ใน spec ได้ครบ
- สถานะ: รอ Q-02 และ Q-03

## ตารางตรวจความครบ

### Acceptance Criteria

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-SBH-01 | T-14, T-15, T-17 |
| AC-SBH-02 | T-13, T-17 |
| AC-SBH-03 | T-05, T-17 |
| AC-SBH-04 | T-07, T-17 |
| AC-SBH-05 | T-16, T-17 |
| AC-SBH-06 | T-05, T-17 |

### Constraints

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-NFR-21 | T-05, T-17 |
| IF-TPL-01 | T-09, T-10, T-12, T-17 |
| IF-PRJNUM-01 | T-06, T-13, T-17 |
| IF-UC07-01 | T-04, T-14, T-17 |

## สิ่งที่ยังไม่ทำ

- Q-01 Exception 2a ระบุว่าเป็น "จุด bottleneck ที่มีความเสี่ยงสูง" และถามว่าต้องมีมาตรการเพิ่มเติมนอกเหนือจากการบล็อกหน้าจอหรือไม่
  - task ที่รอ: ยังไม่มี task implementation เพราะ spec ยังไม่ระบุ FR สำหรับมาตรการเพิ่มเติม จึงไม่เดาคำตอบหรือสร้างฟีเจอร์เพิ่ม
- Q-02 หากกรรมการตรวจสอบไฟล์แล้วพบข้อมูลผิด มีช่องทางแก้ไขก่อนส่งหรือไม่ หรือย้อนกลับไปแก้จากต้นทาง
  - task ที่รอ: T-08 และ T-15
- Q-03 ขั้นตอนที่ 5 ส่งเข้าคิว UC-07 ทันทีหลังยืนยัน หรือมีการยืนยันเพิ่มเติม
  - task ที่รอ: T-14 และ T-15
