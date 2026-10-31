import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import ProjectApprovalListPage from '../pages/ProjectApprovalListPage.jsx'

test('test_AC_APR_03_list_approvals_for_selection เลือกโครงการจากรายการเอกสาร', async () => {
  // Given มีเอกสารที่ส่งต่อถึงอาจารย์หลายชุด
  const onOpen = vi.fn()
  const client = {
    listApprovals: async () => [
      { id: 'a-1', projectName: 'โครงการหนึ่ง', status: 'ส่งต่ออาจารย์' },
      { id: 'a-2', projectName: 'โครงการสอง', status: 'รออนุมัติ' },
    ],
  }
  render(<ProjectApprovalListPage client={client} heading="อนุมัติเอกสารโครงการ" onOpen={onOpen} />)

  // When อาจารย์เลือกโครงการหนึ่ง
  fireEvent.click(await screen.findByRole('button', { name: /โครงการสอง/ }))

  // Then ระบบเปิดเอกสารชุดที่เลือก
  expect(onOpen).toHaveBeenCalledWith('a-2')
})
