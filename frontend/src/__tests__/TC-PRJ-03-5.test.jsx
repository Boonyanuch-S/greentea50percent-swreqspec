import { fireEvent, render, screen } from '@testing-library/react'
import ProjectDocumentsPage from '../pages/ProjectDocumentsPage.jsx'
import { createClient, rejectionReason, returnedProject } from './prj03-fixtures.js'

// TC-PRJ-03-5 (AC-PRJ-03 ทางผิด, Then จาก AC-PRJ-05 / FR-PRJ-06)
test('test_TC_PRJ_03_5_edit_returned_is_not_empty_form', async () => {
  // Given กรรมการไม่ได้เลือก "สร้างโครงการใหม่" แต่เลือกแก้ไขโครงการที่ถูกตีกลับ
  render(<ProjectDocumentsPage client={createClient({ projects: [returnedProject] })} />)
  fireEvent.click(await screen.findByRole('button', { name: 'แก้ไข' }))

  // When ระบบโหลดหน้าจอ
  await screen.findByRole('heading', { name: 'แก้ไขโครงการ' })

  // Then (1) ฟอร์มไม่ใช่ฟอร์มเปล่า: แสดงข้อมูลเดิมของโครงการ
  expect(screen.getByLabelText('ชื่อโครงการ').value).toBe(returnedProject.projectName)
  expect(screen.getByLabelText('วัตถุประสงค์').value).toBe(returnedProject.objectives)
  expect(screen.getByLabelText('วันที่จัดกิจกรรม').value).toBe(returnedProject.activityDate)
  expect(screen.getByLabelText('สถานที่').value).toBe(returnedProject.location)
  expect(screen.getByLabelText('ตัวชี้วัด').value).toBe(returnedProject.indicators)
  // Then (2) แสดงเหตุผลที่เจ้าหน้าที่ตีกลับ
  expect(screen.getByRole('region', { name: 'เหตุผลที่ถูกตีกลับ' }).textContent).toContain(rejectionReason)
})
