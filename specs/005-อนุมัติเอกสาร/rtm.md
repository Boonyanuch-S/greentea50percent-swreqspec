# RTM: อนุมัติเอกสารโครงการ
อ้างอิง: spec.md Draft v2 | tasks.md | test-cases.md (ยังไม่มีแถวของ 005)
สร้างด้วย /verify เมื่อ 2569-10-31 11:22 UTC | test: 90 ผ่าน 0 ไม่ผ่าน (backend 58, frontend 32)

F-ID ในไฟล์นี้นับเฉพาะฟีเจอร์ 005 คนละชุดกับ `rtm.md` ที่ root

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-APR-01 | AC-APR-03 | T-01, T-02, T-03 | `project_approvals.py`: `get_project_approval`, `get_project_document`; `ProjectApprovalPage.jsx`: `handleSelectDocument` | `test_AC_APR_03_select_project_document` หลังบ้านและหน้าจอ (ผ่าน) | ช่องโหว่ (F-004) |
| FR-APR-02 | AC-APR-01 ตาม Traceability แต่ข้อความ AC ไม่ได้ตรวจเรื่องนี้ | T-01, T-02, T-03, T-04 | `project_approval_service.py`: ข้อมูลตัวอย่าง; `ProjectApprovalPage.jsx` | `test_AC_APR_03_select_project_document` ตรวจการแสดงหัวข้อ (ผ่าน) | ช่องโหว่ (F-007) |
| FR-APR-03 | AC-APR-01 | T-04, T-05 | `ProjectApprovalService.approve_content`; `handleApproveContent` | `test_AC_APR_01_content_approval` หลังบ้านและหน้าจอ (ผ่าน) | ช่องโหว่ (F-003, F-008) |
| FR-APR-04 | AC-APR-02 | T-06, T-07, T-14 | `upload_cover_sheet`; `handleUpload` | `test_AC_APR_02_cover_sheet_upload_accepted` และ `..._rejects_invalid_file` (ผ่าน) | ช่องโหว่ (F-005) |
| FR-APR-05 | AC-APR-02 | T-09, T-10, T-15 | `complete_review`; `ProjectOfficeReviewPanel.jsx`: `handlePass` | `test_AC_APR_02_office_approval_completes` หลังบ้านและหน้าจอ (ผ่าน) | ช่องโหว่ (F-003) |
| FR-APR-06 | AC-APR-04 | T-11, T-12, T-15 | `return_documents`; `handleReturn` | `test_AC_APR_04_return_full_document_with_comment` หลังบ้านและหน้าจอ (ผ่าน) | ช่องโหว่ (F-003) |
| FR-APR-07 | AC-APR-05 | T-16, T-17 | `ProjectApprovalPage.jsx`: ข้อความ `role="note"` | `test_AC_APR_05_ai_warning_does_not_block` หลังบ้านและหน้าจอ (ผ่าน) | ช่องโหว่ (F-006) |
| NFR-SEC-01 | AC-APR-06 | T-02, T-13 | `middleware/auth.py`: `require_authenticated_user`; `api/client.js`: `requireAuthentication` | `test_AC_APR_06_reject_unauthenticated_access` หลังบ้าน 7 กรณีและหน้าจอ (ผ่าน) | ช่องโหว่ (F-002) |
| CON-NFR-21 | AC-APR-06 | T-02, T-13 | เหมือน NFR-SEC-01 | `test_AC_APR_06_reject_unauthenticated_access` (ผ่าน) | ช่องโหว่ (F-002) |
| IF-UC10-01 | AC-APR-02 | T-08, T-09 | `integrations/uc10.py`; `complete_review`; `notify_uc10` | `test_AC_APR_02_office_approval_completes`, `test_project_approval_uc10_records_notification_request` (ผ่าน) | ครบ |
| IF-UC01-02 | AC-APR-04 | T-11, T-12 | `integrations/uc01.py`; `return_documents` | `test_AC_APR_04_return_full_document_with_comment` (ผ่าน) | ช่องโหว่ (F-001) |
| IF-UPLOAD-01 | AC-APR-02 | T-06, T-07, T-14 | `upload_cover_sheet`; `_require_valid_cover_sheet`; `storage/cover_sheet.py`; `config.py` | `test_AC_APR_02_cover_sheet_upload_*` (ผ่าน) | ช่องโหว่ (F-009, F-010) |

สรุป: ครบ 1 | ยังไม่ถึง 0 | รอ 0 | ช่องโหว่ 11

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `GET /project-approvals/{id}` | FR-APR-01 | ตรง | อยู่ใน plan ไม่คืนสิทธิ์ผู้ใช้ตามที่ plan เขียน |
| `GET /project-approvals/{id}/documents/{documentId}` | FR-APR-01, FR-APR-02 | ตรง | |
| `POST /content-approval` | FR-APR-03 | ตรงบางส่วน | ไม่ตรวจว่าเป็นอาจารย์ (F-003); กดซ้ำเก็บเวลาเดิมเป็นการตัดสินใจเอง (F-008) |
| `POST /cover-sheet` | FR-APR-04, IF-UPLOAD-01 | ตรงบางส่วน | ดู F-005, F-009, F-010 |
| `POST /review` | FR-APR-05 | ตรงบางส่วน | ไม่ตรวจว่าเป็นกองกิจ (F-003) |
| `POST /return` | FR-APR-06, IF-UC01-02 | ตรงเฉพาะกรณีกองกิจ | ดู F-001 |
| `POST /notifications/uc-10` | FR-APR-05, IF-UC10-01 | ตรง | อยู่ใน plan เรียกซ้ำใช้คำขอเดิมเป็นการตัดสินใจเอง (F-008) |
| `integrations/uc10.py`, `integrations/uc01.py` | IF-UC10-01, IF-UC01-02 | ตรงในระดับคิวจำลอง | ไม่สร้างเนื้อหาอีเมลซึ่งอยู่ใน Out of scope |
| `create_sample_project_approval_service`, `SAMPLE_APPROVAL_ID` | FR-APR-01, FR-APR-02 | ข้อมูลตัวอย่าง | ดู F-004 |
| `ProjectApprovalPage.jsx`: `confirmAction` | นอก spec ทีมสั่งเพิ่ม | ไม่มี FR | ดู F-011 |
| `ProjectOfficeReviewPanel.jsx`: `confirmAction` | นอก spec ทีมสั่งเพิ่ม | ไม่มี FR | ดู F-011 |
| `frontend/src/components/AuthGuard.jsx` | CON-NFR-21 | ไม่ได้ถูกใช้ใน App | plan ยังเอ่ยถึง ใช้การตรวจ session ใน `App.jsx` แทน |
| `frontend/src/services/projectApprovalMock.js` | FR-APR-01 ถึง FR-APR-04 | ใช้เฉพาะใน test | ไม่มีผลต่อผู้ใช้ |
| `frontend/src/pages/RoleHomePage.jsx` | FR-AUTH-04 | ข้อความ "รอ Q-01" ล้าสมัย | เป็นของ 009 ทั้ง 4 บทบาทมีหน้าหลักแล้ว |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-001 | ละเมิด Constraint | `project_approvals.py`: `return_documents`, `ProjectApprovalPage.jsx` | IF-UC01-02, Scope บรรทัด "ส่งเอกสารกลับพร้อมความเห็น เมื่ออาจารย์ไม่เห็นด้วย" | อาจารย์ไม่มีปุ่มหรือทางส่งกลับ มีแต่กองกิจ ขณะที่ FR-APR-06, AC-APR-04 พูดถึงกองกิจ spec ขัดกันเอง ถ้าอาจารย์ต้องส่งกลับได้ ต้องเพิ่ม FR, AC และหน้าจอ | |
| F-002 | ละเมิด Constraint | `middleware/auth.py`: `require_authenticated_user` | CON-NFR-21, NFR-SEC-01, AC-APR-06 | ตรวจแค่ว่ามี header `Authorization` ลองส่งค่า `anything-fake` แล้วได้ 200 ไม่มี `AuthenticatedUserContext` ตาม plan และ `actor_user_id` รับจาก client จึงปลอมชื่อผู้ดำเนินการได้ test ตรวจเฉพาะกรณีไม่มี header | |
| F-003 | ละเมิด Constraint | `project_approvals.py`: `approve_content`, `pass_review`, `return_documents` | FR-APR-03, FR-APR-05, FR-APR-06 | spec ระบุว่าอาจารย์อนุมัติและกองกิจตรวจ แต่หลังบ้านไม่ตรวจบทบาท ลองเรียก `/review` ด้วยผู้ใช้ `nobody` แล้วได้ 200 หน้าจอแยกตามบทบาทเท่านั้น | |
| F-004 | โค้ดไม่มี FR | `client.js`: `SAMPLE_APPROVAL_ID`, `create_sample_project_approval_service` | FR-APR-01 | เอกสารมาจากข้อมูลตัวอย่างชุดเดียว ไม่ได้มาจากเอกสารที่ UC-03 ส่งต่อ และไม่มีรายการเอกสารรออนุมัติ เอกสารจริงจึงเข้าหน้าอนุมัติไม่ได้ | |
| F-005 | test อ่อน | `project_approval_service.py`: `upload_cover_sheet` | FR-APR-04, AC-APR-02 | ลองลบบรรทัด `approval.status = PENDING_STATUS` แล้ว test ยังผ่าน 58 ตัว เพราะเอกสารเริ่มที่ `รออนุมัติ` อยู่แล้ว การเปลี่ยนสถานะตาม FR-APR-04 จึงไม่เกิดจริง spec ไม่ได้ตั้งชื่อสถานะก่อนอัปโหลด | |
| F-006 | อ้าง ID ผิดเรื่อง | `ProjectApprovalPage.jsx`: ข้อความคำเตือน | FR-APR-07, AC-APR-05 | โค้ดแสดงทุกครั้งตามคำตอบ Q-02 แต่ FR และ AC ยังเขียนว่าแสดงเมื่อเนื้อหาคล้าย AI ควรปรับถ้อยคำใน spec และข้อความคำเตือนยังเป็นประโยคไม่จบ | |
| F-007 | FR ไม่มี AC | spec.md: FR-APR-02 | FR-APR-02 | ตาราง Traceability โยงกับ AC-APR-01 แต่ AC นั้นตรวจเรื่องการอนุมัติ ไม่มี AC ตรวจวัตถุประสงค์ ตัวชี้วัด และรูปแบบเอกสาร ควรเสนอทีมเพิ่ม | |
| F-008 | โค้ดไม่มี FR | `approve_content`, `upload_cover_sheet`, `uc10.py`: `request_notification` | AGENTS.md กฎข้อ 2 | ตัดสินใจเรื่องที่ spec ไม่ระบุ: อนุมัติซ้ำเก็บเวลาเดิม, อัปโหลดซ้ำแทนไฟล์เดิม, เรียก UC-10 ซ้ำใช้คำขอเดิม, และ `approve_content` ไม่ตรวจว่าเอกสารครบชุดตาม Given ของ AC-APR-01 นอกจากนี้เอกสารที่ถูกตีกลับยังไม่มีทางกลับเข้ารอบอนุมัติ | |
| F-009 | test อ่อน | `_require_valid_cover_sheet` | IF-UPLOAD-01, Q-03 | ตรวจชนิดจากนามสกุลเท่านั้น ลองส่งเนื้อหาที่ไม่ใช่ PDF ชื่อ `virus.pdf` แล้วได้ 200 และระบบอ่านไฟล์ทั้งก้อนก่อนตรวจขนาด | |
| F-010 | ตัวเลขฝังในโค้ด | `_require_valid_cover_sheet`, `ProjectApprovalPage.jsx`: `accept` | Q-03 | ข้อความ "ไม่เกิน 10 MB", "PDF, JPG หรือ PNG" และ `accept` ของหน้าจอซ้ำกับ `config.py` ถ้าแก้ค่า ข้อความจะไม่ตรง | |
| F-011 | โค้ดไม่มี FR | `ProjectApprovalPage.jsx`, `ProjectOfficeReviewPanel.jsx`: `confirmAction` | spec ไม่มี FR | กล่องยืนยันทำตามคำสั่งทีม กำกับว่านอก spec แล้ว ควรเพิ่มลง spec หรือตัดสินว่าไม่ใช่ปัญหา | |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
