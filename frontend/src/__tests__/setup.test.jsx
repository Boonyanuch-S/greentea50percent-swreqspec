// test ตรวจโครงหน้าจอและการนำทางตามบทบาทหลัง login (AC-AUTH-01)
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from '../App.jsx'

test('โครงหน้าจอเปิดได้', async () => {
  render(<App />)
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeTruthy()
  })
})

test('login เป็นเจ้าหน้าที่คณะแล้วเปิดคิวตรวจเอกสาร UC-03', async () => {
  const authClient = {
    login: async () => ({
      status: 200,
      body: {
        token: 'test-token',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        role: 'faculty_officer',
      },
    }),
  }

  render(<App authClient={authClient} />)

  fireEvent.change(screen.getByLabelText('บัญชีผู้ใช้'), { target: { value: 'faculty@test.edu' } })
  fireEvent.change(screen.getByLabelText('รหัสผ่าน'), { target: { value: 'password' } })
  fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }))

  expect(await screen.findByRole('heading', { name: 'คิวเอกสารรอตรวจ' })).toBeTruthy()
})
