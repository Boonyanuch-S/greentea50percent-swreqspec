import { render, screen } from '@testing-library/react'
import ProjectDocumentForm from '../pages/ProjectDocumentForm.jsx'
import { projectDocumentMock } from '../services/projectDocumentMock.js'

test('T-03 แสดงฟอร์มโครงการใหม่พร้อมช่องข้อมูลหลักครบ', async () => {
  render(<ProjectDocumentForm client={projectDocumentMock} />)

  expect(await screen.findByLabelText('ชื่อโครงการ')).toBeTruthy()
  expect(screen.getByLabelText('วัตถุประสงค์')).toBeTruthy()
  expect(screen.getByLabelText('วันที่จัดกิจกรรม')).toBeTruthy()
  expect(screen.getByLabelText('สถานที่')).toBeTruthy()
  expect(screen.getByLabelText('ตัวชี้วัด')).toBeTruthy()
})

test('T-03 แจ้งกำหนดเสนอโครงการล่วงหน้าโดยคงชื่อช่องวันที่เดิม', async () => {
  render(<ProjectDocumentForm client={projectDocumentMock} />)

  const dateInput = await screen.findByLabelText('วันที่จัดกิจกรรม')
  const hint = document.getElementById(dateInput.getAttribute('aria-describedby'))
  expect(hint.textContent).toBe('ควรเสนอล่วงหน้าอย่างน้อย 1 เดือน หรือ 2 เดือนถ้าร่วมกับองค์การนักศึกษา')
})
