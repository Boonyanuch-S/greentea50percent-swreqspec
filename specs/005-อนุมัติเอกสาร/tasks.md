# Tasks: อนุมัติเอกสารโครงการ

- Feature: อนุมัติเอกสารโครงการ (Approve Project Document)
- Spec ID: SPEC-APR-005
- อ้างอิง: `specs/005-อนุมัติเอกสาร/plan.md`
- วันที่: 2569-10-30 (อัปเดตตามงานจริง 2569-10-31)

- สรุป: มี 7 เฟสที่ทำได้ (เฟส 0 ถึง 6) และเฟสรอคำตอบ 1 เฟส รวม 17 task
- ทำแล้วครบ 17 task สถานะเสร็จ รอทีมตรวจ ยังไม่ผ่านจุดตรวจของคนและยังไม่ commit
- ทีมตอบ Q-02, Q-03 และ Q-01 ของ specs/009 แล้ว (2569-10-31) ไม่มี task รอ Open Question; Q-01 ของ spec นี้ยังเปิดแต่ไม่มี task รอ
- เฟสแรกที่ลองใช้งานได้จริงคือเฟส 1: อาจารย์เปิดหน้าอนุมัติจากข้อมูลหลังบ้านและเลือกดูเอกสารทั้งชุด (AC-APR-03)

หมายเหตุการจัดไฟล์นี้
- จัดใหม่จากฉบับ 19 task ที่เรียงตามชั้น จึงมีการจัดเลข task ใหม่ ดูตาราง "เทียบเลข task เดิม" ท้ายไฟล์
- หน้า `ProjectApprovalPage` มีอยู่แล้วและใช้ `projectApprovalMock` (T-10 ฉบับเดิม) งานหน้าจอในไฟล์นี้จึงเป็นการต่อหน้าเดิมเข้ากับ API ไม่ใช่สร้างหน้าใหม่
- การเก็บข้อมูลใช้ in-memory แบบเดียวกับ `review_queue_service` ของ UC-03 ตามที่ทีมเลือกไว้ใน prompt-log ยังไม่ต่อฐานข้อมูลจริงตามตารางเทคโนโลยีใน plan.md (ทีมเลือกเอง ไม่ได้มาจาก spec)
- route หลังบ้านไม่มีคำนำหน้า `/api` เพราะ Vite ตัด `/api` ออกก่อนส่งต่อ เช่น plan.md เขียน `GET /api/project-approvals/{approvalId}` หลังบ้านจะเป็น `GET /project-approvals/{approvalId}`
- สถานะหลังตีกลับใช้ `RETURNED_STATUS` เดิมของระบบ (`ตีกลับให้แก้ไข`) ตามที่ plan.md ระบุว่าใช้สถานะตีกลับที่ระบบต้นทางกำหนดไว้

งานนอก task ที่ทำเพิ่มตามคำสั่งทีม
- ต่อ `ProjectApprovalPage` เป็นหน้าหลักของอาจารย์ และปรับหน้าตาให้เหมือนหน้าอื่นของระบบ
- เพิ่มกล่องยืนยันก่อนอนุมัติเนื้อหา ส่งใบปะหน้า ตรวจผ่าน และตีกลับ (นอก spec ทีมสั่งเพิ่ม) กดยกเลิกแล้วไม่เรียก API

การตัดสินใจระหว่างทำที่ spec ไม่ระบุ รอทีมตรวจ
- อนุมัติเนื้อหาซ้ำเก็บเวลาครั้งแรก, เรียก UC-10 ซ้ำใช้คำขอเดิม, อัปโหลดซ้ำแทนไฟล์เดิมระหว่างสถานะ `รออนุมัติ`, ตีกลับได้เมื่อมีใบปะหน้าแล้ว
- ตรวจชนิดไฟล์จากนามสกุล และตอบข้อผิดพลาดไฟล์เป็น 409
- ถ้อยคำคำเตือน AI และข้อความในกล่องยืนยันเป็นร่างจาก AI

ผล test ล่าสุด (2569-10-31): backend 58 passed; frontend 15 files / 32 tests ผ่าน; `npm run build` ผ่าน

ก่อนรัน test หลังบ้าน: `pip install -r backend/requirements.txt` แล้วรันจาก root ของ repo ด้วย `PYTHONPATH=. pytest -q backend/tests` (test import จาก package `backend`)

## เฟส 0: ฐานรากของฟีเจอร์ (ไม่มี AC)

### T-01 สร้างโมเดลการอนุมัติ รายการเอกสาร และข้อมูลตัวอย่าง
- รองรับ: FR-APR-01, FR-APR-02, FR-APR-03, ASM-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-02 และ T-04
- ไฟล์ที่แตะ: `backend/app/models/project_approval.py`, `backend/app/services/project_approval_service.py`, `backend/tests/test_project_approval_service.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: `test_project_approval_seed_has_full_document_set` ผ่าน โดยมี `ProjectApproval`, `ProjectDocumentItem`, `ApprovalAction` และข้อมูลตัวอย่าง 1 ชุดสถานะ `รออนุมัติ` ที่มีเล่มโครงการ กส 002 และใบแนบกิจกรรม พร้อมวัตถุประสงค์ ตัวชี้วัด และรูปแบบเอกสารตาม FR-APR-02
- สถานะ: เสร็จ รอทีมตรวจ

#### จุดตรวจเฟส 0
- test ที่ต้องผ่านทั้งหมด: `test_project_approval_seed_has_full_document_set` และ test เดิมของโปรเจกต์ทั้งหมด
- เปิดระบบ: เฟสนี้ยังไม่มีหน้าจอหรือ API ใหม่ ตรวจด้วย `PYTHONPATH=. pytest -q backend/tests`
- คนลองเองตาม: ไม่มี AC ในเฟสนี้
  Given ติดตั้ง dependency ของหลังบ้านแล้ว
  When รัน test หลังบ้านทั้งหมด
  Then test ผ่านทั้งหมด
- ยังขาด: ไม่มี

## เฟส 1: อาจารย์เลือกเปิดดูเอกสารทั้งชุด (AC-APR-03)

### T-02 สร้าง API รายการเอกสารและเอกสารที่เลือก
- รองรับ: FR-APR-01, FR-APR-02, CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: AC-APR-03
- ไฟล์ที่แตะ: `backend/app/routers/project_approvals.py`, `backend/app/services/project_approval_service.py`, `backend/app/main.py`, `backend/tests/test_AC_APR_03_select_project_document.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: `test_AC_APR_03_select_project_document` ผ่าน โดย `GET /project-approvals/{approvalId}` คืนเอกสารทั้งชุด `GET /project-approvals/{approvalId}/documents/{documentId}` คืนเฉพาะรายการที่เลือก และ router ใช้ `require_authenticated_user`
- สถานะ: เสร็จ รอทีมตรวจ

### T-03 ต่อหน้าอนุมัติกับ API รายการเอกสาร
- รองรับ: FR-APR-01, FR-APR-02
- ตรวจด้วย: AC-APR-03
- ไฟล์ที่แตะ: `frontend/src/api/client.js`, `frontend/src/pages/ProjectApprovalPage.jsx`, `frontend/src/App.jsx`, `frontend/src/__tests__/setup.test.jsx`, `frontend/src/__tests__/project-approval-select-document.test.jsx`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: test `test_AC_APR_03_select_project_document` ฝั่งหน้าจอผ่านด้วย client จำลอง และเมื่อเปิดระบบจริงหน้าอนุมัติโหลดเอกสารจาก `client.js` ผ่าน session ของผู้ใช้ โดยใช้ `approvalId` ของข้อมูลตัวอย่าง
- สถานะ: เสร็จ รอทีมตรวจ

#### จุดตรวจเฟส 1
- test ที่ต้องผ่านทั้งหมด: `test_AC_APR_03_select_project_document` ทั้งหลังบ้านและหน้าจอ และ test ของเฟส 0
- เปิดระบบ: หลังบ้าน `cd backend && PYTHONPATH=. uvicorn app.main:app --reload --port 8000`; หน้าจอ `cd frontend && npm run dev`
- คนลองเองตาม AC-APR-03:
  Given มีเอกสารโครงการตัวอย่างที่รออนุมัติ และ login ด้วยบัญชีอาจารย์ที่ปรึกษาสโมสร
  When เลือก "แบบ กส 002" จากรายการเอกสารทั้งชุด
  Then เห็นรายละเอียดของ "แบบ กส 002" และยังเห็นรายการเอกสารครบทั้ง 3 รายการให้เลือก
- ยังขาด: หน้าจอเปิดได้เฉพาะชุดตัวอย่างชุดเดียว เพราะ plan.md ยังไม่มี API รายการเอกสารรออนุมัติ (ดูหัวข้อ "เรื่องที่ต้องให้ทีมตัดสิน")

## เฟส 2: อาจารย์อนุมัติเนื้อหาออนไลน์ (AC-APR-01)

### T-04 สร้าง API อนุมัติเนื้อหา
- รองรับ: FR-APR-02, FR-APR-03, ASM-01
- ตรวจด้วย: AC-APR-01
- ไฟล์ที่แตะ: `backend/app/routers/project_approvals.py`, `backend/app/services/project_approval_service.py`, `backend/tests/test_AC_APR_01_content_approval.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: `test_AC_APR_01_content_approval` ผ่าน โดย `POST /project-approvals/{approvalId}/content-approval` บันทึกวันเวลาอนุมัติและ `ApprovalAction` แล้วคืนข้อความให้พิมพ์เฉพาะใบปะหน้า
- สถานะ: เสร็จ รอทีมตรวจ

### T-05 ต่อปุ่มอนุมัติเนื้อหากับ API
- รองรับ: FR-APR-03
- ตรวจด้วย: AC-APR-01
- ไฟล์ที่แตะ: `frontend/src/api/client.js`, `frontend/src/pages/ProjectApprovalPage.jsx`, `frontend/src/__tests__/project-approval-content-approval.test.jsx`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-03, T-04
- เสร็จเมื่อ: test `test_AC_APR_01_content_approval` ฝั่งหน้าจอผ่านด้วย client จำลอง โดยแสดงวันเวลาอนุมัติและข้อความให้พิมพ์ใบปะหน้า
- สถานะ: เสร็จ รอทีมตรวจ

#### จุดตรวจเฟส 2
- test ที่ต้องผ่านทั้งหมด: `test_AC_APR_01_content_approval` ทั้งหลังบ้านและหน้าจอ และ test ของเฟส 0 ถึง 1
- เปิดระบบ: หลังบ้าน `cd backend && PYTHONPATH=. uvicorn app.main:app --reload --port 8000`; หน้าจอ `cd frontend && npm run dev`
- คนลองเองตาม AC-APR-01:
  Given login ด้วยบัญชีอาจารย์ที่ปรึกษาสโมสร และเปิดเอกสารตัวอย่างครบทั้งชุด
  When กด "อนุมัติเนื้อหา"
  Then เห็นวันเวลาที่อนุมัติ ข้อความให้พิมพ์เฉพาะใบปะหน้า และปุ่มเปลี่ยนเป็น "อนุมัติเนื้อหาแล้ว"
- ยังขาด: การติดตามเมื่ออนุมัติแล้วไม่อัปโหลดใบปะหน้า ยังไม่สร้างจนกว่าจะตอบ Q-01

## เฟส 3: อาจารย์อัปโหลดใบปะหน้าที่เซ็นแล้ว (FR-APR-04, ส่วนแรกของ AC-APR-02)

### T-06 สร้าง API รับไฟล์ใบปะหน้า
- รองรับ: FR-APR-04, IF-UPLOAD-01, ASM-01
- ตรวจด้วย: AC-APR-02
- ไฟล์ที่แตะ: `backend/app/models/cover_sheet_upload.py`, `backend/app/storage/cover_sheet.py`, `backend/app/routers/project_approvals.py`, `backend/app/services/project_approval_service.py`, `backend/requirements.txt`, `backend/tests/test_AC_APR_02_cover_sheet_upload.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-04
- เสร็จเมื่อ: `test_AC_APR_02_cover_sheet_upload_accepted` ผ่าน โดย `POST /project-approvals/{approvalId}/cover-sheet` บันทึก `CoverSheetUpload` และคืนสถานะ `รออนุมัติ` และปฏิเสธการอัปโหลดก่อนอนุมัติเนื้อหาตาม ASM-01 โดยยังไม่จำกัดชนิดหรือขนาดไฟล์แทน Q-03 (เพิ่ม `python-multipart` ใน requirements เพราะ FastAPI ใช้รับไฟล์ ทีมเลือกเอง ไม่ได้มาจาก spec)
- สถานะ: เสร็จ รอทีมตรวจ

### T-07 ต่อการอัปโหลดใบปะหน้ากับ API
- รองรับ: FR-APR-04, IF-UPLOAD-01
- ตรวจด้วย: AC-APR-02
- ไฟล์ที่แตะ: `frontend/src/api/client.js`, `frontend/src/pages/ProjectApprovalPage.jsx`, `frontend/src/__tests__/project-approval-cover-sheet.test.jsx`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-05, T-06
- เสร็จเมื่อ: test `test_AC_APR_02_cover_sheet_upload_accepted` ฝั่งหน้าจอผ่านด้วย client จำลอง โดยแสดงชื่อไฟล์และสถานะ `รออนุมัติ` และอัปโหลดไม่ได้จนกว่าจะอนุมัติเนื้อหาแล้ว
- สถานะ: เสร็จ รอทีมตรวจ

#### จุดตรวจเฟส 3
- test ที่ต้องผ่านทั้งหมด: `test_AC_APR_02_cover_sheet_upload_accepted` ทั้งหลังบ้านและหน้าจอ และ test ของเฟส 0 ถึง 2
- เปิดระบบ: หลังบ้าน `cd backend && PYTHONPATH=. uvicorn app.main:app --reload --port 8000`; หน้าจอ `cd frontend && npm run dev`
- คนลองเองตามส่วนแรกของ AC-APR-02:
  Given อาจารย์อนุมัติเนื้อหาแล้ว
  When เลือกไฟล์ใบปะหน้าแล้วกด "รับไฟล์ใบปะหน้า"
  Then เห็นข้อความว่ารับไฟล์แล้วและสถานะ `รออนุมัติ`
- ยังขาด: การตรวจของกองกิจอยู่เฟส 4

## เฟส 4: กองกิจตรวจผ่านและแจ้งกรรมการสโมสร (AC-APR-02)

### T-08 สร้างการเรียก UC-10 แบบจำลอง
- รองรับ: FR-APR-05, IF-UC10-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-09
- ไฟล์ที่แตะ: `backend/app/models/notification_request.py`, `backend/app/integrations/uc10.py`, `backend/app/routers/project_approvals.py`, `backend/app/services/project_approval_service.py`, `backend/tests/test_project_approval_uc10.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: `test_project_approval_uc10_records_notification_request` ผ่าน โดยมี `POST /project-approvals/{approvalId}/notifications/uc-10` ตาม plan.md และบันทึก `NotificationRequest` ได้ โดยไม่สร้างเนื้อหาหรือช่องทางอีเมลซึ่งเป็น Out of scope
- สถานะ: เสร็จ รอทีมตรวจ

### T-09 สร้าง API ให้กองกิจตรวจผ่าน
- รองรับ: FR-APR-05, IF-UC10-01, ASM-01, ASM-02
- ตรวจด้วย: AC-APR-02
- ไฟล์ที่แตะ: `backend/app/routers/project_approvals.py`, `backend/app/services/project_approval_service.py`, `backend/tests/test_AC_APR_02_office_approval_completes.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-06, T-08
- เสร็จเมื่อ: `test_AC_APR_02_office_approval_completes` ผ่าน โดย `POST /project-approvals/{approvalId}/review` เปลี่ยนสถานะจาก `รออนุมัติ` เป็น `อนุมัติสมบูรณ์` เรียก UC-10 และปฏิเสธเอกสารที่ยังไม่มีใบปะหน้าตาม ASM-01
- สถานะ: เสร็จ รอทีมตรวจ

### T-10 สร้างแผงตรวจของกองกิจส่วนตรวจผ่าน
- รองรับ: FR-APR-05
- ตรวจด้วย: AC-APR-02
- ไฟล์ที่แตะ: `frontend/src/api/client.js`, `frontend/src/pages/ProjectOfficeReviewPanel.jsx`, `frontend/src/__tests__/project-office-review.test.jsx`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-09
- เสร็จเมื่อ: test `test_AC_APR_02_office_approval_completes` ฝั่งหน้าจอผ่านด้วย client จำลอง โดยแผงแสดงเอกสารสถานะ `รออนุมัติ` กดตรวจผ่านแล้วเห็น `อนุมัติสมบูรณ์` ต่อเข้า `App.jsx` ใน T-15
- สถานะ: เสร็จ รอทีมตรวจ

#### จุดตรวจเฟส 4
- test ที่ต้องผ่านทั้งหมด: `test_project_approval_uc10_records_notification_request`, `test_AC_APR_02_office_approval_completes` ทั้งหลังบ้านและหน้าจอ และ test ของเฟส 0 ถึง 3
- เปิดระบบ: หลังบ้าน `cd backend && PYTHONPATH=. uvicorn app.main:app --reload --port 8000`; หน้าจอ `cd frontend && npm run dev`
- คนลองเองตาม AC-APR-02:
  Given อาจารย์อนุมัติเนื้อหาและอัปโหลดใบปะหน้าแล้ว
  When login ด้วยบัญชีเจ้าหน้าที่กองกิจ กด "ตรวจผ่าน" แล้วยืนยันในกล่องยืนยัน
  Then เห็นสถานะ `อนุมัติสมบูรณ์` และเมื่อ login อาจารย์ใหม่เห็นสถานะเดียวกันบนหน้าอนุมัติ ส่วนการเรียก UC-10 ตรวจด้วย `test_AC_APR_02_office_approval_completes`
- ยังขาด: ยังไม่มีการส่งอีเมลจริงเพราะเป็นงานของ UC-10; กองกิจเปิดแผงตรวจจากหน้าจอจริงได้แล้วหลัง T-15

## เฟส 5: กองกิจตีกลับเอกสารทั้งชุดพร้อมคอมเมนต์ (AC-APR-04)

### T-11 สร้าง API ตีกลับพร้อมคอมเมนต์
- รองรับ: FR-APR-06, IF-UC01-02, ASM-02
- ตรวจด้วย: AC-APR-04
- ไฟล์ที่แตะ: `backend/app/models/review_comment.py`, `backend/app/integrations/uc01.py`, `backend/app/routers/project_approvals.py`, `backend/app/services/project_approval_service.py`, `backend/tests/test_AC_APR_04_return_full_document_with_comment.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-09
- เสร็จเมื่อ: `test_AC_APR_04_return_full_document_with_comment` ผ่าน โดย `POST /project-approvals/{approvalId}/return` บันทึก `ReviewComment` ใช้ `RETURNED_STATUS` และส่งเอกสารทั้งชุดพร้อมคอมเมนต์ครบถ้วนเข้าคิวจำลอง UC-01
- สถานะ: เสร็จ รอทีมตรวจ

### T-12 เพิ่มการตีกลับในแผงตรวจของกองกิจ
- รองรับ: FR-APR-06, IF-UC01-02
- ตรวจด้วย: AC-APR-04
- ไฟล์ที่แตะ: `frontend/src/api/client.js`, `frontend/src/pages/ProjectOfficeReviewPanel.jsx`, `frontend/src/__tests__/project-office-return.test.jsx`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-10, T-11
- เสร็จเมื่อ: test `test_AC_APR_04_return_full_document_with_comment` ฝั่งหน้าจอผ่านด้วย client จำลอง โดยกรอกคอมเมนต์แล้วส่งกลับได้และเห็นสถานะหลังตีกลับ
- สถานะ: เสร็จ รอทีมตรวจ

#### จุดตรวจเฟส 5
- test ที่ต้องผ่านทั้งหมด: `test_AC_APR_04_return_full_document_with_comment` ทั้งหลังบ้านและหน้าจอ และ test ของเฟส 0 ถึง 4
- เปิดระบบ: หลังบ้าน `cd backend && PYTHONPATH=. uvicorn app.main:app --reload --port 8000`; หน้าจอ `cd frontend && npm run dev`
- คนลองเองตาม AC-APR-04:
  Given เปิดระบบใหม่เพื่อล้างข้อมูล in-memory แล้วอาจารย์อนุมัติเนื้อหาและอัปโหลดใบปะหน้า
  When login ด้วยบัญชีเจ้าหน้าที่กองกิจ กรอกคอมเมนต์ กด "ตีกลับเอกสารทั้งชุด" แล้วยืนยันในกล่องยืนยัน
  Then เห็นข้อความว่าส่งเอกสารทั้งชุดกลับ UC-01 และสถานะเป็น `ตีกลับให้แก้ไข` ส่วนเนื้อหาที่ส่งเข้าคิวตรวจด้วย `test_AC_APR_04_return_full_document_with_comment`
- ยังขาด: หน้า UC-01 ยังใช้ mock ของตัวเอง จึงยังไม่เห็นคอมเมนต์นี้ในหน้ากรรมการสโมสร

## เฟส 6: ปฏิเสธผู้ที่ยังไม่เข้าสู่ระบบ (AC-APR-06)

### T-13 ทดสอบการปฏิเสธผู้ที่ยังไม่เข้าสู่ระบบ
- รองรับ: CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: AC-APR-06
- ไฟล์ที่แตะ: `backend/tests/test_AC_APR_06_reject_unauthenticated_access.py`, `frontend/src/__tests__/project-approval-auth.test.jsx`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-11, T-12
- เสร็จเมื่อ: `test_AC_APR_06_reject_unauthenticated_access` ผ่าน โดยทุก endpoint ของฟีเจอร์ตอบ 401 เมื่อไม่มี session และหน้าจอแสดงหน้า login แทนหน้าอนุมัติ
- สถานะ: เสร็จ รอทีมตรวจ

#### จุดตรวจเฟส 6
- test ที่ต้องผ่านทั้งหมด: `test_AC_APR_06_reject_unauthenticated_access` ทั้งหลังบ้านและหน้าจอ และ test ของเฟส 0 ถึง 5
- เปิดระบบ: หลังบ้าน `cd backend && PYTHONPATH=. uvicorn app.main:app --reload --port 8000`; หน้าจอ `cd frontend && npm run dev`
- คนลองเองตาม AC-APR-06:
  Given ยังไม่ได้เข้าสู่ระบบ
  When เปิดหน้าเว็บ และเรียก `GET http://localhost:8000/project-approvals/{approvalId}` โดยไม่มี header `Authorization`
  Then หน้าเว็บแสดงหน้า login และ API ตอบ 401
- ยังขาด: หลังบ้านตรวจเพียงว่ามี header `Authorization` ตามแบบเดียวกับ UC-03 ยังไม่ได้ตรวจความถูกต้องของ Token หรือจำกัดบทบาท

## เฟสรอคำตอบ

ทีมตอบครบแล้ว (2569-10-31) จึงทำ T-14 ถึง T-17 แล้ว

#### จุดตรวจเฟสรอคำตอบ
- test ที่ต้องผ่านทั้งหมด: `test_AC_APR_02_cover_sheet_upload_rejects_invalid_file`, `test_AC_APR_05_ai_warning_does_not_block` และ test ของเฟส 0 ถึง 6
- เปิดระบบ: หลังบ้าน `cd backend && PYTHONPATH=. uvicorn app.main:app --reload --port 8000`; หน้าจอ `cd frontend && npm run dev`
- คนลองเองตาม AC-APR-05:
  Given login ด้วยบัญชีอาจารย์ที่ปรึกษาสโมสร
  When เปิดหน้าอนุมัติ แล้วกด "อนุมัติเนื้อหา"
  Then เห็นคำเตือนให้ตรวจสอบอย่างละเอียด และอนุมัติเนื้อหาได้ตามปกติ
- คนลองเองตาม AC-APR-02:
  Given อาจารย์อนุมัติเนื้อหาแล้ว
  When อัปโหลดไฟล์ที่ไม่ใช่ PDF, JPG, PNG หรือเกิน 10 MB แล้วอัปโหลด PDF ที่ถูกต้อง จากนั้น login ด้วยบัญชีเจ้าหน้าที่กองกิจแล้วกด "ตรวจผ่าน"
  Then ไฟล์แรกขึ้นข้อผิดพลาด ไฟล์ที่ถูกต้องผ่าน และสถานะเป็น `อนุมัติสมบูรณ์`
- ยังขาด: ไม่มี

### T-14 จำกัดชนิดและขนาดไฟล์ใบปะหน้า
- รองรับ: FR-APR-04, IF-UPLOAD-01
- ตรวจด้วย: AC-APR-02
- ไฟล์ที่แตะ: `backend/app/config.py`, `backend/app/services/project_approval_service.py`, `backend/tests/test_AC_APR_02_cover_sheet_upload.py`, `frontend/src/pages/ProjectApprovalPage.jsx`, `frontend/src/__tests__/project-approval-cover-sheet.test.jsx`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-07
- เสร็จเมื่อ: `test_AC_APR_02_cover_sheet_upload_rejects_invalid_file` ผ่านตามชนิดและขนาดไฟล์ที่ทีมกำหนด และหน้าจอแสดงข้อผิดพลาดไฟล์
- สถานะ: เสร็จ รอทีมตรวจ

### T-15 เปิดแผงตรวจของกองกิจจากหน้าหลักตามบทบาท
- รองรับ: FR-APR-05, FR-APR-06
- ตรวจด้วย: AC-APR-02, AC-APR-04
- ไฟล์ที่แตะ: `frontend/src/App.jsx`, `frontend/src/__tests__/setup.test.jsx`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-10, T-12
- เสร็จเมื่อ: test หน้าจอยืนยันว่าเจ้าหน้าที่กองกิจ login แล้วเปิดแผงตรวจได้ตามคำตอบของทีม
- สถานะ: เสร็จ รอทีมตรวจ

### T-16 แสดงคำเตือน AI โดยไม่บล็อกการอนุมัติ
- รองรับ: FR-APR-07
- ตรวจด้วย: AC-APR-05
- ไฟล์ที่แตะ: `frontend/src/pages/ProjectApprovalPage.jsx`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-05
- เสร็จเมื่อ: หน้าจอแสดงคำเตือนตามคำตอบของทีม และปุ่มอนุมัติยังใช้งานได้ โดยไม่สร้างกลไกตรวจจับ AI เกินคำตอบนั้น
- สถานะ: เสร็จ รอทีมตรวจ

### T-17 ทดสอบคำเตือน AI ไม่บล็อกการอนุมัติ
- รองรับ: FR-APR-07
- ตรวจด้วย: AC-APR-05
- ไฟล์ที่แตะ: `backend/tests/test_AC_APR_05_ai_warning_does_not_block.py`, `frontend/src/__tests__/project-approval-ai-warning.test.jsx`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-16
- เสร็จเมื่อ: `test_AC_APR_05_ai_warning_does_not_block` ผ่าน โดยไม่ทดสอบความแม่นยำของการตรวจจับ AI
- สถานะ: เสร็จ รอทีมตรวจ

## ตารางตรวจความครบ

### Acceptance Criteria

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-APR-01 | T-04, T-05 |
| AC-APR-02 | T-06, T-07, T-09, T-10, T-14, T-15 |
| AC-APR-03 | T-02, T-03 |
| AC-APR-04 | T-11, T-12, T-15 |
| AC-APR-05 | T-16, T-17 |
| AC-APR-06 | T-13 |

### Constraints

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-NFR-21 | T-02, T-13 |
| IF-UC10-01 | T-08, T-09 |
| IF-UC01-02 | T-11, T-12 |
| IF-UPLOAD-01 | T-06, T-07, T-14 |

### Functional Requirements

| FR ID | AC ที่ตรวจ FR นี้ | เฟส |
|---|---|---|
| FR-APR-01 | AC-APR-03 | เฟส 1 |
| FR-APR-02 | AC-APR-01 ตามตาราง Traceability ของ spec | เฟส 1, 2 |
| FR-APR-03 | AC-APR-01 | เฟส 2 |
| FR-APR-04 | AC-APR-02 | เฟส 3, เฟสรอคำตอบ |
| FR-APR-05 | AC-APR-02 | เฟส 4, เฟสรอคำตอบ |
| FR-APR-06 | AC-APR-04 | เฟส 5, เฟสรอคำตอบ |
| FR-APR-07 | AC-APR-05 | เฟสรอคำตอบ |

## สิ่งที่ยังไม่ทำ

- **Q-01:** หากอาจารย์กดอนุมัติเนื้อหาแล้ว แต่ไม่อัปโหลดใบปะหน้าที่เซ็นแล้วภายในเวลาที่กำหนด ระบบมีการติดตาม/แจ้งเตือนอย่างไร
  - task ที่รอ: ไม่มี เนื่องจาก spec ยังไม่มี FR สำหรับการติดตาม/แจ้งเตือนหรือสถานะเพิ่มเติม และ plan.md ระบุว่ายังไม่ออกแบบส่วนนี้
- **Q-02:** เกณฑ์การตรวจจับเนื้อหาที่คล้ายถูกสร้างจาก AI เป็นการตรวจจับอัตโนมัติหรือดุลพินิจของอาจารย์
  - ตอบแล้ว (2569-10-31): ข้อความเตือนทั่วไปทุกครั้ง; T-16, T-17 ทำแล้ว
- **Q-03:** รูปแบบไฟล์ใบปะหน้าที่อัปโหลดได้และขนาดไฟล์สูงสุด
  - ตอบแล้ว (2569-10-31): PDF, JPG, PNG สูงสุด 10 MB; T-14 ทำแล้ว
- **Q-01 ของ specs/009:** หน้าหลักของเจ้าหน้าที่กองกิจคือหน้าใด
  - ตอบแล้ว (2569-10-31): แผงตรวจเอกสาร UC-05; T-15 ทำแล้ว

Q-01 ยังเปิด จึงยังไม่มีการติดตามหรือแจ้งเตือนเมื่อไม่อัปโหลดใบปะหน้า AC ทุกข้อใน spec ยังไม่ติ๊กจนกว่าทีมจะลองตามจุดตรวจ

## เรื่องที่ต้องให้ทีมตัดสิน

ข้อเหล่านี้ไม่มีคำตอบใน spec และยังไม่มี ID เป็นข้อเสนอให้ทีมพิจารณาเพิ่มลง spec ไม่ได้ตัดสินแทนทีม

1. ใครเป็นผู้ส่งเอกสารกลับ UC-01: Scope และ IF-UC01-02 เขียนว่าอาจารย์ส่งกลับพร้อมความเห็น แต่ FR-APR-06, AC-APR-04 และ ASM-02 เขียนว่ากองกิจ ไฟล์นี้ทำเฉพาะกองกิจตามที่มี FR และ AC รองรับ ถ้าอาจารย์ต้องส่งกลับได้ด้วย ต้องเพิ่ม FR และ AC
2. สถานะก่อนอัปโหลดใบปะหน้า: AC-APR-03 เรียกเอกสารที่เปิดดูว่า "รออนุมัติ" ส่วน FR-APR-04 ให้เปลี่ยนเป็น "รออนุมัติ" หลังอัปโหลด ไฟล์นี้ไม่เพิ่มชื่อสถานะใหม่ จึงใช้การมี `CoverSheetUpload` แยกว่าอัปโหลดแล้วหรือยัง
3. การเลือกเอกสารที่ต้องอนุมัติ: plan.md มีเฉพาะ API ตาม `approvalId` ไม่มีรายการเอกสารรออนุมัติ และคิวส่งต่อจาก UC-03 ยังไม่เชื่อมกับฟีเจอร์นี้ หน้าจอจึงเปิดได้เฉพาะชุดตัวอย่าง
4. สิทธิ์ตามบทบาท: spec กำหนดเฉพาะการ Login จึงยังไม่จำกัดว่า `POST /content-approval` เป็นของอาจารย์ หรือ `POST /review` และ `POST /return` เป็นของกองกิจ
5. ฟิลด์ใน plan.md: `ProjectDocumentItem` ไม่มีวัตถุประสงค์ ตัวชี้วัด และรูปแบบเอกสาร แต่ FR-APR-02 ต้องใช้ T-01 จึงเพิ่มฟิลด์เหล่านี้ ควรปรับ plan.md ให้ตรงกัน
6. กล่องยืนยันก่อนอนุมัติเนื้อหา ส่งใบปะหน้า ตรวจผ่าน และตีกลับ: ทำตามคำสั่งทีมแต่ยังไม่มีใน spec ควรเพิ่มลง spec หรือไม่

## เทียบเลข task เดิม

ฉบับเดิมเรียงตามชั้น และ T-19 "ต่อหน้าจอกับ API จริง" ถูกยกเลิก เพราะแต่ละเฟสต่อ API จริงในตัวแล้ว ส่วน T-10 เดิม (หน้าอนุมัติแบบ mock) ทำเสร็จแล้วและเป็นฐานของ T-03

| task เดิม | task ใหม่ |
|---|---|
| T-01 | T-01 |
| T-02 | T-01, T-11 |
| T-03 | T-06, T-08 |
| T-04 | T-02, T-13 |
| T-05 | T-02 |
| T-06 | T-04, T-06, T-14 |
| T-07 | T-09 |
| T-08 | T-11 |
| T-09 | T-08, T-09 |
| T-10 | T-03, T-05, T-07 |
| T-11 | T-10, T-12 |
| T-12 | T-16 |
| T-13 | T-02, T-03 |
| T-14 | T-04, T-05, T-09, T-10 |
| T-15 | T-04, T-05 |
| T-16 | T-11, T-12 |
| T-17 | T-17 |
| T-18 | T-13 |
| T-19 | ยกเลิก |
