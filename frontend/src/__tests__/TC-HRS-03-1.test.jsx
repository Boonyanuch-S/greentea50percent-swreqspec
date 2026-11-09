import { render, screen, within } from '@testing-library/react'
import ActivityHoursQueue from '../pages/ActivityHoursQueue.jsx'

test('test_TC_HRS_03_1_pending_documents_sorted_by_submitted_date', async () => {
  // Given มีเอกสารใบสรุปชั่วโมงกิจกรรมหลายฉบับรอตรวจสอบ โดยแต่ละฉบับมีวันที่ส่งต่างกัน
  const client = {
    getPendingDocuments: async () => [
      {
        documentId: 'hrs-oldest',
        activityName: 'กิจกรรมวันแรก',
        submittedAt: '2026-09-18T09:00:00+07:00',
        status: 'รอตรวจสอบ',
      },
      {
        documentId: 'hrs-middle',
        activityName: 'กิจกรรมวันที่สอง',
        submittedAt: '2026-09-20T13:30:00+07:00',
        status: 'รอตรวจสอบ',
      },
      {
        documentId: 'hrs-newest',
        activityName: 'กิจกรรมวันสุดท้าย',
        submittedAt: '2026-09-22T10:15:00+07:00',
        status: 'รอตรวจสอบ',
      },
    ],
  }

  // When เจ้าหน้าที่เปิดคิวเอกสารรอตรวจสอบ
  render(<ActivityHoursQueue client={client} onSelectDocument={() => {}} />)

  // Then ระบบแสดงลิสต์เอกสารเรียงตามวันที่ส่งก่อน-หลัง (FR-HRS-01)
  const queue = await screen.findByRole('list', { name: 'รายการเอกสารรอตรวจสอบ' })
  const items = within(queue).getAllByRole('listitem')
  expect(items).toHaveLength(3)
  expect(items.map((item) => item.textContent)).toEqual([
    expect.stringContaining('กิจกรรมวันแรก'),
    expect.stringContaining('กิจกรรมวันที่สอง'),
    expect.stringContaining('กิจกรรมวันสุดท้าย'),
  ])
})
