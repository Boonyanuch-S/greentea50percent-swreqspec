# แผนการพัฒนา: ตรวจเอกสารโครงการ

## 1. สรุปแนวทาง

1. ฟีเจอร์นี้ให้เจ้าหน้าที่คณะวิทยาศาสตร์ดูคิวเอกสารโครงการที่รอตรวจสอบและเปิดรายละเอียดของแต่ละฉบับตาม FR-VDC-01 และ FR-VDC-02
2. เจ้าหน้าที่ทุกคนใช้รายการ Checklist ส่วนกลางฉบับล่าสุดร่วมกัน เพิ่มหรือแก้ไขรายการได้ และผู้ตรวจทำเครื่องหมายเลือกรายการที่เกี่ยวข้องกับแต่ละโครงการตาม FR-VDC-03, FR-VDC-07 และ IF-CHK-02
3. การแก้ไขรายการ Checklist มีผลทันทีต่อเอกสารที่กำลังตรวจ โดยสถานะตรวจที่ผูกกับรายการเดิมคงอยู่ตราบใดที่รายการนั้นยังอยู่ ตาม ASM-03
4. เจ้าหน้าที่จะตรวจสอบเนื้อหาและรูปแบบเอกสารก่อนตัดสินใจอนุมัติหรือตีกลับตาม FR-VDC-04
5. เมื่ออนุมัติ ระบบจะส่งต่อให้อาจารย์ที่ปรึกษาและแจ้งกรรมการสโมสรแบบ synchronous ตาม FR-VDC-05, IF-UC05-01 และคำตอบ Q-03
6. เมื่อตีกลับ ระบบจะเปลี่ยนสถานะเอกสารและส่งเหตุผลกลับไปยังกรรมการสโมสรตาม FR-VDC-06 และ IF-UC01-01 โดยบังคับให้ยืนยันตัวตนก่อนเข้าถึงทุกหน้าจอและ API ตาม CON-NFR-21 และ NFR-SEC-01

## 2. เทคโนโลยีที่ใช้

| สิ่งที่เลือก | มาจาก | หมายเหตุ |
|---|---|---|
| React (Vite) สำหรับหน้าบ้าน | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สร้างคิวเอกสารรายละเอียดเอกสาร Checklist และฟอร์มอนุมัติ/ตีกลับตาม FR-VDC-01 ถึง FR-VDC-06 |
| Python FastAPI สำหรับหลังบ้าน | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้จัดการการอ่านคิว เอกสาร Checklist สถานะเอกสาร และการแจ้งผลตาม FR-VDC-01 ถึง FR-VDC-06 |
| ฐานข้อมูลเชิงสัมพันธ์ | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้เก็บเอกสาร สถานะ และเหตุผลการตีกลับตาม FR-VDC-05 และ FR-VDC-06 |
| ระบบยืนยันตัวตนจาก UC-09 | CON-NFR-21, NFR-SEC-01 | ใช้เป็นเงื่อนไขก่อนเข้าถึงหน้าและ API ของฟีเจอร์ตรวจเอกสารทุกครั้ง |
| Checklist ส่วนกลางและเวอร์ชันล่าสุด | IF-CHK-02, FR-VDC-03, FR-VDC-07 | เจ้าหน้าที่คณะทุกคนเพิ่ม/แก้รายการได้; ผู้ตรวจเลือกเฉพาะรายการที่ใช้กับแต่ละโครงการ; อ่านจากฉบับล่าสุดร่วมกัน |

## 3. โมเดลข้อมูล

| Entity | ฟิลด์หลัก | รองรับ |
|---|---|---|
| ProjectSubmission | submission_id, project_id, submitted_at, sender_user_id, status, review_queue_order | FR-VDC-01, FR-VDC-02, FR-VDC-05, FR-VDC-06 |
| ProjectDocument | project_id, project_name, project_owner, summary, document_url, created_at, current_status | FR-VDC-02, FR-VDC-05, FR-VDC-06 |
| ChecklistRule | checklist_rule_id, version, created_at, is_current | FR-VDC-03, FR-VDC-07, IF-CHK-02 |
| ChecklistItem | checklist_item_id (stable identity) | FR-VDC-03, FR-VDC-07 |
| ChecklistItemVersion | checklist_item_id, checklist_rule_id, item_name | FR-VDC-03, FR-VDC-07, IF-CHK-02 |
| ChecklistEvaluation | evaluation_id, submission_id, checklist_item_id, selected, result | FR-VDC-03, FR-VDC-04, FR-VDC-07, ASM-03 |
| ReviewDecision | decision_id, submission_id, reviewer_user_id, decision_type, reason_text, decided_at | FR-VDC-05, FR-VDC-06 |
| NotificationMessage | notification_id, target_user_id, target_case, message, sent_at | FR-VDC-05, FR-VDC-06, IF-UC05-01, IF-UC01-01 |
| AuthenticatedUser | user_id, login_status, role | CON-NFR-21, NFR-SEC-01 |

ข้อมูลที่ไม่ถูกระบุใน spec เช่น ตัวระบุเจ้าของเอกสารที่ตรงกับ role ของผู้ใช้ หรือช่องทางแจ้งเตือน (อีเมล/ระบบ) จะยังไม่เพิ่มฟิลด์ยืนยันจนกว่าจะได้รับคำตอบจากทีม; การแจ้งตาม Q-03 บันทึกใน mock integration แบบ synchronous โดยไม่อ้างว่าส่งออกนอกระบบ

## 4. API / หน้าจอ

| รายการ | Input / Output หลัก | รองรับ |
|---|---|---|
| `GET /review-queue` | Input: ผู้ใช้ที่ผ่าน Login; Output: รายการเอกสารรอตรวจ เรียงตามวันที่ส่งก่อน-หลัง | FR-VDC-01, AC-VDC-03 |
| `GET /submissions/{submission_id}` | Input: submission_id; Output: รายละเอียดโครงการและเอกสาร | FR-VDC-02, AC-VDC-04 |
| `GET /checklists/latest` | Input: ผู้ใช้ที่ผ่าน Login; Output: รายการ Checklist ส่วนกลางฉบับล่าสุด | FR-VDC-07, IF-CHK-02, AC-VDC-05 |
| `POST /checklists/items` | Input: item_name; Output: รายการ Checklist ใหม่ในฉบับล่าสุด | FR-VDC-07, AC-VDC-05 |
| `PATCH /checklists/items/{item_id}` | Input: item_name; Output: รายการที่แก้ไขในฉบับล่าสุด; ใช้ item_id เดิมเพื่อคงสถานะที่ผูกกับรายการเดิม | FR-VDC-07, ASM-03, AC-VDC-05 |
| `GET /submissions/{submission_id}/checklist` | Input: submission_id; Output: รายการส่วนกลางฉบับล่าสุด พร้อมรายการที่เลือกและผลครบ/ไม่ครบของโครงการ | FR-VDC-03, FR-VDC-07, AC-VDC-04, AC-VDC-05 |
| `PUT /submissions/{submission_id}/checklist` | Input: รายการ item_id ที่เลือกและผลตรวจ; Output: รายการที่เลือกและสถานะของโครงการ | FR-VDC-03, AC-VDC-04 |
| `POST /submissions/{submission_id}/review/approve` | Input: reviewer_user_id, submission_id; Output: บันทึกอนุมัติ, สถานะใหม่และการแจ้งกรรมการแบบ synchronous | FR-VDC-05, IF-UC05-01, AC-VDC-01, Q-03 |
| `POST /submissions/{submission_id}/review/reject` | Input: reviewer_user_id, submission_id, reason_text; Output: บันทึกตีกลับและส่งเหตุผลเพื่อแก้เฉพาะจุด | FR-VDC-06, IF-UC01-01, AC-VDC-02, Q-04 |
| หน้า “คิวเอกสารรอตรวจ” | Input: รายการเอกสาร; Output: การเรียงลำดับและตัวเลือกเอกสาร | FR-VDC-01, AC-VDC-03 |
| หน้า “รายละเอียดเอกสาร” | Input: project_id/submission_id; Output: ข้อมูลโครงการ รายการ Checklist ส่วนกลางที่ผู้ตรวจเลือก/แก้ไข และปุ่มอนุมัติ/ตีกลับ; เมนูหลักยังใช้เปลี่ยนไปหน้า Checklist กลางหรือคิวได้ | FR-VDC-02, FR-VDC-03, FR-VDC-04, FR-VDC-07 |
| หน้า “ยืนยันตีกลับ” | Input: reason_text; Output: สถานะ“ตีกลับให้แก้ไข” พร้อมเหตุผล | FR-VDC-06, AC-VDC-02 |
| ตรวจสิทธิ์ก่อนเข้าถึงลิสต์/API | Input: authentication token/session; Output: อนุญาตหรือปฏิเสธ | CON-NFR-21, NFR-SEC-01, AC-VDC-06 |

เมนูหลักของเจ้าหน้าที่คณะต้องเข้าถึงได้ทั้งจากคิวและหน้ารายละเอียด; เมื่อเลือก “Checklist กลาง” ให้ปิดรายละเอียดที่เลือกและแสดงหน้าจัดการ Checklist และเมื่อเลือก “คิวเอกสาร” ให้กลับไปคิว (FR-VDC-02, FR-VDC-07). Regression test อยู่ใน `frontend/src/__tests__/checklist-management.test.jsx`.

การแก้ไข Checklist ส่วนกลางสร้างฉบับล่าสุดใหม่ โดยแก้รายการเดิมด้วย item_id เดิม เมื่อผู้ตรวจเปิดงานที่กำลังตรวจ ระบบอ่านรายการล่าสุดทันที; สถานะตรวจที่อ้างถึง item_id เดิมยังคงอยู่ตราบใดที่รายการนั้นยังอยู่ ไม่มีการกำหนดรายการเอกสารตัวอย่างหรือชุดตายตัวไว้ในระบบ (FR-VDC-03, FR-VDC-07, ASM-01, ASM-03)

API สำหรับอ่าน/เพิ่ม/แก้ไข Checklist และบันทึกผลเลือกใช้ในโครงการต้องตรวจการยืนยันตัวตนก่อนเข้าถึงทุกครั้งตาม CON-NFR-21 และ NFR-SEC-01; การเพิ่ม/แก้ไข Checklist ให้ใช้ได้กับเจ้าหน้าที่คณะทุกคนตาม FR-VDC-07

## 5. ตารางตรวจ Constraints

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| CON-NFR-21 | ระบบยืนยันตัวตนก่อนเข้าถึงหน้าและ API ของฟีเจอร์; AuthenticatedUser | ใช้แล้ว |
| IF-CHK-02 | ChecklistRule/ChecklistItem แบบมีเวอร์ชัน, `GET /checklists/latest`, และการอ่านรายการล่าสุดในรายละเอียดเอกสาร | ใช้แล้ว |
| IF-UC05-01 | `POST /submissions/{submission_id}/review/approve` และ NotificationMessage | ใช้แล้ว |
| IF-UC01-01 | `POST /submissions/{submission_id}/review/reject` และ NotificationMessage | ใช้แล้ว |
| NFR-SEC-01 | ตรวจสิทธิ์ก่อนเข้าถึงคิวและรายละเอียดเอกสาร | ใช้แล้ว |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| AC-VDC-01 | `test_AC_VDC_01_approve_forwards_to_advisor` | สร้างเอกสารแล้วอนุมัติ ตรวจสถานะและ handoff ไป UC-05 พร้อมข้อความแจ้งกรรมการที่บันทึกแบบ synchronous ใน mock process; ไม่ได้ยืนยันการส่งออกนอกระบบ |
| AC-VDC-02 | `test_AC_VDC_02_reject_sends_reason_to_member`, `test_return_flow_after_rejection` | ตรวจสถานะตีกลับ เหตุผล และ `submission_id` เดิมที่ส่งกลับ UC-01 โดยข้อมูลเดิมไม่ถูกแทนที่; ยังไม่มีหน้าหรือ API ให้กรรมการแก้/ส่งข้อมูลเฉพาะจุดกลับเข้าระบบ |
| AC-VDC-03 | `test_AC_VDC_03_queue_sorted_by_submission_date`, `test_AC_VDC_03_queue_uses_submission_id_for_equal_submission_times` | ตรวจเรียงตามวันเวลาส่ง และเมื่อเวลาเท่ากันใช้ `submission_id` จากน้อยไปมาก |
| AC-VDC-04 | `test_AC_VDC_04_reviewer_selects_relevant_checklist_items` | เปิดรายละเอียดโครงการ เลือกทำเครื่องหมายรายการที่เกี่ยวข้อง แล้วตรวจว่าระบบแสดงเฉพาะรายการที่เลือกและสถานะครบ/ไม่ครบ โดยไม่บังคับชุดหรือชื่อเดียวกันทุกโครงการ |
| AC-VDC-05 | `test_AC_VDC_05_all_reviewers_see_same_latest_rule` | เจ้าหน้าที่คนหนึ่งเพิ่ม/แก้รายการส่วนกลาง จากนั้นเจ้าหน้าที่อีกคนและงานตรวจที่กำลังดำเนินอยู่เปิด Checklist ตรวจว่าทุกคนเห็นรายการล่าสุด และสถานะเดิมที่ผูกกับรายการเดิมยังอยู่ |
| AC-VDC-06 | `test_AC_VDC_06_unauthenticated_user_blocked` | เรียกหน้า/endpoint ที่ต้องใช้ Login โดยไม่มี session ตรวจว่าระบบปฏิเสธการเข้าถึง |

การทดสอบเพิ่มเติมสำหรับ Q-05: `test_latest_concurrent_review_decision_replaces_previous` ตรวจว่าคำตัดสิน/ข้อความที่เปิดเผยเป็นผลล่าสุด โดย lock ใช้เฉพาะภายใน process ของ prototype. Regression test การเปลี่ยนแท็บจากหน้ารายละเอียดไป Checklist กลางคือ `เปิด Checklist กลางได้จากหน้ารายละเอียดเอกสาร` ใน `frontend/src/__tests__/checklist-management.test.jsx`.

## 7. ลำดับงาน

1. กำหนดสัญญาข้อมูลสำหรับ ProjectSubmission, ProjectDocument และการตรวจสิทธิ์ก่อนเข้าฟีเจอร์ ตาม FR-VDC-01, FR-VDC-02, CON-NFR-21 และ NFR-SEC-01
2. สร้างหน้า “คิวเอกสารรอตรวจ” และการเรียงลำดับตามวันที่ส่งเข้าก่อน-หลัง ตาม FR-VDC-01 และ AC-VDC-03
3. สร้างหน้า “รายละเอียดเอกสาร” และ API ดึงรายละเอียดโครงการ ตาม FR-VDC-02 และ AC-VDC-04
4. สร้างโมเดลและบริการ Checklist ส่วนกลางแบบมีเวอร์ชัน ให้เจ้าหน้าที่ทุกคนอ่าน/เพิ่ม/แก้ไขรายการฉบับล่าสุดร่วมกัน ตาม FR-VDC-07 และ IF-CHK-02
5. เพิ่ม API และหน้าให้ผู้ตรวจเลือกทำเครื่องหมายรายการที่เกี่ยวข้องกับแต่ละโครงการ พร้อมเก็บสถานะครบ/ไม่ครบ ตาม FR-VDC-03
6. เพิ่มฟังก์ชันตรวจสอบเนื้อหาและรูปแบบเอกสารสำหรับเจ้าหน้าที่ ตาม FR-VDC-04
7. เพิ่มฟังก์ชันอนุมัติและส่งต่อเอกสารไปยัง UC-05 ตาม FR-VDC-05 และ IF-UC05-01
8. เพิ่มฟังก์ชันตีกลับพร้อมเหตุผลและแจ้งกรรมการสโมสรตาม FR-VDC-06 และ IF-UC01-01
9. ทดสอบตาม AC-VDC-01 ถึง AC-VDC-06 และตรวจสอบ traceability ของ FR / IF / NFR ทุกข้อ

## 8. สิ่งที่ยังไม่ทำ

- Q-01 และ Q-02 ได้รับคำตอบแล้วตาม `spec.md`; งาน Checklist ตาม FR-VDC-03, FR-VDC-07 และ IF-CHK-02 จึงวางแผนได้ตามข้อกำหนดฉบับล่าสุด
- Q-03 ถึง Q-06 ได้รับคำตอบแล้วตาม `spec.md`; การแจ้งทำแบบ synchronous, การตีกลับแก้เฉพาะจุดตามเหตุผล,
  คำตัดสินล่าสุดแทนที่คำตัดสินเดิม และคิวที่เวลาส่งเท่ากันเรียงตาม `submission_id` จากน้อยไปมาก
- ช่องทาง/ระบบปลายทางสำหรับ notification จริงยังไม่ระบุ; T-20 บันทึกการแจ้งใน mock integration แบบ synchronous เท่านั้น ไม่อ้างว่าส่งออกนอกระบบ
- T-22 ใช้ lock ภายใน process สำหรับ mock store; ยังไม่ประสานคำตัดสินข้ามหลาย process
- ข้อจำกัดการทำงานตามขอบเขตที่ทีมเลือกสำหรับ T-21: ระบบส่งเหตุผลและอ้าง `submission_id` เดิมกลับ UC-01 แต่ยังไม่มี flow ให้กรรมการแก้/ส่งเฉพาะจุดกลับเข้าระบบ จึงยังไม่ถือว่าพฤติกรรม Q-04 ครบตาม `spec.md`
