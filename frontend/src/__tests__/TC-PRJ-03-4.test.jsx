import { fireEvent, render, screen } from '@testing-library/react'
import ProjectDocumentsPage from '../pages/ProjectDocumentsPage.jsx'
import { createClient, FIELD_LABELS } from './prj03-fixtures.js'

// TC-PRJ-03-4 (AC-PRJ-03, FR-PRJ-01, FR-PRJ-02)
test('test_TC_PRJ_03_4_new_form_when_no_projects', async () => {
  // Given กรรมการยังไม่มีโครงการเลย (รายการ 0 โครงการ) แล้วกด "สร้างโครงการใหม่"
  render(<ProjectDocumentsPage client={createClient({ projects: [] })} />)
  await screen.findByText('ยังไม่มีโครงการ')
  fireEvent.click(screen.getByRole('button', { name: /สร้างโครงการใหม่/ }))

  // When ระบบโหลดหน้าจอ
  await screen.findByLabelText('ชื่อโครงการ')

  // Then แสดงฟอร์มที่มีช่องครบ 5 ช่องและว่างทุกช่อง
  const fields = FIELD_LABELS.map((label) => screen.getByLabelText(label))
  expect(fields).toHaveLength(5)
  fields.forEach((field) => expect(field.value).toBe(''))
})
