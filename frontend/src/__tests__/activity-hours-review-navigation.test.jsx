import { fireEvent, render, screen, within } from '@testing-library/react'
import { vi } from 'vitest'
import App from '../App.jsx'
import { createActivityHoursClient } from '../services/activityHoursClient.js'
import { projectApprovalMock } from '../services/projectApprovalMock.js'

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

function loginAsStudentAffairsOfficer() {
  fireEvent.change(screen.getByLabelText('บัญชีผู้ใช้'), {
    target: { value: 'staff@test.edu' },
  })
  fireEvent.change(screen.getByLabelText('รหัสผ่าน'), {
    target: { value: 'password' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }))
}

test('test_AC_HRS_04_display_all_excel_participants_and_hour_types เปิดหน้ารายชื่อจากเมนูเจ้าหน้าที่กองกิจ', async () => {
  // Given เจ้าหน้าที่กองกิจเข้าสู่ระบบและเห็นหน้าตรวจเอกสารเดิม
  render(<App authClient={createAuthClient()} />)
  loginAsStudentAffairsOfficer()

  expect(await screen.findByRole('heading', { name: 'ตรวจเอกสารโครงการ' })).toBeTruthy()

  // When เจ้าหน้าที่เลือกเมนูตรวจสอบชั่วโมงกิจกรรม
  fireEvent.click(
    screen.getByRole('button', { name: 'ตรวจสอบชั่วโมงกิจกรรม' }),
  )

  // Then ระบบเปิดคิวเอกสารชั่วโมงที่รอตรวจ
  expect(await screen.findByRole('heading', { name: 'คิวตรวจสอบชั่วโมงกิจกรรม' })).toBeTruthy()
  expect(screen.getByText(/ส่งเมื่อ 18 ก\.ย\. 2569/)).toBeTruthy()
  expect(screen.queryByText(/3112/)).toBeNull()
  const documentButtons = await screen.findAllByRole('button', { name: 'ตรวจสอบเอกสาร' })
  fireEvent.click(documentButtons[0])

  // Then แสดงข้อมูลเอกสารก่อน และมีแท็บแยกสำหรับรายชื่อ
  const documentPanel = await screen.findByRole('tabpanel', { name: 'ข้อมูลเอกสาร' })
  expect(within(documentPanel).getByText('hrs-002')).toBeTruthy()
  expect(within(documentPanel).getByText('ค่ายอาสาพัฒนาชุมชน')).toBeTruthy()
  fireEvent.click(screen.getByRole('tab', { name: 'รายชื่อผู้เข้าร่วม' }))

  // And เมื่อเปิดแท็บรายชื่อ แสดงผู้เข้าร่วมและประเภทชั่วโมงครบตาม AC-HRS-04
  const table = await screen.findByRole('table', {
    name: 'รายชื่อผู้เข้าร่วมและประเภทชั่วโมง',
  })
  expect(screen.queryByText('ข้อมูลตัวอย่าง')).toBeNull()
  const rows = within(table).getAllByRole('row')

  expect(rows).toHaveLength(3)
  expect(within(rows[1]).getByText('Participant One')).toBeTruthy()
  expect(within(rows[1]).getByText('จิตอาสา')).toBeTruthy()
  expect(within(rows[2]).getByText('Participant Two')).toBeTruthy()
  expect(within(rows[2]).getByText('การศึกษา')).toBeTruthy()

  // When เจ้าหน้าที่กลับไปเลือกหน้าตรวจเอกสารโครงการ
  fireEvent.click(screen.getByRole('button', { name: 'ตรวจเอกสารโครงการ' }))

  // Then หน้าเดิมยังเปิดได้ตามเดิม
  expect(await screen.findByRole('heading', { name: 'ตรวจเอกสารโครงการ' })).toBeTruthy()
})

test('เจ้าหน้าที่ใช้ API ชั่วโมงจริงพร้อม token ตรวจสอบและเรียก UC-04', async () => {
  const responses = new Map([
    ['GET /api/activity-hours/documents/pending', [{
      document_id: 41,
      activity_id: 1,
      source_file_reference: 'hours.xlsx',
      submitted_at: '2026-10-20T10:00:00Z',
      status: 'รอตรวจสอบ',
    }]],
    ['GET /api/activity-hours/documents/41/participants', [{
      student_reference: 'S-001',
      participant_name: 'Participant One',
      reported_hour_type: 'จิตอาสา',
      reported_hours: '2.50',
    }]],
    ['POST /api/activity-hours/documents/41/validate', {
      document_id: 41,
      academic_year: 'AY-2569-S1',
      status: 'รอตรวจสอบ',
      invalid_items: [],
    }],
    ['GET /api/activity-hours/documents/41/individual-summary', {
      summary_reference: 'UC-04 response',
    }],
    ['POST /api/activity-hours/documents/41/approve', {
      document_id: 41,
      status: 'บันทึกชั่วโมงสำเร็จ',
      submission_id: 1,
      response_status: 'success',
      notification_status: 'queued',
    }],
  ])
  const fetchMock = vi.fn(async (url, options = {}) => {
    const requestUrl = new URL(url, window.location.origin)
    const method = options.method ?? 'GET'
    const body = responses.get(`${method} ${requestUrl.pathname}`)
    if (body === undefined) {
      throw new Error(`ไม่พบ response จำลองสำหรับ ${method} ${requestUrl.pathname}`)
    }
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify(body),
    }
  })

  vi.stubGlobal('fetch', fetchMock)

  try {
    render(
      <App
        authClient={createAuthClient()}
        approvalClient={projectApprovalMock}
        activityHoursClient={createActivityHoursClient({ token: 'test-student-affairs-token' })}
      />,
    )
    loginAsStudentAffairsOfficer()
    fireEvent.click(await screen.findByRole('button', { name: 'ตรวจสอบชั่วโมงกิจกรรม' }))
    fireEvent.click(await screen.findByRole('button', { name: 'ตรวจสอบเอกสาร' }))

    const documentPanel = await screen.findByRole('tabpanel', { name: 'ข้อมูลเอกสาร' })
    expect(within(documentPanel).getByText('41')).toBeTruthy()
    expect(within(documentPanel).getByText('hours.xlsx')).toBeTruthy()
    fireEvent.click(screen.getByRole('tab', { name: 'รายชื่อผู้เข้าร่วม' }))
    const table = await screen.findByRole('table', {
      name: 'รายชื่อผู้เข้าร่วมและประเภทชั่วโมง',
    })
    fireEvent.click(within(table).getByRole('button', {
      name: 'ดูสรุป UC-04 ของ Participant One',
    }))
    const summary = await screen.findByRole('region', { name: 'สรุปข้อมูลจาก UC-04' })
    expect(within(summary).getByText(/UC-04 response/)).toBeTruthy()
    fireEvent.click(screen.getByRole('tab', { name: 'ข้อมูลเอกสาร' }))
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันอนุมัติ' }))

    expect(await screen.findByText('บันทึกชั่วโมงสำเร็จ และส่งคำขอแจ้งยืนยันแล้ว')).toBeTruthy()
    expect(fetchMock).toHaveBeenCalledTimes(5)
    for (const [, options] of fetchMock.mock.calls) {
      expect(options.headers.Authorization).toBe('test-student-affairs-token')
    }
  } finally {
    vi.unstubAllGlobals()
  }
})

test('อนุญาตส่งซ้ำด้วยตนเองได้ครั้งเดียวเมื่อ REG ไม่ตอบสนอง', async () => {
  const responses = new Map([
    ['GET /api/activity-hours/documents/pending', [{
      document_id: 41,
      submitted_at: '2026-10-20T10:00:00Z',
      status: 'รอตรวจสอบ',
    }]],
    ['GET /api/activity-hours/documents/41/participants', [{
      student_reference: 'S-001',
      participant_name: 'Participant One',
      reported_hour_type: 'จิตอาสา',
      reported_hours: '2.50',
    }]],
    ['POST /api/activity-hours/documents/41/validate', {
      status: 'รอตรวจสอบ',
      invalid_items: [],
    }],
    ['POST /api/activity-hours/documents/41/approve', {
      httpStatus: 502,
      body: { detail: 'ส่งข้อมูลไม่สำเร็จ' },
    }],
    ['POST /api/activity-hours/documents/41/reg-retry', {
      httpStatus: 502,
      body: { detail: 'ส่งข้อมูลไม่สำเร็จ' },
    }],
  ])
  const fetchMock = vi.fn(async (url, options = {}) => {
    const requestUrl = new URL(url, window.location.origin)
    const method = options.method ?? 'GET'
    const response = responses.get(`${method} ${requestUrl.pathname}`)
    if (response === undefined) {
      throw new Error(`ไม่พบ response จำลองสำหรับ ${method} ${requestUrl.pathname}`)
    }
    const status = response.httpStatus ?? 200
    const body = response.body ?? response
    return {
      ok: status < 400,
      status,
      text: async () => JSON.stringify(body),
    }
  })
  vi.stubGlobal('fetch', fetchMock)

  try {
    render(
      <App
        authClient={createAuthClient()}
        approvalClient={projectApprovalMock}
        activityHoursClient={createActivityHoursClient({ token: 'test-student-affairs-token' })}
      />,
    )
    loginAsStudentAffairsOfficer()
    fireEvent.click(await screen.findByRole('button', { name: 'ตรวจสอบชั่วโมงกิจกรรม' }))
    fireEvent.click(await screen.findByRole('button', { name: 'ตรวจสอบเอกสาร' }))
    fireEvent.click(await screen.findByRole('tab', { name: 'รายชื่อผู้เข้าร่วม' }))
    await screen.findByRole('table', { name: 'รายชื่อผู้เข้าร่วมและประเภทชั่วโมง' })
    fireEvent.click(screen.getByRole('tab', { name: 'ข้อมูลเอกสาร' }))
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันอนุมัติ' }))

    expect((await screen.findByRole('alert')).textContent).toContain('ส่งข้อมูลไม่สำเร็จ')
    fireEvent.click(screen.getByRole('button', { name: 'ลองส่งซ้ำ' }))
    expect((await screen.findByRole('alert')).textContent).toContain('ส่งข้อมูลไม่สำเร็จ')
    expect(screen.queryByRole('button', { name: 'ลองส่งซ้ำ' })).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(5)
  } finally {
    vi.unstubAllGlobals()
  }
})
