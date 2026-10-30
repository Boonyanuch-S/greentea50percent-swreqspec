import { render, screen, within } from '@testing-library/react'
import ReviewQueuePage from '../pages/ReviewQueuePage.jsx'
import { reviewQueueMock } from '../services/reviewQueue.js'

test('test_AC_VDC_03_queue_sorted_by_submission_date แสดงคิวตามวันที่ส่งก่อน-หลัง', async () => {
  // Given มีเอกสารรอตรวจหลายฉบับ และ client คืนรายการเรียงตามวันที่ส่ง
  render(<ReviewQueuePage client={reviewQueueMock} />)

  // When เจ้าหน้าที่เปิดคิวเอกสาร
  const queue = await screen.findByRole('list', { name: 'รายการเอกสารรอตรวจ' })

  // Then รายการที่แสดงเรียงจากวันที่ส่งเก่าก่อนไปใหม่
  const projectNames = within(queue)
    .getAllByRole('heading', { level: 2 })
    .map((heading) => heading.textContent)

  expect(projectNames).toEqual([
    'โครงการค่ายอาสาพัฒนาชุมชน',
    'โครงการอบรมทักษะการสื่อสาร',
    'โครงการปฐมนิเทศสมาชิกใหม่',
  ])
  expect(screen.queryByRole('heading', { name: 'เอกสารที่เลือก' })).toBeNull()
})
