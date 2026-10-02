# Tasks Breakdown: ตรวจเอกสารโครงการ
- Feature: ตรวจเอกสารโครงการ
- Spec ID: SPEC-VDC-003
- อ้างอิง plan.md: specs/003-ตรวจเอกสารโครงการ/plan.md
- วันที่: 2026-10-01

- สรุป: ทำ 9 task; 4 task ต้องรอ Open Questions

## รายการ task

### T-01 กำหนดสิทธิ์เข้าถึงและตรวจสอบ Login
- รองรับ: CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: AC-VDC-06
- ไฟล์ที่แตะ: backend/app/middleware/auth.py, backend/app/routers/review_queue.py, frontend/src/api/client.js
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: ทุกการเข้าถึงคิวเอกสารและรายละเอียดเอกสารจะถูกปฏิเสธจนกว่าจะยืนยันตัวตนสำเร็จ
- สถานะ: เสร็จ รอทีมตรวจ

### T-02 สร้างข้อมูลเอกสารและ API คิวการตรวจ
- รองรับ: FR-VDC-01, FR-VDC-02, FR-VDC-03
- ตรวจด้วย: AC-VDC-03
- ไฟล์ที่แตะ: backend/app/models/project_submission.py, backend/app/services/review_queue_service.py, backend/app/routers/review_queue.py
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: `GET /review-queue` ส่งคืนรายการเอกสารรอตรวจเรียงตามวันที่ส่งก่อน-หลัง และ `GET /submissions/{submission_id}` ดึงรายละเอียดโครงการได้
- สถานะ: เสร็จ รอทีมตรวจ

### T-03 สร้างหน้า “คิวเอกสารรอตรวจ”
- รองรับ: FR-VDC-01
- ตรวจด้วย: AC-VDC-03
- ไฟล์ที่แตะ: frontend/src/pages/ReviewQueuePage.jsx, frontend/src/api/reviewQueue.js
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: เจ้าหน้าที่เปิดคิวแล้วเห็นลิสต์เอกสารเรียงตามวันที่ส่งเข้าก่อน-หลังและสามารถเลือกเอกสารได้
- สถานะ: เสร็จ รอทีมตรวจ

### T-04 สร้างโมเดล Checklist กลางและเลือกเวอร์ชันล่าสุด
- รองรับ: FR-VDC-03, FR-VDC-07, IF-CHK-02
- ตรวจด้วย: AC-VDC-04, AC-VDC-05
- ไฟล์ที่แตะ: backend/app/models/checklist_rule.py, backend/app/models/checklist_item.py, backend/app/services/checklist_service.py
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: ระบบเลือก Checklist กลางฉบับล่าสุดสำหรับเอกสารได้และให้ผลลัพธ์ที่สอดคล้องกับเวอร์ชันกลางเดียวกันสำหรับทุกเจ้าหน้าที่
- สถานะ: รอ Q-01, Q-02

### T-05 สร้างหน้าและ API แสดงรายละเอียดเอกสารพร้อม Checklist
- รองรับ: FR-VDC-02, FR-VDC-03, FR-VDC-04
- ตรวจด้วย: AC-VDC-04
- ไฟล์ที่แตะ: backend/app/routers/submissions.py, backend/app/services/project_review_service.py, frontend/src/pages/DocumentReviewPage.jsx
- ต้องทำหลัง: T-02, T-04
- เสร็จเมื่อ: เจ้าหน้าที่เปิดรายละเอียดเอกสารแล้วเห็นข้อมูลโครงการและ Checklist ที่ระบุรายการครบ/ไม่ครบตามเกณฑ์กลางฉบับล่าสุด
- สถานะ: พร้อมทำ

### T-06 ให้เจ้าหน้าที่ตรวจสอบเนื้อหาและรูปแบบก่อนตัดสินใจ
- รองรับ: FR-VDC-04
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-05
- ไฟล์ที่แตะ: frontend/src/components/ReviewerChecklistPanel.jsx, frontend/src/components/ReviewDecisionForm.jsx
- ต้องทำหลัง: T-05
- เสร็จเมื่อ: เจ้าหน้าที่สามารถอ่านเนื้อหาและรูปแบบเอกสารก่อนกดอนุมัติหรือตีกลับ และมีฟังก์ชันจัดเก็บผลตรวจที่พร้อมใช้สำหรับคำตัดสินต่อไป
- สถานะ: พร้อมทำ

### T-07 สร้างกระบวนการอนุมัติส่งต่อให้อาจารย์ที่ปรึกษา
- รองรับ: FR-VDC-05, IF-UC05-01, IF-CHK-02
- ตรวจด้วย: AC-VDC-01
- ไฟล์ที่แตะ: backend/app/services/approval_service.py, backend/app/routers/review_decisions.py, frontend/src/components/ApprovalAction.jsx
- ต้องทำหลัง: T-05, T-06
- เสร็จเมื่อ: เมื่อเอกสารผ่าน Checklist แล้วเจ้าหน้าที่กดอนุมัติ ระบบเปลี่ยนสถานะเป็น “ส่งต่ออาจารย์” และสร้างการแจ้งกรรมการสโมสรว่าอนุมัติแล้ว
- สถานะ: รอ Q-03

### T-08 สร้างกระบวนการตีกลับพร้อมเหตุผลและแจ้งกรรมการสโมสร
- รองรับ: FR-VDC-06, IF-UC01-01
- ตรวจด้วย: AC-VDC-02
- ไฟล์ที่แตะ: backend/app/services/rejection_service.py, backend/app/models/review_decision.py, frontend/src/components/RejectDialog.jsx
- ต้องทำหลัง: T-05, T-06
- เสร็จเมื่อ: เมื่อเอกสารไม่ผ่าน Checklist และเจ้าหน้าที่กดตีกลับพร้อมเหตุผล ระบบเปลี่ยนสถานะเป็น “ตีกลับให้แก้ไข” และส่งเหตุผลไปยังกรรมการสโมสรตามที่ระบุ
- สถานะ: รอ Q-04

### T-09 ป้องกันการอนุมัติ/ตีกลับซ้ำซ้อนกันและตรวจสอบความครบทุก AC
- รองรับ: FR-VDC-05, FR-VDC-06, FR-VDC-07, CON-NFR-21, IF-CHK-02, IF-UC05-01, IF-UC01-01, NFR-SEC-01
- ตรวจด้วย: AC-VDC-01, AC-VDC-02, AC-VDC-03, AC-VDC-04, AC-VDC-05, AC-VDC-06
- ไฟล์ที่แตะ: backend/tests/test_review_workflow.py, backend/tests/test_auth_review_access.py, backend/tests/test_checklist_versioning.py
- ต้องทำหลัง: T-01, T-02, T-03, T-04, T-05, T-06, T-07, T-08
- เสร็จเมื่อ: การทดสอบทุก AC ผ่าน และ traceability ของ FR / IF / NFR ครบทุกตัวตาม spec
- สถานะ: รอ Q-05

## ตารางตรวจความครบ

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-VDC-01 | T-07, T-09 |
| AC-VDC-02 | T-08, T-09 |
| AC-VDC-03 | T-02, T-03, T-09 |
| AC-VDC-04 | T-04, T-05, T-09 |
| AC-VDC-05 | T-04, T-09 |
| AC-VDC-06 | T-01, T-09 |

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-NFR-21 | T-01, T-09 |
| IF-CHK-02 | T-04, T-07, T-09 |
| IF-UC05-01 | T-07, T-09 |
| IF-UC01-01 | T-08, T-09 |
| NFR-SEC-01 | T-01, T-09 |

## สิ่งที่ยังไม่ทำ
- Q-01 เกณฑ์ Checklist กลาง ถูกกำหนด/ปรับปรุงโดยใคร และผ่าน use case ใด (ยังไม่ระบุในตาราง เช่นเดียวกับ UC-01, UC-02 ก่อนหน้านี้) — รอ T-04
- Q-02 ข้อความ Exception Flow 5a ในภาพต้นฉบับไม่สมบูรณ์/อ่านไม่ชัด -> ขอภาพที่ชัดกว่านี้เพื่อยืนยันเนื้อหาที่ถูกต้อง — รอ T-04
- Q-03 การแจ้งกรรมการสโมสรเมื่ออนุมัติ (AC-VDC-01) เป็นการแจ้งแบบ synchronous หรือ asynchronous (เทียบกับรูปแบบ IF-NOT-01 ในสเปกอื่น) ยังไม่ระบุในตาราง — รอ T-07
- Q-04 การตีกลับ (Alternative Flow 4a) ส่งเอกสารกลับไปที่ UC-01 ทั้งฉบับ หรือกรรมการแก้ไขเฉพาะจุด ที่ระบุเหตุผลได้เลยโดยไม่ต้องกรอกใหม่ทั้งหมด? — รอ T-08
- Q-05 หากเจ้าหน้าที่หลายคนเปิดตรวจเอกสารฉบับเดียวกันพร้อมกัน (มาจากคิวเดียวกัน) ระบบป้องกันการอนุมัติ/ตีกลับซ้ำซ้อนกันอย่างไร? — รอ T-09
