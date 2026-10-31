// test ตรวจโครงหน้าจอและการนำทางตามบทบาทหลัง login (AC-AUTH-01)
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from '../App.jsx'
import { projectApprovalMock } from '../services/projectApprovalMock.js'

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

test('login เป็นอาจารย์ที่ปรึกษาสโมสรแล้วเปิดหน้าอนุมัติเอกสาร UC-05', async () => {
  const authClient = {
    login: async () => ({
      status: 200,
      body: {
        token: 'test-token',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        role: 'advisor',
      },
    }),
  }

  render(<App authClient={authClient} approvalClient={projectApprovalMock} />)

  fireEvent.change(screen.getByLabelText('บัญชีผู้ใช้'), { target: { value: 'advisor@test.edu' } })
  fireEvent.change(screen.getByLabelText('รหัสผ่าน'), { target: { value: 'password' } })
  fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }))

  expect(await screen.findByRole('heading', { name: 'อนุมัติเอกสารโครงการ' })).toBeTruthy()
})

test('login เป็นเจ้าหน้าที่กองกิจแล้วเปิดแผงตรวจเอกสาร UC-05', async () => {
  const authClient = {
    login: async () => ({
      status: 200,
      body: {
        token: 'test-token',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        role: 'student_affairs_officer',
      },
    }),
  }

  render(<App authClient={authClient} approvalClient={projectApprovalMock} />)

  fireEvent.change(screen.getByLabelText('บัญชีผู้ใช้'), { target: { value: 'affairs@test.edu' } })
  fireEvent.change(screen.getByLabelText('รหัสผ่าน'), { target: { value: 'password' } })
  fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }))

  expect(await screen.findByRole('heading', { name: 'ตรวจเอกสารโครงการ' })).toBeTruthy()
})
