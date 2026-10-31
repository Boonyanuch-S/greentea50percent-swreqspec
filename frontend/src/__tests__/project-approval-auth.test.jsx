import { render, screen } from '@testing-library/react'
import { createProjectApprovalClient } from '../api/client.js'
import App from '../App.jsx'

test('test_AC_APR_06_reject_unauthenticated_access ผู้ไม่มี session เข้าถึงฟีเจอร์ไม่ได้', async () => {
  // Given ผู้ใช้ยังไม่ได้เข้าสู่ระบบ
  render(<App />)

  // When พยายามเข้าถึงฟีเจอร์อนุมัติเอกสาร
  const heading = await screen.findByRole('heading', { name: 'เข้าสู่ระบบ' })

  // Then ระบบแสดงหน้า login แทนหน้าอนุมัติ และไม่เรียก API
  expect(heading).toBeTruthy()
  expect(screen.queryByRole('heading', { name: 'อนุมัติเอกสารโครงการ' })).toBeNull()
  await expect(createProjectApprovalClient(null).listApprovals()).rejects.toThrow('ต้องยืนยันตัวตน')
})
