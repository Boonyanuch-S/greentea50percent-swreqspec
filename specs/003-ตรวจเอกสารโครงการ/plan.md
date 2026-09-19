# แผนการพัฒนา: ตรวจเอกสารโครงการ

## 1. สรุปแนวทาง

1. ฟีเจอร์นี้ให้เจ้าหน้าที่คณะวิทยาศาสตร์ดูคิวเอกสารโครงการที่รอตรวจสอบและเปิดรายละเอียดของแต่ละฉบับตาม FR-VDC-01 และ FR-VDC-02
2. ระบบจะประเมินเอกสารกับ Checklist กลางฉบับล่าสุดและแสดงผลว่ารายการใดครบ/ไม่ครบตาม FR-VDC-03 และ FR-VDC-07
3. เจ้าหน้าที่จะตรวจสอบเนื้อหาและรูปแบบเอกสารก่อนตัดสินใจอนุมัติหรือตีกลับตาม FR-VDC-04
4. เมื่ออนุมัติ ระบบจะส่งต่อให้อาจารย์ที่ปรึกษาและแจ้งกรรมการสโมสรตาม FR-VDC-05 และ IF-UC05-01
5. เมื่อตีกลับ ระบบจะเปลี่ยนสถานะเอกสารและส่งเหตุผลกลับไปยังกรรมการสโมสรตาม FR-VDC-06 และ IF-UC01-01 โดยบังคับให้ยืนยันตัวตนก่อนเข้าถึงทุกหน้าจอและ API ตาม CON-NFR-21 และ NFR-SEC-01

## 2. เทคโนโลยีที่ใช้

| สิ่งที่เลือก | มาจาก | หมายเหตุ |
|---|---|---|
| React (Vite) สำหรับหน้าบ้าน | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สร้างคิวเอกสารรายละเอียดเอกสาร Checklist และฟอร์มอนุมัติ/ตีกลับตาม FR-VDC-01 ถึง FR-VDC-06 |
| Python FastAPI สำหรับหลังบ้าน | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้จัดการการอ่านคิว เอกสาร Checklist สถานะเอกสาร และการแจ้งผลตาม FR-VDC-01 ถึง FR-VDC-06 |
| ฐานข้อมูลเชิงสัมพันธ์ | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้เก็บเอกสาร สถานะ และเหตุผลการตีกลับตาม FR-VDC-05 และ FR-VDC-06 |
| ระบบยืนยันตัวตนจาก UC-09 | CON-NFR-21, NFR-SEC-01 | ใช้เป็นเงื่อนไขก่อนเข้าถึงหน้าและ API ของฟีเจอร์ตรวจเอกสารทุกครั้ง |
| เกณฑ์ Checklist กลางฉบับล่าสุด | IF-CHK-02, FR-VDC-07 | เป็นแหล่งข้อมูลกลางที่ทุกเจ้าหน้าที่ใช้ร่วมกัน ไม่อนุญาตให้ใช้เวอร์ชันแยกต่างหาก |

## 3. โมเดลข้อมูล

| Entity | ฟิลด์หลัก | รองรับ |
|---|---|---|
| ProjectSubmission | submission_id, project_id, submitted_at, sender_user_id, status, review_queue_order | FR-VDC-01, FR-VDC-02, FR-VDC-05, FR-VDC-06 |
| ProjectDocument | project_id, project_name, project_owner, summary, document_url, created_at, current_status | FR-VDC-02, FR-VDC-05, FR-VDC-06 |
| ChecklistRule | checklist_rule_id, version, effective_date, rule_name, description | FR-VDC-03, FR-VDC-07, IF-CHK-02 |
| ChecklistItem | checklist_item_id, checklist_rule_id, item_code, item_name, required_flag, status | FR-VDC-03, FR-VDC-04, FR-VDC-07 |
| ChecklistEvaluation | evaluation_id, submission_id, checklist_rule_id, checklist_item_id, result, notes | FR-VDC-03, FR-VDC-04, FR-VDC-07 |
| ReviewDecision | decision_id, submission_id, reviewer_user_id, decision_type, reason_text, decided_at | FR-VDC-05, FR-VDC-06 |
| NotificationMessage | notification_id, target_user_id, target_case, message, sent_at, channel_type | FR-VDC-05, FR-VDC-06, IF-UC05-01, IF-UC01-01 |
| AuthenticatedUser | user_id, login_status, role | CON-NFR-21, NFR-SEC-01 |

ข้อมูลที่ไม่ถูกระบุใน spec เช่น ตัวระบุเจ้าของเอกสารที่ตรงกับ role ของผู้ใช้ หรือชนิดช่องทางแจ้งเตือน (อีเมล/ระบบ) จะยังไม่เพิ่มฟิลด์ยืนยันจนกว่าจะได้รับคำตอบจาก Open Questions ที่เกี่ยวข้อง

## 4. API / หน้าจอ

| รายการ | Input / Output หลัก | รองรับ |
|---|---|---|
| `GET /review-queue` | Input: ผู้ใช้ที่ผ่าน Login; Output: รายการเอกสารรอตรวจ เรียงตามวันที่ส่งก่อน-หลัง | FR-VDC-01, AC-VDC-03 |
| `GET /submissions/{submission_id}` | Input: submission_id; Output: รายละเอียดโครงการและเอกสาร | FR-VDC-02, AC-VDC-04 |
| `GET /submissions/{submission_id}/checklist` | Input: submission_id; Output: Checklist ถอดจากเกณฑ์กลางฉบับล่าสุด พร้อมสถานะครบ/ไม่ครบ | FR-VDC-03, FR-VDC-07, AC-VDC-04, AC-VDC-05 |
| `POST /submissions/{submission_id}/review/approve` | Input: reviewer_user_id, submission_id; Output: บันทึกอนุมัติ, สถานะใหม่และการแจ้งเตือน | FR-VDC-05, IF-UC05-01, AC-VDC-01 |
| `POST /submissions/{submission_id}/review/reject` | Input: reviewer_user_id, submission_id, reason_text; Output: บันทึกตีกลับและการแจ้งเหตุผล | FR-VDC-06, IF-UC01-01, AC-VDC-02 |
| หน้า “คิวเอกสารรอตรวจ” | Input: รายการเอกสาร; Output: การเรียงลำดับและตัวเลือกเอกสาร | FR-VDC-01, AC-VDC-03 |
| หน้า “รายละเอียดเอกสาร” | Input: project_id/submission_id; Output: ข้อมูลโครงการ Checklist และปุ่มอนุมัติ/ตีกลับ | FR-VDC-02, FR-VDC-03, FR-VDC-04 |
| หน้า “ยืนยันตีกลับ” | Input: reason_text; Output: สถานะ“ตีกลับให้แก้ไข” พร้อมเหตุผล | FR-VDC-06, AC-VDC-02 |
| ตรวจสิทธิ์ก่อนเข้าถึงลิสต์/API | Input: authentication token/session; Output: อนุญาตหรือปฏิเสธ | CON-NFR-21, NFR-SEC-01, AC-VDC-06 |

## 5. ตารางตรวจ Constraints

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| CON-NFR-21 | ระบบยืนยันตัวตนก่อนเข้าถึงหน้าและ API ของฟีเจอร์; AuthenticatedUser | ใช้แล้ว |
| IF-CHK-02 | ChecklistRule, `GET /submissions/{submission_id}/checklist`, และข้อความในข้อสรุปแนวทาง | ใช้แล้ว |
| IF-UC05-01 | `POST /submissions/{submission_id}/review/approve` และ NotificationMessage | ใช้แล้ว |
| IF-UC01-01 | `POST /submissions/{submission_id}/review/reject` และ NotificationMessage | ใช้แล้ว |
| NFR-SEC-01 | ตรวจสิทธิ์ก่อนเข้าถึงคิวและรายละเอียดเอกสาร | ใช้แล้ว |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| AC-VDC-01 | `test_AC_VDC_01_approve_forwards_to_advisor` | สร้างเอกสารที่ผ่าน Checklist แล้วกดอนุมัติ ตรวจว่าระบบเปลี่ยนสถานะเป็น “ส่งต่ออาจารย์” และมีการแจ้งกรรมการสโมสรว่าอนุมัติแล้ว |
| AC-VDC-02 | `test_AC_VDC_02_reject_sends_reason_to_member` | สร้างเอกสารที่ไม่ผ่าน Checklist แล้วกดตีกลับพร้อมเหตุผล ตรวจว่าระบบเปลี่ยนสถานะเป็น “ตีกลับให้แก้ไข” และส่งเหตุผลไปยังกรรมการสโมสร |
| AC-VDC-03 | `test_AC_VDC_03_queue_sorted_by_submission_date` | เตรียมเอกสารหลายฉบับที่ส่งเข้ามาในช่วงเวลาต่างกัน แล้วเปิดคิว ตรวจว่ารายการเรียงตามวันที่ส่งเข้าก่อน-หลัง |
| AC-VDC-04 | `test_AC_VDC_04_checklist_matches_latest_rule` | เปิดรายละเอียดเอกสารหนึ่งฉบับ แล้วตรวจสอบกับเกณฑ์กลางฉบับล่าสุด ตรวจว่าระบบแสดงรายการครบ/ไม่ครบตาม checklist ที่ถูกเลือก |
| AC-VDC-05 | `test_AC_VDC_05_all_reviewers_see_same_latest_rule` | จำลองการเปิดเอกสารของเจ้าหน้าที่สองคนในเวลาใกล้เคียงกัน ตรวจว่าทั้งสองเห็น checklist เดียวกันตามเวอร์ชันกลางล่าสุด |
| AC-VDC-06 | `test_AC_VDC_06_unauthenticated_user_blocked` | เรียกหน้า/endpoint ที่ต้องใช้ Login โดยไม่มี session ตรวจว่าระบบปฏิเสธการเข้าถึง |

## 7. ลำดับงาน

1. กำหนดสัญญาข้อมูลสำหรับ ProjectSubmission, ProjectDocument และการตรวจสิทธิ์ก่อนเข้าฟีเจอร์ ตาม FR-VDC-01, FR-VDC-02, CON-NFR-21 และ NFR-SEC-01
2. สร้างหน้า “คิวเอกสารรอตรวจ” และการเรียงลำดับตามวันที่ส่งเข้าก่อน-หลัง ตาม FR-VDC-01 และ AC-VDC-03
3. สร้างหน้า “รายละเอียดเอกสาร” และ API ดึงรายละเอียดโครงการ ตาม FR-VDC-02 และ AC-VDC-04
4. สร้างโมเดล ChecklistRule และ ChecklistItem พร้อมการประเมินผลตามเกณฑ์กลางฉบับล่าสุด ตาม FR-VDC-03, FR-VDC-07 และ IF-CHK-02
5. เพิ่มฟังก์ชันตรวจสอบเนื้อหาและรูปแบบเอกสารสำหรับเจ้าหน้าที่ ตาม FR-VDC-04
6. เพิ่มฟังก์ชันอนุมัติและส่งต่อเอกสารไปยัง UC-05 ตาม FR-VDC-05 และ IF-UC05-01
7. เพิ่มฟังก์ชันตีกลับพร้อมเหตุผลและแจ้งกรรมการสโมสรตาม FR-VDC-06 และ IF-UC01-01
8. ทดสอบตาม AC-VDC-01 ถึง AC-VDC-06 และตรวจสอบ traceability ของ FR / IF / NFR ทุกข้อ

## 8. สิ่งที่ยังไม่ทำ

- Q-01 เกณฑ์ Checklist กลาง ถูกกำหนด/ปรับปรุงโดยใคร และผ่าน use case ใด (ยังไม่ระบุในตาราง เช่นเดียวกับ UC-01, UC-02 ก่อนหน้านี้) — ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
- Q-02 ข้อความ Exception Flow 5a ในภาพต้นฉบับไม่สมบูรณ์/อ่านไม่ชัด -> ขอภาพที่ชัดกว่านี้เพื่อยืนยันเนื้อหาที่ถูกต้อง — ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
- Q-03 การแจ้งกรรมการสโมสรเมื่ออนุมัติ (AC-VDC-01) เป็นการแจ้งแบบ synchronous หรือ asynchronous (เทียบกับรูปแบบ IF-NOT-01 ในสเปกอื่น) ยังไม่ระบุในตาราง — ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
- Q-04 การตีกลับ (Alternative Flow 4a) ส่งเอกสารกลับไปที่ UC-01 ทั้งฉบับ หรือกรรมการแก้ไขเฉพาะจุด ที่ระบุเหตุผลได้เลยโดยไม่ต้องกรอกใหม่ทั้งหมด? — ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
- Q-05 หากเจ้าหน้าที่หลายคนเปิดตรวจเอกสารฉบับเดียวกันพร้อมกัน (มาจากคิวเดียวกัน) ระบบป้องกันการอนุมัติ/ตีกลับซ้ำซ้อนกันอย่างไร? — ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
