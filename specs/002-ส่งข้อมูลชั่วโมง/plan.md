# แผนการพัฒนา: ส่งข้อมูลชั่วโมง

## 1. สรุปแนวทาง

1. ฟีเจอร์นี้ให้กรรมการสโมสรส่งไฟล์สรุปชั่วโมงของกิจกรรมที่มีสถานะ "จบแล้ว" ตาม FR-SBH-01 และ AC-SBH-03
2. ระบบจะดึงข้อมูลผู้เข้าร่วม/Staff และประเภทชั่วโมงระดับกิจกรรมจากข้อมูลกิจกรรม แล้วสร้าง Excel ตามเทมเพลตที่กำหนดใน config ตาม FR-SBH-02, FR-SBH-03 และ IF-TPL-01
3. กรรมการจะตรวจสอบข้อมูลในไฟล์ก่อนกดยืนยันส่ง และระบบจะปฏิเสธเมื่อข้อมูลไม่ครบ/เลขสรุปโครงการยังไม่พร้อม ตาม FR-SBH-04, FR-SBH-06 และ AC-SBH-01 ถึง AC-SBH-02
4. เมื่อส่งสำเร็จ ระบบจะบันทึกไฟล์ลงคิวของเจ้าหน้าที่กองกิจ และเชื่อมต่อกับ UC-07 ตาม FR-SBH-05 และ IF-UC07-01
5. ระบบจะตรวจสิทธิ์ Login ก่อนเข้าถึงทุกส่วนของฟีเจอร์ และยึดตาม NFR-SEC-01 พร้อมรักษาความชัดเจนของข้อมูลเลขสรุปโครงการและ template config ตาม ASM-01 ถึง ASM-05

## 2. เทคโนโลยีที่ใช้

| สิ่งที่เลือก | มาจาก | หมายเหตุ |
|---|---|---|
| React (Vite) สำหรับหน้าบ้าน | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สร้างหน้าถึงสถานะกิจกรรม, หน้า preview Excel, และหน้าคอนเฟิร์ม template/เลขสรุปโครงการ |
| Python FastAPI สำหรับหลังบ้าน | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้จัดการข้อมูลกิจกรรม, สร้าง Excel, ตรวจสถานะเลขสรุปโครงการ และส่งคิว UC-07 |
| ฐานข้อมูลเชิงสัมพันธ์ | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้เก็บข้อมูลกิจกรรม, ผู้เข้าร่วม, ชนิดชั่วโมงระดับกิจกรรม, สถานะเลขสรุปโครงการ และคิวส่งไฟล์ |
| File storage / blob storage | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้เก็บไฟล์ Excel ที่สร้างขึ้นและ template ที่กองกิจอัปโหลดผ่านแอดมิน |
| Login / auth guard | CON-NFR-21, NFR-SEC-01 | บังคับใช้ทุกหน้าและทุก API ของฟีเจอร์นี้ |
| Config template registry | IF-TPL-01 | จัดเก็บ template ID/เวอร์ชัน และเปิดให้กองกิจจัดการผ่านแอดมิน |

## 3. โมเดลข้อมูล

| Entity | ฟิลด์หลัก | รองรับ |
|---|---|---|
| Activity | activity_id, activity_name, status, end_date, project_number_status, category_template_id | FR-SBH-01, FR-SBH-02, FR-SBH-06, ASM-05 |
| ActivityParticipant | participant_id, activity_id, user_id, role_type | FR-SBH-02 |
| ActivityStaff | staff_id, activity_id, user_id, role_type | FR-SBH-02 |
| ActivityHourType | hour_type_id, activity_id, name, code | FR-SBH-02, ASM-05 |
| SubmissionTemplateConfig | template_id, version, active_flag, uploaded_by, uploaded_at | FR-SBH-03, IF-TPL-01, ASM-04 |
| ProjectNumberStatus | project_number_id, activity_id, status, updated_at | FR-SBH-06, IF-PRJNUM-01 |
| HoursSubmission | submission_id, activity_id, generated_file_ref, created_by, submitted_at, status | FR-SBH-04, FR-SBH-05, AC-SBH-01 |
| ReviewQueueEntry | queue_entry_id, submission_id, reviewer_group, queue_status | FR-SBH-05, IF-UC07-01 |
| AuthSession | user_id, auth_status | CON-NFR-21, NFR-SEC-01 |

หมายเหตุ: ไม่เก็บประเภทชั่วโมงแบบรายบุคคลตามคำตอบ ASM-05; ประเภทชั่วโมงจะผูกที่ระดับกิจกรรมเท่านั้น และไม่เพิ่มฟิลด์ที่ระบุข้อมูลเปล่า/ข้อมูลที่ไม่ใช่ spec

## 4. API / หน้าจอ

| รายการ | Input / Output หลัก | รองรับ |
|---|---|---|
| `GET /activities/{activityId}/hours-submission` | Input: activityId, auth context; Output: สถานะกิจกรรม, template ที่ใช้, สถานะเลขสรุปโครงการ | FR-SBH-01, FR-SBH-06, IF-PRJNUM-01 |
| `GET /activities/{activityId}/participants` | Input: activityId; Output: รายชื่อผู้เข้าร่วมและ Staff | FR-SBH-02 |
| `GET /activities/{activityId}/hour-types` | Input: activityId; Output: ประเภทชั่วโมงระดับกิจกรรม | FR-SBH-02, ASM-05 |
| `POST /hours-submissions/preview` | Input: activityId, template_id, participant data; Output: preview Excel / รายการข้อมูลที่สร้างจากไฟล์ | FR-SBH-03, FR-SBH-04 |
| `POST /hours-submissions/submit` | Input: activityId, template_id, generated_file_ref; Output: ส่งสำเร็จ/ปฏิเสธพร้อมข้อความ | FR-SBH-05, FR-SBH-06, AC-SBH-01, AC-SBH-02 |
| `GET /config/templates` | Input: auth context; Output: template list และ version ที่พร้อมใช้งาน | IF-TPL-01, ASM-04 |
| `GET /project-number/status/{activityId}` | Input: activityId; Output: status ของเลขสรุปโครงการ | IF-PRJNUM-01, FR-SBH-06 |
| `POST /review-queue/submit` | Input: submission_id; Output: queue_id/สถานะคิว | FR-SBH-05, IF-UC07-01 |
| หน้าส่งชั่วโมง | Input: เลือกกิจกรรมที่จบแล้ว; Output: preview + ปุ่มยืนยันส่ง | FR-SBH-01, FR-SBH-03, FR-SBH-04 |
| หน้าแอดมินจัดการ template | Input: template file + version; Output: template_id ที่พร้อมใช้งาน | IF-TPL-01, ASM-04 |

## 5. ตารางตรวจ Constraints

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| CON-NFR-21 | Login guard ในทุกการเข้าถึงหน้าและ API ของฟีเจอร์ | ใช้แล้ว |
| IF-TPL-01 | SubmissionTemplateConfig, `GET /config/templates`, หน้าแอดมินจัดการ template และ flow Preview/Submit | ใช้แล้ว |
| IF-PRJNUM-01 | `GET /project-number/status/{activityId}` และ `POST /hours-submissions/submit` | ใช้แล้ว |
| IF-UC07-01 | `POST /review-queue/submit` และ ReviewQueueEntry | ใช้แล้ว |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| AC-SBH-01 | `test_AC_SBH_01_submit_success` | ตั้งสภาพเลขสรุปโครงการพร้อมและตรวจสอบไฟล์เรียบร้อย แล้วกดยืนยันส่ง ตรวจว่าคิว UC-07 สร้างสำเร็จและไฟล์ถูกบันทึก |
| AC-SBH-02 | `test_AC_SBH_02_block_when_project_number_missing` | ตั้งสภาพเลขสรุปโครงการยังไม่พร้อม แล้วเปิดหน้า/กดยืนยันส่ง ตรวจว่าระบบแสดง "ขอเลขสรุปจากกองกิจ" และไม่อนุญาตส่ง |
| AC-SBH-03 | `test_AC_SBH_03_only_finished_activity_allowed` | มีกิจกรรมที่จบแล้วและไม่จบปะปนกัน แล้วเข้าหน้าส่งชั่วโมง ตรวจว่าเปิดได้เฉพาะกิจกรรมที่สถานะเป็น "จบแล้ว" |
| AC-SBH-04 | `test_AC_SBH_04_generate_excel_from_activity_data` | เปิดกิจกรรมที่จบแล้ว แล้วประมวลผลข้อมูล ตรวจว่าดึงรายชื่อผู้เข้าร่วม/Staff ตามประเภทชั่วโมงระดับกิจกรรม และสร้าง Excel ตาม template config |
| AC-SBH-05 | `test_AC_SBH_05_show_exception_link_when_deadline_exceeded` | ตั้งเงื่อนไขเกินกำหนดส่งของกองกิจ ตรวจว่าระบบเสนอทางเลือกไปที่ UC-11 |
| AC-SBH-06 | `test_AC_SBH_06_reject_unauthenticated_access` | เรียกหน้า/API โดยไม่มี Login ตรวจว่าระบบปฏิเสธการเข้าถึง |

## 7. ลำดับงาน

1. กำหนดโครงสร้างข้อมูลกิจกรรม ผู้เข้าร่วม Staff และประเภทชั่วโมงระดับกิจกรรม ตาม FR-SBH-01, FR-SBH-02 และ ASM-05
2. สร้างหน้าและ API สำหรับตรวจสิทธิ์ Login และการเปิดหน้า “ส่งข้อมูลชั่วโมง” เฉพาะกิจกรรมที่จบแล้ว ตาม CON-NFR-21, NFR-SEC-01 และ FR-SBH-01
3. เพิ่มการตรวจสถานะเลขสรุปโครงการจาก UC-04 และแสดงสถานะ “ขอเลขสรุปจากกองกิจ” เมื่อยังไม่พร้อม ตาม FR-SBH-06 และ IF-PRJNUM-01
4. สร้างระบบ template registry / config และเชื่อมกับการสร้าง Excel ตาม FR-SBH-03 และ IF-TPL-01
5. เพิ่ม preview Excel พร้อมตรวจความครบถ้วนของข้อมูลก่อนยืนยันส่ง ตาม FR-SBH-04
6. เพิ่ม workflow การยืนยันส่งและส่งเข้าคิว UC-07 ตาม FR-SBH-05 และ IF-UC07-01
7. เพิ่มเมนู/ลิงก์ UC-11 สำหรับกรณีเกินกำหนดเวลาส่งตาม FR-SBH-07
8. ทดสอบตาม AC-SBH-01 ถึง AC-SBH-06 และตรวจ checklist traceability ของ FR/IF/NFR จนครบ

## 8. สิ่งที่ยังไม่ทำ

- Q-01 Exception 2a ระบุว่าเป็น "จุด bottleneck ที่มีความเสี่ยงสูง" - ต้องการมาตรการเพิ่มเติม (เช่น แจ้งเตือนกองกิจให้ออกเลขเร็วขึ้น) นอกเหนือจากการบล็อกหน้าจอหรือไม่? — ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
- Q-02 หากกรรมการตรวจสอบไฟล์ (ขั้นที่ 4) แล้วพบข้อมูลผิด (เช่น รายชื่อ/ประเภทชั่วโมงไม่ถูกต้อง) มีช่องทางแก้ไขก่อนส่งหรือไม่ หรือต้องย้อนกลับไปแก้จากต้นทาง (ระบบรายชื่อผู้เข้าร่วม/Staff)? — ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
- Q-03 ขั้นที่ 5 ของ Main Flow ("ระบบส่ง/แสดงเอกสารของเจ้าหน้าที่กองกิจ") หมายถึงส่งเข้าคิว UC-07 ทันที หลังกรรมการยืนยัน หรือมีขั้นตอนยืนยันเพิ่มเติมอีกขั้นหนึ่งหรือไม่? — ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
