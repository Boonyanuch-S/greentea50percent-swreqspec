import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { vi } from 'vitest'
import { checklistApi } from '../api/client.js'
import App from '../App.jsx'
import ChecklistManagementPage from '../pages/ChecklistManagementPage.jsx'

test('test_checklist_management_adds_and_edits_items_AC_VDC_05 เพิ่มและแก้ชื่อ Checklist ผ่าน client', async () => {
  // Given เจ้าหน้าที่เข้าสู่ระบบและ Checklist กลางยังไม่มีรายการ
  const items = []
  let nextId = 1
  const client = {
    getLatestChecklist: async () => ({
      version: items.length ? 1 : null,
      items: [...items],
    }),
    addChecklistItem: async (itemName) => {
      const item = { checklist_item_id: nextId++, item_name: itemName }
      items.push(item)
      return item
    },
    renameChecklistItem: async (itemId, itemName) => {
      const item = items.find((entry) => entry.checklist_item_id === itemId)
      item.item_name = itemName
      return item
    },
  }
  const session = { token: 'test-token', role: 'faculty_officer' }
  render(<ChecklistManagementPage client={client} session={session} />)

  // When เพิ่มรายการและแก้ไขชื่อรายการนั้น
  const nameInput = await screen.findByLabelText('ชื่อรายการ Checklist ใหม่')
  fireEvent.change(nameInput, { target: { value: 'เอกสารประกอบ' } })
  fireEvent.click(screen.getByRole('button', { name: 'เพิ่มรายการ' }))
  const itemName = await screen.findByText('เอกสารประกอบ')
  const row = itemName.closest('li')
  fireEvent.click(within(row).getByRole('button', { name: 'แก้ไข' }))
  fireEvent.change(screen.getByLabelText('แก้ชื่อ เอกสารประกอบ'), {
    target: { value: 'เอกสารประกอบฉบับแก้ไข' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'บันทึก' }))

  // Then แสดงชื่อใหม่และ client เดิมรักษา identity ของรายการ
  expect(await screen.findByText('เอกสารประกอบฉบับแก้ไข')).toBeTruthy()
  await waitFor(() => {
    expect(items).toEqual([
      { checklist_item_id: 1, item_name: 'เอกสารประกอบฉบับแก้ไข' },
    ])
  })
})

test('test_AC_VDC_05_all_reviewers_see_same_latest_rule ผู้ตรวจอีกคนเห็น Checklist กลางล่าสุด', async () => {
  // Given เจ้าหน้าที่คนแรกเพิ่มรายการ Checklist กลาง
  const items = []
  const client = {
    getLatestChecklist: async () => ({ version: 1, items: [...items] }),
    addChecklistItem: async (itemName) => {
      const item = { checklist_item_id: 1, item_name: itemName }
      items.push(item)
      return item
    },
    renameChecklistItem: async () => {
      throw new Error('test ไม่คาดว่าจะต้องแก้ไขรายการ')
    },
  }
  const reviewerOneSession = { token: 'reviewer-one', role: 'faculty_officer' }
  const reviewerTwoSession = { token: 'reviewer-two', role: 'faculty_officer' }
  const reviewerOneView = render(
    <ChecklistManagementPage client={client} session={reviewerOneSession} />,
  )

  const nameInput = await screen.findByLabelText('ชื่อรายการ Checklist ใหม่')
  fireEvent.change(nameInput, { target: { value: 'เอกสารประกอบ' } })
  fireEvent.click(screen.getByRole('button', { name: 'เพิ่มรายการ' }))
  expect(await screen.findByText('เอกสารประกอบ')).toBeTruthy()
  reviewerOneView.unmount()

  // When เจ้าหน้าที่คนที่สองเปิดหน้า Checklist กลาง
  render(<ChecklistManagementPage client={client} session={reviewerTwoSession} />)

  // Then เจ้าหน้าที่อีกคนเห็นรายการ Checklist ฉบับล่าสุดชุดเดียวกัน
  expect(await screen.findByText('เอกสารประกอบ')).toBeTruthy()
  expect(items).toEqual([{ checklist_item_id: 1, item_name: 'เอกสารประกอบ' }])
})

test('หน้า Checklist กลางใช้แท็บเมนูแทนปุ่มย้อนกลับ', async () => {
  const authClient = {
    login: async () => ({
      status: 200,
      body: {
        token: 'test-token',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        role: 'faculty_officer',
      },
    }),
  }
  const checklistClient = {
    getLatestChecklist: async () => ({ version: null, items: [] }),
  }
  const reviewClient = { getReviewQueue: async () => [] }
  render(<App
    authClient={authClient}
    checklistClient={checklistClient}
    reviewClient={reviewClient}
  />)

  fireEvent.change(screen.getByLabelText('บัญชีผู้ใช้'), {
    target: { value: 'faculty@test.edu' },
  })
  fireEvent.change(screen.getByLabelText('รหัสผ่าน'), {
    target: { value: 'password' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Checklist กลาง' }))
  expect(await screen.findByRole('heading', { name: 'จัดการ Checklist กลาง' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Checklist กลาง' }).getAttribute('aria-pressed')).toBe('true')
  expect(screen.queryByRole('button', { name: '← กลับคิวเอกสาร' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'คิวเอกสาร' }))

  expect(await screen.findByRole('heading', { name: 'คิวเอกสารรอตรวจ' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'คิวเอกสาร' }).getAttribute('aria-pressed')).toBe('true')
})

test('เปิด Checklist กลางได้จากหน้ารายละเอียดเอกสาร', async () => {
  const authClient = {
    login: async () => ({
      status: 200,
      body: {
        token: 'test-token',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        role: 'faculty_officer',
      },
    }),
  }
  const checklistClient = {
    getLatestChecklist: async () => ({ version: 1, items: [] }),
  }
  const reviewClient = {
    getReviewQueue: async () => [{
      submission_id: 1,
      project_name: 'โครงการทดสอบ',
      project_owner: 'สโมสรนักศึกษา',
      submitted_at: '2026-10-30T09:00:00+07:00',
      status: 'รอตรวจสอบ',
    }],
    getSubmission: async () => ({
      submission_id: 1,
      project_name: 'โครงการทดสอบ',
      project_owner: 'สโมสรนักศึกษา',
      submitted_at: '2026-10-30T09:00:00+07:00',
      status: 'รอตรวจสอบ',
      summary: 'รายละเอียดโครงการ',
      document: { name: 'เอกสาร', format: 'ข้อความ', content: 'เนื้อหา' },
    }),
    getSubmissionChecklist: async () => [],
    updateSubmissionChecklist: async () => [],
  }

  render(<App
    authClient={authClient}
    checklistClient={checklistClient}
    reviewClient={reviewClient}
  />)

  fireEvent.change(screen.getByLabelText('บัญชีผู้ใช้'), {
    target: { value: 'faculty@test.edu' },
  })
  fireEvent.change(screen.getByLabelText('รหัสผ่าน'), {
    target: { value: 'password' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }))
  fireEvent.click(await screen.findByRole('button', { name: /โครงการทดสอบ/ }))
  expect(await screen.findByRole('heading', { name: 'โครงการทดสอบ' })).toBeTruthy()

  fireEvent.click(screen.getByRole('button', { name: 'Checklist กลาง' }))

  expect(await screen.findByRole('heading', { name: 'จัดการ Checklist กลาง' })).toBeTruthy()
  expect(screen.queryByRole('heading', { name: 'โครงการทดสอบ' })).toBeNull()
})

test('Checklist API แสดงข้อผิดพลาดที่เข้าใจได้เมื่อ backend ตอบ HTML', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(
    '<!doctype html><title>Not Found</title>',
    { status: 404, headers: { 'Content-Type': 'text/html' } },
  )))

  try {
    await expect(
      checklistApi.getLatestChecklist({ token: 'test-token' }),
    ).rejects.toThrow('เรียกใช้ Checklist ไม่สำเร็จ (HTTP 404) กรุณาตรวจสอบว่า backend ทำงานอยู่')
  } finally {
    vi.unstubAllGlobals()
  }
})
