import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import App from '../App.jsx'
import ReviewerChecklistPanel from '../components/ReviewerChecklistPanel.jsx'
import { reviewQueueMock } from '../services/reviewQueue.js'

test('test_AC_VDC_04_document_review_displays_details_and_checklist เจ้าหน้าที่เปิดรายละเอียดและเห็น Checklist', async () => {
  // Given เจ้าหน้าที่ที่ Login แล้วเลือกเอกสารจากคิว
  const submission = {
    submission_id: 41,
    project_id: 41,
    project_name: 'โครงการสำหรับทดสอบ',
    project_owner: 'สโมสรนักศึกษาคณะวิทยาศาสตร์',
    submitted_at: '2026-10-30T09:00:00+07:00',
    status: 'รอตรวจสอบ',
    summary: 'รายละเอียดโครงการสำหรับทดสอบหน้าจอ',
    document: {
      name: 'รายละเอียดโครงการ-test.txt',
      format: 'ข้อความจำลอง',
      content: 'เนื้อหาเอกสารสำหรับตรวจสอบ',
    },
  }
  const reviewClient = {
    getReviewQueue: async () => [submission],
    getSubmission: async () => submission,
    getSubmissionChecklist: async () => [
      {
        checklist_item_id: 51,
        item_name: 'รายการเอกสารทดสอบ',
        selected: false,
        result: null,
      },
    ],
    updateSubmissionChecklist: async (_submissionId, items) => items,
  }
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
  render(<App authClient={authClient} reviewClient={reviewClient} />)

  fireEvent.change(screen.getByLabelText('บัญชีผู้ใช้'), {
    target: { value: 'faculty@test.edu' },
  })
  fireEvent.change(screen.getByLabelText('รหัสผ่าน'), {
    target: { value: 'password' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }))

  // When เจ้าหน้าที่คลิกการ์ดเอกสารในคิว
  fireEvent.click(await screen.findByRole('button', { name: /โครงการสำหรับทดสอบ/ }))

  // Then เปิดรายละเอียดโครงการ เนื้อหา/รูปแบบเอกสาร และ Checklist กลางทันที
  expect(await screen.findByRole('heading', { name: 'โครงการสำหรับทดสอบ' })).toBeTruthy()
  expect(screen.getByText('เนื้อหาเอกสารสำหรับตรวจสอบ')).toBeTruthy()
  expect(screen.getByText('รูปแบบ: ข้อความจำลอง')).toBeTruthy()
  expect(await screen.findByText('รายการเอกสารทดสอบ')).toBeTruthy()
})

test('test_AC_VDC_04_reviewer_selects_relevant_checklist_items แต่ละโครงการเลือกชุดเอกสารได้ต่างกัน', async () => {
  // Given Checklist กลางที่มีรายการซึ่งทีมกำหนดเองและผู้ตรวจ Login แล้ว
  const checklistItems = [
    { checklist_item_id: 701, item_name: 'รายการเฉพาะโครงการหนึ่ง' },
    { checklist_item_id: 702, item_name: 'รูปแบบเอกสารอีกประเภท' },
    { checklist_item_id: 703, item_name: 'เอกสารเสริมสำหรับโครงการสอง' },
  ]
  const session = { token: `reviewer-${Date.now()}` }
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    text: async () => JSON.stringify({ version: 1, items: checklistItems }),
  })))

  try {
    // When ผู้ตรวจเลือกและบันทึกรายการที่เกี่ยวข้องกับโครงการแรก
    const firstProject = render(
      <ReviewerChecklistPanel
        client={reviewQueueMock}
        session={session}
        submissionId={501}
      />,
    )
    const firstItem = await screen.findByLabelText('รายการเฉพาะโครงการหนึ่ง')
    fireEvent.click(firstItem)
    fireEvent.change(screen.getByLabelText('สถานะเอกสาร รายการเฉพาะโครงการหนึ่ง'), {
      target: { value: 'ครบ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'บันทึกผลตรวจ' }))
    await screen.findByText('บันทึกผลตรวจแล้ว')
    expect(screen.getByLabelText('รายการเฉพาะโครงการหนึ่ง').checked).toBe(true)
    expect(
      screen.getByLabelText('สถานะเอกสาร รายการเฉพาะโครงการหนึ่ง').value,
    ).toBe('ครบ')
    expect(screen.getByLabelText('รูปแบบเอกสารอีกประเภท').checked).toBe(false)
    firstProject.unmount()

    // And ผู้ตรวจเลือกคนละชุดสำหรับโครงการที่สอง
    render(
      <ReviewerChecklistPanel
        client={reviewQueueMock}
        session={session}
        submissionId={502}
      />,
    )
    fireEvent.click(await screen.findByLabelText('รูปแบบเอกสารอีกประเภท'))
    fireEvent.change(screen.getByLabelText('สถานะเอกสาร รูปแบบเอกสารอีกประเภท'), {
      target: { value: 'ไม่ครบ' },
    })
    fireEvent.click(screen.getByLabelText('เอกสารเสริมสำหรับโครงการสอง'))
    fireEvent.change(screen.getByLabelText('สถานะเอกสาร เอกสารเสริมสำหรับโครงการสอง'), {
      target: { value: 'ครบ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'บันทึกผลตรวจ' }))
    await screen.findByText('บันทึกผลตรวจแล้ว')
    expect(screen.getByLabelText('รายการเฉพาะโครงการหนึ่ง').checked).toBe(false)
    expect(screen.getByLabelText('รูปแบบเอกสารอีกประเภท').checked).toBe(true)
    expect(
      screen.getByLabelText('สถานะเอกสาร รูปแบบเอกสารอีกประเภท').value,
    ).toBe('ไม่ครบ')
    expect(screen.getByLabelText('เอกสารเสริมสำหรับโครงการสอง').checked).toBe(true)

    // Then รายการและผลตรวจของแต่ละโครงการไม่ถูกบังคับให้เหมือนกัน
    await waitFor(async () => {
      expect(await reviewQueueMock.getSubmissionChecklist(501, session)).toEqual([
        {
          ...checklistItems[0],
          selected: true,
          result: 'ครบ',
        },
        {
          ...checklistItems[1],
          selected: false,
          result: null,
        },
        {
          ...checklistItems[2],
          selected: false,
          result: null,
        },
      ])
      expect(await reviewQueueMock.getSubmissionChecklist(502, session)).toEqual([
        {
          ...checklistItems[0],
          selected: false,
          result: null,
        },
        {
          ...checklistItems[1],
          selected: true,
          result: 'ไม่ครบ',
        },
        {
          ...checklistItems[2],
          selected: true,
          result: 'ครบ',
        },
      ])
    })
  } finally {
    vi.unstubAllGlobals()
  }
})
