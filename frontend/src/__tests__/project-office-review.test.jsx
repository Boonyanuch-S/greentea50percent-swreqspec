import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import ProjectOfficeReviewPanel from '../pages/ProjectOfficeReviewPanel.jsx'
import { confirmAction } from '../utils/alerts.js'

vi.mock('../utils/alerts.js', () => ({ confirmAction: vi.fn(async () => true) }))

const documents = [
  { id: 'project-book', type: 'เล่มโครงการ', title: 'เล่มโครงการตัวอย่าง', reference: 'book.pdf' },
]

test('test_AC_APR_02_office_approval_completes กองกิจตรวจผ่านแล้วเห็นอนุมัติสมบูรณ์', async () => {
  // Given อาจารย์อัปโหลดใบปะหน้าที่เซ็นแล้ว และระบบรับไฟล์
  const client = {
    getApproval: async () => ({ status: 'รออนุมัติ', coverSheet: { fileName: 'cover.pdf' }, documents }),
    passReview: vi.fn(async () => ({ status: 'อนุมัติสมบูรณ์' })),
  }
  render(<ProjectOfficeReviewPanel client={client} />)
  expect(await screen.findByText('สถานะ: รออนุมัติ')).toBeTruthy()

  // When กองกิจตรวจสอบเอกสารและให้ผ่าน
  fireEvent.click(screen.getByRole('button', { name: 'ตรวจผ่าน' }))

  // Then สถานะเปลี่ยนเป็นอนุมัติสมบูรณ์
  expect(await screen.findByText('สถานะ: อนุมัติสมบูรณ์')).toBeTruthy()
  expect(client.passReview).toHaveBeenCalledOnce()
  expect(screen.getByRole('button', { name: 'ตรวจผ่าน' }).disabled).toBe(true)
})

test('test_AC_APR_02_review_requires_cover_sheet ยังตรวจผ่านไม่ได้เมื่อไม่มีใบปะหน้า', async () => {
  // Given เอกสารยังไม่มีใบปะหน้าที่เซ็นแล้ว
  const client = { getApproval: async () => ({ status: 'รออนุมัติ', coverSheet: null, documents }) }

  // When กองกิจเปิดแผงตรวจ
  render(<ProjectOfficeReviewPanel client={client} />)

  // Then ปุ่มตรวจผ่านใช้งานไม่ได้
  expect((await screen.findByRole('button', { name: 'ตรวจผ่าน' })).disabled).toBe(true)
})

test('test_AC_APR_08_cancel_keeps_review_undecided กดยกเลิกแล้วไม่ตรวจผ่าน', async () => {
  // Given มีเอกสารที่มีใบปะหน้าแล้ว
  const client = {
    getApproval: async () => ({ status: 'รออนุมัติ', coverSheet: { fileName: 'cover.pdf' }, documents }),
    passReview: vi.fn(),
  }
  confirmAction.mockClear()
  confirmAction.mockResolvedValueOnce(false)
  render(<ProjectOfficeReviewPanel client={client} />)

  // When กดตรวจผ่านแล้วยกเลิกในกล่องยืนยัน
  fireEvent.click(await screen.findByRole('button', { name: 'ตรวจผ่าน' }))

  // Then ระบบไม่เรียก API
  await vi.waitFor(() => expect(confirmAction).toHaveBeenCalled())
  expect(client.passReview).not.toHaveBeenCalled()
  expect(screen.getByText('สถานะ: รออนุมัติ')).toBeTruthy()
})
