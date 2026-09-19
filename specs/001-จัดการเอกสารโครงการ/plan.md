# แผนการพัฒนา: จัดการเอกสารโครงการ

## 1. สรุปแนวทาง

1. ฟีเจอร์นี้ให้กรรมการสโมสรนักศึกษาสร้างและแก้ไขเอกสารโครงการกิจกรรมตาม FR-PRJ-01 และ FR-PRJ-06
2. ระบบจะแสดงฟอร์มข้อมูลโครงการและ Checklist เอกสารประกอบตาม FR-PRJ-02 และ FR-PRJ-03
3. กรรมการจะแนบเอกสารตาม Checklist ตาม FR-PRJ-04
4. ระบบจะตรวจความครบถ้วนก่อนส่ง และปฏิเสธการส่งเมื่อเอกสารไม่ครบตาม FR-PRJ-07
5. เมื่อส่งสำเร็จ ระบบจะบันทึกโครงการเข้าคิวเจ้าหน้าที่คณะและเปลี่ยนสถานะตาม FR-PRJ-05 โดยบังคับผ่าน Login ตาม NFR-SEC-01

## 2. เทคโนโลยีที่ใช้

| สิ่งที่เลือก | มาจาก | หมายเหตุ |
|---|---|---|
| React (Vite) สำหรับหน้าบ้าน | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สร้างหน้าฟอร์มโครงการ หน้าแนบเอกสาร และการตรวจสถานะตาม FR-PRJ-01 ถึง FR-PRJ-07 |
| Python FastAPI สำหรับหลังบ้าน | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้จัดการข้อมูลโครงการ เอกสารแนบ Checklist และการส่งเข้าคิวตาม FR-PRJ-03 ถึง FR-PRJ-07 |
| ฐานข้อมูลเชิงสัมพันธ์ | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้เก็บข้อมูลโครงการ สถานะ เหตุผลการตีกลับ และรายการเอกสารตาม FR-PRJ-05 และ FR-PRJ-06; ชนิดฐานข้อมูลยังไม่ถูกกำหนดใน spec |
| ระบบยืนยันตัวตนของ UC-09 | CON-NFR-21, NFR-SEC-01 | เรียกใช้เป็นเงื่อนไขก่อนเข้าถึงหน้าจอและ API ของฟีเจอร์นี้ ไม่สร้าง Login ซ้ำในฟีเจอร์นี้ |

## 3. โมเดลข้อมูล

| Entity | ฟิลด์หลัก | รองรับ |
|---|---|---|
| ProjectDocument | project_id, project_name, objectives, activity_date, location, indicators, status, owner_user_id | FR-PRJ-01, FR-PRJ-02, FR-PRJ-05, FR-PRJ-06 |
| ChecklistItem | checklist_item_id, activity_type, document_name, required | FR-PRJ-03, FR-PRJ-04, FR-PRJ-07, IF-CHK-01 |
| ProjectAttachment | attachment_id, project_id, checklist_item_id, file_reference, file_name | FR-PRJ-04, FR-PRJ-05, FR-PRJ-07 |
| RejectionReason | rejection_id, project_id, reason_text | FR-PRJ-06 |
| ReviewQueueEntry | queue_entry_id, project_id, queue_status | FR-PRJ-05 |
| AuthenticatedUserReference | user_id, authentication_reference, role_reference | CON-NFR-21, NFR-SEC-01 |

รายละเอียดฟิลด์ที่เกี่ยวกับชนิดไฟล์ ขนาดไฟล์ จำนวนไฟล์ สิทธิ์เจ้าของโครงการ สถานะโครงการที่ถูกตีกลับ และการแก้ไขพร้อมกัน จะยังไม่กำหนดจนกว่าจะได้คำตอบ Q-01 ถึง Q-05 ตามหัวข้อ 8

## 4. API / หน้าจอ

| รายการ | Input / Output หลัก | รองรับ |
|---|---|---|
| `GET /project-documents/new` | Input: ผู้ใช้ที่ผ่าน Login; Output: ฟอร์มเอกสารเปล่า | FR-PRJ-01, AC-PRJ-03, CON-NFR-21 |
| `POST /project-documents` | Input: ชื่อโครงการ วัตถุประสงค์ วันที่ สถานที่ ตัวชี้วัด และเอกสารแนบ; Output: เอกสารโครงการที่บันทึกและสถานะคิว | FR-PRJ-02, FR-PRJ-04, FR-PRJ-05, AC-PRJ-01 |
| `GET /project-documents/{project_id}/checklist` | Input: project_id; Output: Checklist ของกิจกรรมนั้น | FR-PRJ-03, AC-PRJ-04, IF-CHK-01 |
| `POST /project-documents/{project_id}/attachments` | Input: project_id, checklist_item_id และไฟล์แนบ; Output: รายการเอกสารแนบ | FR-PRJ-04 |
| `POST /project-documents/{project_id}/submit` | Input: project_id; Output: สถานะสำเร็จ หรือรายการเอกสารที่ขาด | FR-PRJ-05, FR-PRJ-07, AC-PRJ-01, AC-PRJ-02 |
| `GET /project-documents/{project_id}/edit` | Input: project_id; Output: ข้อมูลเดิมและเหตุผลที่ถูกตีกลับ พร้อมฟอร์มแก้ไข | FR-PRJ-06, AC-PRJ-05 |
| หน้าฟอร์มเอกสารโครงการ | Input: ข้อมูลโครงการ; Output: ข้อมูลที่กรอกและทางไปหน้า Checklist | FR-PRJ-01, FR-PRJ-02 |
| หน้า Checklist และแนบเอกสาร | Input: เอกสารแนบ; Output: รายการครบ/ขาดและปุ่มส่ง | FR-PRJ-03, FR-PRJ-04, FR-PRJ-07 |
| การตรวจสิทธิ์ก่อนหน้า/API | Input: authentication reference; Output: อนุญาตหรือปฏิเสธการเข้าถึง | CON-NFR-21, NFR-SEC-01, AC-PRJ-06 |

เส้นทาง API และหน้าจอที่เกี่ยวกับการเลือก Checklist การส่งซ้ำ และการแก้ไขพร้อมกันจะยังไม่ยืนยันจนกว่าจะได้คำตอบ Q-01, Q-03 และ Q-05

## 5. ตารางตรวจ Constraints

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| CON-NFR-21 | การตรวจสิทธิ์ก่อนหน้า/API และ AuthenticatedUserReference | ใช้แล้ว |
| IF-CHK-01 | ChecklistItem, `GET /project-documents/{project_id}/checklist` และขั้นตรวจ Checklist | ใช้แล้ว แต่รายละเอียดแหล่งที่มาและกรณีไม่พบยังรอ Q-01 |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| AC-PRJ-01 | `test_AC_PRJ_01_submit_complete_project` | เตรียมข้อมูลโครงการครบและเอกสารครบตาม Checklist แล้วกดส่ง ตรวจว่าบันทึกโครงการและสถานะเป็น "รอเจ้าหน้าที่คณะตรวจสอบ" |
| AC-PRJ-02 | `test_AC_PRJ_02_reject_missing_attachment` | เตรียมเอกสารแนบขาดอย่างน้อยหนึ่งรายการแล้วกดส่ง ตรวจว่าระบบปฏิเสธ แสดงรายการที่ขาด และไม่เข้าคิว |
| AC-PRJ-03 | `test_AC_PRJ_03_show_empty_project_form` | เลือกสร้างโครงการใหม่ ตรวจว่าระบบแสดงฟอร์มเอกสารเปล่าพร้อมกรอก |
| AC-PRJ-04 | `test_AC_PRJ_04_show_activity_checklist` | กรอกข้อมูลโครงการครบแล้วเปิดหน้าแนบเอกสาร ตรวจว่าแสดง Checklist ของกิจกรรมนั้น |
| AC-PRJ-05 | `test_AC_PRJ_05_load_rejected_project_for_edit` | เปิดโครงการที่ถูกตีกลับ ตรวจว่าข้อมูลเดิม เหตุผลการตีกลับ และขั้นกรอกข้อมูลแสดงครบ |
| AC-PRJ-06 | `test_AC_PRJ_06_reject_unauthenticated_access` | เรียกหน้าจอหรือ API โดยไม่มีการยืนยันตัวตน ตรวจว่าระบบปฏิเสธการเข้าถึง |

## 7. ลำดับงาน

1. กำหนดสัญญาข้อมูล ProjectDocument และการตรวจสิทธิ์ก่อนเข้าฟีเจอร์ ตาม FR-PRJ-01, FR-PRJ-02, CON-NFR-21 และ NFR-SEC-01
2. สร้างหน้าฟอร์มเอกสารเปล่าและรับข้อมูลโครงการ ตาม FR-PRJ-01 และ FR-PRJ-02
3. เชื่อมการอ่าน Checklist ที่กำหนดไว้ในระบบและแสดงรายการตามกิจกรรม ตาม FR-PRJ-03 และ IF-CHK-01
4. เพิ่มการแนบเอกสารและผูกเอกสารกับรายการ Checklist ตาม FR-PRJ-04
5. เพิ่มการตรวจเอกสารแนบก่อนส่งและแสดงรายการที่ขาด ตาม FR-PRJ-07
6. เพิ่มการบันทึกโครงการเข้าคิวและเปลี่ยนสถานะเมื่อเอกสารครบ ตาม FR-PRJ-05
7. เพิ่มการโหลดข้อมูลเดิมและเหตุผลการตีกลับเพื่อแก้ไข ตาม FR-PRJ-06
8. รันทดสอบตาม AC-PRJ-01 ถึง AC-PRJ-06 และตรวจ traceability ของ FR, NFR และ IF ทุกข้อ

งานที่เกี่ยวกับรายละเอียด Checklist การส่งซ้ำ สิทธิ์เจ้าของโครงการ และ concurrent editing จะหยุดไว้จนกว่าจะตอบ Q-01 ถึง Q-05

## 8. สิ่งที่ยังไม่ทำ

- Q-01 เกณฑ์ Checklist เอกสารแนบถูกกำหนด/ดูแลโดย use case หรือหน่วยงานใด (เช่น กองกิจ)? ต้องยืนยัน owner ของเกณฑ์นี้ก่อนออกแบบ integration — ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
- Q-02 ข้อความ Main Flow ขั้น 2 ในภาพต้นฉบับไม่สมบูรณ์/อ่านไม่ชัด ต้องขอภาพที่ชัดกว่านี้หรือยืนยันข้อความที่ถูกต้อง — ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
- Q-03 ข้อความต่อท้าย Exception Flow 4a เป็นส่วนหนึ่งของ flow หรือหมายเหตุเพิ่มเติม? — ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
- Q-04 หากกรรมการแนบเอกสารครบตาม Checklist แต่กรอกข้อมูลฟอร์มหลักไม่ครบ ระบบควรจัดการอย่างไร? — ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
- Q-05 กรรมการสโมสรหลายคนสามารถแก้ไขโครงการเดียวกันพร้อมกันได้หรือไม่ (concurrent editing)? — ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
