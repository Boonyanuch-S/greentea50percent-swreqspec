// test ตรวจว่าโครงหน้าจอพร้อมใช้ (ไม่ใช่ test ของ AC ใด)
import { render, screen, waitFor } from '@testing-library/react'
import App from '../App.jsx'

test('โครงหน้าจอเปิดได้', async () => {
  render(<App />)
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'ขอบันทึกชั่วโมงย้อนหลัง' })).toBeTruthy()
  })
})
