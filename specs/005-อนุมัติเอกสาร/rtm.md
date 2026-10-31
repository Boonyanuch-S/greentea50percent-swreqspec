# RTM: อนุมัติเอกสารโครงการ
อ้างอิง: spec.md Draft v2 | tasks.md | test-cases.md (ยังไม่มีแถวของ 005)
สร้างด้วย /verify เมื่อ 2569-10-31 11:22 UTC | ปรับหลังแก้ข้อค้นพบ 2569-10-31 | test: 121 ผ่าน 0 ไม่ผ่าน (backend 84, frontend 37)

F-ID ในไฟล์นี้นับเฉพาะฟีเจอร์ 005 คนละชุดกับ `rtm.md` ที่ root

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-APR-01 | AC-APR-03 | T-01, T-02, T-03 | `project_approvals.py`: `get_project_approval`, `get_project_document`; `ProjectApprovalPage.jsx`: `handleSelectDocument` | `test_AC_APR_03_select_project_document` หลังบ้านและหน้าจอ (ผ่าน) | ครบ |
| FR-APR-02 | AC-APR-07 | T-01, T-02, T-03, T-24 | `project_approval_service.py`: ข้อมูลตัวอย่าง; `ProjectApprovalPage.jsx` | `test_AC_APR_07_review_items_displayed`, `test_AC_APR_07_review_items_are_returned_for_selected_document` (ผ่าน) | ครบ |
| FR-APR-03 | AC-APR-01 | T-04, T-05 | `ProjectApprovalService.approve_content`; `handleApproveContent` | `test_AC_APR_01_content_approval` หลังบ้านและหน้าจอ (ผ่าน) | ครบ |
| FR-APR-04 | AC-APR-02 | T-06, T-07, T-14 | `upload_cover_sheet`; `handleUpload` | `test_AC_APR_02_cover_sheet_upload_accepted` และ `..._rejects_invalid_file` (ผ่าน) | ครบ |
| FR-APR-05 | AC-APR-02 | T-09, T-10, T-15 | `complete_review`; `ProjectOfficeReviewPanel.jsx`: `handlePass` | `test_AC_APR_02_office_approval_completes` หลังบ้านและหน้าจอ (ผ่าน) | ครบ |
| FR-APR-06 | AC-APR-04 | T-11, T-12, T-15 | `return_documents`; `handleReturn` | `test_AC_APR_04_return_full_document_with_comment` หลังบ้านและหน้าจอ (ผ่าน) | ครบ |
| FR-APR-08 | AC-APR-08 | T-24 | `confirmAction` ในหน้าอนุมัติและแผงตรวจ | `test_AC_APR_08_cancel_*` (ผ่าน) | ครบ |
| FR-APR-07 | AC-APR-05 | T-16, T-17 | `ProjectApprovalPage.jsx`: ข้อความ `role="note"` | `test_AC_APR_05_ai_warning_does_not_block` หลังบ้านและหน้าจอ (ผ่าน) | ครบ |
| NFR-SEC-01 | AC-APR-06 | T-02, T-13 | `middleware/auth.py`: `require_authenticated_context`; `auth_service.py`: `TokenRegistry`; `api/client.js`: `requireAuthentication` | `test_AC_APR_06_reject_unauthenticated_access` หลังบ้าน 7 กรณีและหน้าจอ (ผ่าน) | ครบ |
| CON-NFR-21 | AC-APR-06 | T-02, T-13 | เหมือน NFR-SEC-01 | `test_AC_APR_06_reject_unauthenticated_access` (ผ่าน) | ครบ |
| IF-UC10-01 | AC-APR-02 | T-08, T-09 | `integrations/uc10.py`; `complete_review`; `notify_uc10` | `test_AC_APR_02_office_approval_completes`, `test_project_approval_uc10_records_notification_request` (ผ่าน) | ครบ |
| IF-UC01-02 | AC-APR-04 | T-11, T-12 | `integrations/uc01.py`; `return_documents` | `test_AC_APR_04_return_full_document_with_comment` (ผ่าน) | ช่องโหว่ (F-012) |
| IF-UPLOAD-01 | AC-APR-02 | T-06, T-07, T-14 | `upload_cover_sheet`; `_require_valid_cover_sheet`; `storage/cover_sheet.py`; `config.py` | `test_AC_APR_02_cover_sheet_upload_*` (ผ่าน) | ครบ |

สรุป: ครบ 12 | ยังไม่ถึง 0 | รอ 0 | ช่องโหว่ 1

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `POST /login` | FR-AUTH-03, FR-AUTH-04, IF-TOKEN-01 | ตรง | บัญชีตัวอย่างตามคำสั่งทีม ยังไม่ใช่แหล่งบัญชีจริง |
| `GET /project-approvals` | FR-APR-01, FR-APR-05 | ตรง | ทีมอนุมัติเพิ่มเมื่อ 2569-10-31 |
| `GET /project-approvals/{id}`, `/documents/{documentId}` | FR-APR-01, FR-APR-02 | ตรง | อาจารย์และกองกิจเท่านั้น |
| `POST /content-approval` | FR-APR-03, ASM-03 | ตรง | อาจารย์เท่านั้น |
| `POST /cover-sheet` | FR-APR-04, IF-UPLOAD-01 | ตรง | อาจารย์เท่านั้น |
| `POST /review` | FR-APR-05 | ตรง | กองกิจเท่านั้น |
| `POST /return` | FR-APR-06, IF-UC01-02 | ตรง | ฝั่งอาจารย์ยังไม่มี AC (F-012) |
| `POST /notifications/uc-10` | FR-APR-05, IF-UC10-01 | ตรง | กองกิจเท่านั้น |
| `ProjectApprovalListPage.jsx`, `ProjectOfficeReviewPanel.jsx`, `ProjectApprovalPage.jsx` | FR-APR-01 ถึง FR-APR-08 | ตรง | |
| `frontend/src/components/AuthGuard.jsx` | CON-NFR-21 | ไม่ได้ถูกใช้ใน App | ใช้การตรวจ session ใน `App.jsx` แทน |
| `frontend/src/services/projectApprovalMock.js` | FR-APR-01 ถึง FR-APR-04 | ใช้เฉพาะใน test | ไม่มีผลต่อผู้ใช้ |
| `frontend/src/pages/RoleHomePage.jsx` | FR-AUTH-04 | ข้อความ "รอ Q-01" ล้าสมัย | เป็นของ 009 ไม่ถูกใช้ตามปกติ |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-012 | FR ไม่มี AC | spec.md: IF-UC01-02 | IF-UC01-02 | อาจารย์ส่งกลับได้แล้วและมี test ตาม IF แต่ยังไม่มี AC เฉพาะ ควรเสนอทีมเพิ่ม | |
| F-013 | เดา Q-xx | `frontend/src/api/client.js`, `backend/app/services/auth_service.py`: `TokenRegistry` | Q-03 ของ specs/009 | Token เก็บใน memory เมื่อ backend เริ่มใหม่ API ตอบ 401 แต่หน้าจอแสดงข้อผิดพลาดค้างไว้ ไม่พากลับหน้า login ควรปิด Q-03 ของ 009 ว่าจัดการเหมือน Token หมดอายุหรือไม่ | |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| F-001 | เพิ่มการส่งกลับของอาจารย์ใน `return_documents` และฟอร์มในหน้าอนุมัติ | `test_IF_UC01_02_advisor_returns_documents_with_comment` ผ่านทั้งหลังบ้านและหน้าจอ |
| F-002 | ย้าย login ไปหลังบ้าน ใช้ `TokenRegistry` และ `require_authenticated_context` | ลอง Token ปลอมกับ server จริงได้ 401; `test_AC_APR_06_reject_unauthenticated_access` |
| F-003 | ใช้ `require_roles` และผู้ดำเนินการจาก Token | ลองบทบาทอื่นกับ server จริงได้ 403; `test_role_cannot_use_other_role_action` |
| F-004 | เพิ่ม `GET /project-approvals` และ `ProjectApprovalListPage` | `test_AC_APR_03_list_approvals_for_selection`; เอกสารยังเป็นตัวอย่างตาม Out of scope ของ UC-03 |
| F-005 | เริ่มที่สถานะ `ส่งต่ออาจารย์` | ลบบรรทัดเปลี่ยนสถานะแล้ว test ล้ม 6 ตัว จากเดิมไม่ล้มเลย |
| F-006 | ปรับ FR-APR-07, AC-APR-05 และข้อความคำเตือน | อ่าน spec เทียบโค้ด; `test_AC_APR_05_ai_warning_does_not_block` |
| F-007 | เพิ่ม AC-APR-07 | `test_AC_APR_07_review_items_displayed` |
| F-008 | บันทึกกติกาเป็น ASM-03 และตรวจเอกสารครบชุด | `test_AC_APR_01_incomplete_documents_cannot_be_approved`; เอกสารตีกลับยังไม่กลับเข้ารอบตาม ASM-03 |
| F-009 | ตรวจต้นไฟล์และปฏิเสธขนาดก่อนอ่าน | ลอง `.pdf` ปลอมกับ server จริงได้ 409; `test_AC_APR_02_cover_sheet_upload_rejects_invalid_file` |
| F-010 | สร้างข้อความจาก `config.py` และส่ง `cover_sheet_accept` จาก API | อ่านโค้ด; test หน้าจอตรวจ `accept` จากข้อมูล API |
| F-011 | เพิ่ม FR-APR-08 และ AC-APR-08 | `test_AC_APR_08_cancel_*` |
