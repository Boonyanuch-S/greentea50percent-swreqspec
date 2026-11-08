import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import ProjectDocumentsPage from '../pages/ProjectDocumentsPage.jsx'
import { createClient } from './prj03-fixtures.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

// TC-PRJ-03-2 (AC-PRJ-03, plan.md ข้อ 6 "ยังไม่สร้างระเบียน")
test('test_TC_PRJ_03_2_open_form_creates_no_record', async () => {
  // Given กรรมการสโมสรที่เข้าสู่ระบบแล้ว อยู่หน้ารายการเอกสารโครงการ แล้วกดปุ่ม "สร้างโครงการใหม่"
  const fetchSpy = vi.fn(async () => new Response('[]', { status: 200 }))
  vi.stubGlobal('fetch', fetchSpy)
  const client = createClient()
  render(<ProjectDocumentsPage client={client} />)
  fireEvent.click(await screen.findByRole('button', { name: /สร้างโครงการใหม่/ }))

  // When ระบบโหลดหน้าจอฟอร์มใหม่ และกรรมการยังไม่กดส่ง
  await screen.findByLabelText('ชื่อโครงการ')

  // Then ยังไม่สร้างระเบียนโครงการ: ไม่มีการเรียกคำสั่งบันทึก/ส่งโครงการ
  expect(client.submitProject).not.toHaveBeenCalled()
  const writes = fetchSpy.mock.calls.filter(([, options]) => options?.method && options.method !== 'GET')
  expect(writes).toHaveLength(0)
})
