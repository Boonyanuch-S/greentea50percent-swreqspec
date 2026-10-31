# แผนทางเทคนิค: อนุมัติเอกสารโครงการ

อ้างอิง: `SPEC-APR-005` | สถานะต้นทาง: `Draft v2` | อัปเดตตามงานจริง: 2569-10-31

สถานะการทำ: T-01 ถึง T-17 ใน `tasks.md` ทำแล้ว รอทีมตรวจที่จุดตรวจ แผนส่วนที่ทำจริงต่างจากฉบับแรกบันทึกไว้ในแต่ละหัวข้อด้านล่าง

## 1. สรุปแนวทาง
1. อาจารย์ที่ปรึกษาเปิดหน้าอนุมัติและเลือกดูเอกสารโครงการแต่ละรายการตาม `FR-APR-01`.
2. ระบบบันทึกการอนุมัติเนื้อหาและแจ้งการพิมพ์ใบปะหน้าตาม `FR-APR-02` และ `FR-APR-03`.
3. อาจารย์อัปโหลดใบปะหน้าที่เซ็นแล้ว ระบบตั้งสถานะเป็น "รออนุมัติ" ตาม `FR-APR-04`.
4. กองกิจตรวจสอบ ตีกลับพร้อมคอมเมนต์ได้ และเมื่อผ่านจึงเปลี่ยนเป็น "อนุมัติสมบูรณ์" ตาม `FR-APR-05` และ `FR-APR-06`.
5. ระบบเรียก `UC-10` เมื่ออนุมัติสมบูรณ์ และต้องไม่สร้างกลไกตรวจจับ AI เพิ่มนอกเหนือจากคำเตือนตาม `FR-APR-07`.

## 2. เทคโนโลยีที่ใช้

| สิ่งที่เลือก | มาจาก | หมายเหตุ |
|---|---|---|
| React (Vite) | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สร้างหน้าอนุมัติและหน้าแสดงสถานะ |
| Python FastAPI | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สร้าง API ของฟีเจอร์ |
| ฐานข้อมูลเชิงสัมพันธ์ | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้เก็บเอกสาร สถานะ การอนุมัติ และคอมเมนต์; prototype ปัจจุบันยังเก็บแบบ in-memory ใน `ProjectApprovalService` ตามแนวของ UC-03 ข้อมูลกลับเป็นค่าเริ่มต้นเมื่อเริ่ม backend ใหม่ |
| Object storage หรือพื้นที่เก็บไฟล์ของระบบ | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้เก็บไฟล์ใบปะหน้าที่อัปโหลดตาม `IF-UPLOAD-01`; prototype เก็บใน memory ผ่าน `CoverSheetStorage`; รับ PDF, JPG, PNG สูงสุด 10 MB ตาม `Q-03` ตรวจนามสกุลและต้นไฟล์ ค่าอยู่ใน `backend/app/config.py` |
| `python-multipart` | ทีมเลือกเอง ไม่ได้มาจาก spec | FastAPI ใช้รับไฟล์อัปโหลดตาม `IF-UPLOAD-01` |
| SweetAlert2 (`confirmAction`) | ทีมเลือกเอง ไม่ได้มาจาก spec | กล่องยืนยันตาม `FR-APR-08` |

## 3. โมเดลข้อมูล

| Entity | ฟิลด์หลัก | รองรับ |
|---|---|---|
| `ProjectApproval` | `id`, `project_id`, `project_name`, `status`, `content_approved_at`, `completed_at`, `created_at`, `updated_at` | `FR-APR-03`, `FR-APR-04`, `FR-APR-05`, `ASM-01`, `ASM-02` |
| `ProjectDocumentItem` | `id`, `approval_id`, `document_type`, `title`, `document_reference`, `display_order`, `objectives`, `indicators`, `document_format` | `FR-APR-01`, `FR-APR-02`, `AC-APR-03` |
| `ApprovalAction` | `id`, `approval_id`, `actor_id`, `action`, `action_at` | `FR-APR-02`, `FR-APR-03`, `FR-APR-05`, `FR-APR-06` |
| `CoverSheetUpload` | `id`, `approval_id`, `file_name`, `file_reference`, `uploaded_by`, `uploaded_at`, `validation_status` | `FR-APR-04`, `IF-UPLOAD-01`, `AC-APR-02` |
| `ReviewComment` | `id`, `approval_id`, `author_id`, `comment_text`, `created_at`, `resolved_at` | `FR-APR-06`, `AC-APR-04`, `ASM-02` |
| `NotificationRequest` | `id`, `approval_id`, `target_use_case`, `requested_at`, `delivery_status` | `FR-APR-05`, `IF-UC10-01` |
| `AuthenticatedUserContext` | `user_id`, `role`, `authenticated_at` ได้จาก Token ที่ออกตอน login | `CON-NFR-21`, `NFR-SEC-01`, `AC-APR-06`, `FR-APR-03`, `FR-APR-05`, `FR-APR-06` |

สถานะที่รองรับคือ `ส่งต่ออาจารย์` (ก่อนอัปโหลดใบปะหน้าตาม `ASM-03`), `รออนุมัติ`, `อนุมัติสมบูรณ์` และสถานะตีกลับ `ตีกลับให้แก้ไข` (ค่า `RETURNED_STATUS` เดิมของระบบ) ตาม `FR-APR-06`; ชื่อสถานะเพิ่มเติมและพฤติกรรมเมื่อยังไม่อัปโหลดใบปะหน้าจะยังไม่ออกแบบเพิ่มจนกว่าจะได้คำตอบ `Q-01`.

## 4. API / หน้าจอ

route หลังบ้านจริงไม่มีคำนำหน้า `/api` เพราะ Vite ตัดออกก่อนส่งต่อ และหน้าจอเรียกผ่าน `createProjectApprovalClient` ใน `frontend/src/api/client.js` ทุก endpoint รับ Token จาก `POST /login` และใช้ผู้ดำเนินการจาก Token ไม่รับจาก client

| รายการ | Input / Output หลัก | รองรับ |
|---|---|---|
| `GET /api/project-approvals` | Input: Token ของอาจารย์หรือกองกิจ; Output: รายการเอกสาร อาจารย์เห็นทุกชุด กองกิจเห็นเฉพาะ `รออนุมัติ` | `FR-APR-01`, `FR-APR-05` |
| `GET /api/project-approvals/{approvalId}` | Input: `approvalId`; Output: รายการเอกสาร สถานะ ใบปะหน้าล่าสุด และชนิดไฟล์ที่รับ; บทบาทอื่นได้ 403 | `FR-APR-01`, `CON-NFR-21` |
| `GET /api/project-approvals/{approvalId}/documents/{documentId}` | Input: `documentId`; Output: เอกสารรายการที่เลือก พร้อมวัตถุประสงค์ ตัวชี้วัด และรูปแบบเอกสาร | `FR-APR-01`, `AC-APR-03` |
| `POST /api/project-approvals/{approvalId}/content-approval` | Input: Token ของอาจารย์; Output: เวลาที่อนุมัติและข้อความให้พิมพ์ใบปะหน้า; ต้องมีเอกสารครบชุด กดซ้ำเก็บเวลาครั้งแรกตาม `ASM-03` | `FR-APR-02`, `FR-APR-03`, `AC-APR-01` |
| `POST /api/project-approvals/{approvalId}/cover-sheet` | Input: Token ของอาจารย์และไฟล์ใบปะหน้าที่เซ็นแล้ว; Output: สถานะ `รออนุมัติ` หรือข้อผิดพลาดไฟล์ (409); ต้องอนุมัติเนื้อหาก่อนตาม `ASM-01` และอัปโหลดซ้ำแทนไฟล์เดิม | `FR-APR-04`, `IF-UPLOAD-01`, `AC-APR-02` |
| `POST /api/project-approvals/{approvalId}/review` | Input: Token ของกองกิจ; ใช้สำหรับผลตรวจผ่าน ส่วนการตีกลับใช้ `POST /return`; Output: สถานะ `อนุมัติสมบูรณ์`; ต้องมีใบปะหน้าก่อน | `FR-APR-05`, `AC-APR-02`, `AC-APR-04` |
| `POST /api/project-approvals/{approvalId}/return` | Input: Token ของอาจารย์หรือกองกิจและคอมเมนต์; Output: เอกสารทั้งชุดและคอมเมนต์ที่ส่งกลับ `UC-01`; อาจารย์ส่งได้ก่อนอัปโหลดใบปะหน้า กองกิจตีกลับได้หลังมีใบปะหน้า | `FR-APR-06`, `IF-UC01-02`, `AC-APR-04` |
| `POST /api/project-approvals/{approvalId}/notifications/uc-10` | Input: `approvalId` ของเอกสารที่อนุมัติสมบูรณ์แล้ว; Output: ผลการเรียก `UC-10`; เรียกซ้ำใช้คำขอเดิมเพื่อไม่แจ้งซ้ำ | `FR-APR-05`, `IF-UC10-01` |
| หน้า `ProjectApprovalListPage` | หน้าหลักของอาจารย์และกองกิจ แสดงรายการเอกสารให้เลือกเปิด | `FR-APR-01`, `FR-APR-05` |
| หน้า `ProjectApprovalPage` | แสดงเอกสารทั้งชุด เลือกดู ตรวจสอบ อนุมัติ อัปโหลด และส่งกลับ | `FR-APR-01` ถึง `FR-APR-04`, `FR-APR-07` |
| หน้า `ProjectOfficeReviewPanel` | แสดงเอกสารรอตรวจ รับผลผ่าน หรือตีกลับพร้อมคอมเมนต์ | `FR-APR-05`, `FR-APR-06` |
| การตรวจ session | `App.jsx` แสดงหน้า login เมื่อไม่มี session, `client.js` ไม่เรียก API เมื่อไม่มี Token และ router ใช้ `require_authenticated_context` กับ `require_roles` ตรวจ Token กับบทบาท | `CON-NFR-21`, `NFR-SEC-01`, `AC-APR-06` |

การแสดงคำเตือน AI เป็นข้อความทั่วไปที่แสดงทุกครั้งใน `ProjectApprovalPage` และไม่บล็อกปุ่มอนุมัติตาม `FR-APR-07` และคำตอบ `Q-02` จึงไม่มีกลไกตรวจจับ

ปุ่มอนุมัติเนื้อหา รับไฟล์ใบปะหน้า ตรวจผ่าน และส่งกลับ มีกล่องยืนยันก่อนทำงานตาม `FR-APR-08`

รายการเอกสารเป็นข้อมูลตัวอย่าง 3 ชุดที่ถือว่า `UC-03` ส่งต่อแล้ว โดยชุด `approval-005-003` เอกสารไม่ครบเพื่อลอง `ASM-03`

## 5. ตารางตรวจ Constraints

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| `CON-NFR-21` | การตรวจ session ในหน้าจอและ `require_authenticated_context` ของทุก endpoint ของฟีเจอร์ | ใช้แล้ว; บัญชียังเป็นตัวอย่าง |
| `IF-UC10-01` | `NotificationRequest` และ `POST /notifications/uc-10` หลัง `FR-APR-05` | ใช้แล้ว |
| `IF-UC01-02` | `POST /return` จากอาจารย์หรือกองกิจ ส่งเอกสารทั้งชุดพร้อม `ReviewComment` ไป `UC-01` | ใช้แล้ว |
| `IF-UPLOAD-01` | `CoverSheetUpload`, `POST /cover-sheet` และพื้นที่เก็บไฟล์ | ใช้แล้ว; ชนิดไฟล์/ขนาดตามคำตอบ `Q-03` |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| `AC-APR-01` | `test_AC_APR_01_content_approval` | จำลองเอกสารครบชุด กดอนุมัติเนื้อหา ตรวจเวลาที่บันทึกและข้อความให้พิมพ์ใบปะหน้า |
| `AC-APR-02` | `test_AC_APR_02_office_approval_completes` | อัปโหลดใบปะหน้าให้สำเร็จ ตั้งสถานะรออนุมัติ จำลองกองกิจตรวจผ่าน ตรวจสถานะอนุมัติสมบูรณ์และการเรียก `UC-10` |
| `AC-APR-03` | `test_AC_APR_03_select_project_document` | เปิดหน้าอนุมัติ เลือกเอกสารแต่ละรายการ ตรวจว่าเปิดได้เฉพาะรายการที่เลือกและมีรายการครบทั้งชุด |
| `AC-APR-04` | `test_AC_APR_04_return_full_document_with_comment` | จำลองกองกิจตีกลับ กรอกคอมเมนต์ ตรวจว่าเอกสารทั้งชุดและคอมเมนต์ถูกส่งไป `UC-01` |
| `AC-APR-05` | `test_AC_APR_05_ai_warning_does_not_block` | จัดข้อมูลให้แสดงคำเตือน ตรวจว่าคำเตือนปรากฏและปุ่มอนุมัติยังทำงานได้ |
| `AC-APR-06` | `test_AC_APR_06_reject_unauthenticated_access` | เรียกหน้าและ API โดยไม่มี session หรือใช้ Token ปลอม ตรวจว่าถูกปฏิเสธจนกว่าจะยืนยันตัวตนสำเร็จ |
| `AC-APR-07` | `test_AC_APR_07_review_items_displayed` | เลือกเอกสารแล้วตรวจวัตถุประสงค์ ตัวชี้วัด และรูปแบบของรายการนั้น |
| `AC-APR-08` | `test_AC_APR_08_cancel_*` | กดยกเลิกในกล่องยืนยันของแต่ละปุ่ม ตรวจว่าไม่เรียก API |

ข้อจำกัดของการทดสอบ: `AC-APR-02` ใช้คิวจำลองของ `UC-10`; `AC-APR-04` ใช้คิวจำลองของ `UC-01`; `AC-APR-05` ทดสอบการแสดงคำเตือนและการไม่บล็อกการอนุมัติตาม `Q-02`.

ผลล่าสุด (2569-10-31): backend 83 passed; frontend 17 files / 37 tests ผ่าน; `npm run build` ผ่าน ลอง flow จริงด้วย curl ผ่านแล้ว แต่ยังไม่ได้ลองหน้าจอจริงในเบราว์เซอร์ครบทุกจุดตรวจ

## 7. ลำดับงาน

ลำดับด้านล่างเป็นแผนฉบับแรก ลำดับที่ทำจริงเป็นเฟสแนวตั้งตาม `tasks.md` และ `AuthGuard` ทำจริงเป็นการตรวจ session ตามหัวข้อ 4

1. กำหนดสถานะและ transition ของ `ProjectApproval` ตั้งแต่รออนุมัติถึงอนุมัติสมบูรณ์ตาม `FR-APR-04`, `FR-APR-05`, `ASM-02`.
2. ออกแบบโมเดลเอกสาร รายการไฟล์ การอัปโหลด และคอมเมนต์ตาม `FR-APR-01`, `FR-APR-04`, `FR-APR-06`.
3. สร้าง `AuthGuard` และ API authorization ตาม `CON-NFR-21`, `NFR-SEC-01`.
4. สร้างหน้าเลือกดูเอกสารและส่วนตรวจสอบวัตถุประสงค์ ตัวชี้วัด และรูปแบบตาม `FR-APR-01`, `FR-APR-02`.
5. สร้างการอนุมัติเนื้อหา การบันทึกเวลา และข้อความพิมพ์ใบปะหน้าตาม `FR-APR-03`, `AC-APR-01`.
6. สร้างการอัปโหลดใบปะหน้าและเปลี่ยนเป็นรออนุมัติตาม `FR-APR-04`, `IF-UPLOAD-01`.
7. สร้างการตรวจของกองกิจ การตีกลับพร้อมคอมเมนต์ และการส่งต่อ `UC-01` ตาม `FR-APR-05`, `FR-APR-06`, `IF-UC01-02`.
8. เชื่อมการเรียก `UC-10` เมื่อผ่าน และเพิ่มคำเตือน AI ที่ไม่บล็อกการอนุมัติตาม `IF-UC10-01`, `FR-APR-07`.
9. เขียนและรันชุดทดสอบตาม `AC-APR-01` ถึง `AC-APR-06`.

## 8. สิ่งที่ยังไม่ทำ

- **Q-01:** หากอาจารย์กดอนุมัติเนื้อหาแล้ว แต่ไม่อัปโหลดใบปะหน้าที่เซ็นแล้วภายในเวลาที่กำหนด ระบบมีการติดตาม/แจ้งเตือนอย่างไร
  ยังเปิด: ส่วนที่เกี่ยวข้องกับการติดตาม แจ้งเตือน หรือสถานะเพิ่มเติมจะยังไม่สร้างจนกว่าจะได้คำตอบ
- **Q-02:** เกณฑ์การตรวจจับเนื้อหาที่คล้ายถูกสร้างจาก AI เป็นการตรวจจับอัตโนมัติหรือดุลพินิจของอาจารย์
  ตอบแล้ว (2569-10-31): ข้อความเตือนทั่วไปที่แสดงทุกครั้ง การตัดสินเป็นดุลพินิจของอาจารย์ จึงไม่สร้างกลไกตรวจจับ
- **Q-03:** รูปแบบไฟล์ใบปะหน้าที่อัปโหลดได้และขนาดไฟล์สูงสุด
  ตอบแล้ว (2569-10-31): รับ PDF, JPG และ PNG ขนาดสูงสุด 10 MB ค่าอยู่ใน `backend/app/config.py`
