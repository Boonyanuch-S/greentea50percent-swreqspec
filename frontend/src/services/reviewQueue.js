import { checklistApi } from '../api/client.js'

const pendingSubmissions = [
  {
    submission_id: 2,
    project_id: 2,
    project_name: 'โครงการอบรมทักษะการสื่อสาร',
    project_owner: 'สโมสรนักศึกษาคณะวิทยาศาสตร์',
    submitted_at: '2026-09-20T13:30:00+07:00',
    status: 'รอตรวจสอบ',
    summary: 'โครงการจำลองสำหรับแสดงรายละเอียดและทดสอบการตรวจเอกสาร',
    document: {
      name: 'รายละเอียดโครงการ-2.txt',
      format: 'ข้อความจำลอง',
      content: 'เนื้อหาเอกสารจำลองสำหรับโครงการอบรมทักษะการสื่อสาร',
    },
  },
  {
    submission_id: 1,
    project_id: 1,
    project_name: 'โครงการค่ายอาสาพัฒนาชุมชน',
    project_owner: 'สโมสรนักศึกษาคณะวิทยาศาสตร์',
    submitted_at: '2026-09-18T09:00:00+07:00',
    status: 'รอตรวจสอบ',
    summary: 'โครงการจำลองสำหรับแสดงรายละเอียดและทดสอบการตรวจเอกสาร',
    document: {
      name: 'รายละเอียดโครงการ-1.txt',
      format: 'ข้อความจำลอง',
      content: 'เนื้อหาเอกสารจำลองสำหรับโครงการค่ายอาสาพัฒนาชุมชน',
    },
  },
  {
    submission_id: 3,
    project_id: 3,
    project_name: 'โครงการปฐมนิเทศสมาชิกใหม่',
    project_owner: 'สโมสรนักศึกษาคณะวิทยาศาสตร์',
    submitted_at: '2026-09-22T10:15:00+07:00',
    status: 'รอตรวจสอบ',
    summary: 'โครงการจำลองสำหรับแสดงรายละเอียดและทดสอบการตรวจเอกสาร',
    document: {
      name: 'รายละเอียดโครงการ-3.txt',
      format: 'ข้อความจำลอง',
      content: 'เนื้อหาเอกสารจำลองสำหรับโครงการปฐมนิเทศสมาชิกใหม่',
    },
  },
]

const projectEvaluations = new Map()

function mergeChecklistItems(items, evaluations = new Map()) {
  return items.map((item) => {
    const evaluation = evaluations.get(item.checklist_item_id)
    return {
      ...item,
      selected: evaluation?.selected ?? false,
      result: evaluation?.result ?? null,
    }
  })
}

function getEvaluationKey(submissionId, session) {
  const sessionReference = session?.token ?? session?.authenticationReference
  if (!sessionReference) {
    throw new Error('ต้องยืนยันตัวตนก่อนเข้าถึง Checklist')
  }
  return `${sessionReference}:${submissionId}`
}

// จำลองคิวเอกสารรอตรวจตาม FR-VDC-01.
export const reviewQueueMock = {
  async getReviewQueue() {
    return [...pendingSubmissions].sort((left, right) => (
      new Date(left.submitted_at) - new Date(right.submitted_at)
    ))
  },

  async getSubmission(submissionId) {
    const submission = pendingSubmissions.find(
      (item) => item.submission_id === submissionId,
    )
    if (!submission) {
      throw new Error('ไม่พบเอกสารโครงการ')
    }
    return structuredClone(submission)
  },

  async getSubmissionChecklist(submissionId, session) {
    const checklist = await checklistApi.getLatestChecklist(session)
    const evaluationKey = getEvaluationKey(submissionId, session)
    return mergeChecklistItems(
      checklist.items,
      projectEvaluations.get(evaluationKey),
    )
  },

  async updateSubmissionChecklist(submissionId, items, session) {
    const checklist = await checklistApi.getLatestChecklist(session)
    const evaluationKey = getEvaluationKey(submissionId, session)
    const latestIds = new Set(
      checklist.items.map((item) => item.checklist_item_id),
    )
    const submittedIds = new Set(items.map((item) => item.checklist_item_id))
    if (
      submittedIds.size !== items.length
      || [...submittedIds].some((itemId) => !latestIds.has(itemId))
    ) {
      throw new Error('รายการ Checklist เปลี่ยนแปลงแล้ว กรุณาโหลดรายการล่าสุด')
    }
    if (items.some((item) => item.selected && !item.result)) {
      throw new Error('รายการที่เลือกต้องระบุสถานะครบหรือไม่ครบ')
    }

    projectEvaluations.set(
      evaluationKey,
      new Map(items.map((item) => [
        item.checklist_item_id,
        { selected: item.selected, result: item.result },
      ])),
    )
    return mergeChecklistItems(
      checklist.items,
      projectEvaluations.get(evaluationKey),
    )
  },
}
