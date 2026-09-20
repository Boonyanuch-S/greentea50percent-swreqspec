# แผนการพัฒนา: ดูภาพรวมกิจกรรม

## 1. สรุปแนวทาง

1. ฟีเจอร์นี้ให้ อาจารย์ที่ปรึกษาสโมสรคณะวิทยาศาสตร์ ดูภาพรวมกิจกรรมของสโมสรที่ตนดูแลผ่านหน้า Dashboard ตาม FR-DSH-01 และ DOM-SCOPE-01
2. ระบบจะแสดงจำนวนกิจกรรมแยกตามสถานะและกราฟสัดส่วนตามกลุ่มทักษะ/ตัวชี้วัด ตาม FR-DSH-01 และ FR-DSH-02
3. ข้อมูลที่แสดงต้องสะท้อนข้อมูลจริงในระบบ ณ เวลาที่เปิดดู ตาม FR-DSH-03 และ ASM-02
4. การเข้าถึงหน้า Dashboard จะถูกบังคับผ่านการยืนยันตัวตนก่อนทุกครั้ง ตาม CON-NFR-21 และ NFR-SEC-01
5. แหล่งข้อมูลกลุ่มทักษะ/ตัวชี้วัดจะอ้างอิงจากเอกสารทางการที่ระบุในลิงก์ใน ASM-03 และจะไม่สร้างชุดข้อมูลใหม่แยกจากระบบหลัก

## 2. เทคโนโลยีที่ใช้

| สิ่งที่เลือก | มาจาก | หมายเหตุ |
|---|---|---|
| React (Vite) สำหรับหน้าบ้าน | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สร้างหน้า Dashboard แสดงสถิติและกราฟตาม FR-DSH-01 ถึง FR-DSH-03 |
| Python FastAPI สำหรับหลังบ้าน | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้จัดการ API ดึงข้อมูลสถิติและข้อมูลกราฟตาม FR-DSH-01 ถึง FR-DSH-03 |
| ฐานข้อมูลเชิงสัมพันธ์ | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้เก็บข้อมูลกิจกรรม สถานะ กลุ่มทักษะ/ตัวชี้วัด และ snapshot สถิติสำหรับแสดง Dashboard |
| ระบบยืนยันตัวตนของ UC-09 | CON-NFR-21, NFR-SEC-01 | ใช้เป็น gate ก่อนให้เข้าถึงหน้า Dashboard และ API ที่เกี่ยวข้อง |

## 3. โมเดลข้อมูล

| Entity | ฟิลด์หลัก | รองรับ |
|---|---|---|
| ClubProfile | club_id, club_name, advisor_user_id, school_name | DOM-SCOPE-01, ASM-01 |
| Semester | semester_id, academic_year, term_name, start_date, end_date | ASM-02 |
| ActivityRecord | activity_id, club_id, semester_id, title, status, created_at, approved_at, skill_group_id | FR-DSH-01, FR-DSH-03 |
| ActivityStatus | status_code, label, description | FR-DSH-01 |
| SkillGroupMetric | skill_group_id, name, definition_source_url, description | FR-DSH-02, ASM-03 |
| ActivityMetricSnapshot | snapshot_id, club_id, semester_id, status_code, metric_count, captured_at | FR-DSH-01, FR-DSH-03 |
| DashboardChartData | chart_id, club_id, semester_id, skill_group_id, activity_count, captured_at | FR-DSH-02, FR-DSH-03 |

หมายเหตุ:
- ข้อมูลที่เก็บจะจำกัดเฉพาะข้อมูลที่เกี่ยวกับกิจกรรมและตัวชี้วัดของสโมสรคณะวิทยาศาสตร์ ตาม DOM-SCOPE-01
- จะไม่มีการเก็บข้อมูลที่ไม่เกี่ยวข้องกับ Dashboard เช่นข้อมูลส่วนตัวนักศึกษาหรือเอกสารภายนอกที่ไม่ได้ระบุใน FR เพื่อหลีกเลี่ยงการเกิน Scope

## 4. API / หน้าจอ

| รายการ | Input / Output หลัก | รองรับ |
|---|---|---|
| `GET /dashboard/overview` | Input: semesterId, userSession; Output: จำนวนกิจกรรมแยกตามสถานะ | FR-DSH-01, NFR-SEC-01 |
| `GET /dashboard/chart/skills` | Input: semesterId, userSession; Output: กราฟสัดส่วนตามกลุ่มทักษะ/ตัวชี้วัด | FR-DSH-02, NFR-SEC-01 |
| `GET /dashboard/summary` | Input: semesterId, userSession; Output: ข้อมูลรวมสรุป Dashboard สำหรับหน้าแรก | FR-DSH-01, FR-DSH-02, FR-DSH-03 |
| หน้า Dashboard หลัก | Input: เลือกเทอมที่ต้องการดู, sessionUser; Output: KPI cards + chart + empty state | FR-DSH-01, FR-DSH-02, ASM-02 |
| Middleware ตรวจสิทธิ์ Dashboard | Input: userSession; Output: อนุญาต/ปฏิเสธ | CON-NFR-21, NFR-SEC-01 |

## 5. ตารางตรวจ Constraints

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| CON-NFR-21 | Middleware ตรวจสิทธิ์ Dashboard และ route guard หน้า Dashboard | ใช้แล้ว |
| DOM-SCOPE-01 | ClubProfile, query filter ของ Dashboard, และกรณีดึง ActivityRecord โดย club_id ของอาจารย์ที่ดูแล | ใช้แล้ว |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| AC-DSH-01 | `test_AC_DSH_01_dashboard_matches_real_data` | เตรียมข้อมูลกิจกรรมจริงในเทอมที่เลือกแล้วเปิดหน้า Dashboard ตรวจว่าจำนวนกิจกรรมและกราฟสัดส่วนตรงกับข้อมูลระบบ |
| AC-DSH-02 | `test_AC_DSH_02_status_counts_are_correct` | สร้างกิจกรรมหลายสถานะปะปนกัน แล้วเปิด Dashboard ตรวจว่าระบบแสดงจำนวนแยกตามสถานะถูกต้อง |
| AC-DSH-03 | `test_AC_DSH_03_skill_chart_includes_all_groups_with_data` | สร้างข้อมูลในหลายกลุ่มทักษะ/ตัวชี้วัด แล้วเปิด Dashboard ตรวจว่ากราฟแสดงทุกกลุ่มที่มีข้อมูล |
| AC-DSH-04 | `test_AC_DSH_04_unauthed_user_cannot_view_dashboard` | พยายามเข้าถึงหน้า Dashboard โดยไม่มี session แล้วตรวจว่าระบบปฏิเสธการเข้าถึง |

## 7. ลำดับงาน

1. กำหนดโครงสร้างข้อมูลและเงื่อนไข filter ตาม club_id ของอาจารย์ที่ปรึกษา ตาม DOM-SCOPE-01 และ ASM-01
2. สร้าง API ดึงข้อมูลสถิติแยกตามสถานะ และเชื่อมกับหน้า Dashboard ตาม FR-DSH-01 และ AC-DSH-02
3. สร้าง API ดึงข้อมูลสัดส่วนกลุ่มทักษะ/ตัวชี้วัด และจัดรูปแบบกราฟตาม FR-DSH-02 และ AC-DSH-03
4. เพิ่มรถตรวจสิทธิ์ Login ให้ทำงานก่อนเข้าถึง Dashboard ตาม CON-NFR-21, NFR-SEC-01 และ AC-DSH-04
5. ผนวกข้อมูลอ้างอิงจากระบบกิจกรรมจริงและแปลงเป็น snapshot สำหรับการแสดงหน้า Dashboard ตาม FR-DSH-03 และ AC-DSH-01
6. เทส end-to-end สำหรับทุก AC และตรวจ Traceability ใน spec ทุกข้อ

## 8. สิ่งที่ยังไม่ทำ

- Q-04 ไม่มีการระบุเวลาตอบสนอง (performance) ของหน้า Dashboard ไว้ในตาราง -> ควรกำหนดเป้าหมาย เช่น p95 กี่วินาที เพื่อให้ทดสอบได้จริง
  ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
