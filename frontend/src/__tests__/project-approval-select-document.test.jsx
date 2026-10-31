import { fireEvent, render, screen, within } from '@testing-library/react'
import { vi } from 'vitest'
import ProjectApprovalPage from '../pages/ProjectApprovalPage.jsx'

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
