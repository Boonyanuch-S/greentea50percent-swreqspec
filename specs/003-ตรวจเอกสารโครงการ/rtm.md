# RTM: ตรวจเอกสารโครงการ
อ้างอิง: spec.md Draft v2 | tasks.md | test-cases.md (มีแถว AC-VDC-03)
สร้างด้วย /verify เมื่อ 2569-11-02 | test: 217 ผ่าน 0 ไม่ผ่าน (backend 147, frontend 70 ทั้งระบบ)

หมายเหตุการรัน: ใช้ `PYTHONPATH=. pytest -q backend/tests` เพราะ `cd backend && pytest` ใช้กับ package path นี้ไม่ได้
ไม่มี `specs/000-shared/` และไม่มี `mockups/`

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-VDC-01 | AC-VDC-03 | T-04, T-05, T-06, T-23 | `review_queue_service.py`: `list_pending`; `ReviewQueuePage.jsx`: `urgentFirst` | `test_AC_VDC_03_*`, `test_TC_VDC_03_*`, `urgent-queue.test.jsx` (ผ่าน) | ช่องโหว่ (F-001) |
| FR-VDC-02 | AC-VDC-04 | T-11, T-12 | `review_queue.py`: `get_submission`; `DocumentReviewPage.jsx` | `test_AC_VDC_04_document_review_displays_details_and_c...` (ผ่าน) | ครบ |
| FR-VDC-03 | AC-VDC-04 | T-11, T-12, T-13 | `submissions.py`, `project_review_service.py`: `save_evaluations`; `ReviewerChecklistPanel.jsx` | `test_AC_VDC_04_reviewer_selects_relevant_checklist_items` หลังบ้านและหน้าจอ (ผ่าน) | ช่องโหว่ (F-003) |
| FR-VDC-04 | ไม่มี AC ที่ตรวจเรื่องนี้ | T-12 | `DocumentReviewPage.jsx`, `DocumentFileViewer.jsx` | ไม่มี test ตรง | ช่องโหว่ (F-004) |
| FR-VDC-05 | AC-VDC-01 | T-14, T-15, T-16, T-20, T-22 | `approval_service.py`: `approve`; `ApprovalAction.jsx` | `test_AC_VDC_01_approve_forwards_to_advisor`, `test_project_moves_from_club_to_completed_on_one_data_set` (ผ่าน) | ช่องโหว่ (F-002, F-005) |
| FR-VDC-06 | AC-VDC-02 | T-17, T-18, T-19, T-21 | `rejection_service.py`: `reject`; `RejectDialog.jsx`; `project_document_service.py` อ่าน `list_member_messages` | `test_AC_VDC_02_reject_sends_reason_to_member` หลังบ้านและหน้าจอ, `test_faculty_rejection_returns_reason_and_club_resubmits` (ผ่าน) | ครบ |
| FR-VDC-07 | AC-VDC-05 | T-07 ถึง T-10 | `checklist_service.py`, `checklists.py`, `ChecklistManagementPage.jsx` | `test_AC_VDC_05_all_reviewers_see_same_latest_rule`, `test_AC_VDC_05_starter_checklist_is_optional_and_editable` (ผ่าน) | ช่องโหว่ (F-003) |
| NFR-SEC-01 | AC-VDC-06 | T-01, T-03 | `middleware/auth.py`: `require_roles` | `test_AC_VDC_06_unauthenticated_user_blocked` (ผ่าน) | ครบ |
| CON-NFR-21 | AC-VDC-06 | T-01, T-03 | เหมือน NFR-SEC-01 | เหมือน NFR-SEC-01 (ผ่าน) | ครบ |
| IF-CHK-02 | AC-VDC-05 | T-07, T-08 | `checklist_service.py`: `latest_rule`, `latest_items` | `test_checklist_versioning.py`, `test_AC_VDC_05_all_reviewers_see_same_latest_rule` (ผ่าน) | ครบ |
| IF-UC05-01 | AC-VDC-01 | T-14 | `approval_service.py`: `on_approved`; `project_document_service.py`: `forward_to_advisor` | `test_project_moves_from_club_to_completed_on_one_data_set` (ผ่าน) | ครบ |
| IF-UC01-01 | AC-VDC-02 | T-17, T-21 | `rejection_service.py`: `UC01ReturnMessage` | `test_AC_VDC_02_reject_sends_reason_to_member`, `test_return_flow_after_rejection.py` (ผ่าน) | ครบ |

สรุป: ครบ 7 | ยังไม่ถึง 0 | รอ 0 | ช่องโหว่ 5

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `GET /review-queue` | FR-VDC-01 | ตรง | หลังบ้านเรียงตามเวลาส่งและ `submission_id` |
| `ReviewQueuePage.jsx`: `urgentFirst` | CHANGELOG 2569-11-02 | ขัดกับข้อความ FR-VDC-01 และ AC-VDC-03 | F-001 |
| `GET /submissions/{id}` | FR-VDC-02 | ตรง | |
| `GET /checklists/latest`, `POST /checklists/items`, `PATCH /checklists/items/{id}` | FR-VDC-07, IF-CHK-02 | ตรง | |
| `POST /submissions/{id}/review/approve`, `/reject` | FR-VDC-05, FR-VDC-06 | ตรง แต่จำกัดเฉพาะเอกสารที่รอตรวจ | F-005 |
| `GET /submissions/{id}/documents`, `/history` | FR-VDC-02, FR-VDC-04 | อยู่ใน `project_documents.py` ประวัติไม่มี FR | CHANGELOG 2569-11-02 |
| `middleware/auth.py`: `ReviewAuthenticationMiddleware`, `require_authenticated_user` | CON-NFR-21 | ไม่มีที่เรียกใช้ | F-006 |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-001 | ตัวเลขไม่ตรง spec | `ReviewQueuePage.jsx`: `urgentFirst`, `utils/urgency.js`: `URGENT_DAYS` | FR-VDC-01, AC-VDC-03 | ข้อความ FR และ AC ยังเขียนว่าเรียงตามวันที่ส่ง แต่หน้าจอดึงงานที่เหลือไม่เกิน 30 วันขึ้นก่อน CHANGELOG บันทึกคำสั่งทีมแล้ว แต่ FR, AC ยังไม่ถูกแก้ ควรแก้ข้อความ FR-VDC-01 และ AC-VDC-03 ให้ตรง เลข 30 ฝังในโค้ดหน้าเว็บ | |
| F-002 | test อ่อน | `approval_service.py`: `_club_notifications`, `list_club_notifications` | FR-VDC-05, AC-VDC-01 | ข้อความแจ้งเก็บไว้ในหน่วยความจำ มีแค่ test ที่อ่าน ไม่มี API หรือหน้าจอแสดงข้อความนี้ให้กรรมการ กรรมการเห็นเพียงสถานะเปลี่ยน ถ้าลบส่วนแสดงผลก็ไม่มี test ล้ม เพราะไม่มีส่วนนั้น | |
| F-003 | โค้ดไม่มี FR | `DocumentReviewPage.jsx`, `ReviewContext.jsx`: `resultForDocument` | ASM-03, Q-07, FR-VDC-07 | จับคู่ผลตรวจกับไฟล์ด้วยชื่อเอกสาร ถ้าเจ้าหน้าที่แก้ชื่อในรายการกลาง ผลตรวจจะหายจากปุ่มไฟล์และหน้าอาจารย์ ทั้งที่ spec บอกให้คงสถานะตรวจเดิม ควรจับคู่ด้วย `checklist_item_id` | |
| F-004 | FR ไม่มี AC | `spec.md`: FR-VDC-04 | FR-VDC-04 | ตาราง Traceability ชี้ไป AC-VDC-01, 02 แต่ทั้งสองข้อไม่ได้พูดเรื่องตรวจเนื้อหาและรูปแบบ ควรเสนอทีมเพิ่ม AC | |
| F-005 | test อ่อน | `approval_service.py`: `pending_only`, `test_latest_concurrent_review_decision_replaces_previous` | Q-05, T-22 | Q-05 ยังเขียนว่าคำตัดสินล่าสุดแทนที่ฉบับก่อน แต่ API ใช้ `pending_only=True` เสมอและตอบ 409 ทางแทนที่จึงถูกเรียกจาก test เท่านั้น CHANGELOG จำกัดไว้แล้ว ควรปรับข้อความ Q-05 และ test ให้ตรงพฤติกรรมจริง | |
| F-006 | โค้ดไม่มี FR | `middleware/auth.py`: `ReviewAuthenticationMiddleware`, `require_authenticated_user` | CON-NFR-21 | เหลือจากการตรวจแบบดูแค่ header ไม่มีที่เรียกใช้แล้ว ควรลบเพื่อไม่ให้เข้าใจผิดว่าเป็นตัวตรวจสิทธิ์จริง | |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| ไม่มี | rtm.md ของฟีเจอร์นี้สร้างครั้งแรก | |

## 5. คำตอบที่เสนอสำหรับ Open Questions (รอทีมยืนยัน ยังไม่ใช่คำตอบทีม)
ฟีเจอร์นี้ไม่มีคำถามที่ยังเปิด Q-01 ถึง Q-07 ตอบแล้วทั้งหมด

ข้อมูลประกอบ F-004: แนวทางการตรวจโครงการของกองกิจระบุจุดตรวจเนื้อหาไว้ เช่น ชื่อโครงการตรงกันทุกเอกสาร, วัตถุประสงค์, ตัวชี้วัด, PDCA, งบประมาณ และการลงวันที่กับเบอร์โทรในทุกจุดลงนาม ใช้เป็นตัวตั้งต้นของ AC ได้

แหล่งอ้างอิง:
- [แนวทางการตรวจโครงการนักศึกษา (2565)](https://dsa.su.ac.th/ksu/wp-content/uploads/2022/03/%e0%b9%81%e0%b8%99%e0%b8%a7%e0%b8%97%e0%b8%b2%e0%b8%87%e0%b8%81%e0%b8%b2%e0%b8%a3%e0%b8%95%e0%b8%a3%e0%b8%a7%e0%b8%88%e0%b9%82%e0%b8%84%e0%b8%a3%e0%b8%87%e0%b8%81%e0%b8%b2%e0%b8%a3%e0%b8%99%e0%b8%b1%e0%b8%81%e0%b8%a8%e0%b8%b6%e0%b8%81%e0%b8%a9%e0%b8%b2.pdf)
