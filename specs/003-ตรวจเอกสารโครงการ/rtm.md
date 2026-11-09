# RTM: ตรวจเอกสารโครงการ
อ้างอิง: spec.md Draft v2 | tasks.md | test-cases.md
สร้างด้วย /verify เมื่อ 2569-11-09T07:31:00Z | test: backend 148/148 ผ่าน, frontend 76/76 ผ่าน

ไม่มี `specs/000-shared/`; มี mockup สำหรับ AC-VDC-04 ที่ `mockups/AC-VDC-04-review-document.html` และ `.png`

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-VDC-01 | AC-VDC-03 | T-04, T-05, T-06, T-23 | `backend/app/services/review_queue_service.py`: `list_pending`; `frontend/src/pages/ReviewQueuePage.jsx`: `urgentFirst` | `test_AC_VDC_03_*`, `test_TC_VDC_03_*` (ผ่าน) | ช่องโหว่ (F-001) |
| FR-VDC-02 | AC-VDC-04 | T-11, T-12 | `backend/app/routers/review_queue.py`: `get_submission`; `frontend/src/pages/DocumentReviewPage.jsx` | `test_AC_VDC_04_document_review_displays_details_and_checklist` (ผ่าน) | ช่องโหว่ (F-007) |
| FR-VDC-03 | AC-VDC-04 | T-11, T-12, T-13 | `backend/app/routers/submissions.py`: `update_submission_checklist`; `frontend/src/components/ReviewerChecklistPanel.jsx` | `test_AC_VDC_04_reviewer_selects_relevant_checklist_items` (ผ่าน); TC-VDC-04-1 ถึง 04-3 ไม่มี test ตามชื่อที่ระบุ | ช่องโหว่ (F-006) |
| FR-VDC-04 | AC-VDC-01, AC-VDC-02 (ไม่ตรวจ Then เรื่องการตรวจเนื้อหา/รูปแบบ) | T-12 | `frontend/src/pages/DocumentReviewPage.jsx`: `DocumentFileViewer` | ไม่มี test ตรง | ช่องโหว่ (F-004) |
| FR-VDC-05 | AC-VDC-01 | T-14, T-15, T-16, T-20, T-22 | `backend/app/services/approval_service.py`: `approve`; `frontend/src/components/ApprovalAction.jsx` | `test_AC_VDC_01_approve_forwards_to_advisor` (ผ่าน; ตรวจสถานะ handoff และ notification) | ครบ |
| FR-VDC-06 | AC-VDC-02 | T-17, T-18, T-19, T-21 | `backend/app/services/rejection_service.py`: `reject`; `frontend/src/components/RejectDialog.jsx` | `test_AC_VDC_02_reject_sends_reason_to_member` (ผ่าน) | ครบ |
| FR-VDC-07 | AC-VDC-05 | T-07 ถึง T-10 | `backend/app/services/checklist_service.py`, `backend/app/routers/checklists.py` | `test_AC_VDC_05_all_reviewers_see_same_latest_rule` (ผ่าน) | ครบ |
| NFR-SEC-01 | AC-VDC-06 | T-01, T-03 | `backend/app/middleware/auth.py`: `require_roles` | `test_AC_VDC_06_unauthenticated_user_blocked` (ผ่าน) | ครบ |
| CON-NFR-21 | AC-VDC-06 | T-01, T-03 | `backend/app/middleware/auth.py`: `require_roles` | เหมือน NFR-SEC-01 (ผ่าน) | ครบ |
| IF-CHK-02 | AC-VDC-05 | T-07, T-08 | `backend/app/services/checklist_service.py`: `latest_rule`, `latest_items` | `test_checklist_versioning.py` และ `test_AC_VDC_05_all_reviewers_see_same_latest_rule` (ผ่าน) | ครบ |
| IF-UC05-01 | AC-VDC-01 | T-14 | `backend/app/services/approval_service.py`: `approve` | `test_project_moves_from_club_to_completed_on_one_data_set` (ผ่าน) | ครบ |
| IF-UC01-01 | AC-VDC-02 | T-17, T-21 | `backend/app/services/rejection_service.py`: `reject` | `test_AC_VDC_02_reject_sends_reason_to_member` (ผ่าน) | ครบ |

สรุป: ครบ 8 | ยังไม่ถึง 0 | รอ 0 | ช่องโหว่ 4

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `GET /review-queue` | FR-VDC-01 | ตรง | หลังบ้านเรียงตามเวลาส่งและ `submission_id` |
| `frontend/src/pages/ReviewQueuePage.jsx`: `urgentFirst` | CHANGELOG 2569-11-02 | ขัดกับข้อความ FR-VDC-01 และ AC-VDC-03 | F-001 |
| `GET /submissions/{id}` | FR-VDC-02 | ตรง | |
| `GET /checklists/latest`, `POST /checklists/items`, `PATCH /checklists/items/{id}` | FR-VDC-07, IF-CHK-02 | ตรง | |
| `POST /submissions/{id}/review/approve`, `/reject` | FR-VDC-05, FR-VDC-06 | ตรง | |
| `frontend/src/pages/DocumentReviewPage.jsx`: ใช้ `checklist_item_id` พร้อม `item_name` fallback | FR-VDC-03, ASM-03, Q-07 | ตรง | F-003 แก้แล้ว |
| `frontend/src/pages/DocumentReviewPage.jsx`: `ReviewHistory` | — | ไม่มี FR / ไม่แสดงใน mockup AC-VDC-04 | ประวัติการตีกลับถูกแสดงเมื่อมีข้อมูล แต่ไม่มี requirement ใน spec หรือ API นี้ใน plan | F-007 |
| `backend/app/middleware/auth.py`: `require_roles` | CON-NFR-21 | ตรง | |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-001 | ตัวเลขไม่ตรง spec | `frontend/src/pages/ReviewQueuePage.jsx`, `frontend/src/utils/urgency.js` | FR-VDC-01, AC-VDC-03 | หน้าจอเรียงงานด่วนก่อนโดยใช้ `URGENT_DAYS = 30` จาก `urgentFirst` และลำดับ `activity_date` แทนการเรียงตาม `submitted_at` ตาม wording ของ spec; ควรแก้ข้อความ FR-VDC-01 และ AC-VDC-03 ให้ตรงกับลำดับจริงหรือปรับโค้ดให้ตาม spec | |
| F-004 | FR ไม่มี AC | `spec.md`: FR-VDC-04 | FR-VDC-04 | แม้ Traceability จะเชื่อม FR-VDC-04 กับ AC-VDC-01/02 แต่ Then ของ AC ทั้งสองไม่ตรวจว่าผู้ตรวจได้ตรวจเนื้อหาและรูปแบบเอกสารก่อนตัดสินใจ; ควรเสนอทีมเพิ่ม AC ที่ตรวจเรื่องนี้โดยตรง | |
| F-006 | AC ไม่มี test | `specs/003-ตรวจเอกสารโครงการ/test-cases.md`: TC-VDC-04-1 ถึง TC-VDC-04-3 | AC-VDC-04 | ทั้งสามแถวสถานะ “ใช้ได้” ระบุชื่อ test `test_TC_VDC_04_1_selected_checklist_items_show_completion_status`, `test_TC_VDC_04_2_single_relevant_item_shows_incomplete_status`, `test_TC_VDC_04_3_project_specific_checklist_is_not_forced_to_shared_names` แต่ไม่พบ test เหล่านี้ใน backend หรือ frontend; มี test ทั่วไปชื่อ `test_AC_VDC_04_*` อยู่ แต่ไม่ได้ทำให้ test ตามแถว TC ครบ | |
| F-007 | โค้ดไม่มี FR | `frontend/src/pages/DocumentReviewPage.jsx`: `<ReviewHistory>`; `frontend/src/components/ReviewContext.jsx`: `ReviewHistory` | FR-VDC-02, AC-VDC-04 | หน้า implementation แสดงประวัติการตีกลับเมื่อมี history แต่ไม่พบ requirement นี้ใน spec, API ใน plan หรือ mockup AC-VDC-04; ให้ทีมพิจารณาว่าจะคงส่วนนี้ไว้หรือไม่ | |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| F-002 | ยืนยันการทดสอบ notification ตามขอบเขต mock process ที่ทีมยืนยันไว้: test ตรวจผู้รับ, target UC-01, ข้อความอนุมัติ และเวลาส่ง พร้อมตรวจ status และ handoff | `test_AC_VDC_01_approve_forwards_to_advisor` ผ่าน และ assert `target_user_id`, `target_case`, `message`, `sent_at`, response status และ handoff |
| F-003 | ใช้ `checklist_item_id` เป็น identity หลัก พร้อม fallback เป็น `item_name` เมื่อไม่มี ID; ทำให้ผลตรวจคงอยู่แม้มีการ rename | หลังจากตรวจ code ปัจจุบันและรัน `PYTHONPATH=. pytest -v` กับ `document-review-checklist.test.jsx` ไม่พบการล้มจากการ rename item; `DocumentReviewPage.jsx` และ `backend/app/routers/project_documents.py` ใช้ identity เดิมแทนการ match ด้วย `item_name` อย่างเดียว |
| F-005 | ปรับ `ApprovalService` และ `RejectionService` ให้ล้างคำตัดสินเก่าของ same submission ก่อนบันทึกผลล่าสุด เพื่อให้ “latest decision wins” ตาม Q-05 | รัน `PYTHONPATH=. pytest -v` แล้ว test `test_latest_concurrent_review_decision_replaces_previous` ผ่าน; มีเพียงผลล่าสุดเท่านั้นที่เหลือใน store |
