// Login API จำลองสำหรับ prototype คืนรูปแบบเดียวกับ authApi.login (status, body)
// backend ยังไม่มีแหล่งข้อมูลบัญชีผู้ใช้ บัญชีด้านล่างเป็นข้อมูลตัวอย่างเท่านั้น
const TOKEN_TTL_MINUTES = 30 // ASM-02

// ชื่อบัญชีตั้งตามผู้ให้สัมภาษณ์ รูปแบบ <นามสกุล>_<อักษรแรกของชื่อ>@silpakorn.edu
const accounts = [
  // นางสาวธิติมาพร บุญเลี้ยง นักศึกษาสโมสรนักศึกษา (สัมภาษณ์ 20/7/69)
  { username: 'boonliang_t@silpakorn.edu', password: 'club1234', role: 'club_committee', displayName: 'นางสาวธิติมาพร บุญเลี้ยง', unit: 'สโมสรนักศึกษาคณะวิทยาศาสตร์' },
  // ยังไม่มีผู้ให้สัมภาษณ์บทบาทเจ้าหน้าที่คณะ
  { username: 'faculty@silpakorn.edu', password: 'faculty1234', role: 'faculty_officer', displayName: 'เจ้าหน้าที่คณะวิทยาศาสตร์ (บัญชีตัวอย่าง)', unit: 'คณะวิทยาศาสตร์' },
  // ผศ.ดร.พชรพล อินทุเวศ อาจารย์ที่ปรึกษาสโมสร (สัมภาษณ์ 14/8/69)
  { username: 'intuwet_p@silpakorn.edu', password: 'advisor1234', role: 'advisor', displayName: 'ผู้ช่วยศาสตราจารย์ ดร.พชรพล อินทุเวศ', unit: 'คณะวิทยาศาสตร์' },
  // นางสาวปัทมรัตน์ ปรีชาไว กองกิจการนักศึกษา (สัมภาษณ์ 25/8/69)
  { username: 'preechawai_p@silpakorn.edu', password: 'affairs1234', role: 'student_affairs_officer', displayName: 'นางสาวปัทมรัตน์ ปรีชาไว', unit: 'กองกิจการนักศึกษา' },
]

// ใช้ลองกรณี Login API ล่ม ตาม FR-AUTH-03
const API_ERROR_USERNAME = 'api-error'

export const authMock = {
  async login({ username, password }) {
    if (username === API_ERROR_USERNAME) {
      throw new Error('Login API ไม่ตอบสนอง')
    }

    const account = accounts.find((a) => a.username === username && a.password === password)
    if (!account) {
      // ไม่บอกว่าผิดที่บัญชีหรือรหัสผ่าน ตาม SEC-AUTHMSG-01 และ FR-AUTH-05
      return { status: 401, body: { detail: 'บัญชีหรือรหัสผ่านไม่ถูกต้อง' } }
    }

    return {
      status: 200,
      body: {
        token: `mock-token-${account.username}-${Date.now()}`,
        expires_at: new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000).toISOString(),
        role: account.role,
        // profile มีเฉพาะใน mock (นอก spec ทีมสั่งเพิ่ม) backend LoginResponse ยังคืนแค่ token/expires_at/role
        profile: { username: account.username, displayName: account.displayName, unit: account.unit },
      },
    }
  },
}
