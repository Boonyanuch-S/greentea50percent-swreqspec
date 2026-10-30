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
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
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
