import { fireEvent, render, screen, within } from '@testing-library/react'
import { vi } from 'vitest'
import ProjectApprovalPage from '../pages/ProjectApprovalPage.jsx'
import { confirmAction } from '../utils/alerts.js'

vi.mock('../utils/alerts.js', () => ({ confirmAction: vi.fn(async () => true) }))

const summaries = [
  { id: 'project-book', type: 'เล่มโครงการ', title: 'เล่มโครงการตัวอย่าง', reference: 'book.pdf' },
  { id: 'ks-002', type: 'กส 002', title: 'แบบ กส 002', reference: 'ks.pdf' },
  { id: 'activity-attachment', type: 'ใบแนบกิจกรรม', title: 'ใบแนบตัวอย่าง', reference: 'attach.pdf' },
]

function createClient() {
  return {
    getApproval: async () => ({ status: 'รออนุมัติ', contentApprovedAt: null, coverSheet: null, documents: summaries }),
    getDocument: vi.fn(async (documentId) => ({
      ...summaries.find((item) => item.id === documentId),
      objectives: [`วัตถุประสงค์ของ ${documentId}`],
      indicators: [`ตัวชี้วัดของ ${documentId}`],
      format: `รูปแบบของ ${documentId}`,
    })),
  }
}

test('test_AC_APR_03_select_project_document เปิดเอกสารที่เลือกโดยมีรายการทั้งชุด', async () => {
  // Given มีเอกสารโครงการที่รออนุมัติ
  const client = createClient()
  render(<ProjectApprovalPage client={client} />)
  const list = await screen.findByRole('complementary', { name: 'รายการเอกสารโครงการ' })

  // When อาจารย์เปิดหน้าอนุมัติและเลือกเอกสารรายการหนึ่ง
  fireEvent.click(within(list).getByRole('button', { name: /แบบ กส 002/ }))

  // Then ระบบเปิดแสดงเอกสารที่เลือก และยังมีรายการทั้งชุด
  expect(await screen.findByText('วัตถุประสงค์ของ ks-002')).toBeTruthy()
  expect(screen.queryByText('วัตถุประสงค์ของ project-book')).toBeNull()
  expect(within(list).getAllByRole('button')).toHaveLength(3)
  expect(client.getDocument).toHaveBeenLastCalledWith('ks-002')
})

test('test_AC_APR_07_review_items_displayed แสดงหัวข้อตรวจของเอกสารที่เลือก', async () => {
  // Given อาจารย์เปิดเอกสารที่รออนุมัติ
  render(<ProjectApprovalPage client={createClient()} />)
  const list = await screen.findByRole('complementary', { name: 'รายการเอกสารโครงการ' })

  // When เลือกเอกสารรายการหนึ่ง
  fireEvent.click(within(list).getByRole('button', { name: /แบบ กส 002/ }))

  // Then ระบบแสดงวัตถุประสงค์ ตัวชี้วัด และรูปแบบของเอกสารรายการนั้น
  expect(await screen.findByText('วัตถุประสงค์ของ ks-002')).toBeTruthy()
  expect(screen.getByText('ตัวชี้วัดของ ks-002')).toBeTruthy()
  expect(screen.getByText('รูปแบบของ ks-002')).toBeTruthy()
})

test('test_AC_APR_03_load_error_is_shown แจ้งเมื่อโหลดเอกสารไม่สำเร็จ', async () => {
  // Given API เอกสารเรียกไม่สำเร็จ
  const client = { getApproval: async () => { throw new Error('ไม่พบเอกสารที่รออนุมัติ') } }

  // When อาจารย์เปิดหน้าอนุมัติ
  render(<ProjectApprovalPage client={client} />)

  // Then ระบบแสดงข้อผิดพลาด
  expect((await screen.findByRole('alert')).textContent).toBe('ไม่พบเอกสารที่รออนุมัติ')
})

function tickReviewPoints() {
  for (const point of ['เข้าใจวัตถุประสงค์ของโครงการ', 'รูปแบบและคำสะกดถูกต้อง', 'ตัวชี้วัดตรงกับของคณะ', 'มีแผน PDCA ครบ']) {
    fireEvent.click(screen.getByLabelText(point))
  }
}

function createReviewClient() {
  let reviewedIds = []
  return {
    ...createClient(),
    getApproval: async () => ({ status: 'ส่งต่ออาจารย์', contentApprovedAt: null, coverSheet: null, documents: summaries, reviewedDocumentIds: [] }),
    setDocumentReviewed: vi.fn(async (documentId, reviewed) => {
      reviewedIds = reviewed ? [...reviewedIds, documentId] : reviewedIds.filter((id) => id !== documentId)
      return reviewedIds
    }),
  }
}

test('test_AC_APR_01_review_each_document_with_confirmation ต้องยืนยันตรวจทีละฉบับก่อนอนุมัติเนื้อหา', async () => {
  // Given อาจารย์เปิดหน้าอนุมัติ ระบบเปิดฉบับแรกให้แต่ยังไม่ถือว่าตรวจแล้ว
  const client = createReviewClient()
  render(<ProjectApprovalPage client={client} />)
  const list = await screen.findByRole('complementary', { name: 'รายการเอกสารโครงการ' })
  const approve = screen.getByRole('button', { name: 'อนุมัติเนื้อหา' })
  expect(within(list).getByText('ตรวจแล้ว 0/3 รายการ')).toBeTruthy()
  expect(approve.disabled).toBe(true)
  expect(screen.getByText('ตรวจเอกสารให้ครบก่อน เหลืออีก 3 ฉบับ')).toBeTruthy()

  // And ต้องติ๊กจุดตรวจครบก่อนจึงกดยืนยันได้
  expect(screen.getByRole('button', { name: 'ตรวจฉบับนี้แล้ว' }).disabled).toBe(true)
  tickReviewPoints()

  // When กดตรวจแต่ยกเลิกในกล่องยืนยัน
  confirmAction.mockResolvedValueOnce(false)
  fireEvent.click(screen.getByRole('button', { name: 'ตรวจฉบับนี้แล้ว' }))
  await vi.waitFor(() => expect(confirmAction).toHaveBeenCalled())

  // Then ไม่บันทึกผล
  expect(client.setDocumentReviewed).not.toHaveBeenCalled()
  expect(within(list).getByText('ตรวจแล้ว 0/3 รายการ')).toBeTruthy()

  // When ยืนยันการตรวจครบทุกฉบับ
  const firstDocumentName = /เล่มโครงการตัวอย่าง/
  for (const documentName of [firstDocumentName, /แบบ กส 002/, /ใบแนบตัวอย่าง/]) {
    fireEvent.click(within(list).getByRole('button', { name: documentName }))
    await vi.waitFor(() => expect(screen.getByRole('heading', { level: 2, name: documentName })).toBeTruthy())
    if (documentName !== firstDocumentName) tickReviewPoints()
    fireEvent.click(screen.getByRole('button', { name: 'ตรวจฉบับนี้แล้ว' }))
    await vi.waitFor(() => expect(screen.getByRole('button', { name: 'ตรวจฉบับนี้แล้ว' }).getAttribute('aria-pressed')).toBe('true'))
  }

  // Then นับครบและกดอนุมัติเนื้อหาได้
  await within(list).findByText('ตรวจแล้ว 3/3 รายการ')
  expect(approve.disabled).toBe(false)
})

test('test_AC_APR_03_shows_uploaded_file_of_selected_document แสดงไฟล์ที่อัปโหลดของเอกสารที่เลือก', async () => {
  // Given เอกสารที่เลือกมีไฟล์ที่อัปโหลดไว้
  URL.createObjectURL = vi.fn(() => 'blob:project-book')
  URL.revokeObjectURL = vi.fn()
  const client = {
    ...createReviewClient(),
    getDocumentFile: vi.fn(async () => new Blob(['%PDF-1.4'], { type: 'application/pdf' })),
  }

  // When อาจารย์เปิดหน้าอนุมัติ
  render(<ProjectApprovalPage client={client} />)

  // Then เห็นไฟล์ของฉบับนั้น และยังกดยืนยันว่าตรวจแล้วได้
  const viewer = await screen.findByTitle('ไฟล์เอกสาร เล่มโครงการตัวอย่าง')
  expect(viewer.getAttribute('src')).toBe('blob:project-book')
  expect(client.getDocumentFile).toHaveBeenCalledWith('project-book')
  tickReviewPoints()
  expect(screen.getByRole('button', { name: 'ตรวจฉบับนี้แล้ว' }).disabled).toBe(false)
})

test('test_AC_APR_03_cannot_mark_reviewed_when_file_missing เปิดไฟล์ไม่ได้ต้องยืนยันตรวจไม่ได้', async () => {
  // Given เอกสารยังไม่มีไฟล์
  const client = {
    ...createReviewClient(),
    getDocumentFile: vi.fn(async () => { throw new Error('ยังไม่มีไฟล์ของเอกสารนี้') }),
  }

  // When อาจารย์เปิดหน้าอนุมัติ
  render(<ProjectApprovalPage client={client} />)

  // Then ระบบแจ้งเหตุผลและไม่ให้ยืนยันว่าตรวจแล้ว
  expect((await screen.findByRole('alert')).textContent).toContain('ยังไม่มีไฟล์ของเอกสารนี้')
  tickReviewPoints()
  expect(screen.getByRole('button', { name: 'ตรวจฉบับนี้แล้ว' }).disabled).toBe(true)
})
