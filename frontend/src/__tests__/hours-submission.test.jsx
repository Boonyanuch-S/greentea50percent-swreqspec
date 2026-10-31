import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { createHoursSubmissionClient } from '../api/client.js'
import HoursSubmission from '../pages/HoursSubmission.jsx'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
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
    screen.getByText('สามารถไปที่ UC-11 เพื่อขอผ่อนผันเวลาส่งช้า'),
  ).toBeTruthy()
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
})
