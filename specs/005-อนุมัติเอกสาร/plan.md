# แผนทางเทคนิค: อนุมัติเอกสารโครงการ

อ้างอิง: `SPEC-APR-005` | สถานะต้นทาง: `Draft v2`

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
| ฐานข้อมูลเชิงสัมพันธ์ | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้เก็บเอกสาร สถานะ การอนุมัติ และคอมเมนต์ |
| Object storage หรือพื้นที่เก็บไฟล์ของระบบ | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้เก็บไฟล์ใบปะหน้าที่อัปโหลดตาม `IF-UPLOAD-01`; รายละเอียดชนิดไฟล์และขนาดยังรอ `Q-03` |

## 3. โมเดลข้อมูล

| Entity | ฟิลด์หลัก | รองรับ |
|---|---|---|
| `ProjectApproval` | `id`, `project_id`, `status`, `content_approved_at`, `completed_at`, `created_at`, `updated_at` | `FR-APR-03`, `FR-APR-04`, `FR-APR-05`, `ASM-01`, `ASM-02` |
| `ProjectDocumentItem` | `id`, `approval_id`, `document_type`, `document_reference`, `display_order` | `FR-APR-01`, `AC-APR-03` |
| `ApprovalAction` | `id`, `approval_id`, `actor_id`, `action`, `action_at` | `FR-APR-02`, `FR-APR-03`, `FR-APR-05`, `FR-APR-06` |
| `CoverSheetUpload` | `id`, `approval_id`, `file_reference`, `uploaded_by`, `uploaded_at`, `validation_status` | `FR-APR-04`, `IF-UPLOAD-01`, `AC-APR-02` |
| `ReviewComment` | `id`, `approval_id`, `author_id`, `comment_text`, `created_at`, `resolved_at` | `FR-APR-06`, `AC-APR-04`, `ASM-02` |
| `NotificationRequest` | `id`, `approval_id`, `target_use_case`, `requested_at`, `delivery_status` | `FR-APR-05`, `IF-UC10-01` |
| `AuthenticatedUserContext` | `user_id`, `role`, `authenticated_at` | `CON-NFR-21`, `NFR-SEC-01`, `AC-APR-06` |

สถานะที่วางแผนรองรับคือ `รออนุมัติ`, `อนุมัติสมบูรณ์` และสถานะตีกลับที่ระบบต้นทางกำหนดไว้ตาม `FR-APR-06`; ชื่อสถานะเพิ่มเติมและพฤติกรรมเมื่อยังไม่อัปโหลดใบปะหน้าจะยังไม่ออกแบบเพิ่มจนกว่าจะได้คำตอบ `Q-01`.

## 4. API / หน้าจอ

| รายการ | Input / Output หลัก | รองรับ |
|---|---|---|
| `GET /api/project-approvals/{approvalId}` | Input: `approvalId`; Output: รายการเอกสาร สถานะ และสิทธิ์ผู้ใช้ | `FR-APR-01`, `CON-NFR-21` |
| `GET /api/project-approvals/{approvalId}/documents/{documentId}` | Input: `documentId`; Output: เอกสารรายการที่เลือก | `FR-APR-01`, `AC-APR-03` |
| `POST /api/project-approvals/{approvalId}/content-approval` | Input: ผู้อนุมัติ; Output: เวลาที่อนุมัติและข้อความให้พิมพ์ใบปะหน้า | `FR-APR-02`, `FR-APR-03`, `AC-APR-01` |
| `POST /api/project-approvals/{approvalId}/cover-sheet` | Input: ไฟล์ใบปะหน้าที่เซ็นแล้ว; Output: สถานะ `รออนุมัติ` หรือข้อผิดพลาดไฟล์ | `FR-APR-04`, `IF-UPLOAD-01`, `AC-APR-02` |
| `POST /api/project-approvals/{approvalId}/review` | Input: ผลตรวจของกองกิจ; Output: สถานะ `อนุมัติสมบูรณ์` หรือสถานะตีกลับ | `FR-APR-05`, `FR-APR-06`, `AC-APR-02`, `AC-APR-04` |
| `POST /api/project-approvals/{approvalId}/return` | Input: คอมเมนต์รายละเอียดที่ต้องแก้ไข; Output: เอกสารทั้งชุดและคอมเมนต์ที่ส่งกลับ `UC-01` | `FR-APR-06`, `IF-UC01-02`, `AC-APR-04` |
| `POST /api/project-approvals/{approvalId}/notifications/uc-10` | Input: `approvalId`, สถานะอนุมัติสมบูรณ์; Output: ผลการเรียก `UC-10` | `FR-APR-05`, `IF-UC10-01` |
| หน้า `ProjectApprovalPage` | แสดงรายการเอกสาร เลือกดู ตรวจสอบ อนุมัติ และอัปโหลด | `FR-APR-01` ถึง `FR-APR-04`, `FR-APR-07` |
| หน้า `ProjectOfficeReviewPanel` | แสดงเอกสารรอตรวจ รับผลผ่าน หรือตีกลับพร้อมคอมเมนต์ | `FR-APR-05`, `FR-APR-06` |
| `AuthGuard` | ตรวจ session/login ก่อนเรียกหน้าจอและ API | `CON-NFR-21`, `NFR-SEC-01`, `AC-APR-06` |

การแสดงคำเตือน AI จะเป็นจุดแสดงข้อความ/ธงเตือนที่ไม่บล็อกปุ่มอนุมัติตาม `FR-APR-07`; กลไกตรวจจับจริงจะยังไม่สร้างจนกว่าจะได้คำตอบ `Q-02`.

## 5. ตารางตรวจ Constraints

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| `CON-NFR-21` | `AuthGuard`, `AuthenticatedUserContext`, API ทุก endpoint ของฟีเจอร์ | ใช้แล้ว |
| `IF-UC10-01` | `NotificationRequest` และ `POST /notifications/uc-10` หลัง `FR-APR-05` | ใช้แล้ว |
| `IF-UC01-02` | `POST /return` ส่งเอกสารทั้งชุดพร้อม `ReviewComment` ไป `UC-01` | ใช้แล้ว |
| `IF-UPLOAD-01` | `CoverSheetUpload`, `POST /cover-sheet` และพื้นที่เก็บไฟล์ | ใช้แล้ว; ชนิดไฟล์/ขนาดรอ `Q-03` |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| `AC-APR-01` | `test_AC_APR_01_content_approval` | จำลองเอกสารครบชุด กดอนุมัติเนื้อหา ตรวจเวลาที่บันทึกและข้อความให้พิมพ์ใบปะหน้า |
| `AC-APR-02` | `test_AC_APR_02_office_approval_completes` | อัปโหลดใบปะหน้าให้สำเร็จ ตั้งสถานะรออนุมัติ จำลองกองกิจตรวจผ่าน ตรวจสถานะอนุมัติสมบูรณ์และการเรียก `UC-10` |
| `AC-APR-03` | `test_AC_APR_03_select_project_document` | เปิดหน้าอนุมัติ เลือกเอกสารแต่ละรายการ ตรวจว่าเปิดได้เฉพาะรายการที่เลือกและมีรายการครบทั้งชุด |
| `AC-APR-04` | `test_AC_APR_04_return_full_document_with_comment` | จำลองกองกิจตีกลับ กรอกคอมเมนต์ ตรวจว่าเอกสารทั้งชุดและคอมเมนต์ถูกส่งไป `UC-01` |
| `AC-APR-05` | `test_AC_APR_05_ai_warning_does_not_block` | จัดข้อมูลให้แสดงคำเตือน ตรวจว่าคำเตือนปรากฏและปุ่มอนุมัติยังทำงานได้ |
| `AC-APR-06` | `test_AC_APR_06_reject_unauthenticated_access` | เรียกหน้าและ API โดยไม่มี session ตรวจว่าถูกปฏิเสธจนกว่าจะยืนยันตัวตนสำเร็จ |

ข้อจำกัดของการทดสอบ: `AC-APR-02` ต้องใช้ stub/mock ของกองกิจและ `UC-10`; `AC-APR-05` ยังทดสอบได้เฉพาะการแสดงคำเตือนตาม `Q-02` ไม่ใช่ความแม่นยำของการตรวจจับ AI.

## 7. ลำดับงาน

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
  ส่วนที่เกี่ยวข้องกับการติดตาม แจ้งเตือน หรือสถานะเพิ่มเติมจะยังไม่สร้างจนกว่าจะได้คำตอบ
- **Q-02:** เกณฑ์การตรวจจับเนื้อหาที่คล้ายถูกสร้างจาก AI เป็นการตรวจจับอัตโนมัติหรือดุลพินิจของอาจารย์
  ส่วนที่เกี่ยวข้องกับกลไกตรวจจับจริงจะยังไม่สร้างจนกว่าจะได้คำตอบ
- **Q-03:** รูปแบบไฟล์ใบปะหน้าที่อัปโหลดได้และขนาดไฟล์สูงสุด
  ส่วนที่เกี่ยวข้องกับการกำหนดชนิดไฟล์และขนาดสูงสุดจะยังไม่สร้างจนกว่าจะได้คำตอบ
