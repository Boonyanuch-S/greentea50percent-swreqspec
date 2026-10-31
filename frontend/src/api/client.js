const BASE = import.meta.env.VITE_API_BASE ?? '/api'

function requireAuthentication(session, resource = 'Checklist') {
  const token = session?.token ?? session?.authenticationReference
  if (!token) {
    throw new Error(`ต้องยืนยันตัวตนก่อนเข้าถึง${resource === 'Checklist' ? ' Checklist' : resource}`)
  }
  return token
}

async function authenticatedJsonFetch(path, session, options = {}, resource = 'Checklist') {
  const token = requireAuthentication(session, resource)
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
      Authorization: token,
    },
  })

  const responseText = await response.text()
  let body = null
  if (responseText) {
    try {
      body = JSON.parse(responseText)
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error
      if (!response.ok) {
        throw new Error(
          `เรียกใช้ ${resource} ไม่สำเร็จ (HTTP ${response.status}) กรุณาตรวจสอบว่า backend ทำงานอยู่`,
        )
      }
      throw new Error(`API ${resource} ส่งข้อมูลที่อ่านไม่ได้ กรุณาตรวจสอบการเชื่อมต่อ backend`)
    }
  }

  if (!response.ok) {
    throw new Error(
      body?.detail ?? `ไม่สามารถดำเนินการกับ ${resource} ได้ (HTTP ${response.status})`,
    )
  }
  if (body === null) {
    throw new Error(`API ${resource} ไม่ได้ส่งข้อมูลกลับมา กรุณาลองใหม่อีกครั้ง`)
  }
  return body
}

// แปลงข้อมูลกิจกรรมและ deadline จาก API ตาม FR-SBH-01, FR-SBH-07 และ ASM-03
function toHoursSubmissionActivity(body) {
  return {
    id: String(body.activity_id),
    name: body.activity_name,
    status: body.status,
    endDate: body.end_date,
    deadlineExceeded: body.deadline_exceeded,
  }
}

// เรียก API กิจกรรมจบแล้วสำหรับหน้าส่งชั่วโมงตาม FR-SBH-01, CON-NFR-21 และ NFR-SEC-01
export function createHoursSubmissionClient(session) {
  const request = (path) => authenticatedJsonFetch(path, session, {}, 'การส่งข้อมูลชั่วโมง')

  return {
    async getFinishedActivities() {
      const activities = await request('/activities/hours-submission')
      return activities.map(toHoursSubmissionActivity)
    },
    async getSubmission(activityId) {
      const activity = await request(`/activities/${encodeURIComponent(activityId)}/hours-submission`)
      return toHoursSubmissionActivity(activity)
    },
  }
}

// อ่าน Checklist กลางฉบับล่าสุดตาม FR-VDC-07, IF-CHK-02 และ CON-NFR-21
export async function getLatestChecklist(session) {
  return authenticatedJsonFetch('/checklists/latest', session)
}

// เพิ่มรายการใน Checklist กลางตาม FR-VDC-07, IF-CHK-02 และ CON-NFR-21
export async function addChecklistItem(itemName, session) {
  return authenticatedJsonFetch('/checklists/items', session, {
    method: 'POST',
    body: JSON.stringify({ item_name: itemName }),
  })
}

// แก้ชื่อรายการโดยใช้ identity เดิมตาม FR-VDC-07, IF-CHK-02 และ ASM-03
export async function renameChecklistItem(itemId, itemName, session) {
  return authenticatedJsonFetch(`/checklists/items/${itemId}`, session, {
    method: 'PATCH',
    body: JSON.stringify({ item_name: itemName }),
  })
}

// บันทึกการอนุมัติและส่งต่อเอกสารตาม FR-VDC-05 และ IF-UC05-01
export async function approveSubmission(submissionId, reviewerUserId, session) {
  if (!reviewerUserId?.trim()) {
    throw new Error('ไม่พบข้อมูลผู้อนุมัติใน session')
  }
  return authenticatedJsonFetch(
    `/submissions/${submissionId}/review/approve`,
    session,
    {
      method: 'POST',
      body: JSON.stringify({ reviewer_user_id: reviewerUserId }),
    },
    'การอนุมัติ',
  )
}

// บันทึกการตีกลับและส่งเหตุผลเข้าคิว UC-01 ตาม FR-VDC-06 และ IF-UC01-01
export async function rejectSubmission(
  submissionId,
  reviewerUserId,
  reasonText,
  session,
) {
  if (!reviewerUserId?.trim()) {
    throw new Error('ไม่พบข้อมูลผู้อนุมัติใน session')
  }
  if (!reasonText?.trim()) {
    throw new Error('กรุณาระบุเหตุผลในการตีกลับ')
  }
  return authenticatedJsonFetch(
    `/submissions/${submissionId}/review/reject`,
    session,
    {
      method: 'POST',
      body: JSON.stringify({
        reviewer_user_id: reviewerUserId,
        reason_text: reasonText,
      }),
    },
    'การตีกลับ',
  )
}

function toApprovalSummary(body) {
  return {
    id: body.id,
    projectName: body.project_name,
    status: body.status,
    contentApprovedAt: body.content_approved_at,
    completedAt: body.completed_at,
  }
}

function toApprovalView(body) {
  return {
    ...toApprovalSummary(body),
    coverSheet: body.cover_sheet ? { fileName: body.cover_sheet.file_name } : null,
    coverSheetAccept: body.cover_sheet_accept,
    documents: body.documents.map((document) => ({
      id: document.id,
      type: document.document_type,
      title: document.title,
      reference: document.document_reference,
    })),
  }
}

function toDocumentView(body) {
  return {
    id: body.id,
    type: body.document_type,
    title: body.title,
    reference: body.document_reference,
    objectives: body.objectives,
    indicators: body.indicators,
    format: body.format,
  }
}

// เรียก API อนุมัติเอกสารด้วย Token ของผู้ใช้ตาม FR-APR-01 ถึง FR-APR-06 และ CON-NFR-21
export function createProjectApprovalClient(session) {
  const resource = 'การอนุมัติเอกสาร'
  const request = (path, options) => authenticatedJsonFetch(path, session, options, resource)

  return {
    async listApprovals() {
      return (await request('/project-approvals')).map(toApprovalSummary)
    },
    forApproval(approvalId) {
      const basePath = `/project-approvals/${approvalId}`
      return {
        async getApproval() {
          return toApprovalView(await request(basePath))
        },
        async getDocument(documentId) {
          return toDocumentView(await request(`${basePath}/documents/${documentId}`))
        },
        async approveContent() {
          const result = await request(`${basePath}/content-approval`, { method: 'POST' })
          return { contentApprovedAt: result.content_approved_at, printMessage: result.print_message }
        },
        async uploadCoverSheet(file) {
          const body = new FormData()
          body.append('file', file)
          const result = await request(`${basePath}/cover-sheet`, { method: 'POST', body })
          return { fileName: result.file_name, status: result.status }
        },
        async passReview() {
          return request(`${basePath}/review`, { method: 'POST' })
        },
        async returnDocuments(commentText) {
          return request(`${basePath}/return`, {
            method: 'POST',
            body: JSON.stringify({ comment_text: commentText }),
          })
        },
      }
    },
  }
}

export const checklistApi = {
  getLatestChecklist,
  addChecklistItem,
  renameChecklistItem,
}

export const approvalApi = {
  approveSubmission,
}

export const rejectionApi = {
  rejectSubmission,
}
