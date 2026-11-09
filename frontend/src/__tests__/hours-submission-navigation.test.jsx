import { act, fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import App from '../App.jsx'
import { createHoursSubmissionClient } from '../api/client.js'
import HoursSubmission from '../pages/HoursSubmission.jsx'

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
  expect(screen.queryByRole('link', { name: 'ไปที่ UC-11 เพื่อขอผ่อนผันเวลาส่งช้า' })).toBeNull()

  fireEvent.click(screen.getByRole('button', { name: 'เอกสารโครงการ' }))
  expect(await screen.findByRole('heading', { name: 'เอกสารโครงการ' })).toBeTruthy()
})

test('AC-SBH-05 กรรมการไปที่ UC-11 ได้เมื่อเกินกำหนดส่ง', async () => {
  const hoursSubmissionClient = {
    getFinishedActivities: async () => [
      { id: 'activity-1', name: 'กิจกรรมเลยกำหนด', status: 'จบแล้ว' },
    ],
    getSubmission: async () => ({
      id: 'activity-1',
      name: 'กิจกรรมเลยกำหนด',
      status: 'จบแล้ว',
      projectNumberStatus: 'พร้อมแล้ว',
      projectNumber: 'PROJECT-1',
      deadlineExceeded: true,
      preview: { templateId: 'test', templateVersion: '1', rows: [] },
    }),
  }

  render(
    <App
      authClient={createAuthClient()}
      hoursSubmissionClient={hoursSubmissionClient}
      projectDocumentClient={{ listMyProjects: async () => [] }}
    />,
  )

  login()
  fireEvent.click(await screen.findByRole('button', { name: 'ส่งข้อมูลชั่วโมงกิจกรรม' }))
  fireEvent.click(await screen.findByRole('link', { name: 'ไปที่ UC-11 เพื่อขอผ่อนผันเวลาส่งช้า' }))

  expect(await screen.findByRole('heading', { name: 'ขอบันทึกชั่วโมงย้อนหลัง' })).toBeTruthy()
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
        projectDocumentClient={{ listMyProjects: async () => [] }}
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

function createHoursSubmissionTestClient(activities) {
  return {
    getFinishedActivities: vi.fn().mockResolvedValue(activities),
    getSubmission: vi.fn(async (activityId) =>
      activities.find((activity) => activity.id === activityId)),
  }
}

function activity(id, name, status) {
  return { id: String(id), name, status }
}

test('test_TC_SBH_03_1_mixed_activity_statuses', async () => {
  // Given มีกิจกรรมที่ยังไม่จบและกิจกรรมที่จบแล้วปะปนกัน
  const finished = activity(1, 'กิจกรรมที่จบแล้ว', 'จบแล้ว')
  const unfinished = activity(2, 'กิจกรรมที่ยังไม่จบ', 'กำลังดำเนินการ')
  const client = createHoursSubmissionTestClient([finished])

  // When กรรมการพยายามเปิดหน้าส่งข้อมูลชั่วโมงของกิจกรรมแต่ละรายการ
  render(<HoursSubmission client={client} />)

  // Then ระบบอนุญาตให้เปิดได้เฉพาะกิจกรรมที่มีสถานะ "จบแล้ว"; กิจกรรมที่ยังไม่จบเปิดหน้าไม่ได้
  expect(await screen.findByRole('option', { name: finished.name })).toBeTruthy()
  expect(screen.queryByRole('option', { name: unfinished.name })).toBeNull()
  expect(client.getSubmission).toHaveBeenCalledWith(finished.id)
  expect(client.getSubmission).not.toHaveBeenCalledWith(unfinished.id)
})

test('test_TC_SBH_03_2_status_boundary', async () => {
  // Given มีกิจกรรมสถานะ "จบแล้ว" ซึ่งเป็นสถานะที่อนุญาต และกิจกรรมสถานะ "ยังไม่จบ" ซึ่งเป็นสถานะที่ไม่อนุญาต
  const finished = activity(3, 'กิจกรรมจบแล้ว', 'จบแล้ว')
  const unfinished = activity(4, 'กิจกรรมยังไม่จบ', 'กำลังดำเนินการ')
  const client = createHoursSubmissionTestClient([finished])

  // When กรรมการพยายามเปิดหน้าส่งข้อมูลชั่วโมงของกิจกรรมแต่ละรายการ
  render(<HoursSubmission client={client} />)

  // Then ระบบอนุญาตให้เปิดกิจกรรมที่มีสถานะ "จบแล้ว" เท่านั้น; ระบบไม่อนุญาตให้เปิดกิจกรรมที่ยังไม่จบ
  expect(await screen.findByRole('option', { name: finished.name })).toBeTruthy()
  expect(screen.queryByRole('option', { name: unfinished.name })).toBeNull()
  expect(client.getSubmission).toHaveBeenCalledWith(finished.id)
  expect(client.getSubmission).not.toHaveBeenCalledWith(unfinished.id)
})

test('test_TC_SBH_03_3_no_finished_activity', async () => {
  // Given มีกิจกรรมที่ยังไม่จบ แต่ไม่มีรายการกิจกรรมที่มีสถานะ "จบแล้ว"
  const client = createHoursSubmissionTestClient([])

  // When กรรมการพยายามเปิดหน้าส่งข้อมูลชั่วโมง
  render(<HoursSubmission client={client} />)

  // Then ไม่มีรายการกิจกรรมที่เปิดหน้าส่งข้อมูลชั่วโมงได้ เพราะระบบอนุญาตเฉพาะกิจกรรมที่มีสถานะ "จบแล้ว"
  expect(await screen.findByRole('heading', { name: 'ส่งข้อมูลชั่วโมงกิจกรรม' })).toBeTruthy()
  expect(screen.queryByRole('combobox', { name: 'เลือกกิจกรรมที่จบแล้ว' })).toBeNull()
  expect(client.getSubmission).not.toHaveBeenCalled()
})

test('test_TC_SBH_03_4_only_finished_activities', async () => {
  // Given มีกิจกรรมที่จบแล้วทั้งหมด ไม่มีรายการกิจกรรมที่ยังไม่จบ
  const firstFinished = activity(5, 'กิจกรรมจบแล้วรายการแรก', 'จบแล้ว')
  const secondFinished = activity(6, 'กิจกรรมจบแล้วรายการที่สอง', 'จบแล้ว')
  const client = createHoursSubmissionTestClient([firstFinished, secondFinished])

  // When กรรมการพยายามเปิดหน้าส่งข้อมูลชั่วโมงของแต่ละรายการ
  render(<HoursSubmission client={client} />)

  // Then กิจกรรมที่มีสถานะ "จบแล้ว" เปิดหน้าส่งข้อมูลชั่วโมงได้
  const selector = await screen.findByRole('combobox', { name: 'เลือกกิจกรรมที่จบแล้ว' })
  expect(screen.getByRole('option', { name: firstFinished.name })).toBeTruthy()
  expect(screen.getByRole('option', { name: secondFinished.name })).toBeTruthy()
  expect(client.getSubmission).toHaveBeenCalledWith(firstFinished.id)

  await act(async () => {
    fireEvent.change(selector, { target: { value: secondFinished.id } })
    await vi.waitFor(() => {
      expect(client.getSubmission).toHaveBeenCalledWith(secondFinished.id)
    })
  })
})
