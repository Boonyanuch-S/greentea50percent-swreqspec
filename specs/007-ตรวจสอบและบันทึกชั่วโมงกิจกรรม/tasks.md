# Tasks: ตรวจสอบและบันทึกชั่วโมงกิจกรรม

- Feature: ตรวจสอบและบันทึกชั่วโมงกิจกรรม
- Spec ID: SPEC-HRS-007
- อ้างอิง: [plan.md](plan.md)
- วันที่: 2569-10-31

สรุป: มี 6 เฟส รวม 24 tasks โดยเรียงเฟสตาม AC และการพึ่งพา; Q-03/Q-05 ปิดแล้วตามคำยืนยันของทีม
เฟส 2 (T-08), เฟส 3 (T-16), เฟส 4 (T-17) และ T-09 ผ่านการตรวจรับแล้ว; T-10 ผ่านการตรวจรับก่อนเริ่มเฟส 5

## เฟส 0: ฐานราก (AC-HRS-08, AC-HRS-09)

### T-01 สร้างโมเดลเอกสารและรายการชั่วโมง
- รองรับ: FR-HRS-01, FR-HRS-02, FR-HRS-03, FR-HRS-04, FR-HRS-06, IF-XLS-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-05, T-07 และ T-10
- ไฟล์ที่แตะ: `backend/app/models/activity_hours.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: มีโมเดล ActivityHourDocument และ ActivityParticipantHour รองรับฟิลด์ตาม plan.md
- สถานะ: เสร็จ

### T-02 ตรวจสิทธิ์เจ้าหน้าที่ก่อนเข้าถึงข้อมูล
- รองรับ: CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: AC-HRS-08
- ไฟล์ที่แตะ: `backend/auth/activity_hours_guard.py`, `backend/tests/test_AC_HRS_08_unauthenticated_user_is_denied.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: `test_AC_HRS_08_unauthenticated_user_is_denied` ผ่านและคำขอที่ไม่มี userSession ถูกปฏิเสธ
- สถานะ: เสร็จ

### T-03 บันทึก audit log การเข้าถึงข้อมูลนักศึกษา
- รองรับ: DOM-PDPA-01, NFR-SEC-02
- ตรวจด้วย: AC-HRS-09
- ไฟล์ที่แตะ: `backend/app/models/student_access_log.py`, `backend/app/audit/student_access_log.py`, `backend/tests/test_AC_HRS_09_student_access_is_logged.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: `test_AC_HRS_09_student_access_is_logged` ผ่านและ log มี accessor_id, accessed_at และ access_item
- สถานะ: เสร็จ

#### จุดตรวจเฟส 0
- test ที่ต้องผ่านทั้งหมด: `test_AC_HRS_08_unauthenticated_user_is_denied`, `test_AC_HRS_09_student_access_is_logged`; backend `PYTHONPATH=. pytest -q backend/tests` และ frontend `cd frontend && npm test`
- เปิดระบบ: หลังบ้าน `cd backend && PYTHONPATH=. uvicorn app.main:app --reload`; หน้าจอ `cd frontend && npm run dev`
- คนลองเองตาม AC-HRS-08 และ AC-HRS-09:
  Given ยังไม่ได้เข้าสู่ระบบ
  When พยายามเปิดคิวตรวจสอบ และเมื่อเปิดข้อมูลรายชื่อหรือชั่วโมงนักศึกษา
  Then ระบบปฏิเสธคำขอที่ยังไม่ยืนยันตัวตน และบันทึกผู้เข้าถึง เวลา และรายการที่เข้าถึงเมื่อเข้าถึงข้อมูลได้
- ยังขาด: ไม่มี

## เฟส 1: เปิดคิวเอกสารรอตรวจ (AC-HRS-03)

### T-05 สร้าง API คิวเอกสารรอตรวจ
- รองรับ: FR-HRS-01, CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: AC-HRS-03
- ไฟล์ที่แตะ: `backend/app/api/activity_hours.py`, `backend/app/main.py`, `backend/tests/test_AC_HRS_03_pending_documents_sorted_by_submitted_at.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01 และ T-02
- เสร็จเมื่อ: `test_AC_HRS_03_pending_documents_sorted_by_submitted_at` ผ่านและ API เรียงเอกสารตาม submitted_at ก่อน-หลัง
- สถานะ: เสร็จ

### T-06 สร้างหน้าคิวเอกสารด้วย API จำลอง
- รองรับ: FR-HRS-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-18
- ไฟล์ที่แตะ: `frontend/src/pages/ActivityHoursQueue.jsx`, `frontend/src/services/activityHoursMock.js`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: หน้าคิวแสดงเอกสารรอตรวจจาก API จำลองและเรียงตามวันที่ส่งได้
- สถานะ: เสร็จ

#### จุดตรวจเฟส 1
- test ที่ต้องผ่านทั้งหมด: `test_AC_HRS_03_pending_documents_sorted_by_submitted_at`, backend `PYTHONPATH=. pytest -q backend/tests` และ frontend `cd frontend && npm test`
- เปิดระบบ: หลังบ้าน `cd backend && PYTHONPATH=. uvicorn app.main:app --reload`; หน้าจอ `cd frontend && npm run dev`
- คนลองเองตาม AC-HRS-03:
  Given มีเอกสารใบสรุปชั่วโมงกิจกรรมหลายฉบับรอตรวจ
  When เจ้าหน้าที่เปิดคิวเอกสารรอตรวจสอบ
  Then ระบบแสดงลิสต์เอกสารเรียงตามวันที่ส่งก่อน-หลัง
- ยังขาด: การเชื่อมหน้าจอกับ API จริงอยู่ใน T-20 ในเฟส 5

## เฟส 2: แสดงรายชื่อและประเภทชั่วโมงจาก Excel (AC-HRS-04)

### T-04 สร้างตัวอ่านไฟล์ Excel
- รองรับ: IF-XLS-01, FR-HRS-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-07
- ไฟล์ที่แตะ: `backend/importers/activity_hours_excel.py`, `backend/tests/test_activity_hours_excel_reader.py`, `backend/requirements.txt`, `specs/007-ตรวจสอบและบันทึกชั่วโมงกิจกรรม/tasks.md`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: ตัวอ่านแปลงรายชื่อผู้เข้าร่วมและประเภทชั่วโมงจากไฟล์ Excel เป็น ActivityParticipantHour ได้
- สมมติฐาน/การตัดสินใจ: schema ของ workbook ยังไม่ยืนยันกับเจ้าของไฟล์; reader รับชื่อ worksheet, แถวหัวตาราง และชื่อคอลัมน์ผ่าน config ที่ผู้เรียกส่งให้ เพื่อไม่ hardcode schema และต้องยืนยันรูปแบบจริงก่อนเชื่อมต่อ T-07
- Dependency: เพิ่ม `openpyxl` ใน `backend/requirements.txt` เพราะ dependency ที่มีใน repository ไม่มีตัวอ่าน `.xlsx` ที่ยืนยันได้
- สถานะ: เสร็จ

### T-07 สร้าง API แสดงรายการจาก Excel
- รองรับ: FR-HRS-02, IF-XLS-01, CON-NFR-21
- ตรวจด้วย: AC-HRS-04
- ไฟล์ที่แตะ: `backend/app/api/activity_hours.py`, `backend/app/services/activity_hours_reader.py`, `backend/tests/test_AC_HRS_04_display_all_excel_participants_and_hour_types.py`, `specs/007-ตรวจสอบและบันทึกชั่วโมงกิจกรรม/tasks.md`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-02 และ T-04
- เสร็จเมื่อ: `test_AC_HRS_04_display_all_excel_participants_and_hour_types` ผ่านและ API ส่งรายชื่อกับประเภทชั่วโมงครบทุกรายการ
- สมมติฐาน/การตัดสินใจ: ค่า worksheet, แถว header และชื่อหัวคอลัมน์เป็น placeholder ผ่าน dependency จนกว่าเจ้าของไฟล์จะยืนยัน; `source_file_reference` ใช้เป็น relative reference ภายใน upload directory ที่ระบบกำหนดผ่าน app state และตรวจ path ก่อนเปิด โดย resolver ฉีดผ่าน dependency; ต้องยืนยัน schema และกลไกจัดเก็บจริงกับเจ้าของระบบไฟล์ก่อนใช้งานจริง
- สถานะ: เสร็จ

### T-08 สร้างหน้าจอแสดงรายชื่อและประเภทชั่วโมง
- รองรับ: FR-HRS-02
- ตรวจด้วย: AC-HRS-04
- ไฟล์ที่แตะ: `frontend/src/pages/ActivityHoursReview.jsx`, `frontend/src/services/activityHoursMock.js`, `frontend/src/__tests__/activity-hours-review.test.jsx`, `frontend/src/App.jsx`, `frontend/src/__tests__/activity-hours-review-navigation.test.jsx`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-06
- เสร็จเมื่อ: `test_AC_HRS_04_display_all_excel_participants_and_hour_types` ผ่านและเจ้าหน้าที่กองกิจเปิดหน้าจอรายชื่อกับประเภทชั่วโมงจากเมนูได้
- ขอบเขต: แสดงรายชื่อและประเภทชั่วโมงเท่านั้น; การแสดงผลตรวจและรายการผิดอยู่ใน T-11
- สถานะ: เสร็จ

#### จุดตรวจเฟส 2
- test ที่ต้องผ่านทั้งหมด: `backend/tests/test_activity_hours_excel_reader.py`, `test_AC_HRS_04_display_all_excel_participants_and_hour_types` ของ backend และ frontend, backend `PYTHONPATH=. pytest -q backend/tests` และ frontend `cd frontend && npm test`
- เปิดระบบ: หลังบ้าน `cd backend && PYTHONPATH=. uvicorn app.main:app --reload`; หน้าจอ `cd frontend && npm run dev`
- คนลองเองตาม AC-HRS-04:
  Given API จำลองส่งรายชื่อผู้เข้าร่วมของกิจกรรมพร้อมประเภทชั่วโมงครบทุกแถว
  When เจ้าหน้าที่เปิดหน้ารายละเอียดกิจกรรม
  Then หน้าจอแสดงรายชื่อผู้เข้าร่วมพร้อมประเภทชั่วโมงที่แจ้งไว้ครบทุกรายการ
- ยังขาด: หน้านี้ใช้ข้อมูลจำลองสำหรับ preview; การเลือก/อ่านไฟล์จริงและการเชื่อม API อยู่ใน T-20; เจ้าของไฟล์ยังต้องยืนยัน schema และกลไกจัดเก็บตามหมายเหตุใน T-07

## เฟส 3: ดูสรุปข้อมูลรายบุคคลระหว่างตรวจสอบ (AC-HRS-07)

### T-16 เรียก UC-04 และกลับสู่ขั้นตรวจสอบ
- รองรับ: FR-HRS-08
- ตรวจด้วย: AC-HRS-07
- ไฟล์ที่แตะ: `backend/app/integrations/uc04_summary_client.py`, `backend/app/api/activity_hours.py`, `backend/tests/test_AC_HRS_07_open_individual_summary_and_return.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-02 และ T-07
- เสร็จเมื่อ: `test_AC_HRS_07_open_individual_summary_and_return` ผ่าน โดยแสดงผลสรุปจาก UC-04 แล้วกลับไปขั้นตรวจสอบเกณฑ์
- สมมติฐาน/การตัดสินใจ: ใช้ provider จำลองที่ฉีดผ่าน app state และส่ง payload กลับโดยไม่กำหนด protocol หรือ schema ของ UC-04 จริง; ผู้เรียก API รับผลแล้วกลับไปยังขั้นตรวจสอบ
- สถานะ: เสร็จ

#### จุดตรวจเฟส 3
- test ที่ต้องผ่านทั้งหมด: `test_AC_HRS_07_open_individual_summary_and_return`, backend `PYTHONPATH=. pytest -q backend/tests` และ frontend `cd frontend && npm test`
- เปิดระบบ: หลังบ้าน `cd backend && PYTHONPATH=. uvicorn app.main:app --reload`; หน้าจอ `cd frontend && npm run dev`
- คนลองเองตาม AC-HRS-07:
  Given เจ้าหน้าที่ต้องการดูสรุปข้อมูลรายบุคคลของผู้เข้าร่วมก่อนตัดสินใจ
  When เจ้าหน้าที่เลือกดูสรุปข้อมูล (เรียก UC-04)
  Then ระบบแสดงสรุปข้อมูลรายบุคคลที่เลือก แล้วกลับไปยังขั้นตรวจสอบเกณฑ์ (ขั้นที่ 4)
- ยังขาด: ไม่มี; ใช้ provider จำลองตามขอบเขตที่ทีมยืนยัน โดยไม่กำหนด protocol/schema ของ UC-04 จริง

## เฟส 4: บันทึก audit log ของทุกการเข้าถึงข้อมูลนักศึกษา (AC-HRS-09)

### T-17 บันทึกการตรวจสอบลง audit log
- รองรับ: DOM-PDPA-01, NFR-SEC-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-19
- ไฟล์ที่แตะ: `backend/app/audit/activity_hours_access.py`, `backend/app/api/activity_hours.py`, `backend/tests/test_AC_HRS_09_student_access_is_logged.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-03, T-05 และ T-07
- เสร็จเมื่อ: endpoint ที่อ่านข้อมูลนักศึกษาส่ง access context ให้ StudentAccessLog ครบทุกครั้ง
- สถานะ: เสร็จ

#### จุดตรวจเฟส 4
- test ที่ต้องผ่านทั้งหมด: `test_AC_HRS_09_student_access_is_logged`, backend `PYTHONPATH=. pytest -q backend/tests` และ frontend `cd frontend && npm test`
- เปิดระบบ: หลังบ้าน `cd backend && PYTHONPATH=. uvicorn app.main:app --reload`; หน้าจอ `cd frontend && npm run dev`
- คนลองเองตาม AC-HRS-09:
  Given มีการเปิดดูข้อมูลรายชื่อหรือชั่วโมงของนักศึกษา
  When การเข้าถึงเสร็จสิ้น
  Then มี log ที่ระบุผู้เข้าถึง เวลา และรายการที่เข้าถึง
- ยังขาด: ไม่มี

## เฟส 5: ตรวจสอบเกณฑ์และบันทึกชั่วโมง (AC-HRS-01, AC-HRS-02, AC-HRS-05, AC-HRS-06)

Q-03/Q-05 ปิดแล้วตามคำยืนยันของทีม; เริ่มงานเฟสนี้ได้หลังทีมตรวจรับจุดตรวจเฟส 4.

### T-09 สร้างโมเดลเกณฑ์ประเภทชั่วโมง
- รองรับ: FR-HRS-03, ASM-01, ASM-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-10
- ไฟล์ที่แตะ: `backend/app/models/hour_criteria.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: มีโมเดล HourCriteria รองรับ academic_year, hour_type, criteria_definition และ active_status โดยไม่เพิ่มกติกาเกณฑ์
- สถานะ: เสร็จ

### T-10 ตรวจประเภทชั่วโมงเทียบเกณฑ์
- รองรับ: FR-HRS-03, FR-HRS-06, ASM-03
- ตรวจด้วย: AC-HRS-02
- ไฟล์ที่แตะ: `backend/app/models/activity.py`, `backend/app/services/hour_validation.py`, `backend/app/api/activity_hours.py`, `backend/tests/test_AC_HRS_02_return_document_and_mark_invalid_items.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01, T-04 และ T-09
- เสร็จเมื่อ: ใช้ `Activity.academic_year` ของกิจกรรมที่เอกสารอ้างถึงค้นหาเกณฑ์ปีเดียวกัน; `test_AC_HRS_02_return_document_and_mark_invalid_items` ผ่าน โดยทำเครื่องหมายรายการผิด คืนทั้งเอกสาร และไม่บันทึกชั่วโมง; กรณีไม่มีปี/เกณฑ์ active ต้องแจ้ง error และคงข้อมูลเดิม
- สถานะ: เสร็จ

### T-11 แสดงผลการตรวจและรายการผิดบนหน้าจอ
- รองรับ: FR-HRS-03, FR-HRS-06, ASM-03
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-18
- ไฟล์ที่แตะ: `frontend/src/pages/ActivityHoursReview.jsx`, `frontend/src/services/activityHoursMock.js`, `frontend/src/__tests__/activity-hours-review.test.jsx`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-08 และ T-10
- เสร็จเมื่อ: เจ้าหน้าที่เห็นผลตรวจและรายการที่ไม่ตรงเกณฑ์พร้อมสถานะคืนเอกสารในหน้าจอจำลอง
- สถานะ: เสร็จ

### T-12 สร้างสัญญาการส่งข้อมูลไป REG
- รองรับ: IF-REG-01, FR-HRS-04
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-13 และ T-14
- ไฟล์ที่แตะ: `backend/app/integrations/reg_client.py`, `backend/app/models/reg_submission.py`, `backend/tests/test_reg_client_contract.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-01 และ T-02
- เสร็จเมื่อ: client และ RegSubmission รองรับข้อมูลส่ง ผลตอบกลับ error เวลาพยายามล่าสุด และจำนวนครั้งที่พยายามตาม plan.md
- สถานะ: เสร็จ

### T-13 บันทึกชั่วโมงสำเร็จและเปลี่ยนสถานะ
- รองรับ: FR-HRS-04, IF-REG-01
- ตรวจด้วย: AC-HRS-01
- ไฟล์ที่แตะ: `backend/app/services/activity_hours_approval.py`, `backend/app/api/activity_hours.py`, `backend/tests/test_AC_HRS_01_approve_matching_hours.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-09, T-10 และ T-12
- เสร็จเมื่อ: `test_AC_HRS_01_approve_matching_hours` ผ่านและข้อมูลถูกส่ง REG พร้อมสถานะ "บันทึกชั่วโมงสำเร็จ"
- สถานะ: เสร็จ

### T-14 จัดการ REG ไม่ตอบสนองและการส่งซ้ำ
- รองรับ: FR-HRS-07, IF-REG-01
- ตรวจด้วย: AC-HRS-06
- ไฟล์ที่แตะ: `backend/app/services/reg_retry.py`, `backend/app/api/activity_hours.py`, `backend/app/integrations/reg_client.py`, `backend/app/config.py`, `backend/tests/test_AC_HRS_06_reg_timeout_retry_and_failure_alert.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-12 และ T-13
- เสร็จเมื่อ: `test_AC_HRS_06_reg_timeout_retry_and_failure_alert` ผ่าน โดยใช้ timeout 5 วินาที ส่งซ้ำด้วยตนเองได้ 1 ครั้ง ไม่มี auto-retry และแจ้งเตือนเมื่อส่งซ้ำไม่สำเร็จ
- สถานะ: เสร็จ

### T-15 เรียก UC-10 หลังบันทึก REG สำเร็จ
- รองรับ: FR-HRS-05
- ตรวจด้วย: AC-HRS-05
- ไฟล์ที่แตะ: `backend/app/integrations/uc10_notification_client.py`, `backend/app/api/activity_hours.py`, `backend/tests/test_AC_HRS_05_notify_club_after_reg_success.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-13
- เสร็จเมื่อ: `test_AC_HRS_05_notify_club_after_reg_success` ผ่านและมีการเรียก UC-10 หลังสถานะเป็น "บันทึกชั่วโมงสำเร็จ"
- สถานะ: เสร็จ

### T-18 เชื่อมหน้าจอคิวและตรวจสอบกับ API จำลอง
- รองรับ: FR-HRS-01, FR-HRS-02, FR-HRS-03, FR-HRS-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-20
- ไฟล์ที่แตะ: `frontend/src/pages/ActivityHoursQueue.jsx`, `frontend/src/pages/ActivityHoursReview.jsx`, `frontend/src/services/activityHoursMock.js`, `frontend/src/App.jsx`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-06, T-08 และ T-11
- เสร็จเมื่อ: workflow คิวและตรวจสอบทำงานครบด้วย API จำลองโดยไม่ต้องรอ API จริง
- สถานะ: เสร็จ

### T-19 กำหนดเกณฑ์ performance การส่ง REG
- รองรับ: NFR-PERF-01, IF-REG-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-14 และ T-21
- ไฟล์ที่แตะ: `backend/app/config.py`, `backend/tests/test_reg_performance.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-12
- เสร็จเมื่อ: มีค่า timeout 5 วินาทีใน config และ test ตรวจเกณฑ์ NFR-PERF-01 ตาม Q-03
- สถานะ: เสร็จ

### T-20 เชื่อมหน้าจอกับ API จริง
- รองรับ: FR-HRS-01, FR-HRS-02, FR-HRS-03, FR-HRS-04, FR-HRS-05, FR-HRS-06, FR-HRS-07, FR-HRS-08, CON-NFR-21, DOM-PDPA-01, IF-REG-01, IF-XLS-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-21 ถึง T-24
- ไฟล์ที่แตะ: `frontend/src/services/activityHoursClient.js`, `frontend/src/pages/ActivityHoursQueue.jsx`, `frontend/src/pages/ActivityHoursReview.jsx`, `frontend/src/App.jsx`, `frontend/src/__tests__/activity-hours-review-navigation.test.jsx`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-05, T-07, T-10, T-13, T-14, T-15, T-16, T-17 และ T-18
- เสร็จเมื่อ: หน้าคิวและหน้าตรวจสอบทำงานกับ API จริงครบตามสัญญา และยังคงตรวจสิทธิ์กับ audit log ได้
- สถานะ: เสร็จ

### T-21 ทดสอบคิวและการอ่านไฟล์
- รองรับ: FR-HRS-01, FR-HRS-02, IF-XLS-01
- ตรวจด้วย: AC-HRS-03 และ AC-HRS-04
- ไฟล์ที่แตะ: `backend/tests/test_AC_HRS_03_pending_documents_sorted_by_submitted_at.py`, `backend/tests/test_AC_HRS_04_display_all_excel_participants_and_hour_types.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-05, T-07 และ T-20
- เสร็จเมื่อ: tests ของ AC-HRS-03 และ AC-HRS-04 ผ่านและยืนยันลำดับคิวกับรายการ Excel ครบถ้วน
- สถานะ: เสร็จ

### T-22 ทดสอบ approval, validation และ REG
- รองรับ: FR-HRS-03, FR-HRS-04, FR-HRS-06, FR-HRS-07, IF-REG-01
- ตรวจด้วย: AC-HRS-01, AC-HRS-02 และ AC-HRS-06
- ไฟล์ที่แตะ: `backend/tests/test_AC_HRS_01_approve_matching_hours.py`, `backend/tests/test_AC_HRS_02_return_document_and_mark_invalid_items.py`, `backend/tests/test_AC_HRS_06_reg_timeout_retry_and_failure_alert.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-10, T-13, T-14 และ T-20
- เสร็จเมื่อ: tests ของ AC-HRS-01, AC-HRS-02 และ AC-HRS-06 ผ่านตามเกณฑ์ที่ทีมยืนยัน
- สถานะ: เสร็จ

### T-23 ทดสอบการแจ้งเตือนและ UC-04
- รองรับ: FR-HRS-05, FR-HRS-08
- ตรวจด้วย: AC-HRS-05 และ AC-HRS-07
- ไฟล์ที่แตะ: `backend/tests/test_AC_HRS_05_notify_club_after_reg_success.py`, `backend/tests/test_AC_HRS_07_open_individual_summary_and_return.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-15, T-16 และ T-20
- เสร็จเมื่อ: tests ของ AC-HRS-05 และ AC-HRS-07 ผ่านและยืนยันลำดับการเรียก UC-10 กับการกลับจาก UC-04
- สถานะ: เสร็จ

### T-24 ทดสอบสิทธิ์และ audit log
- รองรับ: CON-NFR-21, DOM-PDPA-01, NFR-SEC-01, NFR-SEC-02
- ตรวจด้วย: AC-HRS-08 และ AC-HRS-09
- ไฟล์ที่แตะ: `backend/tests/test_AC_HRS_08_unauthenticated_user_is_denied.py`, `backend/tests/test_AC_HRS_09_student_access_is_logged.py`
- แบบหน้าจอ: ไม่มี
- ต้องทำหลัง: T-02, T-03, T-17 และ T-20
- เสร็จเมื่อ: tests ของ AC-HRS-08 และ AC-HRS-09 ผ่านตามข้อกำหนดสิทธิ์และ audit log ที่ทีมยืนยัน
- สถานะ: เสร็จ

## ตารางตรวจความครบ: Acceptance Criteria

| AC ID | task ที่ตรวจ AC นี้ | เฟส |
|---|---|---|
| AC-HRS-01 | T-13, T-22 | 5 |
| AC-HRS-02 | T-10, T-22 | 5 |
| AC-HRS-03 | T-05, T-21 | 1, 5 |
| AC-HRS-04 | T-07, T-08, T-21 | 2, 5 |
| AC-HRS-05 | T-15, T-23 | 5 |
| AC-HRS-06 | T-14, T-22 | 5 |
| AC-HRS-07 | T-16, T-23 | 3, 5 |
| AC-HRS-08 | T-02, T-24 | 0, 5 |
| AC-HRS-09 | T-03, T-17, T-24 | 0, 4, 5 |

## ตารางตรวจความครบ: Constraints

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-NFR-21 | T-02, T-05, T-07, T-20, T-24 |
| DOM-PDPA-01 | T-03, T-17, T-20, T-24 |
| IF-REG-01 | T-12, T-13, T-14, T-19, T-20, T-22 |
| IF-XLS-01 | T-04, T-07, T-21, T-20 |

## ตารางตรวจความครบ: FR

| FR ID | AC ที่ตรวจ FR นี้ | เฟส |
|---|---|---|
| FR-HRS-01 | AC-HRS-03 | 1, 5 |
| FR-HRS-02 | AC-HRS-04 | 2, 5 |
| FR-HRS-03 | AC-HRS-01, AC-HRS-02 | 5 |
| FR-HRS-04 | AC-HRS-01 | 5 |
| FR-HRS-05 | AC-HRS-05 | 5 |
| FR-HRS-06 | AC-HRS-02 | 5 |
| FR-HRS-07 | AC-HRS-06 | 5 |
| FR-HRS-08 | AC-HRS-07 | 3, 5 |

## สิ่งที่ยังไม่ทำ

- Q-01 ปิดแล้ว: ภาพต้นฉบับยืนยัน flow เรียก UC-11 เมื่อยื่นล่าช้า; UC-11 อยู่นอก scope ของ UC-07 จึงไม่มี FR/AC เพิ่ม
- Q-02 ปิดแล้ว: audit log เป็นข้อกำหนดเฉพาะ UC-07 — ไม่มีการอ้างเป็น NFR หลัก
- Q-03 ปิดแล้ว: REG ต้องตอบ success ภายใน 5 วินาที; เจ้าหน้าที่ส่งซ้ำด้วยตนเองได้ 1 ครั้ง ไม่มี auto-retry
- Q-05 ปิดแล้ว: ใช้ตารางเกณฑ์เดิมที่กองการนักศึกษาดูแล; UC-07 อ่านอย่างเดียว
- เฟส 5 ยังเริ่มไม่ได้จนกว่าทีมจะตรวจรับ T-17 ที่จุดตรวจเฟส 4
- Q-06 ปิดแล้ว: คง FR-HRS-06 และปรับ Goal ให้ระบุการคืนเอกสารก่อนบันทึก — ไม่มีงานรอ Q-06

หมายเหตุ: spec.md ไม่มี Q-04 จึงไม่มีการสร้าง task หรืออ้างอิง Q-04 เพิ่ม
