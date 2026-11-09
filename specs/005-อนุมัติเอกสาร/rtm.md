# RTM: อนุมัติเอกสารโครงการ
อ้างอิง: spec.md Draft v2 | tasks.md | test-cases.md (AC-APR-03: TC-APR-03-1 ถึง TC-APR-03-10 สถานะ "ใช้ได้")
สร้างด้วย /verify เมื่อ 2569-11-09 (รอบ 2 หลัง commit `9bf9b27`) | test: 230 ผ่าน 0 ไม่ผ่าน (backend 152, frontend 34 ไฟล์ 78 test รันจริงทั้งสองฝั่งรอบนี้)

F-ID ในไฟล์นี้นับเฉพาะฟีเจอร์ 005 คนละชุดกับ `rtm.md` ที่ root

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-APR-01 | AC-APR-03 | T-01, T-02, T-03, T-21 | `project_approvals.py`: `get_project_approval`, `get_project_document`, `get_project_document_file`; `ProjectApprovalPage.jsx`, `DocumentFileViewer.jsx` | `test_AC_APR_03_select_project_document`, `test_AC_APR_03_open_document_file`, `test_TC_APR_03_1/3/6/7` (pytest), `TC-APR-03-2`, `TC-APR-03-4` (vitest) (ผ่าน); TC-APR-03-5, 8, 9 ยังไม่มี test | ช่องโหว่ (F-017, F-018) |
| FR-APR-02 | AC-APR-07 | T-01, T-02, T-03, T-24 | `project_approvals.py`: `_document_detail`; `ProjectApprovalPage.jsx`: `REVIEW_POINTS` | `test_AC_APR_07_review_items_displayed`, `test_AC_APR_07_review_items_are_returned_for_selected_document` (ผ่าน) | ช่องโหว่ (F-014, F-019) |
| FR-APR-03 | AC-APR-01 | T-04, T-05 | `ProjectApprovalService.approve_content` | `test_AC_APR_01_content_approval`, `test_AC_APR_01_documents_reviewed_before_content_approval` (ผ่าน) | ครบ |
| FR-APR-04 | AC-APR-02 | T-06, T-07, T-14, T-23 | `upload_cover_sheet`; `_require_valid_cover_sheet` | `test_AC_APR_02_cover_sheet_upload_accepted`, `..._rejects_invalid_file` (ผ่าน) | ครบ |
| FR-APR-05 | AC-APR-02 | T-09, T-10, T-15 | `complete_review`; `ProjectOfficeReviewPanel.jsx` | `test_AC_APR_02_office_approval_completes` (ผ่าน) | ครบ |
| FR-APR-06 | AC-APR-04 | T-11, T-12, T-15 | `return_documents` | `test_AC_APR_04_return_full_document_with_comment` (ผ่าน) | ครบ |
| FR-APR-07 | AC-APR-05 | T-16, T-17 | ยกเลิกแล้ว ไม่มีคำเตือนในหน้าจอ | `test_AC_APR_05_ai_warning_removed_approval_still_works`, `test_AC_APR_05_ai_warning_does_not_block` (ผ่าน) | ไม่นับ: ยกเลิก 2569-11-01 (F-015) |
| FR-APR-08 | AC-APR-08 | T-24 | `confirmAction` ในหน้าอนุมัติและแผงตรวจ | `test_AC_APR_08_cancel_*` (ผ่าน) | ครบ |
| NFR-SEC-01 | AC-APR-06 | T-02, T-13, T-18 | `middleware/auth.py`: `require_authenticated_context`; `auth_service.py`: `TokenRegistry` | `test_AC_APR_06_reject_unauthenticated_access` หลังบ้านและหน้าจอ (ผ่าน) | ครบ |
| CON-NFR-21 | AC-APR-06 | T-02, T-13, T-18 | เหมือน NFR-SEC-01 | เหมือน NFR-SEC-01 (ผ่าน) | ครบ |
| IF-UC10-01 | AC-APR-02 | T-08, T-09 | `integrations/uc10.py`; `complete_review` | `test_AC_APR_02_office_approval_completes`, `test_project_approval_uc10_records_notification_request` (ผ่าน) | ครบ |
| IF-UC01-02 | AC-APR-04 | T-11, T-12, T-20 | `integrations/uc01.py`; `return_documents` | `test_AC_APR_04_return_full_document_with_comment`, `test_advisor_return_reaches_club_with_comment` (ผ่าน) | ช่องโหว่ (F-012) |
| IF-UPLOAD-01 | AC-APR-02 | T-06, T-07, T-14, T-23 | `upload_cover_sheet`; `storage/cover_sheet.py`; `config.py` | `test_AC_APR_02_cover_sheet_upload_*` (ผ่าน) | ครบ |

สรุป: ครบ 9 | ยังไม่ถึง 0 | รอ 0 | ช่องโหว่ 3 | ไม่นับเพราะยกเลิก 1

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `POST /login` | FR-AUTH-03, FR-AUTH-04, IF-TOKEN-01 | ตรง | บัญชีตัวอย่างตามคำสั่งทีม ยังไม่ใช่แหล่งบัญชีจริง |
| `GET /project-approvals` | FR-APR-01, FR-APR-05 | ตรง | ทีมอนุมัติเพิ่มเมื่อ 2569-10-31 |
| `GET /project-approvals/{id}`, `/documents/{documentId}`, `/file` | FR-APR-01, FR-APR-02 | ตรงในทางปกติ | CHANGELOG 2569-11-01; ผลในกรณีชุดไม่ครบ เอกสารไม่อยู่ในชุด และสถานะอื่น โค้ดกำหนดเองโดย spec ไม่ได้บอก (F-018) |
| `GET /project-approvals/{id}/review-context` (`routers/project_documents.py`: `get_approval_review_context`); `ReviewContext.jsx`, `ReturnDocumentPicker.jsx` ในหน้าอนุมัติและแผงตรวจ | FR-APR-02 | ไม่ตรง: FR-APR-02 พูดถึงวัตถุประสงค์ ตัวชี้วัด และรูปแบบ ไม่ใช่ผล Checklist ของคณะหรือประวัติการตีกลับ | มีแค่ใน CHANGELOG 2569-11-02 ไม่มี FR/AC และไม่อยู่ในตาราง plan ข้อ 4 (F-019) |
| `POST .../documents/{id}/review` | CHANGELOG 2569-11-01 | ยังไม่มี FR/AC ของการยืนยันรายฉบับ | F-014 |
| `GET .../cover-sheet/file` | FR-APR-05 | ไม่มี FR สั่งเปิดดูใบปะหน้า แต่จำเป็นต่อการตรวจ | อยู่ใน CHANGELOG |
| `POST /content-approval` | FR-APR-03, ASM-03 | ตรง | อาจารย์เท่านั้น |
| `POST /cover-sheet` | FR-APR-04, IF-UPLOAD-01 | ตรง | อาจารย์เท่านั้น |
| `POST /review` | FR-APR-05 | ตรง | กองกิจเท่านั้น |
| `POST /return` | FR-APR-06, IF-UC01-02 | ตรง | ฝั่งอาจารย์ยังไม่มี AC (F-012) |
| `POST /notifications/uc-10` | FR-APR-05, IF-UC10-01 | ตรง | กองกิจเท่านั้น |
| `project_approval_service.py`: `OFFICE_REVIEW_SAMPLES`, `URGENT_SAMPLE_ACTIVITY_DATE` | ไม่มี FR | ข้อมูลตัวอย่าง | F-016 |
| `frontend/src/pages/RoleHomePage.jsx` | FR-AUTH-04 | ข้อความ "รอ Q-01" ล้าสมัย | ดู F-006 ของ specs/009 |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-012 | FR ไม่มี AC | spec.md: IF-UC01-02 | IF-UC01-02 | อาจารย์ส่งกลับได้แล้วและมี test ตาม IF แต่ยังไม่มี AC เฉพาะ ควรเสนอทีมเพิ่ม | |
| F-014 | โค้ดไม่มี FR | `ProjectApprovalPage.jsx`: `REVIEW_POINTS`, `set_document_reviewed` | FR-APR-02 | จุดตรวจ 4 ข้อบังคับเฉพาะหน้าเว็บ เรียก API ตรงก็ยืนยันตรวจได้โดยไม่ผ่านจุดตรวจ และการยืนยันรายฉบับยังไม่มี FR/AC ตามที่ CHANGELOG 2569-11-01 บอกว่ารอทีมตัดสิน | |
| F-015 | อ้าง ID ผิดเรื่อง | `backend/tests/test_AC_APR_05_ai_warning_does_not_block.py`, tasks T-16, T-17 | AC-APR-05 ยกเลิกแล้ว | ชื่อ test ยังพูดถึงคำเตือนที่เอาออกแล้ว สิ่งที่ตรวจจริงคืออนุมัติได้ และ T-16, T-17 ยังเขียนว่าแสดงคำเตือน ควรเปลี่ยนชื่อหรือลบ และปรับ tasks | |
| F-016 | โค้ดไม่มี FR | spec.md: ASM-03, `project_approval_service.py`: ข้อมูลตัวอย่าง | ASM-03, CHANGELOG 2569-10-30 | ASM-03 ยังเขียนว่าเอกสารที่ถูกตีกลับไม่กลับเข้ารอบ แต่ตอนนี้กรรมการแก้แล้วส่งใหม่จนกลับถึงอาจารย์ได้จริง และ spec ยังเขียนว่าเอกสารเป็นตัวอย่าง ควรปรับข้อความ ส่วนวันที่ตัวอย่าง `2026-11-20` เป็นค่าคงที่ จึงเลิกเป็นงานด่วนเมื่อเลยวันนั้น | |
| F-017 | AC ไม่มี test | `test-cases.md`: TC-APR-03-5, TC-APR-03-7 ส่วน (2), TC-APR-03-8, TC-APR-03-9 | AC-APR-03 | แถวสถานะ "ใช้ได้" แต่ช่อง Then เขียนว่า "spec ไม่ได้บอก" จึงยังไม่มี test ในโค้ด (TC-APR-03-5, 8, 9) และ TC-APR-03-7 ส่วน (2) ไม่มี assert ทีมควรตอบคำถามแล้วเขียน Then ใหม่ หรือเปลี่ยนสถานะเป็น "รอ Q-xx" | |
| F-018 | โค้ดไม่มี FR | `routers/project_approvals.py`: `get_project_approval`, `get_project_document` (`require_approval_reader` ไม่ตรวจสถานะ) | FR-APR-01, plan ข้อ 4 | โค้ดตัดสินคำถามที่ test-cases ยังเปิดไว้: ชุดไม่ครบเปิดดูได้และแสดง 2 รายการ (TC-5); เอกสารที่ไม่อยู่ในชุดได้ 404 และ test เดิม `test_AC_APR_03_unknown_document_is_not_found` assert ไว้แล้ว (TC-9); กรรมการสโมสรได้ 403 ที่ endpoint เอกสาร (TC-7 ส่วน 2); อาจารย์เห็นทุกสถานะ (TC-8) และกองกิจเปิดชุดสถานะ "ส่งต่ออาจารย์" ได้ 200 ถ้ารู้ `approvalId` แม้ plan ข้อ 4 บอกว่ากองกิจเห็นเฉพาะ "รออนุมัติ" (ลองด้วย TestClient แล้ว) | |
| F-019 | อ้าง ID ผิดเรื่อง | `routers/project_documents.py`: `get_approval_review_context` (`SAMPLE_FACULTY_RESULTS` สำหรับ id ที่ขึ้นต้น `approval-005-`); `ReviewContext.jsx`, `ReturnDocumentPicker.jsx` | FR-APR-02, CHANGELOG 2569-11-02 | คอมเมนต์อ้าง FR-APR-02 แต่สิ่งที่ทำคือแสดงผล Checklist ของเจ้าหน้าที่คณะ ประวัติการตีกลับ และให้เลือกเอกสารที่ต้องแก้ตอนส่งกลับ ซึ่งมีแค่ใน CHANGELOG ไม่มี FR/AC และ endpoint ไม่อยู่ในตาราง plan ข้อ 4 ชุดตัวอย่างของ 005 ยังได้ผล Checklist ปลอมตาม prefix ของ id | |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| F-001 | เพิ่มการส่งกลับของอาจารย์ใน `return_documents` และฟอร์มในหน้าอนุมัติ | `test_IF_UC01_02_advisor_returns_documents_with_comment` ผ่านทั้งหลังบ้านและหน้าจอ |
| F-002 | ย้าย login ไปหลังบ้าน ใช้ `TokenRegistry` และ `require_authenticated_context` | ลอง Token ปลอมกับ server จริงได้ 401; `test_AC_APR_06_reject_unauthenticated_access` |
| F-003 | ใช้ `require_roles` และผู้ดำเนินการจาก Token | ลองบทบาทอื่นกับ server จริงได้ 403; `test_role_cannot_use_other_role_action` |
| F-004 | เพิ่ม `GET /project-approvals` และ `ProjectApprovalListPage` | `test_AC_APR_03_list_approvals_for_selection`; เอกสารมาจาก UC-03 จริงแล้ว |
| F-005 | เริ่มที่สถานะ `ส่งต่ออาจารย์` | ลบบรรทัดเปลี่ยนสถานะแล้ว test ล้ม 6 ตัว จากเดิมไม่ล้มเลย |
| F-006 | ปรับ FR-APR-07, AC-APR-05 และข้อความคำเตือน ต่อมาทีมยกเลิกทั้งสองข้อ | อ่าน spec เทียบโค้ด; `test_AC_APR_05_ai_warning_removed_approval_still_works` |
| F-007 | เพิ่ม AC-APR-07 | `test_AC_APR_07_review_items_displayed` |
| F-008 | บันทึกกติกาเป็น ASM-03 และตรวจเอกสารครบชุด | `test_AC_APR_01_incomplete_documents_cannot_be_approved` |
| F-009 | ตรวจต้นไฟล์และปฏิเสธขนาดก่อนอ่าน | ลอง `.pdf` ปลอมกับ server จริงได้ 409; `test_AC_APR_02_cover_sheet_upload_rejects_invalid_file` |
| F-010 | สร้างข้อความจาก `config.py` และส่ง `cover_sheet_accept` จาก API | อ่านโค้ด; test หน้าจอตรวจ `accept` จากข้อมูล API |
| F-011 | เพิ่ม FR-APR-08 และ AC-APR-08 | `test_AC_APR_08_cancel_*` |
| F-013 | `api/client.js` ส่ง `SESSION_REJECTED` เมื่อได้ 401 และ `AuthContext.jsx` พากลับหน้า login | test `API ปฏิเสธ Token แล้วพากลับ...` ใน `url-navigation.test.jsx` ส่วนการตัดสิน Q-03 ย้ายไป F-001 ของ specs/009 |

## 5. คำตอบที่เสนอสำหรับ Open Questions (รอทีมยืนยัน ยังไม่ใช่คำตอบทีม)
| Q | คำตอบที่เสนอ | หลักฐาน | ความมั่นใจ |
|---|---|---|---|
| Q-01 | ยังไม่พบกำหนดเวลาอัปโหลดใบปะหน้าในเอกสารกองกิจ จึงไม่ควรใส่ตัวเลขเอง เสนอให้โปรโตไทป์คงแสดงสถานะ "ส่งต่ออาจารย์" ในรายการไว้ก่อน ถ้าจะเตือนจริงให้ถามกองกิจ ผังใช้ 3-5 วันทำการต่อขั้นซึ่งเป็นตัวอ้างอิงได้ | ผังขั้นตอน | ต่ำ: ไม่มีข้อกำหนดตรง ต้องถามกองกิจ |

ข้อมูลประกอบ: ผังกองกิจไม่มีขั้น "อาจารย์อัปโหลดใบปะหน้า" แยกออกมา ลำดับลงนามที่เห็นคือสโมสรและฝ่ายกิจการนักศึกษาคณะ, คณบดี, องค์การนักศึกษา, กองกิจ, รองอธิการบดี ส่วนแนวทางระบุว่าผู้ลงนามสัญญายืมเงินต้องเป็นที่ปรึกษาโครงการ ขั้นตอนใน spec จึงมาจาก use case ของทีม ไม่ได้มาจากผังนี้

แหล่งอ้างอิง:
- [ผังขั้นตอนการขออนุมัติโครงการและชั่วโมงกิจกรรม](https://drive.google.com/file/d/1aVeGJRqKh0b7_z4vAuG7PpghfxCIe7Nk/view?usp=drive_link)
- [แนวทางการตรวจโครงการนักศึกษา (2565)](https://dsa.su.ac.th/ksu/wp-content/uploads/2022/03/%e0%b9%81%e0%b8%99%e0%b8%a7%e0%b8%97%e0%b8%b2%e0%b8%87%e0%b8%81%e0%b8%b2%e0%b8%a3%e0%b8%95%e0%b8%a3%e0%b8%a7%e0%b8%88%e0%b9%82%e0%b8%84%e0%b8%a3%e0%b8%87%e0%b8%81%e0%b8%b2%e0%b8%a3%e0%b8%99%e0%b8%b1%e0%b8%81%e0%b8%a8%e0%b8%b6%e0%b8%81%e0%b8%a9%e0%b8%b2.pdf)
