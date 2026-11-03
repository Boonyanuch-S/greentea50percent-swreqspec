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

test('test_AC_APR_03_list_separates_pending_from_handled นับเฉพาะงานที่รอดำเนินการและบอกขั้นถัดไป', async () => {
  // Given อาจารย์มีเอกสารที่ต้องทำและเอกสารที่ส่งต่อกองกิจแล้ว
  const client = {
    listApprovals: async () => [
      { id: 'a-1', projectName: 'โครงการรออนุมัติเนื้อหา', status: 'ส่งต่ออาจารย์', contentApprovedAt: null },
      { id: 'a-2', projectName: 'โครงการรอใบปะหน้า', status: 'ส่งต่ออาจารย์', contentApprovedAt: '2026-11-01T09:00:00' },
      { id: 'a-3', projectName: 'โครงการส่งกองกิจแล้ว', status: 'รออนุมัติ', contentApprovedAt: '2026-11-01T09:00:00' },
    ],
  }

  // When อาจารย์เปิดรายการ
  render(<ProjectApprovalListPage client={client} heading="อนุมัติเอกสารโครงการ" actionableStatus="ส่งต่ออาจารย์" onOpen={vi.fn()} />)

  // Then ตัวเลขนับเฉพาะงานของอาจารย์ และแต่ละรายการบอกขั้นถัดไป
  expect(await screen.findByText('2')).toBeTruthy()
  expect(screen.getByText('รออนุมัติเนื้อหา')).toBeTruthy()
  expect(screen.getByText('อนุมัติเนื้อหาแล้ว เหลืออัปโหลดใบปะหน้า')).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'ดำเนินการแล้ว (1)' })).toBeTruthy()
  expect(screen.getByText('รอกองกิจตรวจสอบ')).toBeTruthy()
})
