# Tasks Breakdown: ตรวจเอกสารโครงการ

- Feature: ตรวจเอกสารโครงการ
- Spec ID: SPEC-VDC-003
- อ้างอิง: [spec.md](./spec.md), [plan.md](./plan.md)
- วันที่: 2569-10-30

- สรุป: มี 7 เฟส รวม 23 task
- Q-03 ถึง Q-06 ได้รับคำตอบแล้ว; T-20 ถึง T-23 ทำครบและรอทีมตรวจที่จุดตรวจเฟสสุดท้าย
- เฟสแรกที่ลองใช้งานจริงได้คือเฟส 1: ดูคิวเอกสารรอตรวจ (AC-VDC-03) หลังเฟส 0 ผ่านจุดตรวจ

## เฟส 0: ฐานรากและการยืนยันตัวตน (AC-VDC-06)

### T-01 ตรวจสิทธิ์ก่อนเข้าถึงฟีเจอร์
- รองรับ: CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: AC-VDC-06
- ไฟล์ที่แตะ: backend/app/middleware/auth.py, backend/app/routers/review_queue.py, frontend/src/services/client.js
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: API คิวและรายละเอียดปฏิเสธคำขอที่ไม่มีข้อมูลยืนยันตัวตน
- สถานะ: เสร็จ

### T-02 สร้างจุดเริ่ม FastAPI และเชื่อม router
- รองรับ: FR-VDC-01, FR-VDC-02, CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-04
- ไฟล์ที่แตะ: backend/app/main.py, backend/app/routers/review_queue.py, backend/tests/test_app_startup.py
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: `uvicorn app.main:app` เปิดบริการที่พอร์ต 8000 ได้, router คิวเอกสารถูกเชื่อมแล้ว และ `test_app_includes_review_queue_router` ผ่าน
- สถานะ: เสร็จ

### T-03 เพิ่มการทดสอบการปฏิเสธผู้ใช้ที่ยังไม่ Login
- รองรับ: CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: AC-VDC-06
- ไฟล์ที่แตะ: backend/tests/test_AC_VDC_06_unauthenticated_user_blocked.py
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: `test_AC_VDC_06_unauthenticated_user_blocked` ตรวจการเข้าถึงคิวและรายละเอียดโดยไม่มี session แล้วผ่าน
- สถานะ: เสร็จ

#### จุดตรวจเฟส 0
- test ที่ต้องผ่านทั้งหมด: `test_app_includes_review_queue_router`, `test_AC_VDC_06_unauthenticated_user_blocked`
- เปิดระบบ: หลังบ้าน `cd backend && PYTHONPATH=. uvicorn app.main:app --reload --port 8000`; หน้าจอ `cd frontend && npm run dev`
- คนลองเองตาม AC-VDC-06:
  Given ยังไม่ได้ Login
  When เรียก `/api/review-queue` หรือเปิดรายละเอียดเอกสาร
  Then ระบบปฏิเสธการเข้าถึง
- ยังขาด: ไม่มี

## เฟส 1: ดูคิวเอกสารรอตรวจ (AC-VDC-03)

### T-04 แสดงรายการคิวตามวันที่ส่ง
- รองรับ: FR-VDC-01
- ตรวจด้วย: AC-VDC-03
- ไฟล์ที่แตะ: backend/app/models/project_submission.py, backend/app/services/review_queue_service.py, backend/app/routers/review_queue.py
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: `GET /review-queue` คืนเอกสารที่รอตรวจเรียงตามวันและเวลาส่งจากเก่าไปใหม่ และ tests `test_TC_VDC_03_1_pending_queue_is_sorted_by_submitted_at`, `test_TC_VDC_03_2_same_submission_time_keeps_all_documents`, `test_TC_VDC_03_3_empty_pending_queue_returns_empty_list` ผ่าน
- สถานะ: เสร็จ

### T-05 สร้างหน้าคิวเอกสารรอตรวจ
- รองรับ: FR-VDC-01
- ตรวจด้วย: AC-VDC-03
- ไฟล์ที่แตะ: frontend/src/pages/ReviewQueuePage.jsx, frontend/src/services/reviewQueue.js, frontend/src/api/client.js
- แบบหน้าจอ: ไม่มี UI ID หรือ mockup ใน spec
- ต้องทำหลัง: T-04
- เสร็จเมื่อ: เจ้าหน้าที่เปิดคิว เห็นรายการเรียงตามวันที่ส่งและเลือกเอกสารได้ โดยหน้าจอเรียก API ผ่าน `frontend/src/api/client.js` และ `test_AC_VDC_03_queue_sorted_by_submission_date` ผ่าน
- สถานะ: เสร็จ

### T-06 เพิ่มการทดสอบการเรียงคิวตาม AC
- รองรับ: FR-VDC-01
- ตรวจด้วย: AC-VDC-03
- ไฟล์ที่แตะ: backend/tests/test_AC_VDC_03_queue_sorted_by_submission_date.py, frontend/src/__tests__/review-queue.test.jsx
- แบบหน้าจอ: ไม่มี UI ID หรือ mockup ใน spec
- ต้องทำหลัง: T-05
- เสร็จเมื่อ: `test_AC_VDC_03_queue_sorted_by_submission_date` ตรวจคิวหลายรายการที่เวลาส่งต่างกันและผ่าน
- สถานะ: เสร็จ

#### จุดตรวจเฟส 1
- test ที่ต้องผ่านทั้งหมด: `test_app_includes_review_queue_router`, `test_AC_VDC_06_unauthenticated_user_blocked`, `test_TC_VDC_03_1_pending_queue_is_sorted_by_submitted_at`, `test_TC_VDC_03_2_same_submission_time_keeps_all_documents`, `test_TC_VDC_03_3_empty_pending_queue_returns_empty_list`, `test_AC_VDC_03_queue_sorted_by_submission_date`
- เปิดระบบ: หลังบ้าน `cd backend && PYTHONPATH=. uvicorn app.main:app --reload --port 8000`; หน้าจอ `cd frontend && npm run dev`
- คนลองเองตาม AC-VDC-03:
  Given มีเอกสารรอตรวจหลายฉบับที่วันเวลาส่งต่างกัน
  When เจ้าหน้าที่เปิดคิวเอกสาร
  Then รายการเรียงจากเอกสารที่ส่งก่อนถึงเอกสารที่ส่งทีหลัง
- เกณฑ์กรณีวันเวลาส่งเท่ากันปิดแล้วใน T-23 ตาม Q-06: เรียง `submission_id` จากน้อยไปมาก

## เฟส 2: แก้ไข Checklist ส่วนกลางฉบับล่าสุด (AC-VDC-05)

### T-07 สร้างโมเดลและบริการ Checklist แบบมีเวอร์ชัน
- รองรับ: FR-VDC-07, IF-CHK-02
- ตรวจด้วย: AC-VDC-05
- ไฟล์ที่แตะ: backend/app/models/checklist_rule.py, backend/app/models/checklist_item.py, backend/app/services/checklist_service.py, backend/tests/test_checklist_versioning.py
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: บริการเก็บรายการกลางฉบับล่าสุดร่วมกันและใช้ item ID เดิมเมื่อแก้ชื่อรายการ เพื่อคงผลตรวจของรายการเดิม โดย `test_checklist_versions_keep_stable_item_id` ผ่าน
- สถานะ: เสร็จ

### T-08 เพิ่ม API อ่าน เพิ่ม และแก้ไข Checklist กลาง
- รองรับ: FR-VDC-07, IF-CHK-02, CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: AC-VDC-05
- ไฟล์ที่แตะ: backend/app/routers/checklists.py, backend/app/services/checklist_service.py, backend/app/main.py, backend/tests/test_checklist_api.py
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-07
- เสร็จเมื่อ: `GET /checklists/latest`, `POST /checklists/items` และ `PATCH /checklists/items/{item_id}` ใช้รายการฉบับล่าสุดและตรวจการยืนยันตัวตน โดย `test_checklist_api_uses_latest_and_requires_auth` ผ่าน; ใช้ SQLite in-memory เป็นฐานข้อมูลจำลองเฉพาะขณะ backend ทำงาน
- สถานะ: เสร็จ

### T-09 เพิ่มหน้าจอจัดการ Checklist กลาง
- รองรับ: FR-VDC-07, IF-CHK-02
- ตรวจด้วย: AC-VDC-05
- ไฟล์ที่แตะ: frontend/src/pages/ChecklistManagementPage.jsx, frontend/src/components/ChecklistManagementPanel.jsx, frontend/src/api/client.js, frontend/src/App.jsx, frontend/src/__tests__/checklist-management.test.jsx
- แบบหน้าจอ: ไม่มี UI ID หรือ mockup ใน spec
- ต้องทำหลัง: T-08
- เสร็จเมื่อ: เจ้าหน้าที่เพิ่มหรือแก้ชื่อรายการได้ และ `test_checklist_management_adds_and_edits_items` ยืนยันว่าหน้าจออ่าน/เขียนผ่าน API client ที่กำหนด
- สถานะ: เสร็จ

### T-10 ทดสอบ Checklist ฉบับล่าสุดร่วมกัน
- รองรับ: FR-VDC-07, IF-CHK-02, ASM-03
- ตรวจด้วย: AC-VDC-05
- ไฟล์ที่แตะ: backend/tests/test_AC_VDC_05_all_reviewers_see_same_latest_rule.py, frontend/src/__tests__/checklist-management.test.jsx
- แบบหน้าจอ: ไม่มี UI ID หรือ mockup ใน spec
- ต้องทำหลัง: T-09
- เสร็จเมื่อ: `test_AC_VDC_05_all_reviewers_see_same_latest_rule` ตรวจว่าผู้ตรวจอีกคนเห็นรายการฉบับล่าสุดเดียวกันและ item ID เดิมยังคงเดิมเมื่อแก้ชื่อ; การคงสถานะตรวจจริงทดสอบหลังมี storage รายโครงการในเฟส 3
- สถานะ: เสร็จ

#### จุดตรวจเฟส 2
- test ที่ต้องผ่านทั้งหมด: `test_app_includes_review_queue_router`, `test_AC_VDC_06_unauthenticated_user_blocked`, `test_TC_VDC_03_1_pending_queue_is_sorted_by_submitted_at`, `test_TC_VDC_03_2_same_submission_time_keeps_all_documents`, `test_TC_VDC_03_3_empty_pending_queue_returns_empty_list`, `test_AC_VDC_03_queue_sorted_by_submission_date`, `test_checklist_versions_keep_stable_item_id`, `test_checklist_api_uses_latest_and_requires_auth`, `test_checklist_management_adds_and_edits_items`, `test_AC_VDC_05_all_reviewers_see_same_latest_rule`
- เปิดระบบ: หลังบ้าน `cd backend && PYTHONPATH=. uvicorn app.main:app --reload --port 8000`; หน้าจอ `cd frontend && npm run dev`
- คนลองเองตาม AC-VDC-05:
  Given เจ้าหน้าที่คนหนึ่งเพิ่มหรือแก้ไขรายการ Checklist กลาง
  When เจ้าหน้าที่อีกคนเปิดหน้า Checklist กลาง
  Then ทั้งสองเห็นรายการล่าสุดชุดเดียวกันและรายการที่แก้ชื่อยังใช้ item ID เดิม
- ติดตามผลจากเฟส 2: การเก็บและคงสถานะตรวจของ Checklist ต่อโครงการทำใน T-11 แล้ว

## เฟส 3: เลือก Checklist และตรวจรายละเอียดโครงการ (AC-VDC-04)

### T-11 เพิ่ม API รายละเอียดและ Checklist รายโครงการ
- รองรับ: FR-VDC-02, FR-VDC-03, FR-VDC-07, IF-CHK-02, CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: AC-VDC-04
- ไฟล์ที่แตะ: backend/app/routers/checklists.py, backend/app/routers/submissions.py, backend/app/services/project_review_service.py, backend/tests/test_project_review_checklist.py
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-08
- เสร็จเมื่อ: `GET /submissions/{submission_id}` คืนรายละเอียดเอกสาร และ `GET/PUT /submissions/{submission_id}/checklist` ใช้ Checklist กลางฉบับล่าสุดพร้อมบันทึกรายการที่เลือกและสถานะครบ/ไม่ครบของโครงการได้ โดย `test_AC_VDC_04_project_details_and_checklist_api` ผ่าน
- สถานะ: เสร็จ

### T-12 แสดงรายละเอียดเอกสารและ Checklist รายโครงการ
- รองรับ: FR-VDC-02, FR-VDC-03, FR-VDC-04, FR-VDC-07
- ตรวจด้วย: AC-VDC-04
- ไฟล์ที่แตะ: frontend/src/pages/DocumentReviewPage.jsx, frontend/src/components/ReviewerChecklistPanel.jsx, frontend/src/App.jsx, frontend/src/pages/ReviewQueuePage.jsx, frontend/src/services/reviewQueue.js, frontend/src/__tests__/document-review-checklist.test.jsx
- แบบหน้าจอ: ไม่มี UI ID หรือ mockup ใน spec
- ต้องทำหลัง: T-11
- หมายเหตุ: ทีมเลือก flow จำลองฝั่ง browser; รายละเอียดและผลตรวจรายโครงการเป็นข้อมูลชั่วคราวในหน่วยความจำ browser ไม่บันทึกผ่าน API และไม่คงข้าม reload/ผู้ใช้
- เสร็จเมื่อ: เจ้าหน้าที่เปิดรายละเอียดจากคิว ดูข้อมูล/เนื้อหาเอกสารจำลอง และเห็น Checklist กลางพร้อมสถานะรายโครงการได้ โดย `test_AC_VDC_04_document_review_displays_details_and_checklist` ผ่าน
- สถานะ: เสร็จ

### T-13 ทดสอบการเลือก Checklist ตามโครงการ
- รองรับ: FR-VDC-02, FR-VDC-03, FR-VDC-04
- ตรวจด้วย: AC-VDC-04
- ไฟล์ที่แตะ: backend/tests/test_AC_VDC_04_reviewer_selects_relevant_checklist_items.py, frontend/src/__tests__/document-review-checklist.test.jsx
- แบบหน้าจอ: ไม่มี UI ID หรือ mockup ใน spec
- ต้องทำหลัง: T-12
- เสร็จเมื่อ: `test_AC_VDC_04_reviewer_selects_relevant_checklist_items` ตรวจว่ารายการที่เลือกและผลครบ/ไม่ครบแสดงได้โดยไม่บังคับชุดหรือชื่อเอกสารเดียวกันทุกโครงการ
- สถานะ: เสร็จ

#### จุดตรวจเฟส 3
- test ที่ต้องผ่านทั้งหมด: `test_app_includes_review_queue_router`, `test_AC_VDC_06_unauthenticated_user_blocked`, `test_TC_VDC_03_1_pending_queue_is_sorted_by_submitted_at`, `test_TC_VDC_03_2_same_submission_time_keeps_all_documents`, `test_TC_VDC_03_3_empty_pending_queue_returns_empty_list`, `test_AC_VDC_03_queue_sorted_by_submission_date`, `test_checklist_versions_keep_stable_item_id`, `test_checklist_api_uses_latest_and_requires_auth`, `test_checklist_management_adds_and_edits_items`, `test_AC_VDC_05_all_reviewers_see_same_latest_rule`, `test_AC_VDC_04_project_details_and_checklist_api`, `test_AC_VDC_04_document_review_displays_details_and_checklist`, `test_AC_VDC_04_reviewer_selects_relevant_checklist_items`
- เปิดระบบ: หลังบ้าน `cd backend && PYTHONPATH=. uvicorn app.main:app --reload --port 8000`; หน้าจอ `cd frontend && npm run dev`
- คนลองเองตาม AC-VDC-04:
  Given เปิดรายละเอียดโครงการและมีรายการ Checklist กลาง
  When เจ้าหน้าที่เลือกและทำเครื่องหมายรายการที่เกี่ยวข้องกับโครงการ
  Then ระบบแสดงเฉพาะรายการที่เลือกและสถานะครบ/ไม่ครบ โดยไม่บังคับชุดหรือชื่อเดียวกันทุกโครงการ
- ยังขาด: ไม่มี

## เฟส 4: อนุมัติและส่งต่อให้อาจารย์ที่ปรึกษา (AC-VDC-01)

### T-14 เพิ่มบริการอนุมัติและส่งต่อเอกสาร
- รองรับ: FR-VDC-04, FR-VDC-05, IF-UC05-01
- ตรวจด้วย: AC-VDC-01
- ไฟล์ที่แตะ: backend/app/models/review_decision.py, backend/app/services/approval_service.py, backend/app/routers/review_decisions.py, backend/app/main.py, backend/tests/test_approval_service.py
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-13
- เสร็จเมื่อ: API บันทึกคำตัดสิน เปลี่ยนสถานะเป็น “ส่งต่ออาจารย์” และส่งเอกสารต่อไปยัง mock queue ของ UC-05 ตามที่ทีมยืนยัน โดย `test_approval_status_and_advisor_handoff` ผ่าน โดยการแจ้งตาม Q-03 ทำใน T-20
- สถานะ: เสร็จ

### T-15 เพิ่มการควบคุมอนุมัติในหน้ารายละเอียด
- รองรับ: FR-VDC-04, FR-VDC-05
- ตรวจด้วย: AC-VDC-01
- ไฟล์ที่แตะ: frontend/src/components/ApprovalAction.jsx, frontend/src/pages/DocumentReviewPage.jsx, frontend/src/api/client.js, frontend/src/__tests__/approval-action.test.jsx
- แบบหน้าจอ: ไม่มี UI ID หรือ mockup ใน spec
- ต้องทำหลัง: T-14
- เสร็จเมื่อ: เจ้าหน้าที่สั่งอนุมัติจากหน้ารายละเอียดได้ และ `test_approval_action_displays_result` ยืนยันว่าหน้าจอแสดงสถานะผลจาก API; prototype ใช้ username จาก `session.profile` ตามที่ทีมยืนยัน เนื่องจาก Login API จริงยังไม่ส่ง user ID
- สถานะ: เสร็จ

### T-16 ทดสอบส่วนการเปลี่ยนสถานะและส่งต่อเมื่ออนุมัติ
- รองรับ: FR-VDC-05, IF-UC05-01
- ตรวจด้วย: AC-VDC-01 (ส่วนเปลี่ยนสถานะและส่งต่อ; การแจ้งตาม Q-03 ทำใน T-20)
- ไฟล์ที่แตะ: backend/tests/test_approval_service.py, frontend/src/__tests__/approval-action.test.jsx
- แบบหน้าจอ: ไม่มี UI ID หรือ mockup ใน spec
- ต้องทำหลัง: T-15
- เสร็จเมื่อ: `test_approval_status_and_advisor_handoff` ยืนยันสถานะ “ส่งต่ออาจารย์” และการส่งเอกสารต่อผ่าน; T-20 ทดสอบการแจ้งกรรมการแบบ synchronous ตาม Q-03
- สถานะ: เสร็จ

#### จุดตรวจเฟส 4
- test ที่ต้องผ่านทั้งหมด: `test_app_includes_review_queue_router`, `test_AC_VDC_06_unauthenticated_user_blocked`, `test_TC_VDC_03_1_pending_queue_is_sorted_by_submitted_at`, `test_TC_VDC_03_2_same_submission_time_keeps_all_documents`, `test_TC_VDC_03_3_empty_pending_queue_returns_empty_list`, `test_AC_VDC_03_queue_sorted_by_submission_date`, `test_checklist_versions_keep_stable_item_id`, `test_checklist_api_uses_latest_and_requires_auth`, `test_checklist_management_adds_and_edits_items`, `test_AC_VDC_05_all_reviewers_see_same_latest_rule`, `test_AC_VDC_04_project_details_and_checklist_api`, `test_AC_VDC_04_document_review_displays_details_and_checklist`, `test_AC_VDC_04_reviewer_selects_relevant_checklist_items`, `test_approval_status_and_advisor_handoff`, `test_approval_action_displays_result`; การแจ้งกรรมการตาม Q-03 ทดสอบเพิ่มใน T-20
- เปิดระบบ: หลังบ้าน `cd backend && PYTHONPATH=. uvicorn app.main:app --reload --port 8000`; หน้าจอ `cd frontend && npm run dev`
- คนลองเองตาม AC-VDC-01:
  Given เอกสารครบตาม Checklist กลาง
  When เจ้าหน้าที่กดอนุมัติ
  Then ระบบส่งต่อเอกสารให้อาจารย์ที่ปรึกษาและแจ้งกรรมการสโมสรว่าอนุมัติแล้ว
- ยังขาด: ช่องทาง/ระบบปลายทางสำหรับ notification จริงยังไม่ระบุ; T-20 ใช้การจำลองใน process ตามขอบเขต prototype

## เฟส 5: ตีกลับเอกสารพร้อมเหตุผล (AC-VDC-02)

### T-17 เพิ่มบริการตีกลับและส่งเหตุผลไปยัง UC-01
- รองรับ: FR-VDC-04, FR-VDC-06, IF-UC01-01
- ตรวจด้วย: AC-VDC-02
- ไฟล์ที่แตะ: backend/app/models/review_decision.py, backend/app/services/rejection_service.py, backend/app/routers/review_decisions.py, backend/tests/test_rejection_service.py
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-14
- เสร็จเมื่อ: API เปลี่ยนสถานะเป็น “ตีกลับให้แก้ไข” และส่งเหตุผลเข้าคิว mock ของ UC-01 ตามที่ทีมยืนยัน โดย `test_reject_status_and_reason_sent_to_member` ผ่านและยังไม่สมมติว่าต้องแก้ทั้งฉบับหรือเฉพาะจุด
- สถานะ: เสร็จ

### T-18 เพิ่มหน้าจอยืนยันการตีกลับ
- รองรับ: FR-VDC-06
- ตรวจด้วย: AC-VDC-02
- ไฟล์ที่แตะ: frontend/src/components/RejectDialog.jsx, frontend/src/pages/DocumentReviewPage.jsx, frontend/src/api/client.js, frontend/src/__tests__/reject-dialog.test.jsx
- แบบหน้าจอ: ไม่มี UI ID หรือ mockup ใน spec
- ต้องทำหลัง: T-17
- เสร็จเมื่อ: เจ้าหน้าที่ระบุเหตุผลและยืนยันตีกลับได้ โดย `test_reject_dialog_requires_reason_and_displays_result` ยืนยันการแสดงสถานะและเหตุผลที่ API ส่งกลับ; UI แจ้งว่าเหตุผลเข้าคิวจำลอง UC-01 ตามที่ทีมยืนยัน
- สถานะ: เสร็จ

### T-19 ทดสอบการตีกลับพร้อมเหตุผล
- รองรับ: FR-VDC-06, IF-UC01-01
- ตรวจด้วย: AC-VDC-02
- ไฟล์ที่แตะ: backend/tests/test_AC_VDC_02_reject_sends_reason_to_member.py, frontend/src/__tests__/reject-dialog.test.jsx
- แบบหน้าจอ: ไม่มี UI ID หรือ mockup ใน spec
- ต้องทำหลัง: T-18
- เสร็จเมื่อ: `test_AC_VDC_02_reject_sends_reason_to_member` ตรวจสถานะตีกลับและเหตุผลที่ส่งให้กรรมการสโมสรได้
- สถานะ: เสร็จ

#### จุดตรวจเฟส 5
- test ที่ต้องผ่านทั้งหมด: `test_app_includes_review_queue_router`, `test_AC_VDC_06_unauthenticated_user_blocked`, `test_TC_VDC_03_1_pending_queue_is_sorted_by_submitted_at`, `test_TC_VDC_03_2_same_submission_time_keeps_all_documents`, `test_TC_VDC_03_3_empty_pending_queue_returns_empty_list`, `test_AC_VDC_03_queue_sorted_by_submission_date`, `test_checklist_versions_keep_stable_item_id`, `test_checklist_api_uses_latest_and_requires_auth`, `test_checklist_management_adds_and_edits_items`, `test_AC_VDC_05_all_reviewers_see_same_latest_rule`, `test_AC_VDC_04_project_details_and_checklist_api`, `test_AC_VDC_04_document_review_displays_details_and_checklist`, `test_AC_VDC_04_reviewer_selects_relevant_checklist_items`, `test_approval_status_and_advisor_handoff`, `test_approval_action_displays_result`, `test_reject_status_and_reason_sent_to_member`, `test_reject_dialog_requires_reason_and_displays_result`, `test_AC_VDC_02_reject_sends_reason_to_member`
- เปิดระบบ: หลังบ้าน `cd backend && PYTHONPATH=. uvicorn app.main:app --reload --port 8000`; หน้าจอ `cd frontend && npm run dev`
- คนลองเองตาม AC-VDC-02:
  Given เอกสารไม่ครบตาม Checklist
  When เจ้าหน้าที่กดตีกลับพร้อมระบุเหตุผล
  Then ระบบเปลี่ยนสถานะเป็น “ตีกลับให้แก้ไข” และแจ้งกรรมการสโมสรพร้อมเหตุผล
- T-21 ทำเฉพาะการส่งเหตุผลและอ้าง submission เดิมกลับ UC-01 ตามขอบเขตที่ทีมเลือก; ยังไม่มี flow แก้/ส่งเฉพาะจุดกลับเข้าระบบ จึงยังไม่ครอบคลุม Q-04 ทั้งหมดตาม `spec.md`

## เฟสสุดท้าย: ปิดคำถามค้างและทดสอบ

### T-20 กำหนดการแจ้งเมื่ออนุมัติและทดสอบ AC-VDC-01 ฉบับเต็ม
- รองรับ: FR-VDC-05, IF-UC05-01
- ตรวจด้วย: AC-VDC-01
- ไฟล์ที่แตะ: backend/app/services/approval_service.py, backend/app/models/notification_message.py, backend/tests/test_AC_VDC_01_approve_forwards_to_advisor.py
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-16
- เสร็จเมื่อ: เพิ่มการแจ้งกรรมการแบบ synchronous ตาม Q-03 และ `test_AC_VDC_01_approve_forwards_to_advisor` ผ่านครบทั้งการส่งต่อและการแจ้ง; ไม่สมมติช่องทางภายนอกที่ยังไม่กำหนด
- สถานะ: เสร็จ รอทีมตรวจ

### T-21 ส่งเหตุผลกลับโดยอ้าง submission เดิม
- รองรับ: FR-VDC-06, IF-UC01-01
- ตรวจด้วย: AC-VDC-02
- ไฟล์ที่แตะ: backend/app/services/rejection_service.py, backend/app/routers/review_decisions.py, frontend/src/pages/DocumentReviewPage.jsx, backend/tests/test_return_flow_after_rejection.py
- แบบหน้าจอ: ไม่มี UI ID หรือ mockup ใน spec
- ต้องทำหลัง: T-19
- เสร็จเมื่อ: ส่ง `submission_id` เดิมพร้อมเหตุผลไปยัง UC-01 โดยคงข้อมูลโครงการเดิมไว้ ไม่สร้าง submission ใหม่ และ `test_return_flow_after_rejection` ผ่าน; ขอบเขตนี้ยังไม่มี flow ให้กรรมการแก้/ส่งเฉพาะจุดกลับเข้าระบบตาม Q-04
- สถานะ: เสร็จ รอทีมตรวจ

### T-22 ป้องกันการตัดสินเอกสารซ้ำเมื่อมีผู้ตรวจพร้อมกัน
- รองรับ: FR-VDC-05, FR-VDC-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานของ AC-VDC-01 และ AC-VDC-02
- ไฟล์ที่แตะ: backend/app/services/approval_service.py, backend/app/services/rejection_service.py, backend/tests/test_concurrent_review_decisions.py
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-19
- เสร็จเมื่อ: คำตัดสินล่าสุดแทนที่คำตัดสินก่อนหน้าตาม Q-05 และ test ยืนยันผลคำตัดสิน/ข้อความแจ้งล่าสุด
- สถานะ: เสร็จ รอทีมตรวจ

### T-23 กำหนดและทดสอบลำดับคิวเมื่อวันเวลาส่งเท่ากัน
- รองรับ: FR-VDC-01
- ตรวจด้วย: AC-VDC-03
- ไฟล์ที่แตะ: backend/app/services/review_queue_service.py, backend/tests/test_TC_selected_acceptance_criteria.py
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-06
- เสร็จเมื่อ: ใช้ `submission_id` จากน้อยไปมากเมื่อ `submitted_at` เท่ากันตาม Q-06 และ test ตรวจเอกสารที่ส่งเวลาเดียวกัน
- สถานะ: เสร็จ รอทีมตรวจ

#### จุดตรวจเฟสสุดท้าย
- test ที่ต้องผ่านทั้งหมด: `test_AC_VDC_01_approve_forwards_to_advisor`, `test_AC_VDC_02_reject_sends_reason_to_member`, `test_return_flow_after_rejection`, `test_latest_concurrent_review_decision_replaces_previous`, `test_AC_VDC_03_queue_uses_submission_id_for_equal_submission_times`
- รัน test และ build: `cd backend && PYTHONPATH=.. pytest`; `cd frontend && npm test -- --run`; `cd frontend && npm run build`
- เปิดระบบ: หลังบ้าน `cd backend && PYTHONPATH=. uvicorn app.main:app --reload --port 8000`; หน้าจอ `cd frontend && npm run dev`
- คนลองเอง:
  - AC-VDC-01: Given เอกสารผ่าน Checklist; When เจ้าหน้าที่อนุมัติ; Then สถานะเป็น “ส่งต่ออาจารย์” มี handoff ไป UC-05 และบันทึกการแจ้งใน mock แบบ synchronous ก่อนตอบกลับ โดยไม่อ้างว่าส่งออกนอกระบบ
  - AC-VDC-02: Given เอกสารไม่ครบ; When เจ้าหน้าที่ตีกลับพร้อมเหตุผล; Then ส่ง `submission_id` เดิมและเหตุผลไป UC-01 โดยคงข้อมูลโครงการเดิม
  - Q-05: Given มีคำตัดสินต่อเอกสารเดียวกันมากกว่าหนึ่งครั้ง; When คำตัดสินล่าสุดถูกประมวลผล; Then คำตัดสินและข้อความแจ้งล่าสุดแทนที่ผลก่อนหน้า
  - AC-VDC-03 / Q-06: Given เอกสารหลายฉบับมี `submitted_at` เท่ากัน; When เปิดคิว; Then เรียงตาม `submission_id` จากน้อยไปมาก
- ขอบเขต prototype: การแจ้งและ lock เก็บใน process; ยังไม่มีช่องทางแจ้งเตือนภายนอกหรือการประสานข้ามหลาย process

## ตารางตรวจความครบ

### Acceptance Criteria

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-VDC-01 | T-14, T-15, T-16, T-20 |
| AC-VDC-02 | T-17, T-18, T-19, T-21 |
| AC-VDC-03 | T-04, T-05, T-06, T-23 |
| AC-VDC-04 | T-11, T-12, T-13 |
| AC-VDC-05 | T-07, T-08, T-09, T-10 |
| AC-VDC-06 | T-01, T-03 |

### Constraints

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-NFR-21 | T-01, T-03, T-08, T-11 |
| IF-CHK-02 | T-07, T-08, T-09, T-11 |
| IF-UC05-01 | T-14, T-16, T-20 |
| IF-UC01-01 | T-17, T-19, T-21 |
| NFR-SEC-01 | T-01, T-03, T-08, T-11 |

### Functional Requirements

| FR ID | AC ที่ตรวจ FR นี้ | เฟส |
|---|---|---|
| FR-VDC-01 | AC-VDC-03 | เฟส 1 |
| FR-VDC-02 | AC-VDC-04 | เฟส 3 |
| FR-VDC-03 | AC-VDC-04 | เฟส 3 |
| FR-VDC-04 | AC-VDC-01, AC-VDC-02 | เฟส 4-5 |
| FR-VDC-05 | AC-VDC-01 | เฟส 4 และ T-20 |
| FR-VDC-06 | AC-VDC-02 | เฟส 5 และ T-21 |
| FR-VDC-07 | AC-VDC-05 | เฟส 2 |

## Open Questions

- ไม่มีคำถามค้างสำหรับ T-20 ถึง T-23; ทั้งสี่ task เสร็จ รอทีมตรวจที่จุดตรวจเฟสสุดท้าย
- Q-01, Q-02 และ Q-07 ตอบแล้วตาม `spec.md`; งาน Checklist ใช้รายการส่วนกลางฉบับล่าสุดร่วมกัน และการแก้ไขคงสถานะของรายการเดิมตาม ASM-03

## ข้อสังเกตสำหรับจุดตรวจ

- ไม่พบ `specs/000-shared/` หรือ mockup HTML สำหรับฟีเจอร์นี้
- `plan.md` เลือก FastAPI และ frontend proxy ปลายทางพอร์ต 8000 แต่ repository ยังไม่มี FastAPI app entrypoint; T-02 เพิ่มจุดเริ่มและ router wiring เพื่อให้ใช้คำสั่งรันในจุดตรวจได้
- UI ไม่มี UI ID ใน spec; งานหน้าจอจึงอ้างอิงหน้า/คอมโพเนนต์ตาม `plan.md` โดยตรง

## การแก้ไขเพิ่มเติมหลัง T-23

- แก้ navigation ของเจ้าหน้าที่คณะ: จากหน้ารายละเอียดสามารถเลือก “Checklist กลาง” แล้วเข้าสู่หน้าจัดการได้ และเลือก “คิวเอกสาร” เพื่อกลับหน้าคิว โดยไม่ต้องกดกลับรายละเอียดก่อน
- ไฟล์: `frontend/src/App.jsx`, `frontend/src/__tests__/checklist-management.test.jsx`
- Regression test: `เปิด Checklist กลางได้จากหน้ารายละเอียดเอกสาร` ใน `checklist-management.test.jsx`
- ผลตรวจ: frontend ทั้งชุด 15 tests ผ่าน; `npm run build` ผ่าน
- การแก้ไขนี้เป็นการทำให้ navigation ใช้งานได้ตามหน้า/FR เดิม ไม่เพิ่ม FR หรือ AC ใหม่; สถานะ T-20 ถึง T-23 ยังคง “เสร็จ รอทีมตรวจ”
- ข้อจำกัดที่ต้องคำนึงในการตรวจ AC-VDC-02: การส่งเหตุผลและการอ้าง submission เดิมทำแล้ว แต่การแก้/ส่งเฉพาะจุดกลับเข้าระบบตาม Q-04 ยังไม่ได้ทำ
