import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import ProjectDocumentsPage from '../pages/ProjectDocumentsPage.jsx'
import { createClient, FIELD_LABELS, rejectionReason, returnedProject } from './prj03-fixtures.js'

// กล่องยืนยัน "ยกเลิกการกรอกเอกสาร?" ตอบว่ายืนยัน
vi.mock('../utils/alerts.js', async (importOriginal) => ({
  ...(await importOriginal()),
  confirmAction: vi.fn(async () => true),
}))

// TC-PRJ-03-3 (AC-PRJ-03, FR-PRJ-01, FR-PRJ-06)
test('test_TC_PRJ_03_3_new_form_after_edit_is_still_empty', async () => {
  // Given กรรมการมีโครงการเดิมที่ถูกตีกลับ 1 โครงการ เคยเปิดแก้ไขโครงการนั้น
  render(<ProjectDocumentsPage client={createClient({ projects: [returnedProject] })} />)
  fireEvent.click(await screen.findByRole('button', { name: 'แก้ไข' }))
  expect((await screen.findByLabelText('ชื่อโครงการ')).value).toBe(returnedProject.projectName)
  // แล้วกดยกเลิกและกดยืนยันยกเลิกในกล่องยืนยัน จนกลับมาหน้ารายการ จากนั้นกด "สร้างโครงการใหม่"
  fireEvent.click(screen.getByRole('button', { name: 'ยกเลิก' }))
  fireEvent.click(await screen.findByRole('button', { name: /สร้างโครงการใหม่/ }))

  // When ระบบโหลดหน้าจอ
  await screen.findByRole('heading', { name: 'สร้างโครงการใหม่' })

  // Then (1) ทุกช่องเป็นค่าว่าง ไม่มีค่าของโครงการเดิมค้างอยู่
  FIELD_LABELS.forEach((label) => expect(screen.getByLabelText(label).value).toBe(''))
  // Then (2) ไม่แสดงเหตุผลที่ถูกตีกลับของโครงการเดิม
  expect(screen.queryByRole('region', { name: 'เหตุผลที่ถูกตีกลับ' })).toBeNull()
  expect(screen.queryByText(rejectionReason)).toBeNull()
})
