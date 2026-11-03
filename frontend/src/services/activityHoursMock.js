const pendingDocuments = [
  {
    documentId: 'hrs-002',
    activityName: 'ค่ายอาสาพัฒนาชุมชน',
    submittedAt: '2026-09-18T09:00:00+07:00',
    status: 'รอตรวจสอบ',
  },
  {
    documentId: 'hrs-001',
    activityName: 'อบรมทักษะการสื่อสาร',
    submittedAt: '2026-09-20T13:30:00+07:00',
    status: 'รอตรวจสอบ',
  },
  {
    documentId: 'hrs-003',
    activityName: 'กิจกรรมปฐมนิเทศสมาชิกใหม่',
    submittedAt: '2026-09-22T10:15:00+07:00',
    status: 'รอตรวจสอบ',
  },
]

const passingDocumentIds = new Set(['hrs-001'])
const recordedDocumentIds = new Set()

const participantsByDocumentId = {
  41: [
    {
      student_reference: 'S-001',
      participant_name: 'Participant One',
      reported_hour_type: 'จิตอาสา',
      reported_hours: '2',
    },
    {
      student_reference: 'S-002',
      participant_name: 'Participant Two',
      reported_hour_type: 'การศึกษา',
      reported_hours: '3',
    },
  ],
}

// ใช้รายการผู้เข้าร่วมเดิมกับเอกสารทุกฉบับในคิวจำลองเพื่อให้เปิดตรวจได้ตาม FR-HRS-02
pendingDocuments.forEach(({ documentId }) => {
  participantsByDocumentId[documentId] = participantsByDocumentId[41]
})

// จำลองข้อมูลคิวเอกสารรอตรวจ รองรับ FR-HRS-01
export const activityHoursMock = {
  async getPendingDocuments() {
    return pendingDocuments
      .filter(({ documentId }) => !recordedDocumentIds.has(documentId))
      .sort((left, right) => new Date(left.submittedAt) - new Date(right.submittedAt))
  },

  async getDocumentParticipants(documentId) {
    if (!Object.hasOwn(participantsByDocumentId, documentId)) {
      throw new Error(`ไม่พบข้อมูลผู้เข้าร่วมของเอกสาร ${documentId}`)
    }

    const participants = participantsByDocumentId[documentId]
    return participants.map((participant) => ({ ...participant }))
  },

  // รับเอกสารจากหน้าส่งชั่วโมงเข้าคิวตรวจ เพื่อให้เดินงาน FR-SBH-05 ถึง FR-HRS-01 ได้ในข้อมูลจำลอง
  addSubmittedDocument(activity) {
    const documentId = `hrs-${activity.id}`
    if (Object.hasOwn(participantsByDocumentId, documentId)) return
    pendingDocuments.push({
      documentId,
      activityName: activity.name,
      submittedAt: new Date().toISOString(),
      status: 'รอตรวจสอบ',
    })
    passingDocumentIds.add(documentId)
    participantsByDocumentId[documentId] = activity.rows.map((row, index) => ({
      student_reference: `S-${String(index + 101)}`,
      participant_name: row.name,
      reported_hour_type: row.hourType,
      reported_hours: String(row.hours),
    }))
  },

  // จำลองสรุปข้อมูลรายบุคคลตาม FR-HRS-08 รายการข้อมูลจริงรอกำหนดใน spec
  async getIndividualSummary(documentId) {
    if (!Object.hasOwn(participantsByDocumentId, documentId)) {
      throw new Error(`ไม่พบเอกสาร ${documentId}`)
    }
    return {
      'กิจกรรมที่เข้าร่วมแล้ว': '5 กิจกรรม',
      'ชั่วโมงกิจกรรมสะสม': '24 ชั่วโมง',
      'หมายเหตุ': 'ข้อมูลตัวอย่าง',
    }
  },

  // จำลองผลตรวจ 2 แบบให้ลองได้ทั้งเอกสารที่ผ่านและถูกคืนตาม FR-HRS-03, FR-HRS-04, FR-HRS-06 และ ASM-03
  async getDocumentValidationResult(documentId) {
    if (!Object.hasOwn(participantsByDocumentId, documentId)) {
      throw new Error(`ไม่พบผลตรวจของเอกสาร ${documentId}`)
    }

    if (passingDocumentIds.has(documentId)) {
      return {
        document_status: recordedDocumentIds.has(documentId) ? 'บันทึกชั่วโมงสำเร็จ' : 'รอตรวจสอบ',
        invalid_items: [],
      }
    }

    return {
      document_status: 'ส่งคืน UC-02',
      invalid_items: [
        {
          student_reference: 'S-002',
          reported_hour_type: 'การศึกษา',
          validation_status: 'ไม่ตรงเกณฑ์',
          validation_message: 'ไม่พบประเภทชั่วโมงในเกณฑ์ของปีการศึกษานี้',
        },
      ],
    }
  },

  // จำลองการบันทึกเข้า REG และแจ้งสโมสรตาม FR-HRS-04 และ FR-HRS-05
  async approveDocument(documentId) {
    recordedDocumentIds.add(documentId)
    return { status: 'บันทึกชั่วโมงสำเร็จ', notification_status: 'queued' }
  },
}
