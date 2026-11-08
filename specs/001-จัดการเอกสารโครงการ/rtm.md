# RTM: จัดการเอกสารโครงการ
อ้างอิง: spec.md Draft v3 | mockups/UI-PRJ-01-new-project.html | tasks.md | test-cases.md (มีแถว AC-PRJ-03: TC-PRJ-03-1 ถึง 8 ใช้ได้ 7 แถว, TC-PRJ-03-7 ร่าง)
สร้างด้วย /verify เมื่อ 2569-11-08 (รอบ verify v2 หลัง fix F-004, F-011 และ spec Draft v2) | test: 224 ผ่าน 0 ไม่ผ่าน (backend 148, frontend 76)
รอบก่อน: 2569-11-08 verify v1 | 224 ผ่าน; 2569-11-02 | 217 ผ่าน

หมายเหตุการรัน: รอบนี้ `cd backend && pytest -v` รันได้แล้ว (แก้ `backend/pytest.ini` 2569-11-08) และ `cd frontend && npm test`
ไม่มี `specs/000-shared/`; รอบ verify ui (2569-11-08) มี `mockups/UI-PRJ-01-new-project.html` แล้ว จึงตรวจข้อ 6 ในหัวข้อ 2.1

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-PRJ-01 | AC-PRJ-03 | T-03 เสร็จ รอทีมตรวจ, T-04 ไม่ได้ทำตาม plan รอ Q-02, T-16 เสร็จ (2569-11-08) | `pages/ProjectDocumentsPage.jsx`: ปุ่มสร้างใหม่, `api/client.js`: `getNewProjectForm`, `pages/ProjectDocumentForm.jsx` | `test_TC_PRJ_03_1` ถึง `test_TC_PRJ_03_6` หน้าจอ 6 ตัว และ `test_TC_PRJ_03_6_unauthenticated_api_rejected` (ผ่านทั้งหมด) ตรวจ Then ของ AC-PRJ-03 ครบทุกส่วน; `T-03 แสดงฟอร์มโครงการใหม่…` (ผ่าน) | รอ Q-10 (F-012) |
| FR-PRJ-02 | AC-PRJ-01 | T-03 เสร็จ รอทีมตรวจ, T-10 รอ Q-04 | `ProjectDocumentForm.jsx`: `validateProjectFields`, `routers/project_documents.py`: `_parse_fields` | `test_invalid_project_is_rejected`, `test_malformed_project_fields_return_422`, `test_AC_PRJ_03_form_requires_all_fields` (ผ่าน) | ยังไม่ถึง (T-14 ยังไม่มี test ชื่อตาม AC-PRJ-01; F-001 และ F-004 แก้แล้ว) |
| FR-PRJ-03 | AC-PRJ-04 | T-05 รอ Q-01, T-06 ทำแล้วใน prototype, T-17 รอ Q-01 | `project_documents.py`: `get_project_checklist`, `ProjectDocumentForm.jsx` ขั้น 2 | ไม่พบ test ที่ตรวจว่า Checklist แสดง | ช่องโหว่ (F-005; F-002 รอ Q-01) |
| FR-PRJ-04 | AC-PRJ-01 | T-07 รอ Q-01, T-08 ทำแล้วใน prototype | `project_documents.py`: `_read_attachment`, `api/client.js`: `submitProject` | `test_project_moves_from_club_to_completed_on_one_data_set` อ่านไฟล์กลับได้ (ผ่าน) | รอ Q-07 (F-006) |
| FR-PRJ-05 | AC-PRJ-01 | T-10 รอ Q-04, T-14 รอ Q-04 | `services/project_document_service.py`: `submit`, `_queue_submission`, `status_of` | `test_project_moves_from_club_to_completed_on_one_data_set` ตรวจสถานะและคิว (ผ่าน) | ช่องโหว่ (F-007; F-001 แก้แล้ว) |
| FR-PRJ-06 | AC-PRJ-05 | T-11 ทำบางส่วน รอ Q-05, T-18 รอ Q-05 | `project_documents.py`: `get_project_document`, `ProjectDocumentForm.jsx`: โหลดข้อมูลและ `rejectionReason`, `project_document_service.py`: `get_for_owner` | `test_faculty_rejection_returns_reason_and_club_resubmits`, `test_advisor_return_reaches_club_with_comment` ตรวจเฉพาะ API (ผ่าน) | ช่องโหว่ (F-005; F-008 รอ Q-05) |
| FR-PRJ-07 | AC-PRJ-02 | T-09 รอ Q-03, Q-04, T-15 รอ Q-03, Q-04 | `project_document_service.py`: `MissingAttachments`, `project_documents.py`: `submit_project_document`, `ProjectDocumentForm.jsx`: `handleSubmit` | `test_missing_attachment_is_rejected_and_not_queued` (ผ่าน) | ช่องโหว่ (F-005, F-007; F-004 แก้แล้ว) |
| NFR-SEC-01 | AC-PRJ-06 | T-19 พร้อมทำ | `project_documents.py`: `require_club`, `middleware/auth.py`: `require_roles`, `App.jsx`: หน้า login | ยังไม่มี test ชื่อตาม AC-PRJ-06; `test_TC_PRJ_03_6_unauthenticated_api_rejected` และ `test_TC_PRJ_03_6_unauthenticated_sees_login_not_form` ตรวจเฉพาะทางสร้างโครงการใหม่ (ผ่าน) ยังไม่ครอบคลุมการแก้ไข | ยังไม่ถึง |
| CON-NFR-21 | AC-PRJ-06 | T-02 ทำแล้วฝั่ง API รอทีมตรวจ, T-19 พร้อมทำ | เหมือน NFR-SEC-01 | เหมือน NFR-SEC-01 | ยังไม่ถึง |
| IF-CHK-01 | AC-PRJ-04 | T-05 รอ Q-01 | `project_document_service.py`: `PROJECT_CHECKLIST`, `services/checklist_service.py`: `STARTER_CHECKLIST_ITEMS` | `test_all_roles_share_central_checklist_and_results` ตรวจรายการกลาง ไม่ได้ตรวจเกณฑ์แนบ (ผ่าน) | รอ Q-01 (F-002) |

สรุป: ครบ 0 | ยังไม่ถึง 3 | รอ 3 (Q-01, Q-07, Q-10) | ช่องโหว่ 4

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `GET /project-documents/checklist` | FR-PRJ-03, IF-CHK-01 | ตรงเรื่อง แต่ค่ามาจากค่าคงที่ | F-002 |
| `GET /project-documents` | FR-PRJ-05, FR-PRJ-06 | ไม่มี FR ขอรายการโครงการ แต่จำเป็นต่อการเลือกแก้ไขตาม FR-PRJ-06 | จำกัดตามบุคคล ดู F-008 |
| `GET /project-documents/{id}` | FR-PRJ-06 | ตรง ส่วน `route`, `history`, `checklistResults` ไม่มี FR | F-009 |
| `GET /project-documents/central-checklist` | FR-PRJ-03, IF-CHK-02 | IF-CHK-02 เป็นของ specs/003 ไม่ใช่ UC-01 | F-009 |
| `GET /project-documents/{id}/attachments/{item}/file` | FR-PRJ-04 | FR-PRJ-04 สั่งแนบ ไม่ได้สั่งเปิดดู | F-009 |
| `POST /project-documents` | FR-PRJ-05, FR-PRJ-07 | ตรง แต่รวมการตรวจฟอร์มซึ่งเป็น Q-04 | F-001, F-010 |
| `ProjectDocumentService.forward_to_advisor`, `route_of`, `history_of` | IF-UC05-01 และอื่น ๆ | เป็นงานของ specs/003 และ 005 | F-009 |
| `GET /submissions/{id}/documents`, `/history`, `/project-approvals/{id}/review-context` | FR-VDC-02, FR-APR-02 | อยู่ในไฟล์ของ UC-01 แต่เป็นงานหลังเข้าคิว | อยู่ใน Out of scope ของ UC-01, ดู F-009 |
| `pages/ProjectDetailPage.jsx`, `components/DocumentRoute.jsx`, `ReviewContext.jsx` | ไม่มี FR ใน spec 001 | CHANGELOG บันทึกว่าเป็นคำสั่งทีม แต่ยังไม่มี FR/AC | F-009 |
| `ProjectDocumentForm.jsx`: ข้อความกำหนดเสนอ 1 เดือนหรือ 2 เดือน | ไม่มี FR | ตัวเลขมาจากผังกองกิจ ไม่ได้อยู่ใน spec | F-006 |
| `pages/ProjectDocumentForm.jsx`: ปุ่มถัดไป ย้อนกลับ ยกเลิก | นำทาง | ไม่นับเป็นของแถม | |
| `project_documents.py`: `require_club` และ `App.jsx`: `RoleHome` (แยกหน้าหลักตามบทบาท) | NFR-SEC-01, FR-AUTH-04 ของ specs/009 | ปฏิเสธบทบาทอื่นด้วย 403 และไม่แสดงหน้าเอกสารโครงการ spec 001 ไม่มี AC ของกรณีนี้ | F-012 |
| `models/auth_token.py`: `utc_now` (แก้ 2569-11-08) | FR-AUTH-04, IF-TOKEN-01 ของ specs/009 | แทน `datetime.utcnow()` ค่าเหมือนเดิม ไม่เปลี่ยนสิ่งที่ผู้ใช้ได้รับ | ไม่ใช่ข้อค้นพบ เป็นไฟล์ของ 009 |
| `components/AuthGuard.jsx` | NFR-SEC-01 | ลบแล้ว 2569-11-08 | F-011 แก้แล้ว |
| `services/projectDocumentMock.js` | FR-PRJ-01, 03, 05, 06, 07 | หน้าจริงเรียกข้อมูลผ่าน API แล้ว แต่ `ProjectDocumentsPage` กับ `ProjectDetailPage` ยัง import ค่าคงที่ `RETURNED` จากไฟล์นี้ ส่วน test หน้าจอยังใช้เป็น client และ Checklist คนละชุดกับ backend | F-004 |

### 2.1 หน้าจอเทียบ mockup (คำถามข้อ 6, verify ui 2569-11-08)
| UI | "ต้องตรง" ใน spec | หน้าจอจริง (ไฟล์) | ผล | test |
|---|---|---|---|---|
| UI-PRJ-01 สถานะ 1, 2 | ปุ่ม "สร้างโครงการใหม่" อยู่ที่หน้ารายการทั้งตอนมีและไม่มีโครงการ | `ProjectDocumentsPage.jsx` บรรทัด 60 "+ สร้างโครงการใหม่" ใน PageHeader แสดงทุกกรณี | ตรง (เครื่องหมาย + เป็นการตกแต่ง) | TC-PRJ-03-1, TC-PRJ-03-4 (ผ่าน) |
| UI-PRJ-01 สถานะ 3 | ฟอร์ม 5 ช่อง ว่างทุกช่องและพิมพ์ได้ | `ProjectDocumentForm.jsx`: `fields`, `api/client.js`: `getNewProjectForm` | ตรง; ชื่อช่อง "วันที่จัดกิจกรรม" อยู่ในข้อ "ยืดหยุ่นได้" | TC-PRJ-03-1 (ผ่าน) |
| UI-PRJ-01 สถานะ 3 | ไม่มีข้อมูลของโครงการเดิมบนฟอร์มใหม่ | `ProjectDocumentForm.jsx` โหลดใหม่ทุกครั้งตาม `projectId` | ตรง | TC-PRJ-03-3 (ผ่าน) |
| UI-PRJ-01 สถานะ 4 | รอ Q-10 | `require_club` และ `RoleHome` ใน `App.jsx` | ไม่ตรวจ (รอ Q-10) | ไม่มี (TC-PRJ-03-7 ร่าง) |

สิ่งบนหน้าจอที่ไม่มีใน mockup:
- ข้อความแนะนำ "ควรเสนอล่วงหน้าอย่างน้อย 1 เดือน…" ที่ช่องวันที่: ไม่มี FR เป็นข้อค้นพบเดิม F-006 (รอ Q-07) ไม่เพิ่มซ้ำ
- กล่องสรุปเอกสารแนบ (0/3) และหมายเหตุ "รอ Q-01" ข้างฟอร์ม: มี FR-PRJ-03 รองรับ (แสดง Checklist ก่อนส่ง) ไม่ใช่ของแถม
- ตัวแสดงขั้น "ข้อมูลโครงการ / แนบเอกสารตาม Checklist" และปุ่ม ถัดไป ยกเลิก: ปุ่มนำทาง ไม่นับ
- คลิกแถวในรายการเพื่อเปิดหน้ารายละเอียด: ข้อค้นพบเดิม F-009 (รอ Q-08) ไม่เพิ่มซ้ำ
mockup เกิน spec: ไม่มี (mockup ร่างจากข้อความใน spec และสถานะ 4 ใช้กล่อง "รอ Q-10")

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-002 | เดา Q-01 | `project_document_service.py`: `PROJECT_CHECKLIST` | Q-01 ยังเปิด, IF-CHK-01 | เกณฑ์เอกสารแนบเป็นค่าคงที่ 3 รายการที่เลือกจาก FR-APR-01 ไม่ได้อ่านจากเกณฑ์ในระบบ AC-PRJ-04 ระบุว่าเกณฑ์เป็น "ของกิจกรรมนั้น" แต่ทุกกิจกรรมได้ชุดเดียวกัน และการแก้ชื่อในรายการกลางทำให้จับคู่ผลตรวจไม่ได้ บทสัมภาษณ์กองกิจยังระบุว่าต้องมีฟอร์ม 003 | ไม่ใช่ปัญหา: Checklist ชั่วคราว 3 รายการบันทึกเป็นสถานะ prototype ใน Q-01 ของ spec แล้ว รอกองกิจกำหนดเกณฑ์จริง |
| F-005 | test อ่อน | `backend/tests/test_project_workflow_end_to_end.py`, ไม่มี test หน้าจอ | AC-PRJ-02, AC-PRJ-04, AC-PRJ-05 | ฝั่ง API ตรวจแล้ว แต่ไม่มี test ว่าหน้าจอแสดงรายการที่ขาด แสดง Checklist หรือโหลดข้อมูลเดิมพร้อมเหตุผลและกลับขั้นกรอกข้อมูล ถ้าลบส่วนแสดงผลเหล่านี้ใน `ProjectDocumentForm.jsx` test ยังผ่าน และ test ไม่ได้ตั้งชื่อตาม AC ตามกฎข้อ 7 | แก้โค้ด: เพิ่ม test หน้าจอของ AC-PRJ-02, 04, 05 ด้วย /testcases ทีละ AC ในรอบถัดไป |
| F-006 | ตัวเลขไม่ตรง spec | `project_documents.py`: `_read_attachment`, `ProjectDocumentForm.jsx`: `fields`, `today` | spec 001 ไม่ระบุ | PDF/JPG/PNG, 10 MB, ข้อความ 1 เดือนและ 2 เดือน ไม่ได้อยู่ใน spec 001 แม้ plan จะอ้าง FR-PRJ-08 ถึง 11 ที่ไม่มีจริง ขนาดไฟล์ใช้ค่า `COVER_SHEET_*` ของ UC-05 ร่วมกัน ถ้าแก้เกณฑ์ใบปะหน้าจะกระทบไฟล์โครงการด้วย | เพิ่ม Q-07: ชนิด/ขนาดไฟล์แนบ (PDF JPG PNG 10 MB) และข้อความกำหนดเสนอ 1/2 เดือนไม่มีใน spec 001 |
| F-007 | โค้ดไม่มี FR | `specs/001/tasks.md`, `specs/001/plan.md` ข้อ 4 | โค้ดปัจจุบัน | T-04, T-05, T-07, T-09, T-10, T-11, T-13 ยังเขียนว่ารอ Q หรือยังไม่ทำ แต่โค้ดทำแล้ว (2569-11-08: T-16 อัปเดตเป็นเสร็จแล้ว ข้ออื่นยังค้าง) และ API จริงต่างจาก plan: ไม่มี `/new`, `/{id}/checklist`, `/{id}/attachments`, `/{id}/submit`, `/{id}/edit`, `lock-heartbeat` เพราะรวมเป็น `POST /project-documents` | แก้ spec: อัปเดต plan.md ข้อ 4 ให้ตรง API ที่ทำจริง และสถานะ task ใน tasks.md (T-16 ทำในรอบนี้ ที่เหลือทีมทำต่อ) |
| F-008 | เดา Q-05 | `project_document_service.py`: `get_for_owner` | Q-05 ยังเปิด | กำหนดให้เห็นและแก้ได้เฉพาะเจ้าของรายบุคคล กรรมการสโมสรคนอื่นเปิดโครงการของสโมสรเดียวกันไม่ได้ ขัดกับแนวทางตรวจสิทธิ์ระดับสโมสรใน plan และเป็นการตัดสินแทนทีม | ไม่ใช่ปัญหา: spec บันทึกพฤติกรรม prototype (เปิด/แก้ได้เฉพาะผู้ส่ง) ไว้ใน Q-05 แล้ว รอคำตอบ |
| F-009 | โค้ดไม่มี FR | `ProjectDetailPage.jsx`, `DocumentRoute`, `ReviewHistory`, `/project-documents/central-checklist`, `/attachments/{item}/file`, `route`, `history`, `checklistResults` | spec 001 | มีเฉพาะบันทึกใน CHANGELOG ยังไม่มี FR/AC ส่วนการส่งต่อและการดูผลหลังเข้าคิวเกี่ยวกับ Out of scope ข้อ "การตรวจสอบเอกสารโดยเจ้าหน้าที่คณะหลังเข้าคิว" ต้องตัดสินว่าจะเพิ่มลง spec หรือย้ายการตามรอยไป 003/005 | เพิ่ม Q-08: จะเพิ่ม FR หน้ารายละเอียด เส้นทางเอกสาร และเปิดไฟล์แนบลง spec 001 หรือย้ายไป 003/005 |
| F-010 | ตัวเลขไม่ตรง spec | `project_documents.py`: `SAMPLE_CLUB_NAME` | FR-PRJ-05 | เจ้าของโครงการในคิวเป็นชื่อสโมสรคงที่ทุกคำขอ ไม่ได้มาจากบัญชีผู้ส่ง ถ้ามีหลายสโมสร เจ้าหน้าที่จะเห็นผิด | เพิ่ม Q-09: ชื่อสโมสรเจ้าของโครงการต้องมาจากไหน Token ไม่มีข้อมูลสโมสร จึงแก้โค้ดเองไม่ได้ |
| F-012 | FR ไม่มี AC | `project_documents.py`: `require_club`, `App.jsx`: `RoleHome`, test-cases.md: TC-PRJ-03-7 | FR-PRJ-01, NFR-SEC-01 | FR-PRJ-01 ระบุผู้ใช้เป็น "กรรมการสโมสร" แต่ AC-PRJ-03 และ AC-PRJ-06 ครอบคลุมเฉพาะผู้ที่ยังไม่ login ไม่มี AC ว่าผู้ใช้ที่ login แล้วแต่เป็นบทบาทอื่น (เช่น เจ้าหน้าที่คณะ) ต้องได้ผลอย่างไร โค้ดตอบ 403 และซ่อนหน้าตาม RBAC ของ specs/009 โดยไม่มี test TC-PRJ-03-7 จึงยังเป็นร่าง วิธีแก้: ทีมเลือกอ้าง FR-AUTH-04 ของ specs/009 หรือเพิ่ม Q/AC ใน spec 001 | เพิ่ม Q-10: ผู้ใช้ที่ login แล้วแต่ไม่ใช่กรรมการสโมสร เปิดหน้าสร้างโครงการต้องได้ผลอย่างไร (อ้าง FR-AUTH-04 ของ 009 ได้ไหม) |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| F-003 | เพิ่ม test ตาม test-cases.md: `TC-PRJ-03-1.test.jsx` ถึง `TC-PRJ-03-6.test.jsx` เริ่มจากการกดปุ่ม "สร้างโครงการใหม่" และตรวจว่าครบ 5 ช่อง ว่างทุกช่อง พิมพ์ได้ ไม่สร้างระเบียน และไม่มีค่าเดิมค้าง (2569-11-08) | อ่าน assert ใน `TC-PRJ-03-1` (ค่าว่าง/พิมพ์ได้), `TC-PRJ-03-3` (หลังเปิดแก้ไขแล้วยังว่าง) ถ้า `getNewProjectForm` เติมค่าเดิม test ทั้งสองไม่ผ่าน; รัน `npm test` ผ่าน 76 ตัว; test T-03 เดิมยังอยู่แต่ไม่ได้อ้าง AC จึงไม่นับเป็นช่องโหว่ |
| F-001 | แก้ spec: spec.md Draft v2 บันทึกคำตอบ Q-04 (บังคับกรอกครบ 5 ช่อง วันที่ต้องไม่ผ่านมาแล้ว) ตรงกับ `_parse_fields` และ `validateProjectFields` เรื่องส่งซ้ำหลังวันจัดแยกเป็นข้อยังเปิดใน Q-04 (ทีมตัดสินเดิม: แก้ spec: บันทึกคำตอบ Q-04 ตามคำสั่งทีม CHANGELOG 2569-11-02 (บังคับกรอกครบ 5 ช่อง ห้ามวันที่ย้อนหลัง) เรื่องส่งซ้ำหลังวันจัดยังเปิดใน Q-04) | อ่าน spec.md Q-04 มีบรรทัด "ตอบแล้ว (ทีมตัดสิน 2569-11-08 …)" และโค้ดตรวจ 5 ช่องกับวันที่ตามคำตอบ; test `test_invalid_project_is_rejected` ผ่าน |
| F-004 | แก้โค้ด (commit "fix F-004"): เปลี่ยนชื่อ test 2 ตัวใน `review-context.test.jsx` เป็น "ข้อความตีกลับระบุเอกสารที่ต้องแก้" และ "ฟอร์มไม่ผ่านถ้ากรอกไม่ครบ" (ทีมตัดสินเดิม: แก้โค้ด: เปลี่ยนชื่อ test 2 ตัวใน review-context.test.jsx ไม่ให้อ้าง AC-PRJ-02/03 เพราะตรวจคนละเรื่อง) | `grep -rn "test_AC_PRJ_0[23]" frontend/src` ไม่เจอแล้ว ชื่อที่อ้าง AC-PRJ-03 เหลือเฉพาะ test TC-PRJ-03-*; `npm test` 76 ผ่าน |
| F-011 | แก้โค้ด (commit "fix F-011"): ลบ `frontend/src/components/AuthGuard.jsx` (ทีมตัดสินเดิม: แก้โค้ด: ลบ components/AuthGuard.jsx ที่ไม่มีหน้าใดเรียกใช้) | `grep -rn AuthGuard frontend/src` ไม่เจอ; `npm test` 76 ผ่าน และ TC-PRJ-03-6 ยังยืนยันว่าไม่มี session แล้วเห็นหน้า login |

## 5. คำตอบที่เสนอสำหรับ Open Questions (รอทีมยืนยัน ยังไม่ใช่คำตอบทีม)
| Q | คำตอบที่เสนอ | หลักฐาน | ความมั่นใจ |
|---|---|---|---|
| Q-01 | เจ้าของเกณฑ์คือกองกิจ ชุดพื้นฐาน: กศ.001, แบบเสนอโครงการตามประเภท (กศ.002 กลุ่มเดียวกัน), กศ.003, กำหนดการ, แบบประเมินโครงการ, รายงานการประชุม เอกสารตามเงื่อนไข: โครงการใหม่แนบรายงานการประชุม, โครงการต่อเนื่องแนบผลปีก่อน, ใช้กองทุนแนบ กศ.004, ยืมเงินแนบสัญญา 3 ฉบับ, จัดซื้อตั้งแต่ 10,000 บาทแนบใบเสนอราคา, ขอชั่วโมงแนบ กศ.013 และไฟล์ Excel รหัสนักศึกษา, ใช้สถานที่หรือยืมของแนบ กศ.009 หรือ กศ.008, เกินเวลาเข้าหอพักแนบ กศ.010 | แนวทางการตรวจโครงการ, หน้าเอกสารกองกิจ | สูง แต่แนวทางเป็นฉบับ 2565 ชื่อ กศ.002.x ต่างจากหน้าเว็บปัจจุบัน ต้องยืนยันกับกองกิจ |
| Q-02 | เว็บตอบไม่ได้เพราะเป็นเรื่องอ่านภาพต้นฉบับ ต้องให้เจ้าของ use case ยืนยัน ผังกองกิจมีเพียงว่าผู้รับผิดชอบเขียนโครงการและสร้างรหัสโครงการผ่านระบบออนไลน์ | ผังขั้นตอน | ต่ำ |
| Q-03 | เว็บตอบไม่ได้โดยตรง เสนอให้ถือเป็นส่วนหนึ่งของ flow คือไม่รับเอกสารไม่ครบ ตรงกับ FR-PRJ-07 | แนวทางระบุให้ตรวจความครบถ้วนก่อนเข้าระบบสารบรรณ | กลาง |
| Q-04 | บังคับกรอกครบแล้วปิด Q-04 ตามคำสั่งทีมใน CHANGELOG 2569-11-02 แบบฟอร์มจริงก็ถือว่าข้อมูลไม่ครบเป็นเอกสารไม่สมบูรณ์ | กศ.011 | สูง |
| Q-05 | ให้โครงการผูกกับองค์กร เพราะรหัสโครงการมีรหัสองค์กร (สโมสรหมวด 200) แต่แบบฟอร์มระบุผู้รับผิดชอบรายคน เสนอให้ทั้งสโมสรเห็นได้ ส่วนการแก้พร้อมกันไม่มีแหล่งกำหนด ยังไม่ต้องทำล็อกในโปรโตไทป์ | แนวทางการตรวจโครงการ | กลาง: ต้องตัดสินว่าใครแก้ได้ |

ข้อมูลประกอบข้อค้นพบ:
- F-002: "กส 002" เป็นคำผิดตามที่ plan บันทึกไว้ หน้าเว็บปัจจุบันระบุ กศ.002 สำหรับโครงการใช้กองทุน, กศ.002.1 ในแผน และ กศ.002.2 นอกแผน ส่วนแนวทางปี 2565 เรียกชื่อต่างออกไป จึงต้องเลือกชื่อที่ใช้ในปีปัจจุบัน
- F-006: ตัวเลข 1 และ 2 เดือนตรงกับผังกองกิจ แบบที่ 4 สโมสรใช้งบคณะหรือหารายได้เอง 1 เดือน แบบที่ 3 สโมสรร่วมกับองค์การนักศึกษา 2 เดือน ส่วนโครงการใช้กองทุนมีข้อกำหนดเสนออย่างน้อย 30 วันทำการ ทีมยังต้องเขียนลง spec
- ไฟล์แนบ PDF, JPG, PNG และ 10 MB ไม่พบข้อกำหนดของกองกิจ เป็นค่าที่ทีมเลือกเอง

แหล่งอ้างอิง:
- [เอกสารกิจกรรมนักศึกษา กองกิจ ม.ศิลปากร](https://dsa.su.ac.th/ksu/?page_id=306)
- [ผังขั้นตอนการขออนุมัติโครงการและชั่วโมงกิจกรรม](https://drive.google.com/file/d/1aVeGJRqKh0b7_z4vAuG7PpghfxCIe7Nk/view?usp=drive_link)
- [แนวทางการตรวจโครงการนักศึกษา (2565)](https://dsa.su.ac.th/ksu/wp-content/uploads/2022/03/%e0%b9%81%e0%b8%99%e0%b8%a7%e0%b8%97%e0%b8%b2%e0%b8%87%e0%b8%81%e0%b8%b2%e0%b8%a3%e0%b8%95%e0%b8%a3%e0%b8%a7%e0%b8%88%e0%b9%82%e0%b8%84%e0%b8%a3%e0%b8%87%e0%b8%81%e0%b8%b2%e0%b8%a3%e0%b8%99%e0%b8%b1%e0%b8%81%e0%b8%a8%e0%b8%b6%e0%b8%81%e0%b8%a9%e0%b8%b2.pdf)
- [กศ.011 แบบขออนุมัติสรุปผลการดำเนินโครงการ](https://dsa.su.ac.th/ksu/wp-content/uploads/2025/03/%E0%B8%81%E0%B8%A8.011.pdf)
