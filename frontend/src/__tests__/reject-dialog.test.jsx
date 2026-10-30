import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import RejectDialog from '../components/RejectDialog.jsx'

const { rejectSubmission } = vi.hoisted(() => ({
  rejectSubmission: vi.fn(),
}))

vi.mock('../api/client.js', () => ({
  rejectionApi: { rejectSubmission },
}))

test('test_reject_dialog_requires_reason_and_displays_result เจ้าหน้าที่ต้องระบุเหตุผลและเห็นผลตีกลับ', async () => {
  // Given เจ้าหน้าที่ที่ Login แล้วเปิดการยืนยันตีกลับ
  const session = {
    token: 'faculty-token',
    role: 'faculty_officer',
    profile: { username: 'faculty@example.test' },
  }
  const onRejected = vi.fn()
  const reason = 'เอกสารแนบไม่ครบตามรายการที่ตรวจ'
  rejectSubmission.mockResolvedValue({
    status: 'ตีกลับให้แก้ไข',
    reason_text: reason,
    notification: { target_use_case: 'UC-01', status: 'queued' },
  })
  render(
    <RejectDialog
      submissionId={517}
      reviewerUserId={session.profile.username}
      session={session}
      onRejected={onRejected}
    />,
  )

  // When เจ้าหน้าที่เปิด dialog โดยยังไม่ได้ระบุเหตุผล
  fireEvent.click(screen.getByRole('button', { name: 'ตีกลับเอกสาร' }))
  const confirmButton = screen.getByRole('button', { name: 'ยืนยันตีกลับ' })

  // Then ระบบไม่อนุญาตให้ยืนยันจนกว่าจะระบุเหตุผล
  expect(confirmButton.disabled).toBe(true)
  expect(rejectSubmission).not.toHaveBeenCalled()

  // When เจ้าหน้าที่ระบุเหตุผลและยืนยันตีกลับ
  fireEvent.change(screen.getByLabelText('เหตุผลในการตีกลับ'), {
    target: { value: reason },
  })
  fireEvent.click(confirmButton)

  // Then แสดงสถานะและเหตุผลจาก API พร้อม callback อัปเดตหน้ารายละเอียด
  expect(await screen.findByText('สถานะการตีกลับ: ตีกลับให้แก้ไข')).toBeTruthy()
  expect(screen.getByText(`เหตุผล: ${reason}`)).toBeTruthy()
  expect(rejectSubmission).toHaveBeenCalledWith(
    517,
    'faculty@example.test',
    reason,
    session,
  )
  expect(onRejected).toHaveBeenCalledWith({
    status: 'ตีกลับให้แก้ไข',
    reason_text: reason,
    notification: { target_use_case: 'UC-01', status: 'queued' },
  })
})

test('test_AC_VDC_02_reject_sends_reason_to_member ตีกลับเอกสารและส่งเหตุผลเข้า UC-01', async () => {
  // Given เอกสารไม่ครบตาม Checklist และเจ้าหน้าที่ Login แล้ว
  const reason = 'ยังขาดเอกสารประกอบโครงการ'
  rejectSubmission.mockReset()
  rejectSubmission.mockResolvedValue({
    status: 'ตีกลับให้แก้ไข',
    reason_text: reason,
    notification: { target_use_case: 'UC-01', status: 'queued' },
  })
  render(
    <RejectDialog
      submissionId={502}
      reviewerUserId="faculty@example.test"
      session={{ token: 'faculty-token' }}
    />,
  )

  // When เจ้าหน้าที่ระบุเหตุผลและยืนยันตีกลับ
  fireEvent.click(screen.getByRole('button', { name: 'ตีกลับเอกสาร' }))
  fireEvent.change(screen.getByLabelText('เหตุผลในการตีกลับ'), {
    target: { value: reason },
  })
  fireEvent.click(screen.getByRole('button', { name: 'ยืนยันตีกลับ' }))

  // Then ระบบแสดงสถานะตีกลับและเหตุผลที่ส่งเข้าคิวจำลอง UC-01
  expect(await screen.findByText('สถานะการตีกลับ: ตีกลับให้แก้ไข')).toBeTruthy()
  expect(screen.getByText(`เหตุผล: ${reason}`)).toBeTruthy()
  expect(rejectSubmission).toHaveBeenCalledWith(
    502,
    'faculty@example.test',
    reason,
    { token: 'faculty-token' },
  )
})
