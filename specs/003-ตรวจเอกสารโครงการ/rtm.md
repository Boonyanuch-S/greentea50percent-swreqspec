# RTM: ตรวจเอกสารโครงการ
อ้างอิง: spec.md Draft v2 | tasks.md | test-cases.md
สร้างด้วย /verify เมื่อ 2569-11-09T06:44:14Z | test: backend 148/148 ผ่าน, frontend suite ผ่าน

ไม่มี `specs/000-shared/` และไม่มี `mockups/`

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-VDC-01 | AC-VDC-03 | T-04, T-05, T-06, T-23 | `review_queue_service.py`: `list_pending`; `ReviewQueuePage.jsx`: `urgentFirst` | `test_AC_VDC_03_*`, `test_TC_VDC_03_*`, `document-review-checklist.test.jsx` (ผ่าน) | ช่องโหว่ (F-001) |
| FR-VDC-02 | AC-VDC-04 | T-11, T-12 | `backend/app/routers/review_queue.py`: `get_submission`; `frontend/src/pages/DocumentReviewPage.jsx` | `test_AC_VDC_04_document_review_displays_details_and_checklist` (ผ่าน) | ครบ |
| FR-VDC-03 | AC-VDC-04 | T-11, T-12, T-13 | `backend/app/routers/submissions.py`: `update_submission_checklist`; `frontend/src/components/ReviewerChecklistPanel.jsx` | `test_AC_VDC_04_reviewer_selects_relevant_checklist_items` (ผ่าน) | ช่องโหว่ (F-003) |
| FR-VDC-04 | ไม่มี AC ที่ตรวจเรื่องนี้ | T-12 | `frontend/src/pages/DocumentReviewPage.jsx` | ไม่มี test ตรง | ช่องโหว่ (F-004) |
| FR-VDC-05 | AC-VDC-01 | T-14, T-15, T-16, T-20, T-22 | `backend/app/services/approval_service.py`: `approve`; `frontend/src/components/ApprovalAction.jsx` | `test_AC_VDC_01_approve_forwards_to_advisor` (ผ่าน) | ช่องโหว่ (F-002, F-005) |
| FR-VDC-06 | AC-VDC-02 | T-17, T-18, T-19, T-21 | `backend/app/services/rejection_service.py`: `reject`; `frontend/src/components/RejectDialog.jsx` | `test_AC_VDC_02_reject_sends_reason_to_member` (ผ่าน) | ครบ |
| FR-VDC-07 | AC-VDC-05 | T-07 ถึง T-10 | `backend/app/services/checklist_service.py`, `backend/app/routers/checklists.py` | `test_AC_VDC_05_all_reviewers_see_same_latest_rule` (ผ่าน) | ช่องโหว่ (F-003) |
| NFR-SEC-01 | AC-VDC-06 | T-01, T-03 | `backend/app/middleware/auth.py`: `require_roles` | `test_AC_VDC_06_unauthenticated_user_blocked` (ผ่าน) | ครบ |
| CON-NFR-21 | AC-VDC-06 | T-01, T-03 | `backend/app/middleware/auth.py`: `require_roles` | เหมือน NFR-SEC-01 (ผ่าน) | ครบ |
| IF-CHK-02 | AC-VDC-05 | T-07, T-08 | `backend/app/services/checklist_service.py`: `latest_rule`, `latest_items` | `test_checklist_versioning.py` และ `test_AC_VDC_05_all_reviewers_see_same_latest_rule` (ผ่าน) | ครบ |
| IF-UC05-01 | AC-VDC-01 | T-14 | `backend/app/services/approval_service.py`: `approve` | `test_project_moves_from_club_to_completed_on_one_data_set` (ผ่าน) | ครบ |
| IF-UC01-01 | AC-VDC-02 | T-17, T-21 | `backend/app/services/rejection_service.py`: `reject` | `test_AC_VDC_02_reject_sends_reason_to_member` (ผ่าน) | ครบ |

สรุป: ครบ 7 | ยังไม่ถึง 0 | รอ 0 | ช่องโหว่ 5

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `GET /review-queue` | FR-VDC-01 | ตรง | หลังบ้านเรียงตามเวลาส่งและ `submission_id` |
| `frontend/src/pages/ReviewQueuePage.jsx`: `urgentFirst` | CHANGELOG 2569-11-02 | ขัดกับข้อความ FR-VDC-01 และ AC-VDC-03 | F-001 |
| `GET /submissions/{id}` | FR-VDC-02 | ตรง | |
| `GET /checklists/latest`, `POST /checklists/items`, `PATCH /checklists/items/{id}` | FR-VDC-07, IF-CHK-02 | ตรง | |
| `POST /submissions/{id}/review/approve`, `/reject` | FR-VDC-05, FR-VDC-06 | ตรง แต่จำกัดเฉพาะเอกสารที่รอตรวจ | F-005 |
| `frontend/src/pages/DocumentReviewPage.jsx`: การจับคู่เอกสารกับ `checklist_item_name` | FR-VDC-03, ASM-03, Q-07 | ขัดกับ spec | F-003 |
| `backend/app/middleware/auth.py`: `require_roles` | CON-NFR-21 | ตรง | |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-001 | ตัวเลขไม่ตรง spec | `frontend/src/pages/ReviewQueuePage.jsx`, `frontend/src/utils/urgency.js` | FR-VDC-01, AC-VDC-03 | หน้าจอเรียงงานด่วนก่อนโดยใช้ `URGENT_DAYS = 30` จาก `urgentFirst` และลำดับ `activity_date` แทนการเรียงตาม `submitted_at` ตาม wording ของ spec; ควรแก้ข้อความ FR-VDC-01 และ AC-VDC-03 ให้ตรงกับลำดับจริงหรือปรับโค้ดให้ตาม spec | |
| F-002 | test อ่อน | `backend/app/services/approval_service.py`, `frontend/src/components/ApprovalAction.jsx` | FR-VDC-05, AC-VDC-01 | test ตรวจเฉพาะสถานะอนุมัติและการส่งต่อ ไม่ได้ตรวจว่ากรรมการเห็นข้อความแจ้งเตือนจริงหรือ API จัดส่ง notification ตาม Q-03; ถ้าเอา notification ออกหรือเปลี่ยนข้อความจะไม่มี test ล้ม | |
| F-003 | โค้ดไม่มี FR | `frontend/src/pages/DocumentReviewPage.jsx`, `frontend/src/components/ReviewContext.jsx`, `backend/app/routers/project_documents.py` | ASM-03, Q-07, FR-VDC-07 | การจับคู่ผลตรวจกับไฟล์และรายการตรวจใช้ `item_name` แทน `checklist_item_id` ทำให้เมื่อเจ้าหน้าที่แก้ชื่อรายการกลาง หรือ rename item แล้วผลตรวจเดิมหายไป แม้ spec ระบุให้คงสถานะตรวจเดิมไว้ตราบใดที่ item เดิมยังอยู่ | แก้โค้ด |
| F-004 | FR ไม่มี AC | `spec.md`: FR-VDC-04 | FR-VDC-04 | FR-VDC-04 ระบุให้เจ้าหน้าที่ตรวจสอบเนื้อหาและรูปแบบเอกสารก่อนตัดสินใจ แต่ไม่มี AC ที่ตรวจเรื่องนี้ใน traceability; ควรเสนอทีมเพิ่ม AC ที่ตรวจเนื้อหา/รูปแบบเอกสารโดยตรง | |
| F-005 | test อ่อน | `backend/app/services/approval_service.py` | Q-05, T-22 | logic `pending_only=True` และ test ที่ตรวจคำตัดสินล่าสุดแทนที่ก่อนหน้า ไม่ได้ตรวจพฤติกรรมเมื่อมีคำตัดสินซ้ำบนข้อมูลเดียวกันจริงไประยะยาว; ขาด assertion สำหรับวิธีจัดการทับคำตัดสินหรือผลลัพธ์สุดท้ายที่ผู้ใช้เห็น | |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| F-001 | ยังไม่แก้ | จนถึงวันที่ตรวจ รัน frontend suite ผ่าน แต่ `ReviewQueuePage.jsx` ยังใช้ `urgentFirst` และ `URGENT_DAYS = 30` ต่อเนื่อง |
| F-003 | แก้ใช้ `checklist_item_id` พร้อม fallback ชื่อ Item เพื่อให้คงสถานะแม้มี rename | รัน `PYTHONPATH=. pytest -v` แล้ว; `DocumentReviewPage.jsx` และ `checklist_item_id` จาก `project_documents.py` ใช้ identity เดิมแทนการ match ด้วย `item_name` |
| F-004 | ยังไม่แก้ | spec ยังไม่มี AC ที่ระบุ FR-VDC-04 อย่างชัดเจนตาม traceability |
