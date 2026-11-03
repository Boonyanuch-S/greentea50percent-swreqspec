import { render, screen } from '@testing-library/react'
import ReviewQueuePage from '../pages/ReviewQueuePage.jsx'
import { urgencyLabel, urgentFirst } from '../utils/urgency.js'

const NOW = new Date('2026-11-02T09:00:00+07:00')

test('งานที่เหลือเวลาไม่เกิน 30 วันเป็นงานด่วน', () => {
  expect(urgencyLabel('2026-11-20', NOW)).toBe('ด่วน: จัดกิจกรรมในอีก 18 วัน')
  expect(urgencyLabel('2027-01-15', NOW)).toBeNull()
  expect(urgencyLabel(null, NOW)).toBeNull()
})

test('ดึงงานด่วนขึ้นก่อนโดยคงลำดับเดิมในแต่ละกลุ่ม', () => {
  const soon = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10)
  const later = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10)
  const items = [{ id: 1, date: later }, { id: 2, date: soon }, { id: 3, date: later }, { id: 4, date: soon }]
  expect(urgentFirst(items, (item) => item.date).map((item) => item.id)).toEqual([2, 4, 1, 3])
})

test('คิวเจ้าหน้าที่คณะแสดงงานด่วนก่อน', async () => {
  const soon = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10)
  const base = { project_owner: 'สโมสร', status: 'รอตรวจสอบ', submitted_at: '2026-10-01T09:00:00+07:00' }
  const client = {
    getReviewQueue: async () => [
      { ...base, submission_id: 1, project_name: 'โครงการส่งก่อน' },
      { ...base, submission_id: 2, project_name: 'โครงการใกล้จัด', activity_date: soon },
    ],
  }
  render(<ReviewQueuePage client={client} />)

  const headings = await screen.findAllByRole('heading', { level: 2 })
  expect(headings.map((heading) => heading.textContent)).toEqual(['โครงการใกล้จัด', 'โครงการส่งก่อน'])
  expect(screen.getByText(/^ด่วน: จัดกิจกรรมในอีก/)).toBeTruthy()
})
