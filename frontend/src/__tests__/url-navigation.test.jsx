import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import App from '../App.jsx'
import { SESSION_REJECTED } from '../utils/token.js'

vi.mock('../utils/alerts.js', async (importOriginal) => ({
  ...(await importOriginal()),
  showWarning: vi.fn(async () => {}),
}))

const expiresAt = () => new Date(Date.now() + 30 * 60 * 1000).toISOString()
const submission = {
  submission_id: 7,
  project_name: 'โครงการทดสอบนำทาง',
  project_owner: 'สโมสรนักศึกษา',
  submitted_at: '2026-10-30T09:00:00+07:00',
  status: 'รอตรวจสอบ',
  summary: 'รายละเอียด',
  documents: [],
}
const reviewClient = {
  getReviewQueue: async () => [submission],
  getSubmission: vi.fn(async () => submission),
  getSubmissionChecklist: async () => [],
}
const authClient = {
  login: async () => ({ status: 200, body: { token: 'test-token', expires_at: expiresAt(), role: 'faculty_officer' } }),
}

function renderApp() {
  render(<App authClient={authClient} reviewClient={reviewClient} checklistClient={{ getLatestChecklist: async () => ({ version: 1, items: [] }) }} />)
}

async function login() {
  renderApp()
  fireEvent.change(screen.getByLabelText('บัญชีผู้ใช้'), { target: { value: 'faculty@test.edu' } })
  fireEvent.change(screen.getByLabelText('รหัสผ่าน'), { target: { value: 'password' } })
  fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }))
  await screen.findByRole('heading', { name: 'คิวเอกสารรอตรวจ' })
}

test('รีเฟรชแล้วยังอยู่ในระบบและอยู่หน้าเดิม', async () => {
  // Given เจ้าหน้าที่เปิดรายละเอียดเอกสาร
  await login()
  fireEvent.click(await screen.findByRole('button', { name: /โครงการทดสอบนำทาง/ }))
  await screen.findByRole('heading', { name: 'โครงการทดสอบนำทาง' })

  // When รีเฟรชหน้า
  cleanup()
  renderApp()

  // Then ไม่ต้อง login ใหม่และกลับมาที่เอกสารเดิม
  expect(await screen.findByRole('heading', { name: 'โครงการทดสอบนำทาง' })).toBeTruthy()
  expect(screen.queryByLabelText('รหัสผ่าน')).toBeNull()
  expect(reviewClient.getSubmission).toHaveBeenLastCalledWith(7)
})

test('ปุ่มย้อนกลับของเบราว์เซอร์พากลับหน้าก่อนหน้า', async () => {
  // Given เจ้าหน้าที่เปิดรายละเอียดจากคิว
  await login()
  fireEvent.click(await screen.findByRole('button', { name: /โครงการทดสอบนำทาง/ }))
  await screen.findByRole('heading', { name: 'โครงการทดสอบนำทาง' })
  expect(window.location.search).toBe('?submission=7')

  // When กดย้อนกลับ
  act(() => {
    window.history.replaceState(null, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
  })

  // Then กลับไปคิวเอกสาร
  expect(await screen.findByRole('heading', { name: 'คิวเอกสารรอตรวจ' })).toBeTruthy()
})

test('Token หมดอายุแล้วรีเฟรชต้อง login ใหม่', async () => {
  // Given session ที่เก็บไว้หมดอายุแล้ว
  window.sessionStorage.setItem('science-su-session', JSON.stringify({
    token: 'old',
    expiresAt: new Date(Date.now() - 1000).toISOString(),
    role: 'faculty_officer',
  }))

  // When เปิดหน้าใหม่
  renderApp()

  // Then กลับหน้า login ตาม AC-AUTH-04
  expect(await screen.findByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeTruthy()
  expect(window.sessionStorage.getItem('science-su-session')).toBeNull()
})

test('API ปฏิเสธ Token แล้วพากลับหน้า login', async () => {
  // Given ผู้ใช้อยู่ในระบบ
  await login()

  // When API แจ้งว่า Token ใช้ไม่ได้
  act(() => window.dispatchEvent(new Event(SESSION_REJECTED)))

  // Then กลับหน้า login
  expect(await screen.findByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeTruthy()
})

test('เปิดลิงก์เอกสารที่ไม่มีแล้วต้องมีทางกลับรายการ', async () => {
  // Given URL ชี้เอกสารที่หายไปแล้ว เช่น หลัง backend เริ่มใหม่
  const client = {
    ...reviewClient,
    getSubmission: async () => { throw new Error('ไม่พบเอกสารโครงการ') },
  }
  await login()
  cleanup()
  window.history.replaceState(null, '', '/?submission=999')
  render(<App authClient={authClient} reviewClient={client} />)

  // Then แจ้งเหตุผล และกดกลับคิวเอกสารได้
  expect((await screen.findByRole('alert')).textContent).toBe('ไม่พบเอกสารโครงการ')
  fireEvent.click(screen.getByRole('button', { name: '← กลับคิวเอกสาร' }))
  expect(await screen.findByRole('heading', { name: 'คิวเอกสารรอตรวจ' })).toBeTruthy()
  expect(window.location.search).toBe('')
})
