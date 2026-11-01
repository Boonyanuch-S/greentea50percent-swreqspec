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
    return [...pendingDocuments].sort((left, right) => (
      new Date(left.submittedAt) - new Date(right.submittedAt)
    ))
  },

  async getDocumentParticipants(documentId) {
    if (!Object.hasOwn(participantsByDocumentId, documentId)) {
      throw new Error(`ไม่พบข้อมูลผู้เข้าร่วมของเอกสาร ${documentId}`)
    }

    const participants = participantsByDocumentId[documentId]
    return participants.map((participant) => ({ ...participant }))
  },

  // จำลองผลการตรวจประเภทชั่วโมงและสถานะคืนเอกสารตาม FR-HRS-03, FR-HRS-06 และ ASM-03
  async getDocumentValidationResult(documentId) {
    if (!Object.hasOwn(participantsByDocumentId, documentId)) {
      throw new Error(`ไม่พบผลตรวจของเอกสาร ${documentId}`)
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
}
