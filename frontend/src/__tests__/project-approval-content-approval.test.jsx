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

test('test_AC_APR_01_content_approval แสดงเวลาอนุมัติและให้พิมพ์ใบปะหน้า', async () => {
  // Given เอกสารครบทั้งชุดแล้ว
  const client = {
    getApproval: async () => ({ status: 'ส่งต่ออาจารย์', contentApprovedAt: null, coverSheet: null, documents: [document] }),
    getDocument: async () => document,
    approveContent: async () => ({
      contentApprovedAt: '2026-10-30T09:00:00+07:00',
      printMessage: 'กรุณาพิมพ์เฉพาะใบปะหน้าเพื่อขอลายเซ็นจริง',
    }),
  }
  render(<ProjectApprovalPage client={client} />)

  // When อาจารย์กดอนุมัติเนื้อหาออนไลน์
  fireEvent.click(await screen.findByRole('button', { name: 'อนุมัติเนื้อหา' }))

  // Then ระบบแสดงวันเวลาอนุมัติ และแจ้งให้พิมพ์ใบปะหน้า
  expect((await screen.findByRole('status')).textContent).toBe('กรุณาพิมพ์เฉพาะใบปะหน้าเพื่อขอลายเซ็นจริง')
  expect(screen.queryByText('วันเวลาที่อนุมัติ: ยังไม่ได้อนุมัติเนื้อหา')).toBeNull()
  expect(screen.getByRole('button', { name: 'อนุมัติเนื้อหาแล้ว' }).disabled).toBe(true)
})

test('test_AC_APR_08_cancel_keeps_content_unapproved กดยกเลิกแล้วไม่อนุมัติเนื้อหา', async () => {
  // Given อาจารย์เปิดเอกสารที่ยังไม่อนุมัติ
  const client = {
    getApproval: async () => ({ status: 'ส่งต่ออาจารย์', contentApprovedAt: null, coverSheet: null, documents: [document] }),
    getDocument: async () => document,
    approveContent: vi.fn(),
  }
  confirmAction.mockClear()
  confirmAction.mockResolvedValueOnce(false)
  render(<ProjectApprovalPage client={client} />)

  // When กดอนุมัติเนื้อหาแล้วยกเลิกในกล่องยืนยัน
  fireEvent.click(await screen.findByRole('button', { name: 'อนุมัติเนื้อหา' }))

  // Then ระบบไม่เรียก API และยังอนุมัติได้
  await vi.waitFor(() => expect(confirmAction).toHaveBeenCalled())
  expect(client.approveContent).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'อนุมัติเนื้อหา' }).disabled).toBe(false)
})
