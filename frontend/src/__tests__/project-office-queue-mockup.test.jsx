import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach } from 'vitest'
import App from '../App.jsx'

function createAuthClient() {
  return {
    login: async () => ({
      status: 200,
      body: {
        token: 'test-student-affairs-token',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        role: 'student_affairs_officer',
      },
    }),
  }
}

afterEach(() => {
  window.history.replaceState({}, '', '/')
})

test('mockup คิวกองกิจแสดงรายการและเปิดรายละเอียดเอกสารได้', async () => {
  window.history.replaceState({}, '', '/?mockup=project-queue')
  render(<App authClient={createAuthClient()} />)

  fireEvent.change(screen.getByLabelText('บัญชีผู้ใช้'), {
    target: { value: 'staff@test.edu' },
  })
  fireEvent.change(screen.getByLabelText('รหัสผ่าน'), {
    target: { value: 'password' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }))

  const projectButton = await screen.findByRole('button', {
    name: /โครงการค่ายวิทยาศาสตร์ 2569/,
  })
  fireEvent.click(projectButton)

  expect(await screen.findByText('สถานะ: รออนุมัติ')).toBeTruthy()
  expect(screen.getByText(/ใบปะหน้า-ลงนามแล้ว\.pdf/)).toBeTruthy()
})
