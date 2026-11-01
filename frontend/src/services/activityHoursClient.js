const BASE = import.meta.env.VITE_API_BASE ?? '/api'

function requireAuthentication(session) {
  const token = session?.token ?? session?.authenticationReference
  if (!token) {
    throw new Error('ต้องยืนยันตัวตนก่อนเข้าถึงข้อมูลชั่วโมงกิจกรรม')
  }
  return token
}

async function request(path, session, options = {}) {
  const token = requireAuthentication(session)
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
          `เรียกข้อมูลชั่วโมงกิจกรรมไม่สำเร็จ (HTTP ${response.status}) กรุณาตรวจสอบว่า backend ทำงานอยู่`,
        )
      }
      throw new Error('API ข้อมูลชั่วโมงกิจกรรมส่งข้อมูลที่อ่านไม่ได้')
    }
  }

  if (!response.ok) {
    const error = new Error(
      body?.detail ?? `ไม่สามารถดำเนินการกับข้อมูลชั่วโมงกิจกรรมได้ (HTTP ${response.status})`,
    )
    error.status = response.status
    throw error
  }
  if (body === null) {
    throw new Error('API ข้อมูลชั่วโมงกิจกรรมไม่ได้ส่งข้อมูลกลับมา')
  }
  return body
}

// เรียก API คิว ตรวจสอบ และบันทึกชั่วโมงโดยส่ง token เพื่อคง CON-NFR-21 และ audit log ตาม DOM-PDPA-01
export function createActivityHoursClient(session) {
  return {
    async getPendingDocuments() {
      const documents = await request('/activity-hours/documents/pending', session)
      return documents.map((document) => ({
        documentId: document.document_id,
        activityId: document.activity_id,
        sourceFileReference: document.source_file_reference,
        submittedAt: document.submitted_at,
        status: document.status,
      }))
    },

    async getDocumentParticipants(documentId) {
      return request(
        `/activity-hours/documents/${encodeURIComponent(documentId)}/participants`,
        session,
      )
    },

    async getDocumentValidationResult(documentId) {
      const result = await request(
        `/activity-hours/documents/${encodeURIComponent(documentId)}/validate`,
        session,
        { method: 'POST' },
      )
      return {
        document_status: result.status,
        invalid_items: result.invalid_items,
      }
    },

    async approveDocument(documentId) {
      return request(
        `/activity-hours/documents/${encodeURIComponent(documentId)}/approve`,
        session,
        { method: 'POST' },
      )
    },

    async retryRegSubmission(documentId) {
      return request(
        `/activity-hours/documents/${encodeURIComponent(documentId)}/reg-retry`,
        session,
        { method: 'POST' },
      )
    },

    async getIndividualSummary(documentId, participantId) {
      const query = new URLSearchParams({ participant_id: participantId })
      return request(
        `/activity-hours/documents/${encodeURIComponent(documentId)}/individual-summary?${query}`,
        session,
      )
    },
  }
}
