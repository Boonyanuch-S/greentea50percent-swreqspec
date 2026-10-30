import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import DocumentReviewPage from '../pages/DocumentReviewPage.jsx'

const { approveSubmission } = vi.hoisted(() => ({
  approveSubmission: vi.fn(),
}))

vi.mock('../api/client.js', () => ({
  approvalApi: { approveSubmission },
}))

test('test_approval_action_displays_result เจ้าหน้าที่เห็นสถานะผลอนุมัติจาก API', async () => {
  // Given เจ้าหน้าที่ที่ Login แล้วเปิดรายละเอียดเอกสารโครงการ
  const session = {
    token: 'faculty-token',
    role: 'faculty_officer',
    profile: { username: 'faculty@example.test' },
  }
  const client = {
    getSubmission: async () => ({
      submission_id: 501,
      project_name: 'โครงการทดสอบการอนุมัติ',
      project_owner: 'สโมสรนักศึกษาคณะวิทยาศาสตร์',
      submitted_at: '2026-10-30T09:00:00+07:00',
      status: 'รอตรวจสอบ',
      summary: 'รายละเอียดโครงการ',
      document: {
        name: 'เอกสารโครงการ.txt',
        format: 'ข้อความจำลอง',
        content: 'เนื้อหาสำหรับตรวจ',
      },
    }),
    getSubmissionChecklist: async () => [],
    updateSubmissionChecklist: async (_submissionId, items) => items,
  }
  approveSubmission.mockResolvedValue({
    status: 'ส่งต่ออาจารย์',
    handoff: { target_use_case: 'UC-05', status: 'queued' },
  })
  render(
    <DocumentReviewPage
      client={client}
      session={session}
      submissionId={501}
      onBack={() => {}}
    />,
  )

  // When เจ้าหน้าที่อนุมัติเอกสารจากหน้ารายละเอียด
  fireEvent.click(await screen.findByRole('button', { name: 'อนุมัติและส่งต่อให้อาจารย์' }))

  // Then หน้าจอแสดงสถานะจาก API และสถานะเอกสารที่อัปเดตแล้ว
  expect(await screen.findByText('สถานะการอนุมัติ: ส่งต่ออาจารย์')).toBeTruthy()
  expect(screen.getByText('ส่งต่อไปยัง: UC-05')).toBeTruthy()
  expect(approveSubmission).toHaveBeenCalledWith(
    501,
    'faculty@example.test',
    session,
  )
  expect(screen.getByText('ส่งต่ออาจารย์')).toBeTruthy()
})
