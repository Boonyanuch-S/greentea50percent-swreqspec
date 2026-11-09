import { render, screen } from '@testing-library/react'
import ActivityHoursQueue from '../pages/ActivityHoursQueue.jsx'

test('test_AC_HRS_03_empty_pending_queue_shows_empty_state', async () => {
  // Given ไม่มีเอกสารใบสรุปชั่วโมงกิจกรรมอยู่ในสถานะรอตรวจสอบ
  const client = {
    getPendingDocuments: async () => [],
  }

  // When เจ้าหน้าที่เปิดคิวเอกสารรอตรวจสอบ
  render(
    <ActivityHoursQueue client={client} onSelectDocument={() => {}} />,
  )

  // Then ระบบแสดง empty state โดยไม่กำหนดข้อความเฉพาะ
  const visibleEmptyStateText = await screen.findByText(
    (_, element) => element?.tagName === 'P'
      && element.textContent.trim().length > 0
      && element.closest('.card') !== null,
  )
  expect(visibleEmptyStateText.textContent.trim()).not.toBe('')
  expect(screen.queryByRole('list', { name: 'รายการเอกสารรอตรวจสอบ' })).toBeNull()
})
