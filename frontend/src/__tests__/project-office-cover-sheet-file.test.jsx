import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import ProjectOfficeReviewPanel from '../pages/ProjectOfficeReviewPanel.jsx'
import { showDocument } from '../utils/alerts.js'

vi.mock('../utils/alerts.js', () => ({
  confirmAction: vi.fn(async () => true),
  showDocument: vi.fn(async () => {}),
}))

test('test_AC_APR_02_office_opens_cover_sheet กองกิจเปิดไฟล์ใบปะหน้าที่เซ็นแล้วได้', async () => {
  // Given เอกสารมีใบปะหน้าที่อาจารย์อัปโหลดแล้ว
  URL.createObjectURL = vi.fn(() => 'blob:cover')
  URL.revokeObjectURL = vi.fn()
  const blob = new Blob(['image'], { type: 'image/png' })
  const client = {
    getApproval: async () => ({ status: 'รออนุมัติ', coverSheet: { fileName: 'ใบปะหน้า.png' }, documents: [] }),
    getCoverSheetFile: vi.fn(async () => blob),
  }
  render(<ProjectOfficeReviewPanel client={client} />)

  // When กดเปิดไฟล์
  fireEvent.click(await screen.findByRole('button', { name: 'เปิดไฟล์ใบปะหน้าที่เซ็นแล้ว' }))

  // Then เห็นไฟล์จริงในกล่องแสดงเอกสาร
  await vi.waitFor(() => expect(showDocument).toHaveBeenCalledWith({
    title: 'ใบปะหน้าที่เซ็นแล้ว',
    name: 'ใบปะหน้า.png',
    url: 'blob:cover',
    type: 'image/png',
  }))
})
