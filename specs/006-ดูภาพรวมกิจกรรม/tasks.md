# Tasks: ดูภาพรวมกิจกรรม

- Feature: ดูภาพรวมกิจกรรม (Activity Overview Dashboard)
- Spec ID: SPEC-DSH-006
- อ้างอิง: `specs/006-ดูภาพรวมกิจกรรม/plan.md`
- วันที่: 2569-10-01
- สรุป: มีทั้งหมด 13 tasks และมี 1 task ที่ต้องรอ Open Question
- งานที่ต้องรอ Open Question: T-13 รอคำตอบ Q-04 เรื่องเป้าหมาย performance ของหน้า Dashboard

## รายการ task

### T-01 กำหนดโมเดลข้อมูลและขอบเขตสโมสร
- รองรับ: DOM-SCOPE-01, FR-DSH-01, FR-DSH-02, FR-DSH-03
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-02, T-03 และ T-05
- ไฟล์ที่แตะ: `backend/app/models/dashboard.py`, `backend/app/repositories/dashboard.py`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: มีโมเดลกิจกรรม สถานะ เทอม กลุ่มทักษะ/ตัวชี้วัด และ query ที่กรองด้วย `club_id` ของอาจารย์ที่ปรึกษาได้
- สถานะ: พร้อมทำ

### T-02 สร้าง API จำนวนกิจกรรมแยกตามสถานะ
- รองรับ: FR-DSH-01, DOM-SCOPE-01
- ตรวจด้วย: AC-DSH-02
- ไฟล์ที่แตะ: `backend/app/api/dashboard.py`, `backend/app/schemas/dashboard.py`
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: `GET /dashboard/overview` รับ `semesterId` และคืนจำนวนกิจกรรมแยกตามสถานะเฉพาะสโมสรที่ผู้ใช้ดูแลได้
- สถานะ: พร้อมทำ

### T-03 สร้าง API ข้อมูลกราฟกลุ่มทักษะ
- รองรับ: FR-DSH-02, DOM-SCOPE-01
- ตรวจด้วย: AC-DSH-03
- ไฟล์ที่แตะ: `backend/app/api/dashboard.py`, `backend/app/schemas/dashboard.py`
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: `GET /dashboard/chart/skills` คืนจำนวนหรือสัดส่วนครบทุกกลุ่มทักษะ/ตัวชี้วัดที่มีข้อมูลของสโมสรที่อยู่ในขอบเขต
- สถานะ: พร้อมทำ

### T-04 บังคับตรวจสอบสิทธิ์ก่อนเข้า Dashboard
- รองรับ: CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: AC-DSH-04
- ไฟล์ที่แตะ: `backend/app/middleware/auth.py`, `backend/app/api/dashboard.py`, `frontend/src/App.jsx`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: request ที่ไม่มี `userSession` ถูกปฏิเสธทั้งที่ route/API Dashboard และผู้ใช้ที่ยืนยันตัวตนแล้วจึงเข้าถึงได้
- สถานะ: พร้อมทำ

### T-05 ทำ API สรุปข้อมูล Dashboard จากข้อมูลจริง
- รองรับ: FR-DSH-03, FR-DSH-01, FR-DSH-02
- ตรวจด้วย: AC-DSH-01
- ไฟล์ที่แตะ: `backend/app/api/dashboard.py`, `backend/app/repositories/dashboard.py`, `backend/app/schemas/dashboard.py`
- ต้องทำหลัง: T-02, T-03
- เสร็จเมื่อ: `GET /dashboard/summary` รวมจำนวนตามสถานะและข้อมูลกราฟจากข้อมูลกิจกรรมจริงของเทอมที่เลือก ณ เวลาที่เรียกใช้
- สถานะ: พร้อมทำ

### T-06 สร้างหน้าจอ Dashboard ด้วย API จำลอง
- รองรับ: FR-DSH-01, FR-DSH-02, ASM-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-08, T-09 และ T-10
- ไฟล์ที่แตะ: `frontend/src/pages/ActivityDashboard.jsx`, `frontend/src/api/dashboardMock.js`, `frontend/src/App.jsx`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: หน้าจอเลือกเทอมและแสดง KPI จำนวนตามสถานะ กราฟกลุ่มทักษะ/ตัวชี้วัด และสถานะไม่มีข้อมูลได้จาก mock API ตามสัญญาใน plan.md
- สถานะ: เสร็จ รอทีมตรวจ

### T-07 ต่อ route guard และหน้าจอกับ session จำลอง
- รองรับ: CON-NFR-21, NFR-SEC-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-11
- ไฟล์ที่แตะ: `frontend/src/App.jsx`, `frontend/src/pages/ActivityDashboard.jsx`, `frontend/src/api/dashboardMock.js`
- ต้องทำหลัง: T-04, T-06
- เสร็จเมื่อ: หน้าจอ Dashboard แสดงการปฏิเสธหรือเปลี่ยนเส้นทางเมื่อไม่มี session และแสดง Dashboard เมื่อมี session จำลอง
- สถานะ: พร้อมทำ

### T-08 ทดสอบจำนวนกิจกรรมตามสถานะ
- รองรับ: FR-DSH-01
- ตรวจด้วย: AC-DSH-02
- ไฟล์ที่แตะ: `backend/tests/test_AC_DSH_02_status_counts_are_correct.py`, `frontend/src/__tests__/dashboard-status.test.jsx`
- ต้องทำหลัง: T-02, T-06
- เสร็จเมื่อ: `test_AC_DSH_02_status_counts_are_correct` ผ่านด้วยข้อมูลหลายสถานะและผลแสดงแยกสถานะถูกต้อง
- สถานะ: พร้อมทำ

### T-09 ทดสอบกราฟครบทุกกลุ่มที่มีข้อมูล
- รองรับ: FR-DSH-02
- ตรวจด้วย: AC-DSH-03
- ไฟล์ที่แตะ: `backend/tests/test_AC_DSH_03_skill_chart_includes_all_groups_with_data.py`, `frontend/src/__tests__/dashboard-skills.test.jsx`
- ต้องทำหลัง: T-03, T-06
- เสร็จเมื่อ: `test_AC_DSH_03_skill_chart_includes_all_groups_with_data` ผ่านและยืนยันว่ากราฟแสดงทุกกลุ่มทักษะ/ตัวชี้วัดที่มีข้อมูล
- สถานะ: พร้อมทำ

### T-10 ทดสอบ Dashboard ตรงกับข้อมูลจริง
- รองรับ: FR-DSH-03, FR-DSH-01, FR-DSH-02
- ตรวจด้วย: AC-DSH-01
- ไฟล์ที่แตะ: `backend/tests/test_AC_DSH_01_dashboard_matches_real_data.py`, `frontend/src/__tests__/dashboard-summary.test.jsx`
- ต้องทำหลัง: T-05, T-06
- เสร็จเมื่อ: `test_AC_DSH_01_dashboard_matches_real_data` ผ่านและจำนวนกับกราฟตรงกับข้อมูลกิจกรรมจริงของเทอมที่เลือก
- สถานะ: พร้อมทำ

### T-11 ทดสอบการปฏิเสธผู้ใช้ที่ยังไม่เข้าสู่ระบบ
- รองรับ: NFR-SEC-01, CON-NFR-21
- ตรวจด้วย: AC-DSH-04
- ไฟล์ที่แตะ: `backend/tests/test_AC_DSH_04_unauthed_user_cannot_view_dashboard.py`, `frontend/src/__tests__/dashboard-auth.test.jsx`
- ต้องทำหลัง: T-04, T-07
- เสร็จเมื่อ: `test_AC_DSH_04_unauthed_user_cannot_view_dashboard` ผ่านและผู้ใช้ไม่มี session ไม่สามารถเห็นข้อมูล Dashboard ได้
- สถานะ: พร้อมทำ

### T-12 ต่อหน้าจอกับ API จริง
- รองรับ: FR-DSH-01, FR-DSH-02, FR-DSH-03, DOM-SCOPE-01
- ตรวจด้วย: AC-DSH-01, AC-DSH-02, AC-DSH-03
- ไฟล์ที่แตะ: `frontend/src/api/client.js`, `frontend/src/pages/ActivityDashboard.jsx`, `backend/app/api/dashboard.py`
- ต้องทำหลัง: T-05, T-08, T-09, T-10
- เสร็จเมื่อ: หน้าจอใช้ API จริงตามสัญญา `GET /dashboard/summary` และแสดงผลครบโดยไม่ใช้ mock ใน flow ปกติ
- สถานะ: พร้อมทำ

### T-13 กำหนดและทดสอบเป้าหมาย performance Dashboard
- รองรับ: FR-DSH-03
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานที่ต้องรอคำตอบ Q-04
- ไฟล์ที่แตะ: `backend/tests/test_dashboard_performance.py`, `specs/006-ดูภาพรวมกิจกรรม/plan.md`
- ต้องทำหลัง: T-05
- เสร็จเมื่อ: มีเป้าหมาย performance ที่ทีมอนุมัติแล้วและมี test ตรวจตามเป้าหมายนั้น
- สถานะ: รอ Q-04

## ตารางตรวจความครบ

### Acceptance Criteria

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-DSH-01 | T-10, T-12 |
| AC-DSH-02 | T-08, T-12 |
| AC-DSH-03 | T-09, T-12 |
| AC-DSH-04 | T-11 |

### Constraints

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-NFR-21 | T-04, T-07, T-11 |
| DOM-SCOPE-01 | T-01, T-02, T-03, T-05, T-12 |

## สิ่งที่ยังไม่ทำ

- Q-04 ไม่มีการระบุเวลาตอบสนอง (performance) ของหน้า Dashboard ไว้ในตาราง จึงควรกำหนดเป้าหมาย เช่น p95 กี่วินาที เพื่อให้ทดสอบได้จริง
  - task ที่รอ: T-13
