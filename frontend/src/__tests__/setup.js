import { afterEach } from 'vitest'

// session และ URL อยู่ใน jsdom ตลอดไฟล์ test จึงล้างทุกครั้งเพื่อไม่ให้ test ปนกัน
afterEach(() => {
  window.sessionStorage.clear()
  window.history.replaceState(null, '', '/')
})
