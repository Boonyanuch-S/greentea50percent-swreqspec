import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import ProjectApprovalPage from '../pages/ProjectApprovalPage.jsx'
import { confirmAction } from '../utils/alerts.js'

vi.mock('../utils/alerts.js', () => ({ confirmAction: vi.fn(async () => true) }))

const document = {
  id: 'project-book',
  type: 'เล่มโครงการ',
  title: 'เล่มโครงการตัวอย่าง',
  reference: 'book.pdf',
  objectives: ['วัตถุประสงค์'],
  indicators: ['ตัวชี้วัด'],
  format: 'รูปแบบ',
}

function createClient(status) {
  return {
    getApproval: async () => ({ status, contentApprovedAt: null, coverSheet: null, documents: [document] }),
    getDocument: async () => document,
    returnDocuments: vi.fn(async () => ({ status: 'ตีกลับให้แก้ไข', target_use_case: 'UC-01' })),
  }
}

test('test_IF_UC01_02_advisor_returns_documents_with_comment อาจารย์ส่งเอกสารกลับพร้อมความเห็น', async () => {
  // Given อาจารย์ไม่เห็นด้วยกับเอกสารบางส่วน
  const client = createClient('ส่งต่ออาจารย์')
  render(<ProjectApprovalPage client={client} />)
  const comment = await screen.findByLabelText('ความเห็นของอาจารย์')

  // When กรอกความเห็นแล้วส่งกลับ
  fireEvent.change(comment, { target: { value: 'แก้วัตถุประสงค์' } })
  fireEvent.click(screen.getByRole('button', { name: 'ส่งเอกสารกลับ' }))

  // Then ระบบส่งความเห็นครบถ้วนและแสดงผลการส่งกลับ UC-01
  expect((await screen.findByRole('status')).textContent).toContain('UC-01')
  expect(client.returnDocuments).toHaveBeenCalledWith('แก้วัตถุประสงค์')
  expect(screen.getByText('สถานะ: ตีกลับให้แก้ไข')).toBeTruthy()
})

test('test_IF_UC01_02_advisor_cannot_return_after_cover_sheet ส่งกลับไม่ได้หลังเอกสารไปถึงกองกิจ', async () => {
  // Given เอกสารมีสถานะรออนุมัติแล้ว
  render(<ProjectApprovalPage client={createClient('รออนุมัติ')} />)

  // When อาจารย์เปิดส่วนส่งกลับ
  const comment = await screen.findByLabelText('ความเห็นของอาจารย์')

  // Then กรอกและส่งกลับไม่ได้
  expect(comment.disabled).toBe(true)
  expect(screen.getByRole('button', { name: 'ส่งเอกสารกลับ' }).disabled).toBe(true)
})

test('test_AC_APR_08_cancel_keeps_document_with_advisor กดยกเลิกแล้วไม่ส่งเอกสารกลับ', async () => {
  // Given อาจารย์กรอกความเห็นแล้ว
  const client = createClient('ส่งต่ออาจารย์')
  confirmAction.mockClear()
  confirmAction.mockResolvedValueOnce(false)
  render(<ProjectApprovalPage client={client} />)
  fireEvent.change(await screen.findByLabelText('ความเห็นของอาจารย์'), { target: { value: 'แก้' } })

  // When กดส่งกลับแล้วยกเลิกในกล่องยืนยัน
  fireEvent.click(screen.getByRole('button', { name: 'ส่งเอกสารกลับ' }))

  // Then ระบบไม่เรียก API
  await vi.waitFor(() => expect(confirmAction).toHaveBeenCalled())
  expect(client.returnDocuments).not.toHaveBeenCalled()
})
