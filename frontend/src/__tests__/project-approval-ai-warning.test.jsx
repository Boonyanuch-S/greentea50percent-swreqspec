import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import ProjectApprovalPage from '../pages/ProjectApprovalPage.jsx'

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

test('test_AC_APR_05_ai_warning_does_not_block แสดงคำเตือนโดยไม่บล็อกการอนุมัติ', async () => {
  // Given ระบบแสดงคำเตือนทั่วไปทุกครั้งตาม Q-02
  const client = {
    getApproval: async () => ({ status: 'รออนุมัติ', contentApprovedAt: null, coverSheet: null, documents: [document] }),
    getDocument: async () => document,
    approveContent: async () => ({
      contentApprovedAt: '2026-10-30T09:00:00+07:00',
      printMessage: 'กรุณาพิมพ์เฉพาะใบปะหน้าเพื่อขอลายเซ็นจริง',
    }),
  }

  // When อาจารย์เปิดตรวจเอกสาร
  render(<ProjectApprovalPage client={client} />)

  // Then ระบบแสดงคำเตือนให้ตรวจสอบละเอียดขึ้น โดยไม่บล็อกการอนุมัติ
  expect((await screen.findByRole('note')).textContent).toContain('ตรวจสอบเนื้อหาอย่างละเอียด')
  const approve = screen.getByRole('button', { name: 'อนุมัติเนื้อหา' })
  expect(approve.disabled).toBe(false)
  fireEvent.click(approve)
  expect((await screen.findByRole('status')).textContent).toContain('ใบปะหน้า')
})
