import { render, screen, within } from '@testing-library/react'
import ActivityHoursQueue from '../pages/ActivityHoursQueue.jsx'

test('test_TC_HRS_03_2_single_pending_document', async () => {
  // Given มีเอกสารใบสรุปชั่วโมงกิจกรรมรอตรวจสอบเพียงฉบับเดียว
  const client = {
    getPendingDocuments: async () => [{
      documentId: 'hrs-only',
      activityName: 'กิจกรรมที่รอตรวจ',
      submittedAt: '2026-09-18T09:00:00+07:00',
      status: 'รอตรวจสอบ',
    }],
  }

  // When เจ้าหน้าที่เปิดคิวเอกสารรอตรวจสอบ
  render(<ActivityHoursQueue client={client} onSelectDocument={() => {}} />)

  // Then ระบบแสดงเอกสารที่รอตรวจสอบในลิสต์ และแสดงเอกสารฉบับนั้นพร้อมสถานะ "รอตรวจสอบ" (FR-HRS-01)
  const queue = await screen.findByRole('list', { name: 'รายการเอกสารรอตรวจสอบ' })
  const items = within(queue).getAllByRole('listitem')
  expect(items).toHaveLength(1)
  expect(within(items[0]).getByText('กิจกรรมที่รอตรวจ')).toBeTruthy()
  expect(within(items[0]).getByText('รอตรวจสอบ')).toBeTruthy()
})
