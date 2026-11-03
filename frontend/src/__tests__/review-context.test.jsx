import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { composeReturnReason } from '../components/ReturnDocumentPicker.jsx'
import ProjectApprovalPage from '../pages/ProjectApprovalPage.jsx'
import ProjectDocumentForm from '../pages/ProjectDocumentForm.jsx'
import { projectDocumentMock } from '../services/projectDocumentMock.js'

vi.mock('../utils/alerts.js', () => ({ confirmAction: vi.fn(async () => true) }))

const document = { id: 'ks-002', type: 'กส 002', title: 'แบบ กส 002', reference: 'k.pdf', objectives: [], indicators: [], format: 'รูปแบบ' }

test('test_AC_APR_07_advisor_sees_faculty_checklist_and_history อาจารย์เห็นผลตรวจและประวัติการตีกลับ', async () => {
  // Given เอกสารผ่านเจ้าหน้าที่คณะและเคยถูกตีกลับ
  const client = {
    getApproval: async () => ({ status: 'ส่งต่ออาจารย์', contentApprovedAt: null, coverSheet: null, documents: [document], reviewedDocumentIds: [] }),
    getDocument: async () => document,
    getReviewContext: async () => ({
      facultyChecklist: [{ item_name: 'กศ.001 บันทึกข้อความ', result: 'ครบ' }],
      history: [{ round: 1, stage: 'เจ้าหน้าที่คณะตรวจเอกสาร', reason: 'เอกสารที่ต้องแก้: กส 002' }],
    }),
  }

  // When อาจารย์เปิดเอกสาร
  render(<ProjectApprovalPage client={client} />)

  // Then เห็นข้อมูลโดยไม่ต้องตรวจซ้ำจากศูนย์
  expect(await screen.findByText('กศ.001 บันทึกข้อความ')).toBeTruthy()
  expect(screen.getByText('ยังไม่ตรวจ')).toBeTruthy()
  expect(screen.getByText('รอบที่ 1 · เจ้าหน้าที่คณะตรวจเอกสาร')).toBeTruthy()
  expect(screen.getByText('เอกสารที่ต้องแก้: กส 002')).toBeTruthy()
})

test('test_AC_PRJ_02_reason_names_documents_to_fix เหตุผลระบุเอกสารที่ต้องแก้', () => {
  expect(composeReturnReason(['กส 002'], ' แก้งบประมาณ ')).toBe('เอกสารที่ต้องแก้: กส 002\nแก้งบประมาณ')
  expect(composeReturnReason([], 'แก้งบประมาณ')).toBe('แก้งบประมาณ')
})

test('test_AC_PRJ_03_form_requires_all_fields ฟอร์มไม่ผ่านถ้ากรอกไม่ครบ', async () => {
  // Given ฟอร์มโครงการใหม่ที่ยังไม่ได้กรอก
  render(<ProjectDocumentForm client={projectDocumentMock} />)
  const name = await screen.findByLabelText('ชื่อโครงการ')

  // When กดถัดไป
  fireEvent.submit(name.closest('form'))

  // Then แจ้งช่องที่ขาดและยังอยู่ขั้นกรอกข้อมูล
  expect((await screen.findByRole('alert')).textContent).toContain('ชื่อโครงการ')
  expect(screen.queryByText('Checklist เอกสารที่ต้องแนบ')).toBeNull()
})

test('test_AC_APR_07_result_is_shown_next_to_document ผลตรวจอยู่คู่กับไฟล์ฉบับนั้น', async () => {
  // Given เจ้าหน้าที่คณะตรวจ กส 002 ว่าไม่ครบ
  const client = {
    getApproval: async () => ({ status: 'ส่งต่ออาจารย์', contentApprovedAt: null, coverSheet: null, documents: [document], reviewedDocumentIds: [] }),
    getDocument: async () => document,
    getReviewContext: async () => ({ facultyChecklist: [{ item_name: 'กส 002', result: 'ไม่ครบ' }], history: [] }),
  }

  // When อาจารย์เปิดเอกสาร
  render(<ProjectApprovalPage client={client} />)

  // Then เห็นผลตรวจในปุ่มของเอกสาร และไม่ซ้ำในรายการอื่น
  const button = await screen.findByRole('button', { name: /ไม่ครบ/ })
  expect(button.textContent).toContain('แบบ กส 002')
  expect(screen.queryByText('รายการอื่นที่เจ้าหน้าที่ตรวจ')).toBeNull()
})
