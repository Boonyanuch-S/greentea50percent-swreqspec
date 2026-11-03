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

// FR-APR-07 และ AC-APR-05 ยกเลิกตามคำสั่งทีม 2569-11-01 จึงตรวจว่าไม่มีคำเตือนและการอนุมัติยังทำงาน
test('test_AC_APR_05_ai_warning_removed_approval_still_works ไม่แสดงคำเตือน AI และอนุมัติได้ตามปกติ', async () => {
  // Given อาจารย์ตรวจเอกสารครบแล้ว
  const client = {
    getApproval: async () => ({ status: 'ส่งต่ออาจารย์', contentApprovedAt: null, coverSheet: null, documents: [document], reviewedDocumentIds: [document.id] }),
    getDocument: async () => document,
    approveContent: async () => ({
      contentApprovedAt: '2026-10-30T09:00:00+07:00',
      printMessage: 'กรุณาพิมพ์เฉพาะใบปะหน้าเพื่อขอลายเซ็นจริง',
    }),
  }

  // When อาจารย์เปิดตรวจเอกสาร
  render(<ProjectApprovalPage client={client} />)

  // Then ไม่มีคำเตือน AI และกดอนุมัติเนื้อหาได้
  const approve = await screen.findByRole('button', { name: 'อนุมัติเนื้อหา' })
  expect(screen.queryByRole('note')).toBeNull()
  expect(approve.disabled).toBe(false)
  fireEvent.click(approve)
  expect((await screen.findByRole('status')).textContent).toContain('ใบปะหน้า')
})
