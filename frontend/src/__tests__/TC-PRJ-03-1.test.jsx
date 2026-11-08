import { fireEvent, render, screen } from '@testing-library/react'
import ProjectDocumentsPage from '../pages/ProjectDocumentsPage.jsx'
import { createClient, FIELD_LABELS } from './prj03-fixtures.js'

// TC-PRJ-03-1 (AC-PRJ-03, FR-PRJ-01, FR-PRJ-02)
test('test_TC_PRJ_03_1_new_button_shows_empty_form', async () => {
  // Given กรรมการสโมสรที่เข้าสู่ระบบแล้ว อยู่หน้ารายการเอกสารโครงการ แล้วกดปุ่ม "สร้างโครงการใหม่"
  render(<ProjectDocumentsPage client={createClient()} />)
  fireEvent.click(await screen.findByRole('button', { name: /สร้างโครงการใหม่/ }))

  // When ระบบโหลดหน้าจอ
  const firstField = await screen.findByLabelText('ชื่อโครงการ')

  // Then (1) แสดงฟอร์มเอกสารโครงการ
  expect(screen.getByRole('heading', { name: 'สร้างโครงการใหม่' })).toBeTruthy()
  expect(firstField.closest('form')).toBeTruthy()

  const fields = FIELD_LABELS.map((label) => screen.getByLabelText(label))
  // Then (2) ฟอร์มมีช่อง ชื่อโครงการ วัตถุประสงค์ วันที่ สถานที่ ตัวชี้วัด
  expect(fields).toHaveLength(5)
  // Then (3) ทุกช่องเป็นค่าว่าง
  fields.forEach((field) => expect(field.value).toBe(''))
  // Then (4) ทุกช่องพิมพ์ได้ ไม่ถูกปิด
  fields.forEach((field) => {
    expect(field.disabled).toBe(false)
    expect(field.readOnly).toBe(false)
  })
  const typed = { ชื่อโครงการ: 'ทดสอบ', วัตถุประสงค์: 'ทดสอบ', วันที่จัดกิจกรรม: '2099-01-01', สถานที่: 'ทดสอบ', ตัวชี้วัด: 'ทดสอบ' }
  FIELD_LABELS.forEach((label) => {
    fireEvent.change(screen.getByLabelText(label), { target: { value: typed[label] } })
    expect(screen.getByLabelText(label).value).toBe(typed[label])
  })
})
