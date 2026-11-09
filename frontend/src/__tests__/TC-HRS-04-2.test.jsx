import { fireEvent, render, screen, within } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import ActivityHoursReview from '../pages/ActivityHoursReview.jsx'

test('test_TC_HRS_04_2_display_single_participant_and_hour_type', async () => {
  // Given เจ้าหน้าที่เข้าสู่ระบบแล้วเลือกไฟล์ Excel ที่มีผู้เข้าร่วมหนึ่งรายและประเภทชั่วโมงหนึ่งรายการ
  const participants = [
    {
      student_reference: 'S-103',
      participant_name: 'Participant Single',
      reported_hour_type: 'Volunteer',
      reported_hours: '1',
    },
  ]
  const client = {
    getDocumentParticipants: vi.fn(async () => participants),
    getDocumentValidationResult: vi.fn(async () => ({
      document_status: 'รอตรวจสอบ',
      invalid_items: [],
    })),
  }
  render(<ActivityHoursReview client={client} documentId={43} />)

  // When ระบบเปิดไฟล์นั้นและเจ้าหน้าที่เปิดแท็บรายชื่อผู้เข้าร่วม
  fireEvent.click(await screen.findByRole('tab', { name: 'รายชื่อผู้เข้าร่วม' }))
  const table = await screen.findByRole('table', {
    name: 'รายชื่อผู้เข้าร่วมและประเภทชั่วโมง',
  })

  // Then ระบบแสดงรายชื่อผู้เข้าร่วมรายนั้นพร้อมประเภทชั่วโมงที่แจ้งไว้ครบรายการ
  const rows = within(table).getAllByRole('row')
  expect(rows).toHaveLength(2)
  expect(within(rows[1]).getByText('Participant Single')).toBeTruthy()
  expect(within(rows[1]).getByText('Volunteer')).toBeTruthy()
})
