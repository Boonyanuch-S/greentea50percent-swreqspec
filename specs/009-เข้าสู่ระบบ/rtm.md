# RTM: เข้าสู่ระบบ
อ้างอิง: spec.md Draft v2 | tasks.md | test-cases.md (มีแถว AC-AUTH-01 ถึง 03)
สร้างด้วย /verify เมื่อ 2569-11-02 | test: 217 ผ่าน 0 ไม่ผ่าน (backend 147, frontend 70 ทั้งระบบ)

หมายเหตุการรัน: ใช้ `PYTHONPATH=. pytest -q backend/tests` เพราะ `cd backend && pytest` ใช้กับ package path นี้ไม่ได้
ไม่มี `specs/000-shared/` และไม่มี `mockups/`

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-AUTH-01 | AC-AUTH-04 | T-02 เสร็จ รอทีมตรวจ, T-05 ทำบางส่วน รอ Q-03 | `App.jsx`: `AppRoutes`; `AuthContext.jsx`: `expireSession` | `Token หมดอายุแล้วรีเฟรช...`, `API ปฏิเสธ Token แล้วพากลับ...` ใน `url-navigation.test.jsx` (ผ่าน) | ช่องโหว่ (F-001) |
| FR-AUTH-02 | ไม่มี AC | T-02 เสร็จ รอทีมตรวจ | `LoginPage.jsx`: ช่องกรอก | `โครงหน้าจอเปิดได้` (ผ่าน) | ช่องโหว่ (F-002) |
| FR-AUTH-03 | ไม่มี AC | T-03 ทำบางส่วน | `routers/auth.py`: `login`; `LoginPage.jsx`: `handleSubmit`, `API_ERROR_MESSAGE` | ไม่มี test กรณี Login API ล้มเหลว | ช่องโหว่ (F-002, F-003) |
| FR-AUTH-04 | AC-AUTH-01 | T-01, T-04 เสร็จ รอทีมตรวจ | `auth_service.py`: `authenticate`; `App.jsx`: `RoleHome` | `test_TC_AUTH_01_*`, `login เป็น...` 3 ตัวใน `setup.test.jsx` (ผ่าน) | ครบ |
| FR-AUTH-05 | AC-AUTH-02, AC-AUTH-03 | T-03 ทำบางส่วน | `routers/auth.py`: `GENERIC_INVALID_CREDENTIALS_MESSAGE`; `LoginPage.jsx` | `test_TC_AUTH_02_*`, `test_TC_AUTH_03_*` เฉพาะหลังบ้าน (ผ่าน) | ช่องโหว่ (F-003) |
| NFR-SEC-02 | ไม่มี AC | T-06 รอ Q-04, Q-06 | เก็บบทบาทใน session เท่านั้น | ไม่มี | รอ Q-04 |
| DOM-PDPA-02 | ไม่มี AC | T-04 เสร็จ รอทีมตรวจ | `middleware/auth.py`: `require_roles` | `test_role_cannot_use_other_role_action` (ผ่าน) | ช่องโหว่ (F-002) |
| SEC-AUTHMSG-01 | AC-AUTH-02, AC-AUTH-03 | T-03 ทำบางส่วน | `routers/auth.py`: `SampleAccountVerifier` คืน None กรณีเดียว | `test_TC_AUTH_02_1...`, `test_TC_AUTH_03_1...` (ผ่าน) | ครบ |
| IF-TOKEN-01 | AC-AUTH-04 | T-05 ทำบางส่วน รอ Q-03 | `models/auth_token.py`: `DEFAULT_TOKEN_TTL_MINUTES`; `auth_service.py`: `TokenRegistry` | `test_AC_APR_06_reject_unauthenticated_access` กรณี Token หมดอายุ (ผ่าน) | ช่องโหว่ (F-001) |

สรุป: ครบ 2 | ยังไม่ถึง 0 | รอ 1 | ช่องโหว่ 6

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `POST /login` | FR-AUTH-03, FR-AUTH-04 | ตรง | ใช้บัญชีตัวอย่าง |
| `auth_service.py`: `SAMPLE_ACCOUNTS`, `SAMPLE_PASSWORD` | FR-AUTH-03 | CHANGELOG 2569-10-31 | รหัสผ่านเดียวกันทุกบัญชีอยู่ในซอร์สโค้ด ใช้ได้เฉพาะโปรโตไทป์ |
| `AuthContext.jsx`: `loadSession`, `saveSession` | CHANGELOG 2569-11-02 | Q-06 ยังเขียนว่าเก็บในหน่วยความจำ | F-004 |
| `AuthContext.jsx`: `signOut`, `ProfilePage.jsx` | ไม่มี FR | ทีมสั่งเพิ่ม ยังรอลง spec | F-005 |
| `components/AuthGuard.jsx`, `pages/RoleHomePage.jsx` | CON-NFR-21, FR-AUTH-04 | ไม่ได้ใช้หรือไม่มีทางถึงตามปกติ | F-006 |
| `GET /api/auth/me` ใน plan.md | FR-AUTH-04 | ไม่มีในโค้ด | F-006 |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-001 | เดา Q-03 | `api/client.js`: `SESSION_REJECTED`, `AuthContext.jsx`: `expireSession` | Q-03 ยังเปิด | Token ไม่ถูกต้องหรือถูกยกเลิกถูกจัดการเหมือนหมดอายุ และขึ้นข้อความ "Token หมดอายุ" ทั้งที่ Q-03 เขียนว่า prototype ยังไม่จัดการ พฤติกรรมนี้มีเหตุผล (ดูหัวข้อ 5) แต่ต้องปิด Q-03 ให้ตรง | |
| F-002 | FR ไม่มี AC | spec.md: FR-AUTH-02, FR-AUTH-03, DOM-PDPA-02 | FR-AUTH-02, FR-AUTH-03, DOM-PDPA-02 | ตาราง Traceability ชี้ AC-AUTH-01 แต่ AC นั้นอ้าง FR-AUTH-04 ไม่ตรวจการกรอก ไม่ตรวจกรณี API ล้มเหลว และไม่มี AC ตรวจการกันข้ามบทบาท | |
| F-003 | test อ่อน | `LoginPage.jsx`: `message` | FR-AUTH-03, FR-AUTH-05, AC-AUTH-02 | ไม่มี test หน้าจอตัวใดตรวจข้อความ "บัญชีหรือรหัสผ่านไม่ถูกต้อง" หรือ "เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง" ถ้าลบการแสดงข้อความนี้ test ยังผ่าน และ test ปัจจุบันไม่ตรวจว่าผู้ใช้อยู่หน้า login ต่อ | |
| F-004 | เดา Q-06 | `AuthContext.jsx`: `saveSession`, spec.md: Q-06 | Q-06 ยังเปิด | โค้ดเก็บ session ใน sessionStorage ตาม CHANGELOG แต่ข้อความ Q-06 ยังเขียนว่าปิดหรือรีเฟรชต้อง login ใหม่ ควรปรับข้อความและตอบ Q-06 | |
| F-005 | โค้ดไม่มี FR | `signOut`, `ProfilePage.jsx` | spec 009 | ออกจากระบบและหน้าโปรไฟล์ยังเป็นข้อเสนอรอทีมตัดสินตาม CHANGELOG 2569-10-29 ยังไม่มี FR/AC | |
| F-006 | โค้ดไม่มี FR | `AuthGuard.jsx`, `RoleHomePage.jsx`, plan.md | CON-NFR-21, Q-01 | AuthGuard ไม่ถูกใช้และตรวจ field ที่ไม่มีใน session, RoleHomePage ยังแสดง "รอ Q-01" ทั้งที่ Q-01 ตอบครบแล้ว และ plan ระบุ `GET /api/auth/me` ที่ไม่มีจริง | |
| F-007 | เดา Q-07 | `test_TC_AUTH_02_2_empty_wrong_password_uses_generic_message`, `test_TC_AUTH_03_2_empty_username_uses_generic_message` | Q-07, Q-08 ยังเปิด | test ล็อกพฤติกรรมว่าค่าว่างใช้ข้อความทั่วไปทั้งที่คำถามยังเปิด | |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| ไม่มี | rtm.md ของฟีเจอร์นี้สร้างครั้งแรก | |

## 5. คำตอบที่เสนอสำหรับ Open Questions (รอทีมยืนยัน ยังไม่ใช่คำตอบทีม)
| Q | คำตอบที่เสนอ | หลักฐาน | ความมั่นใจ |
|---|---|---|---|
| Q-02 | แสดงหน้า login ทันที ไม่ต้องมีหน้าต่างแจ้งเตือน เพราะการไม่มี Token ไม่ใช่ข้อผิดพลาด | ไม่มีมาตรฐานกำหนด เป็นเหตุผลเชิงออกแบบ | กลาง |
| Q-03 | จัดการเหมือนกัน กลับหน้า login แต่ควรเปลี่ยนข้อความเป็นกลาง เช่น "กรุณาเข้าสู่ระบบใหม่" RFC 6750 รวมกรณี "expired, revoked, malformed" ไว้ใน `invalid_token` และตอบ 401 เหมือนกัน | RFC 6750 ข้อ 3.1 | สูง |
| Q-04 | ให้ฟีเจอร์การแจ้งเตือนเป็นเจ้าของ login แค่ส่งบทบาทต่อ ตรงกับ Out of scope ของ spec นี้ | spec 009 หัวข้อ Out of scope | สูง: เป็นเรื่องภายในทีม เว็บตอบไม่ได้ |
| Q-05 | โปรโตไทป์ยังไม่ต้องทำ ระบบจริงต้องจำกัด โดย NIST กำหนดเพดานไม่เกิน 100 ครั้งติดต่อกันต่อบัญชี และ OWASP ให้นับต่อบัญชีไม่ใช่ต่อ IP แต่ไม่กำหนดตัวเลขตายตัว ทีมต้องเลือกตัวเลขและระยะเวลาล็อกเอง | NIST SP 800-63B ข้อ 3.2.2, OWASP Authentication | สูงเรื่องหลักการ, ตัวเลขทีมเลือก |
| Q-06 | ให้หลาย session ได้ เพราะ OWASP ถือเป็นการตัดสินใจของแต่ละระบบ ไม่ต้องมี remember me หรือ refresh token ในโปรโตไทป์ อายุ 30 นาทีอยู่ในช่วง 15-30 นาทีของระบบความเสี่ยงต่ำ แต่ระบบนี้มีข้อมูลนักศึกษาจึงควรทบทวน และ OWASP ไม่แนะนำเก็บ Token ใน sessionStorage ระบบจริงควรใช้ HttpOnly cookie | OWASP Session Management | สูงเรื่องข้อเท็จจริง, ทีมตัดสินระดับความเสี่ยง |
| Q-07 | ใช้ข้อความทั่วไปเดียวกันฝั่งเซิร์ฟเวอร์ ตามหลัก OWASP ให้ตอบแบบเดียวกัน ส่วนบังคับกรอกช่องบนหน้าจอเพิ่มได้เพราะไม่เปิดเผยว่ามีบัญชีหรือไม่ | OWASP Authentication | กลาง: OWASP ไม่พูดถึงค่าว่างโดยตรง |
| Q-08 | ใช้ข้อความทั่วไปเดียวกัน และตัดช่องว่างหน้าหลัง username ได้ ส่วน password ไม่ควรตัดเอง OWASP ให้ใช้ทุกอักขระรวมช่องว่าง แต่ NIST อนุญาตให้ตัดหน้าหลังได้ถ้ายังยาวตามขั้นต่ำ | OWASP Authentication, NIST SP 800-63B ข้อ 3.1.1.2 | กลาง: ไม่มีแหล่งใดพูดถึง username โดยตรง |

แหล่งอ้างอิง:
- [RFC 6750 The OAuth 2.0 Bearer Token Usage](https://www.rfc-editor.org/rfc/rfc6750.txt)
- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
