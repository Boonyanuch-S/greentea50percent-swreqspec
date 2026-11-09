// AC-APR-03 (FR-APR-01) ตามแถว TC-APR-03-2 ใน specs/005-อนุมัติเอกสาร/test-cases.md
import { fireEvent, render, screen, within } from '@testing-library/react'
import { vi } from 'vitest'
import ProjectApprovalPage from '../pages/ProjectApprovalPage.jsx'

vi.mock('../utils/alerts.js', () => ({ confirmAction: vi.fn(async () => true) }))

const summaries = [
  { id: 'project-book', type: 'เล่มโครงการ', title: 'เล่มโครงการตัวอย่าง', reference: 'book.pdf' },
  { id: 'ks-002', type: 'กส 002', title: 'แบบ กส 002', reference: 'ks.pdf' },
  { id: 'activity-attachment', type: 'ใบแนบกิจกรรม', title: 'ใบแนบกิจกรรมตัวอย่าง', reference: 'attach.pdf' },
]

function createClient() {
  return {
    getApproval: async () => ({ status: 'ส่งต่ออาจารย์', contentApprovedAt: null, coverSheet: null, documents: summaries, reviewedDocumentIds: [] }),
    getDocument: vi.fn(async (documentId) => ({
      ...summaries.find((item) => item.id === documentId),
      objectives: [`วัตถุประสงค์ของ ${documentId}`],
      indicators: [`ตัวชี้วัดของ ${documentId}`],
      format: `รูปแบบของ ${documentId}`,
    })),
  }
}

test('test_TC_APR_03_2_page_shows_selected_document_with_full_list', async () => {
  // Given อาจารย์ที่ปรึกษาสโมสร login แล้ว และ client จำลองคืนเอกสารครบชุด 3 รายการ สถานะ "ส่งต่ออาจารย์"
  const client = createClient()

  // When เปิดหน้าอนุมัติ (ProjectApprovalPage) แล้วคลิกเลือก "แบบ กส 002"
  render(<ProjectApprovalPage client={client} />)
  const list = await screen.findByRole('complementary', { name: 'รายการเอกสารโครงการ' })
  fireEvent.click(within(list).getByRole('button', { name: /แบบ กส 002/ }))

  // Then (1) หน้าจอแสดงเอกสาร "แบบ กส 002" เป็นรายการที่เปิดอยู่
  expect(await screen.findByRole('heading', { level: 2, name: 'แบบ กส 002' })).toBeTruthy()
  expect(within(list).getByRole('button', { name: /แบบ กส 002/ }).getAttribute('aria-pressed')).toBe('true')
  // Then (2) หน้าจอยังแสดงรายการเอกสารทั้งชุดครบ 3 รายการให้เลือกดู
  expect(within(list).getAllByRole('button')).toHaveLength(3)
  for (const title of ['เล่มโครงการตัวอย่าง', 'แบบ กส 002', 'ใบแนบกิจกรรมตัวอย่าง']) {
    expect(within(list).getByRole('button', { name: new RegExp(title) })).toBeTruthy()
  }
})
