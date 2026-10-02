# Tasks: ส่งอีเมลแจ้งเตือน

- Feature: ส่งอีเมลแจ้งเตือน (Send Email Notification)
- Spec ID: SPEC-NOTI-010
- อ้างอิง: `specs/010-ส่งอีเมลแจ้งเตือน/plan.md`
- วันที่: 2569-10-01
- สถานะ spec: Draft v1 (ทีมยืนยันให้แตก tasks ต่อ)
- สรุป: มีทั้งหมด 11 tasks และมี 8 tasks ที่ต้องรอ Open Questions
- งานที่ต้องรอ Open Questions: T-03 รอ Q-04, T-04 รอ Q-03, T-05 รอ Q-04, T-06 รอ Q-03/Q-04, T-07 รอ Q-01/Q-03/Q-04, T-08 รอ Q-02/Q-03/Q-04, T-09 รอ Q-01/Q-03/Q-04 และ T-10 รอ Q-03

## รายการ task

### T-01 กำหนด schema คำขอแจ้งเตือนภายใน
- รองรับ: FR-NOTI-01, IF-CALL-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-03 และ T-06
- ไฟล์ที่แตะ: `backend/app/schemas/notifications.py`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: schema รับประเภทเหตุการณ์ ผู้รับ ข้อมูลสำหรับ template และรหัสเหตุการณ์ต้นทางตามสัญญา API ใน plan.md ได้
- สถานะ: พร้อมทำ

### T-02 สร้างข้อมูลบันทึกความพยายามส่ง
- รองรับ: FR-NOTI-04
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-06 และ T-11
- ไฟล์ที่แตะ: `backend/app/models/email_delivery_attempt.py`, `backend/app/services/delivery_log.py`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: มีโครงสร้างและตัวบันทึกผลที่รองรับรหัสคำขอ ลำดับ เวลาเริ่ม/สิ้นสุด ผลการส่ง และรายละเอียดข้อผิดพลาดตาม plan.md
- สถานะ: เสร็จ รอทีมตรวจ

### T-03 สร้าง internal API รับคำขอแจ้งเตือน
- รองรับ: FR-NOTI-01, IF-CALL-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-06
- ไฟล์ที่แตะ: `backend/app/api/notifications.py`, `backend/app/schemas/notifications.py`
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: `POST /internal/notifications/email` รับคำขอจาก use case ต้นทางและคืนรหัสคำขอกับสถานะรับคำขอตาม contract ที่ทีมยืนยัน
- สถานะ: รอ Q-04

### T-04 สร้างตัวเลือกและ render template ตามเหตุการณ์
- รองรับ: FR-NOTI-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-06 และ T-10
- ไฟล์ที่แตะ: `backend/app/models/event_email_template.py`, `backend/app/services/template_renderer.py`
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: เนื้อหาอีเมลถูก render จาก template ที่จับคู่กับประเภทเหตุการณ์และตัวแปรที่ทีมยืนยันไว้
- สถานะ: รอ Q-03

### T-05 สร้าง adapter ส่งอีเมลภายนอก
- รองรับ: FR-NOTI-03, IF-EMAIL-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-06 และ T-08
- ไฟล์ที่แตะ: `backend/app/services/email_sender.py`
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: adapter ส่งผู้รับและเนื้อหาอีเมลไปยังบริการภายนอกตาม provider และ contract ที่ทีมยืนยัน โดยไม่เพิ่มช่องทางแจ้งเตือนอื่น
- สถานะ: รอ Q-04

### T-06 ประกอบ flow รับคำขอ render ส่ง และบันทึกผล
- รองรับ: FR-NOTI-01, FR-NOTI-02, FR-NOTI-03, FR-NOTI-04, IF-CALL-01, IF-EMAIL-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-08, T-09 และ T-10
- ไฟล์ที่แตะ: `backend/app/api/notifications.py`, `backend/app/services/notification_service.py`, `backend/app/services/delivery_log.py`
- ต้องทำหลัง: T-02, T-03, T-04, T-05
- เสร็จเมื่อ: คำขอภายในถูกแปลงเป็นเนื้อหาตาม template ส่งผ่าน adapter และบันทึกผลการพยายามส่งตาม contract ที่ยืนยันแล้ว
- สถานะ: รอ Q-03, Q-04

### T-07 เข้าคิวและลองส่งซ้ำตามนโยบาย
- รองรับ: FR-NOTI-05, NFR-REL-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-09
- ไฟล์ที่แตะ: `backend/app/models/notification_retry_queue_item.py`, `backend/app/workers/notification_retry.py`
- ต้องทำหลัง: T-06
- เสร็จเมื่อ: ความพยายามส่งที่ล้มเหลวถูกเข้าคิวและ worker ลองส่งซ้ำตามจำนวนครั้งกับช่วงเวลาที่ทีมกำหนด โดยไม่เลือกผลิตภัณฑ์หรือค่าซ้ำแทนทีม
- สถานะ: รอ Q-01, Q-03, Q-04

### T-08 ทดสอบการส่งอีเมลภายใน SLA
- รองรับ: FR-NOTI-03, IF-EMAIL-01
- ตรวจด้วย: AC-NOTI-01
- ไฟล์ที่แตะ: `backend/tests/test_AC_NOTI_01_send_email_within_required_time.py`
- ต้องทำหลัง: T-03, T-05, T-06
- เสร็จเมื่อ: `test_AC_NOTI_01_send_email_within_required_time` ผ่านโดยใช้ email provider stub และตรวจเวลาตาม SLA ที่ทีมกำหนด
- สถานะ: รอ Q-02, Q-03, Q-04

### T-09 ทดสอบ retry โดยไม่ทำให้เหตุการณ์ต้นทางล้มเหลว
- รองรับ: FR-NOTI-05, NFR-REL-01
- ตรวจด้วย: AC-NOTI-02
- ไฟล์ที่แตะ: `backend/tests/test_AC_NOTI_02_retry_without_failing_source_event.py`
- ต้องทำหลัง: T-06, T-07
- เสร็จเมื่อ: `test_AC_NOTI_02_retry_without_failing_source_event` ผ่านเมื่อ provider stub ล้มเหลวชั่วคราว คำขอเข้าคิวส่งซ้ำ และผลของเหตุการณ์ต้นทางไม่ล้มเหลว
- สถานะ: รอ Q-01, Q-03, Q-04

### T-10 ทดสอบการ render template ตามประเภทเหตุการณ์
- รองรับ: FR-NOTI-02
- ตรวจด้วย: AC-NOTI-03
- ไฟล์ที่แตะ: `backend/tests/test_AC_NOTI_03_render_event_template.py`
- ต้องทำหลัง: T-04, T-06
- เสร็จเมื่อ: `test_AC_NOTI_03_render_event_template` ผ่านโดยยืนยันว่าเนื้อหาและตัวแปรตรงกับ template ของเหตุการณ์ที่ทีมกำหนด
- สถานะ: รอ Q-03

### T-11 ทดสอบการบันทึกผลทุกความพยายามส่ง
- รองรับ: FR-NOTI-04
- ตรวจด้วย: AC-NOTI-04
- ไฟล์ที่แตะ: `backend/tests/test_AC_NOTI_04_log_every_delivery_attempt.py`
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: `test_AC_NOTI_04_log_every_delivery_attempt` ผ่านโดยตรวจว่ามี log ทั้งกรณีส่งสำเร็จและไม่สำเร็จ
- สถานะ: พร้อมทำ

## ตารางตรวจความครบ

### Acceptance Criteria

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-NOTI-01 | T-08 |
| AC-NOTI-02 | T-09 |
| AC-NOTI-03 | T-10 |
| AC-NOTI-04 | T-11 |

### Constraints

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| IF-EMAIL-01 | T-05, T-06, T-08 |
| IF-CALL-01 | T-01, T-03, T-06 |
| NFR-REL-01 | T-07, T-09 |

## สิ่งที่ยังไม่ทำ

- Q-01 "ตามที่กำหนดไว้ใน Infrastructure Requirements" (NFR-REL) หมายถึงเอกสารข้อกำหนดชุดใด และมีตัวเลขจำนวนครั้ง/ช่วงเวลาส่งซ้ำเท่าไร? ไม่มีรายละเอียดอยู่ในตารางนี้
  - task ที่รอ: T-07, T-09
- Q-02 "เวลาที่กำหนด" ใน AC-NOTI-01 (อีเมลต้องถูกส่งถึงผู้รับภายในเวลาที่กำหนด) ไม่มีตัวเลขระบุ -> ต้องการ SLA ที่ชัดเจน (เช่น กี่นาที) เพื่อให้ทดสอบได้จริง
  - task ที่รอ: T-08
- Q-03 Trigger ในตารางระบุว่ามี "10 กรณีที่กำหนดไว้" แต่ในตารางให้ตัวอย่างเพียง 2 กรณี (UC-05 อนุมัติเสร็จ, UC-07 บันทึกชั่วโมงสำเร็จ) -> ต้องการรายการครบทั้ง 10 กรณี พร้อม template ของแต่ละกรณี เพื่อออกแบบ FR-NOTI-02 ให้ครบถ้วน
  - task ที่รอ: T-04, T-06, T-10
- Q-04 ขอภาพต้นฉบับที่ชัดกว่านี้ของแถว Stakeholder & Interest เพื่อยืนยันถ้อยคำที่แน่นอน
  - task ที่รอ: T-03, T-05, T-06, T-08, T-09
