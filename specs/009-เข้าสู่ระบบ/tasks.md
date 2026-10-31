# Tasks Breakdown: เข้าสู่ระบบ
- Feature: เข้าสู่ระบบ
- Spec ID: SPEC-AUTH-009
- อ้างอิง plan.md: specs/009-เข้าสู่ระบบ/plan.md
- วันที่: 2026-10-01

- สรุป: ทำ 6 task; 3 task ต้องรอ Open Questions

## รายการ task

### T-01 กำหนดสัญญา Login API และ Token
- รองรับ: FR-AUTH-03, FR-AUTH-04, IF-TOKEN-01
- ตรวจด้วย: AC-AUTH-01
- ไฟล์ที่แตะ: backend/app/models/auth_token.py, backend/app/services/auth_service.py, backend/app/routers/auth.py
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: `POST /api/login` รับ username/password แล้วคืน token, expires_at และ role ที่ถูกต้อง
- สถานะ: เสร็จ รอทีมตรวจ

### T-02 สร้างหน้า login และส่งข้อมูลเข้าสู่ระบบ
- รองรับ: FR-AUTH-01, FR-AUTH-02, FR-AUTH-03
- ตรวจด้วย: AC-AUTH-02, AC-AUTH-03
- ไฟล์ที่แตะ: frontend/src/pages/LoginPage.jsx, frontend/src/services/auth.js (ย้ายจาก frontend/src/api/auth.js เมื่อ 2569-10-29)
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: หน้า login แสดงช่องกรอก username/password และส่งข้อมูลไปยัง Login API ได้
- สถานะ: เสร็จ รอทีมตรวจ
- หมายเหตุ 2569-10-29: prototype ใช้บัญชีตัวอย่าง 4 บทบาทใน frontend/src/services/authMock.js แทน Login API จริง (backend ยังไม่มี verifier)

### T-03 ตรวจสอบบัญชี/รหัสผ่านแบบ generic และจัดการ API error
- รองรับ: FR-AUTH-03, FR-AUTH-05, SEC-AUTHMSG-01, ASM-04
- ตรวจด้วย: AC-AUTH-02, AC-AUTH-03
- ไฟล์ที่แตะ: backend/app/services/auth_service.py, backend/app/routers/auth.py
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: เมื่อ username/password ผิดหรือ user ไม่มีจริงหรือ Login API ล้มเหลว ระบบคืนข้อความที่ถูกต้องตามเงื่อนไขทั่วไป และไม่เปิดเผยรายละเอียดที่ผิด
- สถานะ: ทำบางส่วน (ตรวจซ้ำ 2569-10-29 เดิมระบุว่า "พร้อมทำ")
  - ทำแล้ว: `backend/app/routers/auth.py` ตอบ 401 พร้อมข้อความ "บัญชีหรือรหัสผ่านไม่ถูกต้อง" เหมือนกันทั้งกรณีรหัสผ่านผิดและไม่มีบัญชี (FR-AUTH-05, SEC-AUTHMSG-01)
  - ทำแล้ว: `frontend/src/pages/LoginPage.jsx` แสดง "บัญชีหรือรหัสผ่านไม่ถูกต้อง" เมื่อได้ 401 และแสดง "เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง" เมื่อ API ล้มเหลวหรือได้ status อื่น (FR-AUTH-03, ASM-04)
  - ยังไม่ทำ: ฝั่ง backend ยังไม่จัดการกรณีแหล่งบัญชีล้มเหลว (ตอนนี้ใช้ `_UnconfiguredVerifier` ที่ยังไม่เชื่อมแหล่งบัญชีจริง ดู F-001 ใน rtm.md)

### T-04 นำทางผู้ใช้ตามบทบาทหลัง login สำเร็จ
- รองรับ: FR-AUTH-04, DOM-PDPA-02, ASM-03
- ตรวจด้วย: AC-AUTH-01
- ไฟล์ที่แตะ: frontend/src/pages/HomeRouter.jsx, frontend/src/api/auth.js
  (ที่ทำจริง 2569-10-29: frontend/src/App.jsx, frontend/src/store/AuthContext.jsx, frontend/src/pages/RoleHomePage.jsx)
- ต้องทำหลัง: T-01, T-02, T-03
- เสร็จเมื่อ: หลัง login สำเร็จ ระบบบันทึก token และนำผู้ใช้เข้าสู่หน้าหลักตามบทบาทที่ได้รับจาก login
- สถานะ: เสร็จ รอทีมตรวจ — บันทึก token/บทบาทแล้ว; กรรมการสโมสรเข้าหน้า UC-01 เจ้าหน้าที่คณะเข้าคิว UC-03 อาจารย์ที่ปรึกษาสโมสรเข้าหน้าอนุมัติ UC-05 และเจ้าหน้าที่กองกิจเข้าแผงตรวจ UC-05 ตามคำตอบทีม

### T-05 ตรวจสอบ Token หมดอายุและบังคับกลับหน้า login
- รองรับ: FR-AUTH-01, IF-TOKEN-01, ASM-02
- ตรวจด้วย: AC-AUTH-04
- ไฟล์ที่แตะ: frontend/src/middleware/authGuard.js, frontend/src/api/auth.js
  (ที่ทำจริง 2569-10-29: frontend/src/store/AuthContext.jsx, frontend/src/utils/token.js, frontend/src/App.jsx)
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: เมื่อ token หมดอายุ ระบบแสดงหน้าต่างแจ้งเตือนแล้วพาผู้ใช้กลับไปหน้า login ทันที
- สถานะ: ทำบางส่วน รอ Q-03 — Token หมดอายุครบ 30 นาที (ASM-02) แสดงหน้าต่างแจ้งแล้วกลับหน้า login แล้ว; Token ไม่ถูกต้อง/ถูกยกเลิกยังไม่ทำ

### T-06 ทดสอบและตรวจความครบทุก AC / Constraint
- รองรับ: FR-AUTH-01, FR-AUTH-02, FR-AUTH-03, FR-AUTH-04, FR-AUTH-05, DOM-PDPA-02, SEC-AUTHMSG-01, IF-TOKEN-01, NFR-SEC-02
- ตรวจด้วย: AC-AUTH-01, AC-AUTH-02, AC-AUTH-03, AC-AUTH-04
- ไฟล์ที่แตะ: backend/tests/test_auth_login_flow.py, frontend/src/__tests__/login.test.jsx
- ต้องทำหลัง: T-01, T-02, T-03, T-04, T-05
- เสร็จเมื่อ: การทดสอบ AC ทุกตัวผ่านและ traceability ของ FR / IF / NFR ครบตาม spec
- สถานะ: รอ Q-04, Q-06 (มีบางส่วนแล้ว ตรวจซ้ำ 2569-10-29)
  - ทำแล้ว: test backend ของ AC-AUTH-01, AC-AUTH-02, AC-AUTH-03 อยู่ใน `backend/tests/test_TC_selected_acceptance_criteria.py` (TC-AUTH-01-1 ถึง TC-AUTH-03-3 ดู test-cases.md และ rtm.md)
  - ทำแล้วบางส่วน: เพิ่ม test frontend ใน `frontend/src/__tests__/setup.test.jsx` ยืนยันว่าเจ้าหน้าที่คณะ login แล้วเข้าคิว UC-03 อาจารย์ที่ปรึกษาสโมสร login แล้วเข้าหน้าอนุมัติ UC-05 และเจ้าหน้าที่กองกิจ login แล้วเข้าแผงตรวจ UC-05 ตาม Q-01
  - ยังไม่ทำ: test ของ AC-AUTH-04 (Token หมดอายุ) และ test frontend ของกรณี login อื่น ๆ ให้ครบ AC (`frontend/src/__tests__/login.test.jsx` ยังไม่มี)
  - หมายเหตุ: ในเครื่องนี้ backend test รันไม่ได้ เพราะยังไม่ได้ติดตั้ง `sqlalchemy`

## ตารางตรวจความครบ

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-AUTH-01 | T-01, T-04, T-06 |
| AC-AUTH-02 | T-02, T-03, T-06 |
| AC-AUTH-03 | T-02, T-03, T-06 |
| AC-AUTH-04 | T-05, T-06 |

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| DOM-PDPA-02 | T-01, T-04, T-06 |
| SEC-AUTHMSG-01 | T-02, T-03, T-06 |
| IF-TOKEN-01 | T-01, T-05, T-06 |

## สิ่งที่ยังไม่ทำ
- Q-01 ต้องกำหนดชื่อหรือเส้นทางหน้าหลักของกรรมการสโมสร เจ้าหน้าที่คณะ อาจารย์ที่ปรึกษา และเจ้าหน้าที่กองกิจอย่างไร? เกี่ยวกับ `FR-AUTH-04`, `AC-AUTH-01` — ตอบแล้ว (2569-10-31): กรรมการสโมสร -> UC-01, เจ้าหน้าที่คณะ -> UC-03, อาจารย์ที่ปรึกษาสโมสรและเจ้าหน้าที่กองกิจ -> UC-05
- Q-02 เมื่อเปิดระบบครั้งแรกโดยยังไม่มี Token ต้องแสดงหน้า login ทันทีหรือมีหน้าต่างแจ้งเตือนร่วมด้วย? เกี่ยวกับ `FR-AUTH-01` — ยังไม่มี task ที่สร้างจากคำถามนี้ (prototype แสดงหน้า login ทันที ยังไม่ใช่คำตอบทีม)
- Q-03 Token ไม่ถูกต้องหรือถูกยกเลิก ต้องจัดการเหมือน Token หมดอายุหรือไม่? เกี่ยวกับ `IF-TOKEN-01`, `FR-AUTH-01`, `AC-AUTH-04` — รอ T-05 (ส่วน Token หมดอายุตามเวลาทำแล้ว)
- Q-04 NFR-SEC-02 เป็นข้อกำหนดของฟีเจอร์ login โดยตรง หรือให้ฟีเจอร์การแจ้งเตือนเป็นผู้รับผิดชอบ โดย login เพียงส่งต่อบทบาท? เกี่ยวกับ `NFR-SEC-02` — รอ T-06
- Q-05 ต้องจำกัดจำนวนครั้งที่กรอกรหัสผ่านผิดหรือล็อกบัญชีชั่วคราวหรือไม่? เกี่ยวกับ Q-02 เดิม — ยังไม่มี task ที่สร้างจากคำถามนี้
- Q-06 อนุญาตให้บัญชีเดียวกัน login หลายอุปกรณ์หรือหลาย session พร้อมกันหรือไม่ และต้องรองรับ remember me หรือ refresh token หรือไม่? เกี่ยวกับ Q-04 และ Q-05 เดิม — รอ T-06
- Q-07 เมื่อกรอก password ว่าง ระบบต้องใช้ข้อความทั่วไปเดียวกับกรณี password ผิดหรือมี validation แยกต่างหาก? เกี่ยวกับ `AC-AUTH-02` — ยังไม่มี task (prototype ยังไม่มี validation ช่องว่าง)
- Q-08 เมื่อ username ว่างหรือมี whitespace ระบบต้องใช้ข้อความทั่วไปเดียวกับกรณี username ไม่พบหรือมี validation แยกต่างหาก? เกี่ยวกับ `AC-AUTH-03` — ยังไม่มี task (prototype ยังไม่มี validation ช่องว่าง)
- ข้อเสนอรอทีมตัดสิน (ยังไม่มี ID): เพิ่ม FR ออกจากระบบ และหน้าโปรไฟล์ ลงใน spec หรือไม่ — ตอนนี้ทำใน prototype กำกับ "นอก spec ทีมสั่งเพิ่ม"
