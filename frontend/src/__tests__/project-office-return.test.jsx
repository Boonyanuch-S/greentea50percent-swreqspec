import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import ProjectOfficeReviewPanel from '../pages/ProjectOfficeReviewPanel.jsx'
import { confirmAction } from '../utils/alerts.js'

vi.mock('../utils/alerts.js', () => ({ confirmAction: vi.fn(async () => true) }))

test('test_AC_APR_04_return_full_document_with_comment กองกิจตีกลับพร้อมคอมเมนต์', async () => {
  // Given กองกิจตรวจสอบเอกสารแล้วไม่เห็นด้วย
  const client = {
    getApproval: async () => ({
      status: 'รออนุมัติ',
      coverSheet: { fileName: 'cover.pdf' },
      documents: [{ id: 'project-book', type: 'เล่มโครงการ', title: 'เล่มโครงการตัวอย่าง', reference: 'book.pdf' }],
    }),
    returnDocuments: vi.fn(async () => ({ status: 'ตีกลับให้แก้ไข', target_use_case: 'UC-01' })),
  }
  render(<ProjectOfficeReviewPanel client={client} />)
  const comment = await screen.findByLabelText('คอมเมนต์รายละเอียดที่ต้องแก้ไข')
  const submit = screen.getByRole('button', { name: 'ตีกลับเอกสารทั้งชุด' })
  expect(submit.disabled).toBe(true)

  // When กองกิจกดตีกลับและกรอกคอมเมนต์รายละเอียดที่ต้องแก้ไข
  fireEvent.change(comment, { target: { value: 'แก้ตัวชี้วัด' } })
  fireEvent.click(submit)

  // Then ระบบส่งคอมเมนต์ครบถ้วนและแสดงสถานะหลังตีกลับ
  expect((await screen.findByRole('status')).textContent).toContain('UC-01')
  expect(screen.getByText('สถานะ: ตีกลับให้แก้ไข')).toBeTruthy()
  expect(client.returnDocuments).toHaveBeenCalledWith('แก้ตัวชี้วัด')
})

test('กดยกเลิกในกล่องยืนยันแล้วไม่ตีกลับ', async () => {
  // Given กองกิจกรอกคอมเมนต์แล้ว
  const client = {
    getApproval: async () => ({ status: 'รออนุมัติ', coverSheet: { fileName: 'cover.pdf' }, documents: [] }),
    returnDocuments: vi.fn(),
  }
  confirmAction.mockClear()
  confirmAction.mockResolvedValueOnce(false)
  render(<ProjectOfficeReviewPanel client={client} />)
  const comment = await screen.findByLabelText('คอมเมนต์รายละเอียดที่ต้องแก้ไข')
  fireEvent.change(comment, { target: { value: 'แก้ตัวชี้วัด' } })

  // When กดตีกลับแล้วยกเลิกในกล่องยืนยัน
  fireEvent.click(screen.getByRole('button', { name: 'ตีกลับเอกสารทั้งชุด' }))

  // Then ระบบไม่เรียก API และคอมเมนต์ยังอยู่
  await vi.waitFor(() => expect(confirmAction).toHaveBeenCalled())
  expect(client.returnDocuments).not.toHaveBeenCalled()
  expect(comment.value).toBe('แก้ตัวชี้วัด')
})
