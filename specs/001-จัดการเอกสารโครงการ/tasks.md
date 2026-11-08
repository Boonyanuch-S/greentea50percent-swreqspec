# Tasks: จัดการเอกสารโครงการ

- Feature: จัดการเอกสารโครงการ (Project Document Management)
- Spec ID: SPEC-PRJDOC-001
- อ้างอิง: `specs/001-จัดการเอกสารโครงการ/plan.md`
- วันที่: 2569-10-01 | อัปเดตตามงานจริง: 2569-11-03 (อ้างอิง `rtm.md` ที่สร้างเมื่อ 2569-11-02)
- สรุป: มีทั้งหมด 19 tasks เรียงตามการพึ่งพาของข้อมูล, API, หน้าจอ และการทดสอบตาม spec v1
- สถานะ ณ 2569-11-03: ทำแล้วรอทีมตรวจ 12 (T-01 ถึง T-03, T-05 ถึง T-13 บางข้อยังขึ้นกับ Q), ไม่ได้ทำตาม plan 1 (T-04), test ตาม AC ยังไม่ครบ 6 (T-14 ถึง T-19)

### T-01 กำหนดสัญญาข้อมูลโครงการและผู้ใช้
- รองรับ: FR-PRJ-01, FR-PRJ-02, CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-02, T-03, T-04 และ T-05
- ไฟล์ที่แตะ: `backend/` โมดูลโมเดลข้อมูลตามโครงใน plan.md, `frontend/src/` สัญญาข้อมูลฟอร์มตามโครงใน plan.md
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: มีสัญญาฟิลด์ ProjectDocument และ AuthenticatedUserReference ที่ใช้ร่วมกันระหว่าง API และหน้าจอ
- สถานะ: ทำแล้ว รอทีมตรวจ
- หมายเหตุ 2569-11-03: โมเดลอยู่ที่ `backend/app/models/project_document.py` และใช้ `AuthenticatedUserContext` จาก Token จริง; ยังไม่มี club_id เพราะเรื่องสิทธิ์ระดับสโมสรรอ Q-05

### T-02 ตรวจสิทธิ์ก่อนเข้าถึงฟีเจอร์
- รองรับ: CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-19
- ไฟล์ที่แตะ: `backend/` middleware/API dependency ตามโครงใน plan.md, `frontend/src/` route guard ตามโครงใน plan.md
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: คำขอที่ไม่มี authentication reference ถูกปฏิเสธทั้งหน้าจอและ API และคำขอที่ผ่านการยืนยันตัวตนไปต่อได้
- สถานะ: ทำแล้วฝั่ง API รอทีมตรวจ
- หมายเหตุ 2569-11-03: `require_club` ใน `backend/app/routers/project_documents.py` ตรวจ Token จริงและบทบาทกรรมการสโมสร; หน้าจอกันด้วย `AppRoutes` ใน `App.jsx` (ไม่ได้ใช้ `AuthGuard.jsx` ดู F-011 ใน rtm.md)
- หมายเหตุ 2569-10-29: หน้าจอ prototype แสดงหน้า login เมื่อยังไม่มี session (จาก specs/009) แต่ฝั่ง API ยังไม่ได้ตรวจสิทธิ์ (ล้าสมัย ดูหมายเหตุ 2569-11-03)

### T-03 สร้างฟอร์มโครงการใหม่ด้วย API จำลอง
- รองรับ: FR-PRJ-01, FR-PRJ-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-12 และ T-16
- ไฟล์ที่แตะ: `frontend/src/` หน้าฟอร์มเอกสารโครงการและ API mock ตามโครงใน plan.md
  (ที่ทำจริง: `frontend/src/pages/ProjectDocumentForm.jsx`, `frontend/src/pages/ProjectDocumentsPage.jsx`, `frontend/src/services/projectDocumentMock.js`)
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: หน้าสร้างโครงการใหม่แสดงฟอร์มเปล่าพร้อมช่องชื่อโครงการ วัตถุประสงค์ วันที่ สถานที่ และตัวชี้วัดจาก API จำลอง
- สถานะ: เสร็จ รอทีมตรวจ
- หมายเหตุ 2569-11-03: หน้าฟอร์มต่อกับ API จริงแล้ว (`frontend/src/api/client.js`); ฟอร์มเปล่าสร้างฝั่งหน้าบ้านใน `getNewProjectForm`

### T-04 สร้าง endpoint ฟอร์มโครงการใหม่
- รองรับ: FR-PRJ-01, FR-PRJ-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-13
- ไฟล์ที่แตะ: `backend/` endpoint `GET /project-documents/new` และ schema ตามโครงใน plan.md
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: endpoint ส่งสัญญาฟอร์มเปล่าสำหรับผู้ใช้ที่ผ่านการยืนยันตัวตนได้
- สถานะ: ไม่ได้ทำตาม plan รอ Q-02
- หมายเหตุ 2569-11-03: ไม่มี endpoint `GET /project-documents/new` ฟอร์มเปล่าสร้างใน `api/client.js: getNewProjectForm` ตาม ASM-02 (F-007 ใน rtm.md) ทีมต้องตัดสินว่าจะทำ endpoint ตาม plan หรือแก้ plan

### T-05 อ่าน Checklist ตามกิจกรรม
- รองรับ: FR-PRJ-03, IF-CHK-01
- ตรวจด้วย: AC-PRJ-04
- ไฟล์ที่แตะ: `backend/` ChecklistItem และ endpoint `GET /project-documents/{project_id}/checklist` ตามโครงใน plan.md
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: API ส่งรายการ Checklist ที่กำหนดไว้สำหรับกิจกรรมนั้นได้โดยไม่สร้างกลไกดูแล Checklist ใหม่
- สถานะ: ทำแบบชั่วคราว รอ Q-01
- หมายเหตุ 2569-11-03: `GET /project-documents/checklist` คืนค่าคงที่ `PROJECT_CHECKLIST` 3 รายการ (เล่มโครงการ, กส 002, ใบแนบกิจกรรม) ทุกกิจกรรมได้ชุดเดียวกัน ยังไม่แยกตามกิจกรรมตาม AC-PRJ-04 (F-002 ใน rtm.md); path จริงไม่มี `{project_id}`

### T-06 แสดง Checklist ด้วย API จำลอง
- รองรับ: FR-PRJ-03, IF-CHK-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-12 และ T-17
- ไฟล์ที่แตะ: `frontend/src/` หน้า Checklist และ API mock ตามโครงใน plan.md
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: หน้าจอแสดงรายการเอกสารที่ต้องแนบของกิจกรรมจาก API จำลอง
- สถานะ: ทำแล้ว ต่อ API จริงแล้ว รอทีมตรวจ; Checklist ยังชั่วคราว รอ Q-01

### T-07 รับเอกสารแนบตาม Checklist
- รองรับ: FR-PRJ-04, IF-CHK-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-08, T-09 และ T-13
- ไฟล์ที่แตะ: `backend/` endpoint `POST /project-documents/{project_id}/attachments` และ ProjectAttachment ตามโครงใน plan.md
- ต้องทำหลัง: T-01, T-05
- เสร็จเมื่อ: API รับไฟล์และผูกไฟล์กับ project_id และ checklist_item_id ได้
- สถานะ: ทำแล้ว รอทีมตรวจ; เกณฑ์ยังรอ Q-01
- หมายเหตุ 2569-11-03: รับไฟล์รวมใน `POST /project-documents` (multipart) ไม่มี endpoint `/attachments` แยก; `_read_attachment` รับ PDF/JPG/PNG ไม่เกิน 10 MB ซึ่งเป็นค่าที่ทีมเลือก ไม่ได้มาจาก spec 001 (F-006); เปิดไฟล์กลับได้ที่ `GET /project-documents/{id}/attachments/{item}/file` ซึ่งยังไม่มี FR (F-009)

### T-08 แนบเอกสารด้วย API จำลอง
- รองรับ: FR-PRJ-04, IF-CHK-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-12
- ไฟล์ที่แตะ: `frontend/src/` การเลือกและส่งไฟล์แนบกับ API mock ตามโครงใน plan.md
- ต้องทำหลัง: T-03, T-06
- เสร็จเมื่อ: ผู้ใช้เลือกไฟล์ให้รายการ Checklist และหน้าจอแสดงรายการแนบล่าสุดจาก API จำลอง
- สถานะ: ทำแล้ว ต่อ API จริงแล้ว รอทีมตรวจ; Checklist ยังชั่วคราว รอ Q-01

### T-09 ตรวจความครบถ้วนก่อนส่ง
- รองรับ: FR-PRJ-07, IF-CHK-01
- ตรวจด้วย: AC-PRJ-02
- ไฟล์ที่แตะ: `backend/` service ตรวจความครบถ้วนและส่วน response ของ endpoint submit ตามโครงใน plan.md
- ต้องทำหลัง: T-05, T-07
- เสร็จเมื่อ: เมื่อมีรายการแนบขาด ระบบส่งรายการเอกสารที่ขาดและไม่สร้างคิวหรือเปลี่ยนสถานะ
- สถานะ: ทำแล้วใน backend รอทีมตรวจ; Q-03 ยังเปิด (ทำตาม FR-PRJ-07)
- หมายเหตุ 2569-11-03: `ProjectDocumentService.submit` ส่ง `MissingAttachments` และไม่เข้าคิว; มี test `test_missing_attachment_is_rejected_and_not_queued`

### T-10 บันทึกโครงการเข้าคิวเมื่อเอกสารครบ
- รองรับ: FR-PRJ-05
- ตรวจด้วย: AC-PRJ-01
- ไฟล์ที่แตะ: `backend/` endpoint submit, ReviewQueueEntry และการเปลี่ยนสถานะตามโครงใน plan.md
- ต้องทำหลัง: T-04, T-07, T-09
- เสร็จเมื่อ: การส่งโครงการที่ข้อมูลและเอกสารครบสร้างโครงการและคิว พร้อมสถานะ "รอเจ้าหน้าที่คณะตรวจสอบ"
- สถานะ: ทำแล้ว รอทีมตรวจ; Q-04 ยังไม่ปิดใน spec
- หมายเหตุ 2569-11-03: `submit`, `_queue_submission` สร้างคิวให้ UC-03; บังคับกรอกครบและห้ามวันที่ย้อนหลังตามคำสั่งทีม CHANGELOG 2569-11-02 แต่ Q-04 ยังไม่ได้บันทึกคำตอบ (F-001); ชื่อสโมสรในคิวเป็นค่าคงที่ `SAMPLE_CLUB_NAME` (F-010)

### T-11 โหลดโครงการที่ถูกตีกลับเพื่อแก้ไข
- รองรับ: FR-PRJ-06
- ตรวจด้วย: AC-PRJ-05
- ไฟล์ที่แตะ: `backend/` RejectionReason และ endpoint `GET /project-documents/{project_id}/edit`, `frontend/src/` ฟอร์มแก้ไขตามโครงใน plan.md
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: การเปิดโครงการที่ถูกตีกลับแสดงข้อมูลเดิม เหตุผลการตีกลับ และขั้นกรอกข้อมูล
- สถานะ: ทำแล้วทั้ง frontend และ backend รอ Q-05
- หมายเหตุ 2569-11-03: ใช้ `GET /project-documents/{id}` แทน `/edit`; แสดงข้อมูลเดิม เหตุผลและประวัติการตีกลับ; จำกัดให้เปิดได้เฉพาะเจ้าของรายบุคคล (`get_for_owner`) ซึ่ง rtm.md F-008 ระบุว่าเป็นการเดา Q-05

### T-12 ต่อ workflow หน้าจอกับ API จำลอง
- รองรับ: FR-PRJ-01, FR-PRJ-02, FR-PRJ-03, FR-PRJ-04, FR-PRJ-06, FR-PRJ-07
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-13 ถึง T-18
- ไฟล์ที่แตะ: `frontend/src/` API mock และหน้าฟอร์ม/Checklist/แนบเอกสาร/แก้ไขตามโครงใน plan.md
- ต้องทำหลัง: T-03, T-06, T-08, T-11
- เสร็จเมื่อ: workflow หน้าจอที่อยู่ใน scope ทำงานได้ครบด้วย API จำลองตามสัญญา โดยไม่เรียก API จริง
- สถานะ: เสร็จ ถูกแทนด้วย T-13 แล้ว
- หมายเหตุ 2569-11-03: `projectDocumentMock.js` เหลือใช้ใน test หน้าจอ และค่าคงที่ `RETURNED` ที่ `ProjectDocumentsPage` กับ `ProjectDetailPage` ยัง import อยู่ (F-004)
- หมายเหตุ: กรรมการสโมสรเข้าหน้านี้หลัง login (คำตอบ Q-01 บางส่วนของ specs/009) ไม่มีบันทึกร่างตาม ASM-03 (เรื่องตรวจความครบของฟอร์มหลัก ดู T-10)

### T-13 เชื่อมหน้าจอกับ API จริง
- รองรับ: FR-PRJ-01, FR-PRJ-02, FR-PRJ-03, FR-PRJ-04, FR-PRJ-05, FR-PRJ-06, FR-PRJ-07, CON-NFR-21, IF-CHK-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-14 ถึง T-18
- ไฟล์ที่แตะ: `frontend/src/` API client และหน้าจอ, `backend/` endpoints ตามโครงใน plan.md
- ต้องทำหลัง: T-04, T-05, T-07, T-09, T-10, T-11, T-12
- เสร็จเมื่อ: workflow ของหน้าจอทำงานกับ endpoint จริงครบตามสัญญาและยังคงตรวจสิทธิ์กับ Checklist ได้
- สถานะ: ทำแล้ว 2569-11-01 รอทีมตรวจ; รายละเอียดยังขึ้นกับ Q-01, Q-03, Q-04, Q-05
- หมายเหตุ 2569-11-03: หน้าจอต่อกับ backend จริงแบบ in-memory ตาม CHANGELOG 2569-11-01 เอกสารเดินต่อถึง UC-03 และ UC-05 ได้

### T-14 ทดสอบการส่งโครงการครบถ้วน
- รองรับ: FR-PRJ-05
- ตรวจด้วย: AC-PRJ-01
- ไฟล์ที่แตะ: `backend/` และ `frontend/src/__tests__/` ชุดทดสอบ `test_AC_PRJ_01_submit_complete_project`
- ต้องทำหลัง: T-10, T-13
- เสร็จเมื่อ: `test_AC_PRJ_01_submit_complete_project` ผ่านและยืนยันสถานะ "รอเจ้าหน้าที่คณะตรวจสอบ"
- สถานะ: ยังไม่มี test ชื่อตาม AC
- หมายเหตุ 2569-11-03: พฤติกรรมถูกตรวจใน `test_project_moves_from_club_to_completed_on_one_data_set` แต่ยังไม่ได้ตั้งชื่อ `test_AC_PRJ_01_submit_complete_project` ตามกฎข้อ 7

### T-15 ทดสอบการปฏิเสธเมื่อเอกสารไม่ครบ
- รองรับ: FR-PRJ-07
- ตรวจด้วย: AC-PRJ-02
- ไฟล์ที่แตะ: `backend/` และ `frontend/src/__tests__/` ชุดทดสอบ `test_AC_PRJ_02_reject_missing_attachment`
- ต้องทำหลัง: T-09, T-13
- เสร็จเมื่อ: `test_AC_PRJ_02_reject_missing_attachment` ผ่านและยืนยันว่าไม่มีเอกสารเข้าสู่คิว
- สถานะ: ยังไม่มี test ชื่อตาม AC; Q-03 ยังเปิด
- หมายเหตุ 2569-11-03: ฝั่ง API มี `test_missing_attachment_is_rejected_and_not_queued` แต่ไม่มี test หน้าจอว่าแสดงรายการที่ขาด (F-005); test `test_AC_PRJ_02_reason_names_documents_to_fix` ใน `review-context.test.jsx` ตรวจข้อความตีกลับของ UC-03/05 ไม่ใช่ AC-PRJ-02 (F-004)

### T-16 ทดสอบการแสดงฟอร์มโครงการใหม่
- รองรับ: FR-PRJ-01
- ตรวจด้วย: AC-PRJ-03
- ไฟล์ที่แตะ: `frontend/src/__tests__/TC-PRJ-03-*.test.jsx` และ `backend/tests/test_AC_PRJ_03.py` ตามแถว TC-PRJ-03-* ใน test-cases.md
- ต้องทำหลัง: T-03, T-12
- เสร็จเมื่อ: test ของแถว TC-PRJ-03-* ที่สถานะ "ใช้ได้" ผ่านทั้งหมด และยืนยันว่าฟอร์มเปล่าแสดงโดยยังไม่สร้างระเบียน
- หมายเหตุ 2569-11-08: ทีมตัดสินใช้ชื่อ test ตามตาราง test-cases.md (`test_TC_PRJ_03_n_…`) แทนชื่อเดียวใน plan.md ข้อ 6
- สถานะ: รอ Q-02
- หมายเหตุ 2569-11-03: test T-03 ใน `projectDocumentForm.test.jsx` ยังไม่ตรวจว่าช่องว่างและไม่ได้เริ่มจากปุ่มสร้างใหม่ (F-003); `test_AC_PRJ_03_form_requires_all_fields` ตรวจ validation ซึ่ง AC-PRJ-03 ไม่ได้สั่ง (F-004)
- หมายเหตุ 2569-10-29: มี test ใกล้เคียงแล้วใน `frontend/src/__tests__/projectDocumentForm.test.jsx` ชื่อ "T-03 แสดงฟอร์มโครงการใหม่พร้อมช่องข้อมูลหลักครบ" แต่ยังไม่ได้ตั้งชื่อตาม AC-PRJ-03 และยังไม่ได้ตรวจว่า "ยังไม่สร้างระเบียน"

### T-17 ทดสอบการแสดง Checklist กิจกรรม
- รองรับ: FR-PRJ-03, IF-CHK-01
- ตรวจด้วย: AC-PRJ-04
- ไฟล์ที่แตะ: `frontend/src/__tests__/` ชุดทดสอบ `test_AC_PRJ_04_show_activity_checklist`
- ต้องทำหลัง: T-05, T-06, T-12
- เสร็จเมื่อ: `test_AC_PRJ_04_show_activity_checklist` ผ่านและยืนยันว่า Checklist ของกิจกรรมนั้นแสดงถูกต้อง
- สถานะ: รอ Q-01
- หมายเหตุ 2569-11-03: ยังไม่มี test ว่าหน้าจอแสดง Checklist (F-005)

### T-18 ทดสอบการแก้ไขโครงการที่ถูกตีกลับ
- รองรับ: FR-PRJ-06
- ตรวจด้วย: AC-PRJ-05
- ไฟล์ที่แตะ: `backend/` และ `frontend/src/__tests__/` ชุดทดสอบ `test_AC_PRJ_05_load_rejected_project_for_edit`
- ต้องทำหลัง: T-11, T-12, T-13
- เสร็จเมื่อ: `test_AC_PRJ_05_load_rejected_project_for_edit` ผ่านและยืนยันว่าข้อมูลเดิม เหตุผล และขั้นกรอกข้อมูลแสดงครบ
- สถานะ: รอ Q-05
- หมายเหตุ 2569-11-03: มีเฉพาะ test API `test_faculty_rejection_returns_reason_and_club_resubmits`, `test_advisor_return_reaches_club_with_comment` ยังไม่มี test หน้าจอ (F-005)

### T-19 ทดสอบการปฏิเสธผู้ใช้ที่ยังไม่ Login
- รองรับ: CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: AC-PRJ-06
- ไฟล์ที่แตะ: `backend/` และ `frontend/src/__tests__/` ชุดทดสอบ `test_AC_PRJ_06_reject_unauthenticated_access`
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: `test_AC_PRJ_06_reject_unauthenticated_access` ผ่านและหน้าจอหรือ API ปฏิเสธผู้ใช้ที่ยังไม่ยืนยันตัวตน
- สถานะ: พร้อมทำ
- หมายเหตุ 2569-11-03: มีแค่กรณีบทบาทอื่นได้ 403 ใน `test_access_is_limited_by_real_token_and_role` ยังไม่มี test `/project-documents` เมื่อไม่มี Token

## ตารางตรวจความครบ: Acceptance Criteria

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-PRJ-01 | T-10, T-14 |
| AC-PRJ-02 | T-09, T-15 |
| AC-PRJ-03 | T-03, T-16 |
| AC-PRJ-04 | T-05, T-17 |
| AC-PRJ-05 | T-11, T-18 |
| AC-PRJ-06 | T-02, T-19 |

## ตารางตรวจความครบ: Constraints

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-NFR-21 | T-02, T-13, T-19 |
| IF-CHK-01 | T-05, T-06, T-07, T-08, T-09, T-13, T-17 |

## งานนอก spec ที่ทีมสั่งเพิ่ม (ยังไม่มี ID)

- 2569-10-29 หน้ารายละเอียดโครงการ `frontend/src/pages/ProjectDetailPage.jsx` และปุ่ม "ดูเอกสาร" (`showDocument` ใน `frontend/src/utils/alerts.js`) — รอทีมตัดสินว่าจะเพิ่ม FR ลง spec หรือไม่
- 2569-10-29 กล่องยืนยันก่อนส่งและก่อนยกเลิกการกรอก (SweetAlert2 ทีมเลือกเอง ไม่ได้มาจาก spec) ไม่เพิ่มความต้องการใหม่
- 2569-11-01 ข้อความแนะนำกำหนดเสนอโครงการ 1 เดือน/2 เดือนที่ช่องวันที่ (ตาม CHANGELOG ไม่บล็อกการส่ง) ตัวเลขยังไม่อยู่ใน spec (F-006)
- 2569-11-01 ถึง 11-02 เส้นทางเอกสาร (`DocumentRoute.jsx`), ประวัติการตีกลับ, ผล Checklist กลางแบบอ่านอย่างเดียว (`ReviewContext.jsx`), `GET /project-documents/central-checklist` และการเปิดไฟล์แนบ — มีบันทึกใน CHANGELOG แต่ยังไม่มี FR/AC (F-009) รอทีมตัดสินว่าจะเพิ่มลง spec หรือย้ายไปตามรอยใน 003/005
- endpoint `GET /submissions/{id}/documents`, `/history` และ `/project-approvals/{id}/review-context` อยู่ใน router ของ 001 แต่เป็นงานหลังเข้าคิวของ 003/005 (F-009)

## สิ่งที่ยังไม่ทำ

- ข้อสังเกต: plan.md เป็น v2 (อ้าง FR-PRJ-08..11, AC-PRJ-07..12) แต่ spec.md ยังเป็น v1 ทีมต้องอัปเดต spec.md ก่อนจึงจะแตก task ของส่วน v2 ได้

- Q-01 เกณฑ์ Checklist เอกสารแนบ ถูกกำหนด/ดูแลโดย use case หรือหน่วยงานใด (เช่น กองกิจ)?
  -> ต้องยืนยัน owner ของเกณฑ์นี้ก่อนออกแบบ integration
  งานที่รอ: T-05, T-06, T-07, T-08, T-13, T-17 (ตอนนี้ใช้ Checklist ชั่วคราว 3 รายการ)
- Q-02 ข้อความ Main Flow ขั้น 2 ในภาพต้นฉบับไม่สมบูรณ์/อ่านไม่ชัด -> ขอภาพที่ชัดกว่านี้ หรือยืนยันข้อความที่ถูกต้อง
  งานที่รอ: T-04, T-16
- Q-03 Exception Flow 4a ในภาพมีข้อความต่อท้ายที่ไม่สมบูรณ์ ("...ไม่ยอมให้ส่งเอกสารไม่ครบเข้ามา")
  ไม่แน่ใจว่าเป็นส่วนหนึ่งของ flow หรือหมายเหตุเพิ่มเติม -> ต้องยืนยัน
  งานที่รอ: T-09, T-13, T-15 (ตอนนี้ทำตาม FR-PRJ-07)
- Q-04 หากกรรมการแนบเอกสารครบตาม Checklist แต่กรอกข้อมูลฟอร์มหลัก (ขั้น 3) ไม่ครบ ระบบควรจัดการอย่างไร?
  (ไม่มี exception ระบุไว้สำหรับกรณีนี้ในตาราง)
  งานที่รอ: T-10, T-13 (ตอนนี้บังคับกรอกครบตามคำสั่งทีม CHANGELOG 2569-11-02 รอทีมบันทึกคำตอบ Q-04 ใน spec)
- Q-05 กรรมการสโมสรหลายคนสามารถแก้ไขโครงการเดียวกันพร้อมกันได้หรือไม่ (concurrent editing)?
  งานที่รอ: T-11, T-13, T-18 (ตอนนี้จำกัดเฉพาะเจ้าของรายบุคคล ไม่มีล็อก)
