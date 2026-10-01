# แผนการพัฒนา: จัดการเอกสารโครงการ

## 0. บันทึกการแก้ไข (v2)

แก้จาก plan v1 ที่อิง spec v1 (ก่อนตอบคำถาม Q1-Q8) เป็น v2 ที่อิง spec.md ฉบับ Draft v2
การเปลี่ยนแปลงหลัก: เพิ่มเนื้อหารองรับ FR-PRJ-08 ถึง FR-PRJ-11, เพิ่ม Constraint ใหม่ 5 ตัว,
เพิ่ม AC-PRJ-07 ถึง AC-PRJ-12 ในแผนทดสอบ, ปิด Q-01 บางส่วนด้วยแหล่งข้อมูลจริงจากกองกิจการนักศึกษา
(ดูหัวข้อ 9) และแก้รหัสเอกสาร "กส 002" เป็น "กศ.002" ให้ตรงกับเอกสารจริง

## 1. สรุปแนวทาง

1. ฟีเจอร์นี้ให้กรรมการสโมสรนักศึกษาสร้างและแก้ไขเอกสารโครงการกิจกรรมตาม FR-PRJ-01 และ FR-PRJ-06
2. ระบบจะแสดงฟอร์มข้อมูลโครงการและ Checklist เอกสารประกอบตาม FR-PRJ-02 และ FR-PRJ-03
   โดยฟอร์มหลักมี validation (ฟิลด์บังคับ, วันที่ไม่เป็นอดีต, จำกัดความยาวข้อความ) ตาม FR-PRJ-02 (v2)
3. กรรมการจะแนบเอกสารตาม Checklist ตาม FR-PRJ-04 โดยจำกัดชนิดไฟล์เป็น PDF/JPG/PNG ขนาดไม่เกิน 10MB
4. ระบบจะตรวจความครบถ้วนของฟอร์มหลักก่อน Checklist เสมอ และแสดง error รวมกันในหน้าเดียวตาม FR-PRJ-11
5. ระบบจะปฏิเสธการส่งเมื่อเอกสารไม่ครบตาม FR-PRJ-07 และหยุดกระบวนการทั้งหมดพร้อมแจ้งผู้ดูแลระบบ
   เมื่อไม่พบ Checklist สำหรับกิจกรรมประเภทนั้นตาม FR-PRJ-08
6. เมื่อส่งสำเร็จ ระบบจะบันทึกโครงการเข้าคิวเจ้าหน้าที่คณะและเปลี่ยนสถานะตาม FR-PRJ-05
   โดยบังคับผ่าน Login ตาม NFR-SEC-01 และตรวจสิทธิ์ระดับสโมสรตาม FR-PRJ-09/NFR-SEC-02
7. เมื่อมีผู้ใช้มากกว่าหนึ่งคนเปิดแก้ไขโครงการเดียวกัน ระบบแสดง soft-lock indicator และใช้
   last-write-wins เมื่อบันทึกตาม FR-PRJ-10

## 2. เทคโนโลยีที่ใช้

| สิ่งที่เลือก | มาจาก | หมายเหตุ |
|---|---|---|
| React (Vite) สำหรับหน้าบ้าน | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สร้างหน้าฟอร์มโครงการ หน้าแนบเอกสาร การตรวจสถานะ และตัวแสดง soft-lock indicator ตาม FR-PRJ-01 ถึง FR-PRJ-11 |
| Python FastAPI สำหรับหลังบ้าน | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้จัดการข้อมูลโครงการ เอกสารแนบ Checklist การส่งเข้าคิว การตรวจสิทธิ์ระดับสโมสร และ validation ไฟล์ตาม FR-PRJ-03 ถึง FR-PRJ-11 |
| ฐานข้อมูลเชิงสัมพันธ์ | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้เก็บข้อมูลโครงการ สถานะ เหตุผลการตีกลับ รายการเอกสาร ข้อมูลสโมสรเจ้าของ (club_id) และ field สำหรับ soft-lock ตาม FR-PRJ-05, FR-PRJ-06, FR-PRJ-09 และ FR-PRJ-10; ชนิดฐานข้อมูลยังไม่ถูกกำหนดใน spec |
| ระบบยืนยันตัวตนของ UC-09 | CON-NFR-21, NFR-SEC-01 | เรียกใช้เป็นเงื่อนไขก่อนเข้าถึงหน้าจอและ API ของฟีเจอร์นี้ ไม่สร้าง Login ซ้ำในฟีเจอร์นี้ |
| Polling แบบช่วงเวลาสั้น (เช่น ทุก 10-15 วินาที) สำหรับ soft-lock | ทีมเลือกเอง เพื่อรองรับ FR-PRJ-10/DOM-CONC-01 | ยังไม่เลือก WebSocket เพราะภาระงานพร้อมกันของฟีเจอร์นี้ต่ำ (กรรมการไม่กี่คนต่อโครงการ) polling เพียงพอและ implement ง่ายกว่า; ควรยืนยันกับทีมก่อนล็อกเทคโนโลยีจริง |

## 3. โมเดลข้อมูล

| Entity | ฟิลด์หลัก | รองรับ |
|---|---|---|
| ProjectDocument | project_id, project_name (≤200 ตัวอักษร, ค่าเริ่มต้นที่เสนอ - รอยืนยัน Q-06), objectives (≤2,000 ตัวอักษร, รอยืนยัน Q-06), activity_date (ต้อง >= วันปัจจุบัน), location, indicators, status, owner_user_id, **club_id** (สโมสรเจ้าของ), **locked_by_user_id**, **locked_at** | FR-PRJ-01, FR-PRJ-02, FR-PRJ-05, FR-PRJ-06, FR-PRJ-09, FR-PRJ-10 |
| ChecklistItem | checklist_item_id, activity_type, document_name (เช่น "กศ.002"), required, **checklist_version**, **not_found_flag** (ใช้เมื่อไม่พบ Checklist ของกิจกรรมประเภทนั้น) | FR-PRJ-03, FR-PRJ-04, FR-PRJ-07, FR-PRJ-08, IF-CHK-01, IF-CHK-02 |
| ProjectAttachment | attachment_id, project_id, checklist_item_id, file_reference, file_name, **file_type** (จำกัด pdf/jpg/png), **file_size_bytes** (≤10MB) | FR-PRJ-04, FR-PRJ-05, FR-PRJ-07, IF-FILE-01 |
| RejectionReason | rejection_id, project_id, reason_text | FR-PRJ-06 |
| ReviewQueueEntry | queue_entry_id, project_id, queue_status | FR-PRJ-05 |
| AuthenticatedUserReference | user_id, authentication_reference, role_reference, **club_membership_id** (สำหรับตรวจสิทธิ์ระดับสโมสร) | CON-NFR-21, NFR-SEC-01, FR-PRJ-09, NFR-SEC-02 |
| AdminAlertLog | alert_id, activity_type, triggered_at, resolved | FR-PRJ-08 (แจ้งผู้ดูแลระบบเมื่อไม่พบ Checklist) |

**อัปเดตสำคัญ (ปิด Q-01 บางส่วน):** ตรวจสอบกับหน้าทางการของกองกิจการนักศึกษา มหาวิทยาลัยศิลปากร
(https://dsa.su.ac.th/ksu/?page_id=306 "เอกสารกิจกรรมนักศึกษา") แล้ว ยืนยันว่า:
- **เจ้าของเกณฑ์/รหัสเอกสาร Checklist คือกองกิจการนักศึกษา** เผยแพร่ฟอร์ม กศ.001 ถึง กศ.017 ที่หน้านี้จริง
- **แก้คำผิด:** รหัสเอกสารที่ spec เขียนว่า "กส 002" ที่ถูกต้องคือ **"กศ.002"** (แบบเสนอขออนุมัติโครงการตามแผนงบประมาณ)
  หรือ กศ.002.1/002.2 (แผนดำเนินงาน/นอกแผนดำเนินงาน) และ กศ.003 (ประกันคุณภาพการศึกษา) แล้วแต่ประเภทโครงการ
- เอกสารต้นฉบับส่วนใหญ่เป็น **PDF หรือลิงก์ Google Drive** (.pdf/.docx) ไม่ใช่ไฟล์ interactive ที่ต้อง parse เนื้อหา
- **ยังไม่ปิดเต็ม:** หน้านี้เป็นหน้าเว็บสาธารณะที่อัปเดตโดยกองกิจเอง **ไม่มี API** ให้ระบบดึงเวอร์ชันล่าสุดอัตโนมัติ
  จึงยังต้องตัดสินใจว่าจะ (ก) ให้เจ้าหน้าที่กองกิจกรอก Checklist เข้าระบบเองผ่านหน้าแอดมิน หรือ
  (ข) ทีมพัฒนา sync ข้อมูลจากหน้านี้เข้าระบบเป็นระยะ — ยังไม่มีคำตอบ จึงยังคงเป็นส่วนหนึ่งของ Q-01 ที่เหลือ

## 4. API / หน้าจอ

| รายการ | Input / Output หลัก | รองรับ |
|---|---|---|
| `GET /project-documents/new` | Input: ผู้ใช้ที่ผ่าน Login; Output: ฟอร์มเอกสารเปล่า | FR-PRJ-01, AC-PRJ-03, CON-NFR-21 |
| `POST /project-documents` | Input: ชื่อโครงการ วัตถุประสงค์ วันที่ สถานที่ ตัวชี้วัด และเอกสารแนบ; Output: เอกสารโครงการที่บันทึกและสถานะคิว หรือ error รวม (ฟอร์ม+เอกสารแนบ) ตาม FR-PRJ-11 | FR-PRJ-02, FR-PRJ-04, FR-PRJ-05, FR-PRJ-11, AC-PRJ-01, AC-PRJ-08, AC-PRJ-10 |
| `GET /project-documents/{project_id}/checklist` | Input: project_id; Output: Checklist ของกิจกรรมนั้น หรือสถานะ "ไม่พบ Checklist" พร้อมแจ้งผู้ดูแลระบบ | FR-PRJ-03, FR-PRJ-08, AC-PRJ-04, AC-PRJ-07, IF-CHK-01, IF-CHK-02 |
| `POST /project-documents/{project_id}/attachments` | Input: project_id, checklist_item_id และไฟล์แนบ (ตรวจชนิด/ขนาดก่อนรับ); Output: รายการเอกสารแนบ หรือปฏิเสธพร้อมเหตุผล | FR-PRJ-04, IF-FILE-01, AC-PRJ-09 |
| `POST /project-documents/{project_id}/submit` | Input: project_id; Output: สถานะสำเร็จ หรือรายการเอกสาร/ฟิลด์ที่ขาดรวมกัน | FR-PRJ-05, FR-PRJ-07, FR-PRJ-11, AC-PRJ-01, AC-PRJ-02, AC-PRJ-10 |
| `GET /project-documents/{project_id}/edit` | Input: project_id, ผู้ใช้ (ตรวจ club_id ตรงกับโครงการ); Output: ข้อมูลเดิมและเหตุผลที่ถูกตีกลับ พร้อมฟอร์มแก้ไข หรือปฏิเสธถ้าไม่ใช่สมาชิกสโมสรเดียวกัน | FR-PRJ-06, FR-PRJ-09, AC-PRJ-05, AC-PRJ-11, NFR-SEC-02 |
| `POST /project-documents/{project_id}/lock-heartbeat` | Input: project_id, user_id; Output: สถานะ lock ปัจจุบัน (ว่าง/มีคนแก้ไขอยู่) | FR-PRJ-10, AC-PRJ-12, DOM-CONC-01 |
| หน้าฟอร์มเอกสารโครงการ | Input: ข้อมูลโครงการ; Output: ข้อมูลที่กรอกและทางไปหน้า Checklist พร้อม validation realtime | FR-PRJ-01, FR-PRJ-02 |
| หน้า Checklist และแนบเอกสาร | Input: เอกสารแนบ; Output: รายการครบ/ขาดและปุ่มส่ง | FR-PRJ-03, FR-PRJ-04, FR-PRJ-07 |
| ตัวแสดง soft-lock indicator | Input: ผลจาก lock-heartbeat; Output: แบนเนอร์แจ้งว่ามีคนอื่นกำลังแก้ไข | FR-PRJ-10 |
| การตรวจสิทธิ์ก่อนหน้า/API | Input: authentication reference, club_membership_id; Output: อนุญาตหรือปฏิเสธการเข้าถึง | CON-NFR-21, NFR-SEC-01, NFR-SEC-02, AC-PRJ-06, AC-PRJ-11 |

## 5. ตารางตรวจ Constraints

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| CON-NFR-21 | การตรวจสิทธิ์ก่อนหน้า/API และ AuthenticatedUserReference | ใช้แล้ว |
| IF-CHK-01 | ChecklistItem, `GET /project-documents/{project_id}/checklist` และขั้นตรวจ Checklist | ใช้แล้ว แต่กลไกอัปเดตเกณฑ์จากกองกิจยังรอข้อสรุป (ดูหัวข้อ 3) |
| IF-CHK-02 | `not_found_flag` ใน ChecklistItem, AdminAlertLog, logic หยุดกระบวนการเมื่อไม่พบ Checklist | ใช้แล้ว |
| IF-FILE-01 | `file_type`/`file_size_bytes` ใน ProjectAttachment, validation ใน `POST /attachments` | ใช้แล้ว |
| DOM-AUTHZ-01 | `club_id`/`club_membership_id`, การตรวจสิทธิ์ใน `GET /edit` | ใช้แล้ว |
| DOM-CONC-01 | `locked_by_user_id`/`locked_at`, `POST /lock-heartbeat`, ตัวแสดง soft-lock indicator | ใช้แล้ว (เทคโนโลยี polling ยังรอยืนยัน) |
| NFR-SEC-02 | การตรวจ club_membership_id เพิ่มจากการ Login ทั่วไป | ใช้แล้ว |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| AC-PRJ-01 | `test_AC_PRJ_01_submit_complete_project` | เตรียมข้อมูลโครงการครบและเอกสารครบตาม Checklist แล้วกดส่ง ตรวจว่าบันทึกโครงการและสถานะเป็น "รอเจ้าหน้าที่คณะตรวจสอบ" |
| AC-PRJ-02 | `test_AC_PRJ_02_reject_missing_attachment` | เตรียมเอกสารแนบขาดอย่างน้อยหนึ่งรายการแล้วกดส่ง ตรวจว่าระบบปฏิเสธ แสดงรายการที่ขาด และไม่เข้าคิว |
| AC-PRJ-03 | `test_AC_PRJ_03_show_empty_project_form` | เลือกสร้างโครงการใหม่ ตรวจว่าระบบแสดงฟอร์มเอกสารเปล่าพร้อมกรอก และยังไม่สร้างระเบียน |
| AC-PRJ-04 | `test_AC_PRJ_04_show_activity_checklist` | กรอกข้อมูลโครงการครบแล้วเปิดหน้าแนบเอกสาร ตรวจว่าแสดง Checklist ของกิจกรรมนั้น |
| AC-PRJ-05 | `test_AC_PRJ_05_load_rejected_project_for_edit` | เปิดโครงการที่ถูกตีกลับ ตรวจว่าข้อมูลเดิม เหตุผลการตีกลับ และขั้นกรอกข้อมูลแสดงครบ |
| AC-PRJ-06 | `test_AC_PRJ_06_reject_unauthenticated_access` | เรียกหน้าจอหรือ API โดยไม่มีการยืนยันตัวตน ตรวจว่าระบบปฏิเสธการเข้าถึง |
| AC-PRJ-07 | `test_AC_PRJ_07_checklist_not_found_blocks_submission` | เตรียมกิจกรรมประเภทที่ไม่มี Checklist ตรวจว่าระบบหยุดกระบวนการ ไม่อนุญาตดำเนินการต่อ และสร้าง AdminAlertLog |
| AC-PRJ-08 | `test_AC_PRJ_08_reject_past_activity_date` | กรอกวันที่จัดกิจกรรมเป็นอดีตแล้วกดส่ง ตรวจว่าระบบปฏิเสธพร้อมข้อความแจ้งวันที่ไม่ถูกต้อง |
| AC-PRJ-09 | `test_AC_PRJ_09_reject_invalid_file_type_or_size` | อัปโหลดไฟล์ชนิด/ขนาดไม่ตรงเงื่อนไข ตรวจว่าระบบปฏิเสธไฟล์นั้นพร้อมเหตุผล |
| AC-PRJ-10 | `test_AC_PRJ_10_combined_validation_errors` | ให้ทั้งฟอร์มหลักและเอกสารแนบไม่ครบพร้อมกันแล้วกดส่ง ตรวจว่า error ทั้งสองประเภทแสดงรวมกันในคำตอบเดียว |
| AC-PRJ-11 | `test_AC_PRJ_11_reject_cross_club_access` | ให้ผู้ใช้จากสโมสรอื่นพยายามเปิดแก้ไขโครงการ ตรวจว่าระบบปฏิเสธแม้ Login สำเร็จแล้ว |
| AC-PRJ-12 | `test_AC_PRJ_12_soft_lock_indicator_shows` | ให้ผู้ใช้คนที่สองเปิดโครงการที่คนแรกกำลังแก้ไขอยู่ ตรวจว่าเห็น soft-lock indicator |

## 7. ลำดับงาน

1. กำหนดสัญญาข้อมูล ProjectDocument (รวม club_id, lock fields) และการตรวจสิทธิ์ก่อนเข้าฟีเจอร์
   ตาม FR-PRJ-01, FR-PRJ-02, CON-NFR-21 และ NFR-SEC-01
2. สร้างหน้าฟอร์มเอกสารเปล่าและรับข้อมูลโครงการพร้อม validation (บังคับ/วันที่/ความยาว) ตาม FR-PRJ-01 และ FR-PRJ-02
3. เชื่อมการอ่าน Checklist ที่กำหนดไว้ในระบบและแสดงรายการตามกิจกรรม รวมถึง logic เมื่อไม่พบ Checklist
   (หยุดกระบวนการ+แจ้งผู้ดูแลระบบ) ตาม FR-PRJ-03, FR-PRJ-08 และ IF-CHK-01/IF-CHK-02
4. เพิ่มการแนบเอกสารพร้อม validation ชนิด/ขนาดไฟล์ และผูกเอกสารกับรายการ Checklist ตาม FR-PRJ-04 และ IF-FILE-01
5. เพิ่มการตรวจเอกสารแนบและฟอร์มหลักร่วมกันก่อนส่ง (ฟอร์มก่อน Checklist เสมอ, error รวมหน้าเดียว)
   และแสดงรายการที่ขาด ตาม FR-PRJ-07 และ FR-PRJ-11
6. เพิ่มการบันทึกโครงการเข้าคิวและเปลี่ยนสถานะเมื่อเอกสารครบ ตาม FR-PRJ-05
7. เพิ่มการโหลดข้อมูลเดิมและเหตุผลการตีกลับเพื่อแก้ไข พร้อมตรวจสิทธิ์ระดับสโมสร
   ตาม FR-PRJ-06, FR-PRJ-09 และ NFR-SEC-02
8. เพิ่ม soft-lock indicator และกลไก last-write-wins สำหรับการแก้ไขพร้อมกัน ตาม FR-PRJ-10 และ DOM-CONC-01
9. รันทดสอบตาม AC-PRJ-01 ถึง AC-PRJ-12 และตรวจ traceability ของ FR, NFR, IF และ Constraint ทุกข้อ

งานที่เกี่ยวกับรายละเอียด Checklist การส่งซ้ำ สิทธิ์เจ้าของโครงการ และ concurrent editing จะหยุดไว้จนกว่าจะตอบ Q-01 ถึง Q-05

## 8. สิ่งที่ยังไม่ทำ

- Q-01 (เหลือบางส่วน) ยืนยันแล้วว่า owner ของเกณฑ์ Checklist คือกองกิจการนักศึกษา เผยแพร่ที่
  https://dsa.su.ac.th/ksu/?page_id=306 แต่ยังไม่ทราบว่าระบบจะ sync เกณฑ์จากหน้านี้เข้ามาอย่างไร
  (กรอกเองโดยเจ้าหน้าที่กองกิจผ่านหน้าแอดมิน หรือ sync อัตโนมัติ) — ส่วนที่เกี่ยวข้องกับกลไก sync
  จะยังไม่สร้างจนกว่าจะได้คำตอบ
- Q-06 ตัวเลขความยาวสูงสุดของฟิลด์ชื่อโครงการ/วัตถุประสงค์ (เสนอไว้ 200/2,000 ตัวอักษร) ยังไม่ได้รับการยืนยัน
- Q-07 กรณีกรรมการที่เพิ่งเข้าสโมสรใหม่ระหว่างโครงการถูกตีกลับ มีสิทธิ์แก้ไขทันทีตาม DOM-AUTHZ-01 หรือไม่
- Q-08 soft-lock indicator ควรปลดล็อกอัตโนมัติเมื่อใด (ปิดหน้าจอ/timeout กี่นาที) และยืนยันว่าใช้ polling
  หรือ WebSocket

## 9. แหล่งอ้างอิงภายนอกที่ตรวจสอบแล้ว

- เอกสารองค์กรนักศึกษามหาวิทยาลัยศิลปากร (กศ.001-017): https://dsa.su.ac.th/ksu/?page_id=306
  ดูแลโดยกองกิจการนักศึกษา เผยแพร่เป็น PDF/Google Drive มีรหัสเอกสารที่เกี่ยวข้องกับฟีเจอร์นี้โดยตรง เช่น
  กศ.002/002.1/002.2 (ขออนุมัติโครงการ), กศ.003 (ขออนุมัติโครงการ-ประกันคุณภาพการศึกษา) — ใช้แก้รหัสเอกสารที่เคย
  เขียนผิดเป็น "กส 002" ในสเปกฉบับก่อนหน้า
