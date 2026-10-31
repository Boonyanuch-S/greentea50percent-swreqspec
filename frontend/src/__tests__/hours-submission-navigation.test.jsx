import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import App from '../App.jsx'
import { createHoursSubmissionClient } from '../api/client.js'

function createAuthClient() {
  return {
    login: async () => ({
      status: 200,
      body: {
        token: 'test-token',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        role: 'club_committee',
      },
    }),
  }
}

function login() {
  fireEvent.change(screen.getByLabelText('บัญชีผู้ใช้'), { target: { value: 'club@test.edu' } })
  fireEvent.change(screen.getByLabelText('รหัสผ่าน'), { target: { value: 'password' } })
  fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }))
}

test('กรรมการสโมสรเปิดหน้าส่งข้อมูลชั่วโมงด้วยข้อมูลจำลองชั่วคราวได้', async () => {
  render(<App authClient={createAuthClient()} />)

  login()

  expect(await screen.findByRole('heading', { name: 'เอกสารโครงการ' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'ส่งข้อมูลชั่วโมงกิจกรรม' }))
  expect(await screen.findByRole('heading', { name: 'ส่งข้อมูลชั่วโมงกิจกรรม' })).toBeTruthy()
  expect(await screen.findByRole('heading', { name: 'Preview ไฟล์ Excel' })).toBeTruthy()

  fireEvent.click(screen.getByRole('button', { name: 'เอกสารโครงการ' }))
  expect(await screen.findByRole('heading', { name: 'เอกสารโครงการ' })).toBeTruthy()
})

test('AC-SBH-03 only finished activities are loaded from authenticated API', async () => {
  const activity = {
    activity_id: 7,
    activity_name: 'กิจกรรมที่จบแล้ว',
    status: 'จบแล้ว',
    end_date: '2026-10-01',
    project_number_status: null,
    category_template_id: null,
  }
  const fetchMock = vi.fn(async (url) => new Response(
    JSON.stringify(url === '/api/activities/hours-submission' ? [activity] : activity),
    { status: 200 },
  ))
  vi.stubGlobal('fetch', fetchMock)

  try {
    render(
      <App
        authClient={createAuthClient()}
        hoursSubmissionClient={createHoursSubmissionClient({ token: 'test-token' })}
      />,
    )
    login()
    expect(await screen.findByRole('heading', { name: 'เอกสารโครงการ' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'ส่งข้อมูลชั่วโมงกิจกรรม' }))

    expect(await screen.findByRole('option', { name: 'กิจกรรมที่จบแล้ว' })).toBeTruthy()
    expect(await screen.findByText('จบแล้ว')).toBeTruthy()
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/activities/hours-submission',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'test-token' }) }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/activities/7/hours-submission',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'test-token' }) }),
    )
  } finally {
    vi.unstubAllGlobals()
  }
})
