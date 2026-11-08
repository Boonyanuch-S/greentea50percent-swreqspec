import { render, screen } from '@testing-library/react'
import App from '../App.jsx'
import { createClient } from './prj03-fixtures.js'

const authClient = { login: async () => ({ status: 401, body: {} }) }

// TC-PRJ-03-6 (AC-PRJ-03 ทางผิด, Then จาก AC-PRJ-06 / CON-NFR-21) ส่วนหน้าจอ
// ส่วนหลังบ้านอยู่ใน backend/tests/test_AC_PRJ_03.py
test('test_TC_PRJ_03_6_unauthenticated_sees_login_not_form', async () => {
  // Given ผู้ใช้ยังไม่ได้เข้าสู่ระบบ (ไม่มี session)
  window.sessionStorage.clear()

  // When พยายามเปิดหน้าสร้างโครงการใหม่ (URL ของหน้าสร้างโครงการใหม่)
  window.history.replaceState(null, '', '/?edit=new')
  render(<App authClient={authClient} projectDocumentClient={createClient()} />)

  // Then (1) หน้าจอไม่แสดงฟอร์ม แสดงหน้าเข้าสู่ระบบแทน
  expect(await screen.findByLabelText('รหัสผ่าน')).toBeTruthy()
  expect(screen.getByLabelText('บัญชีผู้ใช้')).toBeTruthy()
  expect(screen.queryByLabelText('ชื่อโครงการ')).toBeNull()
  expect(screen.queryByRole('heading', { name: 'สร้างโครงการใหม่' })).toBeNull()
})
