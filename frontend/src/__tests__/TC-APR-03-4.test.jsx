// AC-APR-03 (FR-APR-01) ตามแถว TC-APR-03-4 ใน specs/005-อนุมัติเอกสาร/test-cases.md
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

test('test_TC_APR_03_4_switching_selection_keeps_full_list', async () => {
  // Given เปิดหน้าอนุมัติและเลือก "แบบ กส 002" อยู่แล้ว
  render(<ProjectApprovalPage client={createClient()} />)
  const list = await screen.findByRole('complementary', { name: 'รายการเอกสารโครงการ' })
  fireEvent.click(within(list).getByRole('button', { name: /แบบ กส 002/ }))
  await screen.findByRole('heading', { level: 2, name: 'แบบ กส 002' })

  // When คลิกเปลี่ยนไปเลือก "ใบแนบกิจกรรม"
  fireEvent.click(within(list).getByRole('button', { name: /ใบแนบกิจกรรมตัวอย่าง/ }))

  // Then (1) หน้าจอเปลี่ยนไปแสดง "ใบแนบกิจกรรม" เป็นรายการที่เปิดอยู่ ไม่แสดง "แบบ กส 002" เป็นรายการที่เปิดแล้ว
  expect(await screen.findByRole('heading', { level: 2, name: 'ใบแนบกิจกรรมตัวอย่าง' })).toBeTruthy()
  expect(screen.queryByRole('heading', { level: 2, name: 'แบบ กส 002' })).toBeNull()
  expect(within(list).getByRole('button', { name: /ใบแนบกิจกรรมตัวอย่าง/ }).getAttribute('aria-pressed')).toBe('true')
  expect(within(list).getByRole('button', { name: /แบบ กส 002/ }).getAttribute('aria-pressed')).toBe('false')
  // Then (2) รายการเอกสารทั้งชุดยังแสดงครบ 3 รายการ
  expect(within(list).getAllByRole('button')).toHaveLength(3)
})
