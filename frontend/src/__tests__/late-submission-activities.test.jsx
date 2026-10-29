import { render, screen } from '@testing-library/react'
import { lateSubmissionMock } from '../services/lateSubmissionMock.js'
import LateSubmissionPage from '../pages/LateSubmissionPage.jsx'

test('test_AC_LATE_03_list_all_late_activities แสดงกิจกรรมที่เลยกำหนดทั้งหมด', async () => {
  render(<LateSubmissionPage client={lateSubmissionMock} />)

  expect(await screen.findByText('ค่ายอาสาพัฒนาชุมชน')).toBeTruthy()
  expect(screen.getByText('อบรมทักษะการสื่อสาร')).toBeTruthy()
  expect(screen.getAllByText('เลยกำหนดปกติ')).toHaveLength(2)
})
