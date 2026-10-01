import { render, screen } from '@testing-library/react'
import ProjectDocumentForm from '../pages/ProjectDocumentForm.jsx'
import { projectDocumentMock } from '../api/projectDocumentMock.js'

test('T-03 แสดงฟอร์มโครงการใหม่พร้อมช่องข้อมูลหลักครบ', async () => {
  render(<ProjectDocumentForm client={projectDocumentMock} />)

  expect(await screen.findByLabelText('ชื่อโครงการ')).toBeTruthy()
  expect(screen.getByLabelText('วัตถุประสงค์')).toBeTruthy()
  expect(screen.getByLabelText('วันที่จัดกิจกรรม')).toBeTruthy()
  expect(screen.getByLabelText('สถานที่')).toBeTruthy()
  expect(screen.getByLabelText('ตัวชี้วัด')).toBeTruthy()
})
