import { fireEvent, render, screen, within } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import ActivityHoursReview from '../pages/ActivityHoursReview.jsx'

test('test_TC_HRS_04_1_display_all_participants_and_hour_types', async () => {
  // Given เจ้าหน้าที่เข้าสู่ระบบแล้วเลือกไฟล์ Excel ที่มีผู้เข้าร่วมหลายรายและประเภทชั่วโมงทุกแถว
  const participants = [
    {
      student_reference: 'S-101',
      participant_name: 'Participant One',
      reported_hour_type: 'Volunteer',
      reported_hours: '2',
    },
    {
      student_reference: 'S-102',
      participant_name: 'Participant Two',
      reported_hour_type: 'Education',
      reported_hours: '3',
    },
  ]
  const client = {
    getDocumentParticipants: vi.fn(async () => participants),
    getDocumentValidationResult: vi.fn(async () => ({
      document_status: 'รอตรวจสอบ',
      invalid_items: [],
    })),
  }
  render(<ActivityHoursReview client={client} documentId={42} />)

  // When ระบบเปิดไฟล์นั้นและเจ้าหน้าที่เปิดแท็บรายชื่อผู้เข้าร่วม
  fireEvent.click(await screen.findByRole('tab', { name: 'รายชื่อผู้เข้าร่วม' }))
  const table = await screen.findByRole('table', {
    name: 'รายชื่อผู้เข้าร่วมและประเภทชั่วโมง',
  })

  // Then ระบบแสดงรายชื่อผู้เข้าร่วมพร้อมประเภทชั่วโมงที่แจ้งไว้ครบทุกแถว
  const rows = within(table).getAllByRole('row')
  expect(rows).toHaveLength(3)
  expect(within(rows[1]).getByText('Participant One')).toBeTruthy()
  expect(within(rows[1]).getByText('Volunteer')).toBeTruthy()
  expect(within(rows[2]).getByText('Participant Two')).toBeTruthy()
  expect(within(rows[2]).getByText('Education')).toBeTruthy()
})
