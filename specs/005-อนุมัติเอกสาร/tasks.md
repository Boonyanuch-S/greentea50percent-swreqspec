# Tasks: อนุมัติเอกสารโครงการ

- Feature: อนุมัติเอกสารโครงการ (Approve Project Document)
- Spec ID: SPEC-APR-005
- อ้างอิง: `specs/005-อนุมัติเอกสาร/plan.md`
- วันที่: 2569-10-01
- สรุป: มีทั้งหมด 19 tasks และมี 5 tasks ที่ต้องรอ Open Questions
- งานที่ต้องรอ Open Question: T-06, T-12, T-14, T-17 และ T-19 รอ Q-02/Q-03 ตามขอบเขตของแต่ละงาน

## รายการ task

### T-01 กำหนดโมเดลสถานะการอนุมัติ
- รองรับ: FR-APR-03, FR-APR-04, FR-APR-05, ASM-01, ASM-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-05, T-06 และ T-07
- ไฟล์ที่แตะ: `backend/app/models/project_approval.py`, `backend/app/repositories/project_approval.py`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: โมเดล `ProjectApproval` รองรับวันเวลาอนุมัติเนื้อหา สถานะ `รออนุมัติ` และ `อนุมัติสมบูรณ์` พร้อม transition ที่สอดคล้องกับ ASM-01 และ ASM-02
- สถานะ: พร้อมทำ

### T-02 สร้างโมเดลเอกสารและประวัติการดำเนินการ
- รองรับ: FR-APR-01, FR-APR-02, FR-APR-03, FR-APR-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-04, T-05 และ T-08
- ไฟล์ที่แตะ: `backend/app/models/project_document.py`, `backend/app/models/approval_action.py`, `backend/app/models/review_comment.py`
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: มี entity `ProjectDocumentItem`, `ApprovalAction` และ `ReviewComment` เก็บรายการเอกสาร ลำดับ การตรวจ และคอมเมนต์ได้ตาม plan.md
- สถานะ: พร้อมทำ

### T-03 สร้างโมเดลการอัปโหลดและการแจ้งเตือน
- รองรับ: FR-APR-04, FR-APR-05, IF-UPLOAD-01, IF-UC10-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-06, T-07 และ T-09
- ไฟล์ที่แตะ: `backend/app/models/cover_sheet_upload.py`, `backend/app/models/notification_request.py`, `backend/app/storage/cover_sheet.py`
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: มี entity `CoverSheetUpload` และ `NotificationRequest` พร้อมพื้นที่เก็บไฟล์และสถานะการส่งต่อ โดยยังไม่กำหนดชนิดหรือขนาดไฟล์แทน Q-03
- สถานะ: พร้อมทำ

### T-04 บังคับยืนยันตัวตนสำหรับ API และหน้าจอ
- รองรับ: CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-18 และ API ทุก task ถัดไป
- ไฟล์ที่แตะ: `backend/app/middleware/auth.py`, `backend/app/models/authenticated_user_context.py`, `backend/app/api/project_approvals.py`, `frontend/src/App.jsx`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: request ที่ไม่มี `AuthenticatedUserContext` ถูกปฏิเสธก่อนเข้าถึงทุก endpoint ของฟีเจอร์ และ route หน้าจอมี `AuthGuard`
- สถานะ: พร้อมทำ

### T-05 สร้าง API รายการเอกสารและเอกสารที่เลือก
- รองรับ: FR-APR-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-13
- ไฟล์ที่แตะ: `backend/app/api/project_approvals.py`, `backend/app/schemas/project_approval.py`
- ต้องทำหลัง: T-01, T-02, T-04
- เสร็จเมื่อ: `GET /api/project-approvals/{approvalId}` คืนรายการเอกสารทั้งชุด และ `GET /documents/{documentId}` คืนเอกสารรายการที่เลือกได้
- สถานะ: พร้อมทำ

### T-06 สร้าง API อนุมัติเนื้อหาและอัปโหลดใบปะหน้า
- รองรับ: FR-APR-03, FR-APR-04, IF-UPLOAD-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-14
- ไฟล์ที่แตะ: `backend/app/api/project_approvals.py`, `backend/app/schemas/project_approval.py`, `backend/app/storage/cover_sheet.py`
- ต้องทำหลัง: T-01, T-03, T-04
- เสร็จเมื่อ: `POST /content-approval` บันทึกเวลาและคืนข้อความให้พิมพ์ใบปะหน้า และ `POST /cover-sheet` รับไฟล์ที่ผ่านเงื่อนไขจาก Q-03 แล้วเปลี่ยนสถานะเป็น `รออนุมัติ`
- สถานะ: รอ Q-03

### T-07 สร้าง API ให้กองกิจตรวจผ่านและเปลี่ยนสถานะ
- รองรับ: FR-APR-05, IF-UC10-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-09 และ T-14
- ไฟล์ที่แตะ: `backend/app/api/project_approvals.py`, `backend/app/services/project_approval.py`
- ต้องทำหลัง: T-01, T-03, T-04, T-06
- เสร็จเมื่อ: `POST /review` เมื่อกองกิจตรวจผ่านเปลี่ยนสถานะจาก `รออนุมัติ` เป็น `อนุมัติสมบูรณ์` และสร้างคำขอเรียก UC-10 ได้
- สถานะ: พร้อมทำ

### T-08 สร้าง API ตีกลับเอกสารทั้งชุดพร้อมคอมเมนต์
- รองรับ: FR-APR-06, IF-UC01-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-16
- ไฟล์ที่แตะ: `backend/app/api/project_approvals.py`, `backend/app/services/project_approval.py`, `backend/app/integrations/uc01.py`
- ต้องทำหลัง: T-01, T-02, T-04
- เสร็จเมื่อ: `POST /return` รับคอมเมนต์รายละเอียด ส่งเอกสารทั้งชุดพร้อมคอมเมนต์ไป UC-01 และบันทึกการดำเนินการได้
- สถานะ: พร้อมทำ

### T-09 เชื่อมการแจ้งเตือนเมื่ออนุมัติสมบูรณ์
- รองรับ: FR-APR-05, IF-UC10-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-14
- ไฟล์ที่แตะ: `backend/app/integrations/uc10.py`, `backend/app/services/project_approval.py`, `backend/app/api/project_approvals.py`
- ต้องทำหลัง: T-07
- เสร็จเมื่อ: เมื่อสถานะเป็น `อนุมัติสมบูรณ์` ระบบเรียก UC-10 ด้วย `approvalId` และบันทึก `NotificationRequest` ตามสัญญาใน plan.md
- สถานะ: พร้อมทำ

### T-10 สร้างหน้าจออนุมัติด้วย API จำลอง
- รองรับ: FR-APR-01, FR-APR-02, FR-APR-03, FR-APR-04
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-13, T-15 และ T-14
- ไฟล์ที่แตะ: `frontend/src/pages/ProjectApprovalPage.jsx`, `frontend/src/api/projectApprovalMock.js`, `frontend/src/App.jsx`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: หน้า `ProjectApprovalPage` แสดงรายการเอกสาร เลือกเปิดดู ตรวจวัตถุประสงค์/ตัวชี้วัด/รูปแบบ อนุมัติเนื้อหา และมีช่องอัปโหลดตามสัญญา mock ใน plan.md
- สถานะ: เสร็จ รอทีมตรวจ

### T-11 สร้างหน้าจอตรวจของกองกิจด้วย API จำลอง
- รองรับ: FR-APR-05, FR-APR-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-14 และ T-16
- ไฟล์ที่แตะ: `frontend/src/pages/ProjectOfficeReviewPanel.jsx`, `frontend/src/api/projectApprovalMock.js`, `frontend/src/App.jsx`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: หน้า `ProjectOfficeReviewPanel` แสดงเอกสารสถานะ `รออนุมัติ` รับผลตรวจผ่าน และรับคอมเมนต์ตีกลับเอกสารทั้งชุดได้จาก mock API
- สถานะ: พร้อมทำ

### T-12 แสดงคำเตือน AI โดยไม่บล็อกการอนุมัติ
- รองรับ: FR-APR-07
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-17
- ไฟล์ที่แตะ: `frontend/src/pages/ProjectApprovalPage.jsx`, `frontend/src/api/projectApprovalMock.js`
- ต้องทำหลัง: T-10
- เสร็จเมื่อ: หน้าจอแสดงคำเตือนจากข้อมูลที่ระบบส่งให้ และปุ่มอนุมัติยังใช้งานได้ โดยไม่สร้างกลไกตรวจจับ AI เพิ่มเอง
- สถานะ: รอ Q-02

### T-13 ทดสอบการเลือกเปิดดูเอกสารโครงการ
- รองรับ: FR-APR-01
- ตรวจด้วย: AC-APR-03
- ไฟล์ที่แตะ: `backend/tests/test_AC_APR_03_select_project_document.py`, `frontend/src/__tests__/project-approval-select-document.test.jsx`
- ต้องทำหลัง: T-05, T-10
- เสร็จเมื่อ: `test_AC_APR_03_select_project_document` ผ่านและยืนยันว่ารายการเอกสารทั้งชุดแสดงครบและเปิดได้เฉพาะรายการที่เลือก
- สถานะ: พร้อมทำ

### T-14 ทดสอบการอนุมัติเนื้อหาและอนุมัติสมบูรณ์
- รองรับ: FR-APR-03, FR-APR-04, FR-APR-05, IF-UC10-01
- ตรวจด้วย: AC-APR-01, AC-APR-02
- ไฟล์ที่แตะ: `backend/tests/test_AC_APR_01_content_approval.py`, `backend/tests/test_AC_APR_02_office_approval_completes.py`, `frontend/src/__tests__/project-approval-complete.test.jsx`
- ต้องทำหลัง: T-06, T-07, T-09, T-10, T-11
- เสร็จเมื่อ: `test_AC_APR_01_content_approval` และ `test_AC_APR_02_office_approval_completes` ผ่าน โดยใช้ stub/mock ของกองกิจและ UC-10 ตาม plan.md
- สถานะ: รอ Q-03

### T-15 ทดสอบการบันทึกเวลาและข้อความพิมพ์ใบปะหน้า
- รองรับ: FR-APR-03
- ตรวจด้วย: AC-APR-01
- ไฟล์ที่แตะ: `backend/tests/test_AC_APR_01_content_approval.py`, `frontend/src/__tests__/project-approval-content-approval.test.jsx`
- ต้องทำหลัง: T-06, T-10
- เสร็จเมื่อ: `test_AC_APR_01_content_approval` ยืนยันว่ามีเวลาอนุมัติและข้อความให้พิมพ์เฉพาะใบปะหน้า
- สถานะ: พร้อมทำ

### T-16 ทดสอบการส่งเอกสารทั้งชุดกลับพร้อมคอมเมนต์
- รองรับ: FR-APR-06, IF-UC01-02
- ตรวจด้วย: AC-APR-04
- ไฟล์ที่แตะ: `backend/tests/test_AC_APR_04_return_full_document_with_comment.py`, `frontend/src/__tests__/project-office-return.test.jsx`
- ต้องทำหลัง: T-08, T-11
- เสร็จเมื่อ: `test_AC_APR_04_return_full_document_with_comment` ผ่านและตรวจว่าข้อมูลเอกสารทั้งชุดกับคอมเมนต์ครบถ้วนถูกส่งไป UC-01
- สถานะ: พร้อมทำ

### T-17 ทดสอบคำเตือน AI ไม่บล็อกการอนุมัติ
- รองรับ: FR-APR-07
- ตรวจด้วย: AC-APR-05
- ไฟล์ที่แตะ: `backend/tests/test_AC_APR_05_ai_warning_does_not_block.py`, `frontend/src/__tests__/project-approval-ai-warning.test.jsx`
- ต้องทำหลัง: T-12
- เสร็จเมื่อ: `test_AC_APR_05_ai_warning_does_not_block` ผ่าน โดยคำเตือนแสดงและการอนุมัติยังทำงานได้ โดยไม่ทดสอบความแม่นยำของกลไกตรวจจับ AI
- สถานะ: รอ Q-02

### T-18 ทดสอบการปฏิเสธผู้ใช้ที่ยังไม่เข้าสู่ระบบ
- รองรับ: CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: AC-APR-06
- ไฟล์ที่แตะ: `backend/tests/test_AC_APR_06_reject_unauthenticated_access.py`, `frontend/src/__tests__/project-approval-auth.test.jsx`
- ต้องทำหลัง: T-04
- เสร็จเมื่อ: `test_AC_APR_06_reject_unauthenticated_access` ผ่านและยืนยันว่าผู้ไม่มี session เข้าถึงหน้าและ API ฟีเจอร์ไม่ได้
- สถานะ: พร้อมทำ

### T-19 ต่อหน้าจอกับ API จริง
- รองรับ: FR-APR-01, FR-APR-02, FR-APR-03, FR-APR-04, FR-APR-05, FR-APR-06, FR-APR-07, CON-NFR-21, IF-UC10-01, IF-UC01-02, IF-UPLOAD-01
- ตรวจด้วย: AC-APR-01, AC-APR-02, AC-APR-03, AC-APR-04, AC-APR-05, AC-APR-06
- ไฟล์ที่แตะ: `frontend/src/api/client.js`, `frontend/src/pages/ProjectApprovalPage.jsx`, `frontend/src/pages/ProjectOfficeReviewPanel.jsx`, `backend/app/api/project_approvals.py`
- ต้องทำหลัง: T-05, T-06, T-07, T-08, T-09, T-10, T-11, T-12, T-13, T-14, T-15, T-16, T-17, T-18
- เสร็จเมื่อ: flow ปกติของหน้าจอเรียก API จริงตามสัญญาใน plan.md แทน mock และยังผ่านการทดสอบ AC ที่เกี่ยวข้อง โดยไม่กำหนดพฤติกรรมที่ยังรอ Q-02/Q-03
- สถานะ: รอ Q-02/Q-03

## ตารางตรวจความครบ

### Acceptance Criteria

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-APR-01 | T-14, T-15, T-19 |
| AC-APR-02 | T-14, T-19 |
| AC-APR-03 | T-13, T-19 |
| AC-APR-04 | T-16, T-19 |
| AC-APR-05 | T-17, T-19 |
| AC-APR-06 | T-18, T-19 |

### Constraints

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-NFR-21 | T-04, T-18, T-19 |
| IF-UC10-01 | T-07, T-09, T-14, T-19 |
| IF-UC01-02 | T-08, T-16, T-19 |
| IF-UPLOAD-01 | T-03, T-06, T-14, T-19 |

## สิ่งที่ยังไม่ทำ

- **Q-01:** หากอาจารย์กดอนุมัติเนื้อหาแล้ว แต่ไม่อัปโหลดใบปะหน้าที่เซ็นแล้วภายในเวลาที่กำหนด ระบบมีการติดตาม/แจ้งเตือนอย่างไร
  - task ที่รอ: ไม่มี เนื่องจาก spec ยังไม่มี FR สำหรับการติดตาม/แจ้งเตือนหรือสถานะเพิ่มเติม และ plan.md ระบุว่ายังไม่ออกแบบส่วนนี้
- **Q-02:** เกณฑ์การตรวจจับเนื้อหาที่คล้ายถูกสร้างจาก AI เป็นการตรวจจับอัตโนมัติหรือดุลพินิจของอาจารย์
  - task ที่รอ: T-12, T-17 และ T-19
  - ขอบเขตที่ยังไม่ทำ: กลไกตรวจจับ AI จริง จะทำเพียงจุดแสดงคำเตือนที่ไม่บล็อกการอนุมัติตาม plan.md
- **Q-03:** รูปแบบไฟล์ใบปะหน้าที่อัปโหลดได้และขนาดไฟล์สูงสุด
  - task ที่รอ: T-06, T-14 และ T-19
  - ขอบเขตที่ยังไม่ทำ: การกำหนดชนิดไฟล์และขนาดสูงสุด จะไม่เดาค่าก่อนทีมตอบคำถาม
