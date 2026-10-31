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

function createClient(contentApprovedAt) {
  return {
    getApproval: async () => ({
      status: 'ส่งต่ออาจารย์',
      contentApprovedAt,
      coverSheet: null,
      coverSheetAccept: '.pdf,.jpg,.jpeg,.png',
      documents: [document],
    }),
    getDocument: async () => document,
    uploadCoverSheet: async (file) => ({ fileName: file.name, status: 'รออนุมัติ' }),
  }
}

test('test_AC_APR_02_cover_sheet_upload_accepted แสดงผลการรับไฟล์ใบปะหน้า', async () => {
  // Given อาจารย์อนุมัติเนื้อหาแล้ว
  render(<ProjectApprovalPage client={createClient('2026-10-30T09:00:00+07:00')} />)
  const input = await screen.findByLabelText('ไฟล์ใบปะหน้า')

  // When อาจารย์อัปโหลดใบปะหน้าที่เซ็นแล้ว
  fireEvent.change(input, { target: { files: [new File(['signed'], 'cover-sheet.pdf')] } })
  fireEvent.click(screen.getByRole('button', { name: 'รับไฟล์ใบปะหน้า' }))

  // Then ระบบแสดงชื่อไฟล์และสถานะรออนุมัติ
  expect((await screen.findByRole('status')).textContent).toBe(
    'รับไฟล์ cover-sheet.pdf แล้ว และเปลี่ยนสถานะเป็น รออนุมัติ',
  )
  expect(screen.getByText('ไฟล์ล่าสุด: cover-sheet.pdf')).toBeTruthy()
})

test('test_AC_APR_02_cover_sheet_requires_content_approval_first อัปโหลดไม่ได้ก่อนอนุมัติเนื้อหา', async () => {
  // Given อาจารย์ยังไม่ได้อนุมัติเนื้อหาตาม ASM-01
  render(<ProjectApprovalPage client={createClient(null)} />)

  // When อาจารย์เปิดส่วนอัปโหลด
  const input = await screen.findByLabelText('ไฟล์ใบปะหน้า')

  // Then เลือกไฟล์และส่งไม่ได้
  expect(input.disabled).toBe(true)
  expect(screen.getByRole('button', { name: 'รับไฟล์ใบปะหน้า' }).disabled).toBe(true)
})

test('test_AC_APR_02_cover_sheet_upload_rejects_invalid_file แสดงข้อผิดพลาดไฟล์', async () => {
  // Given อาจารย์อนุมัติเนื้อหาแล้ว และ API ปฏิเสธไฟล์ที่ไม่ตรงตาม Q-03
  const client = {
    ...createClient('2026-10-30T09:00:00+07:00'),
    uploadCoverSheet: async () => {
      throw new Error('รับเฉพาะไฟล์ PDF, JPG หรือ PNG')
    },
  }
  render(<ProjectApprovalPage client={client} />)
  const input = await screen.findByLabelText('ไฟล์ใบปะหน้า')

  // When อาจารย์อัปโหลดไฟล์
  fireEvent.change(input, { target: { files: [new File(['x'], 'cover-sheet.exe')] } })
  fireEvent.click(screen.getByRole('button', { name: 'รับไฟล์ใบปะหน้า' }))

  // Then ระบบแสดงข้อผิดพลาดไฟล์
  expect((await screen.findByRole('alert')).textContent).toBe('รับเฉพาะไฟล์ PDF, JPG หรือ PNG')
  expect(input.accept).toBe('.pdf,.jpg,.jpeg,.png')
})

test('test_AC_APR_08_cancel_keeps_cover_sheet_unsent กดยกเลิกแล้วไม่ส่งใบปะหน้า', async () => {
  // Given อาจารย์อนุมัติเนื้อหาแล้วและเลือกไฟล์
  const client = { ...createClient('2026-10-30T09:00:00+07:00'), uploadCoverSheet: vi.fn() }
  confirmAction.mockClear()
  confirmAction.mockResolvedValueOnce(false)
  render(<ProjectApprovalPage client={client} />)
  const input = await screen.findByLabelText('ไฟล์ใบปะหน้า')
  fireEvent.change(input, { target: { files: [new File(['signed'], 'cover-sheet.pdf')] } })

  // When กดรับไฟล์แล้วยกเลิกในกล่องยืนยัน
  fireEvent.click(screen.getByRole('button', { name: 'รับไฟล์ใบปะหน้า' }))

  // Then ระบบไม่เรียก API
  await vi.waitFor(() => expect(confirmAction).toHaveBeenCalled())
  expect(client.uploadCoverSheet).not.toHaveBeenCalled()
})
