import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { createHoursSubmissionClient } from '../api/client.js'
import HoursSubmission from '../pages/HoursSubmission.jsx'

vi.mock('../utils/alerts.js', () => ({
  confirmAction: vi.fn(async () => true),
}))

import { confirmAction } from '../utils/alerts.js'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

function createFetchForDeadline(deadlineExceeded) {
  return vi.fn(async (url) => {
    const activity = {
      activity_id: 1,
      activity_name: 'กิจกรรมทดสอบ',
      status: 'จบแล้ว',
      end_date: '2026-10-01',
      project_number_status: null,
      category_template_id: null,
      ...(url === '/api/activities/1/hours-submission'
        ? { deadline_exceeded: deadlineExceeded }
        : {}),
    }

    return new Response(
      JSON.stringify(url === '/api/activities/hours-submission' ? [activity] : activity),
      { status: 200 },
    )
  })
}

test('test_AC_SBH_05_show_exception_link_when_deadline_exceeded เสนอ UC-11 เมื่อ deadline ผ่านแล้ว', async () => {
  vi.stubGlobal('fetch', createFetchForDeadline(true))

  render(
    <HoursSubmission
      client={createHoursSubmissionClient({ token: 'test-token' })}
    />,
  )

  expect(
    await screen.findByText('กำหนดส่งของกองกิจผ่านแล้ว'),
  ).toBeTruthy()
  expect(
    screen.getByRole('link', { name: 'ไปที่ UC-11 เพื่อขอผ่อนผันเวลาส่งช้า' }),
  ).toBeTruthy()
  expect(
    screen.getByRole('link', { name: 'ไปที่ UC-11 เพื่อขอผ่อนผันเวลาส่งช้า' }).getAttribute('href'),
  ).toBe('?view=late-submission')
})

test('test_AC_SBH_05_show_exception_link_when_deadline_exceeded ไม่เสนอ UC-11 เมื่อ deadline ยังไม่ผ่าน', async () => {
  vi.stubGlobal('fetch', createFetchForDeadline(false))

  render(
    <HoursSubmission
      client={createHoursSubmissionClient({ token: 'test-token' })}
    />,
  )

  await screen.findByText('กิจกรรมทดสอบ')
  expect(screen.queryByText('กำหนดส่งของกองกิจผ่านแล้ว')).toBeNull()
  expect(screen.queryByRole('link', { name: 'ไปที่ UC-11 เพื่อขอผ่อนผันเวลาส่งช้า' })).toBeNull()
})

test('test_FR_SBH_04_require_completeness_check_before_submit', async () => {
  const client = {
    getFinishedActivities: vi.fn().mockResolvedValue([
      { id: 'activity-1', name: 'กิจกรรมทดสอบ', status: 'จบแล้ว' },
    ]),
    getSubmission: vi.fn().mockResolvedValue({
      id: 'activity-1',
      name: 'กิจกรรมทดสอบ',
      status: 'จบแล้ว',
      projectNumber: 'PROJECT-1',
      projectNumberStatus: 'พร้อมแล้ว',
      preview: { templateId: 'test', templateVersion: '1', rows: [] },
    }),
    submitHours: vi.fn().mockResolvedValue(undefined),
  }

  render(<HoursSubmission client={client} />)

  const checkbox = await screen.findByRole('checkbox', {
    name: 'ตรวจสอบความครบถ้วนของข้อมูลในไฟล์แล้ว',
  })
  expect(
    screen.getByText(
      'หากพบข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน ให้กลับไปแก้ไขไฟล์ต้นทางแล้วส่งฉบับแก้ไขกลับเข้าระบบ โดยไม่แก้ไขข้อมูลในหน้านี้',
    ),
  ).toBeTruthy()
  expect(screen.queryByRole('textbox')).toBeNull()
  const submitButton = screen.getByRole('button', { name: 'ยืนยันส่งข้อมูล' })

  expect(submitButton.disabled).toBe(true)
  fireEvent.click(submitButton)
  expect(confirmAction).not.toHaveBeenCalled()
  expect(client.submitHours).not.toHaveBeenCalled()

  fireEvent.click(checkbox)
  expect(submitButton.disabled).toBe(false)
  fireEvent.click(submitButton)

  await waitFor(() => expect(client.submitHours).toHaveBeenCalledWith('activity-1'))
})
