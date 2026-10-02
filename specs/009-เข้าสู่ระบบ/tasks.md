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
- ไฟล์ที่แตะ: frontend/src/pages/LoginPage.jsx, frontend/src/api/auth.js
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: หน้า login แสดงช่องกรอก username/password และส่งข้อมูลไปยัง Login API ได้
- สถานะ: เสร็จ รอทีมตรวจ

### T-03 ตรวจสอบบัญชี/รหัสผ่านแบบ generic และจัดการ API error
- รองรับ: FR-AUTH-03, FR-AUTH-05, SEC-AUTHMSG-01, ASM-04
- ตรวจด้วย: AC-AUTH-02, AC-AUTH-03
- ไฟล์ที่แตะ: backend/app/services/auth_service.py, backend/app/routers/auth.py
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: เมื่อ username/password ผิดหรือ user ไม่มีจริงหรือ Login API ล้มเหลว ระบบคืนข้อความที่ถูกต้องตามเงื่อนไขทั่วไป และไม่เปิดเผยรายละเอียดที่ผิด
- สถานะ: พร้อมทำ

### T-04 นำทางผู้ใช้ตามบทบาทหลัง login สำเร็จ
- รองรับ: FR-AUTH-04, DOM-PDPA-02, ASM-03
- ตรวจด้วย: AC-AUTH-01
- ไฟล์ที่แตะ: frontend/src/pages/HomeRouter.jsx, frontend/src/api/auth.js
- ต้องทำหลัง: T-01, T-02, T-03
- เสร็จเมื่อ: หลัง login สำเร็จ ระบบบันทึก token และนำผู้ใช้เข้าสู่หน้าหลักตามบทบาทที่ได้รับจาก login
- สถานะ: รอ Q-01

### T-05 ตรวจสอบ Token หมดอายุและบังคับกลับหน้า login
- รองรับ: FR-AUTH-01, IF-TOKEN-01, ASM-02
- ตรวจด้วย: AC-AUTH-04
- ไฟล์ที่แตะ: frontend/src/middleware/authGuard.js, frontend/src/api/auth.js
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: เมื่อ token หมดอายุ ระบบแสดงหน้าต่างแจ้งเตือนแล้วพาผู้ใช้กลับไปหน้า login ทันที
- สถานะ: รอ Q-03

### T-06 ทดสอบและตรวจความครบทุก AC / Constraint
- รองรับ: FR-AUTH-01, FR-AUTH-02, FR-AUTH-03, FR-AUTH-04, FR-AUTH-05, DOM-PDPA-02, SEC-AUTHMSG-01, IF-TOKEN-01, NFR-SEC-02
- ตรวจด้วย: AC-AUTH-01, AC-AUTH-02, AC-AUTH-03, AC-AUTH-04
- ไฟล์ที่แตะ: backend/tests/test_auth_login_flow.py, frontend/src/__tests__/login.test.jsx
- ต้องทำหลัง: T-01, T-02, T-03, T-04, T-05
- เสร็จเมื่อ: การทดสอบ AC ทุกตัวผ่านและ traceability ของ FR / IF / NFR ครบตาม spec
- สถานะ: รอ Q-04, Q-06

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
- Q-01 ต้องกำหนดชื่อหรือเส้นทางหน้าหลักของกรรมการสโมสร เจ้าหน้าที่คณะ อาจารย์ที่ปรึกษา และเจ้าหน้าที่กองกิจอย่างไร? เกี่ยวกับ `FR-AUTH-04`, `AC-AUTH-01` — รอ T-04
- Q-02 เมื่อเปิดระบบครั้งแรกโดยยังไม่มี Token ต้องแสดงหน้า login ทันทีหรือมีหน้าต่างแจ้งเตือนร่วมด้วย? เกี่ยวกับ `FR-AUTH-01` — ยังไม่มี task ที่สร้างจากคำถามนี้
- Q-03 Token ไม่ถูกต้องหรือถูกยกเลิก ต้องจัดการเหมือน Token หมดอายุหรือไม่? เกี่ยวกับ `IF-TOKEN-01`, `FR-AUTH-01`, `AC-AUTH-04` — รอ T-05
- Q-04 NFR-SEC-02 เป็นข้อกำหนดของฟีเจอร์ login โดยตรง หรือให้ฟีเจอร์การแจ้งเตือนเป็นผู้รับผิดชอบ โดย login เพียงส่งต่อบทบาท? เกี่ยวกับ `NFR-SEC-02` — รอ T-06
- Q-05 ต้องจำกัดจำนวนครั้งที่กรอกรหัสผ่านผิดหรือล็อกบัญชีชั่วคราวหรือไม่? เกี่ยวกับ Q-02 เดิม — ยังไม่มี task ที่สร้างจากคำถามนี้
- Q-06 อนุญาตให้บัญชีเดียวกัน login หลายอุปกรณ์หรือหลาย session พร้อมกันหรือไม่ และต้องรองรับ remember me หรือ refresh token หรือไม่? เกี่ยวกับ Q-04 และ Q-05 เดิม — รอ T-06
