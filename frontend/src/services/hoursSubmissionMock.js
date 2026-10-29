const activities = [
  {
    id: 'activity-finished-01',
    name: 'ค่ายพัฒนาทักษะผู้นำนักศึกษา',
    status: 'จบแล้ว',
    projectNumberStatus: 'พร้อมแล้ว',
    projectNumber: 'SCI-2569-001',
    template: { id: 'HOURS-SCI', version: '1.0' },
    rows: [
      { name: 'กมลชนก ใจดี', role: 'ผู้เข้าร่วม', hourType: 'จิตอาสา', hours: 6 },
      { name: 'ณัฐวุฒิ ตั้งใจ', role: 'ผู้เข้าร่วม', hourType: 'จิตอาสา', hours: 6 },
      { name: 'อาจารย์สมชาย วิทยา', role: 'Staff', hourType: 'จิตอาสา', hours: 6 },
    ],
  },
  {
    id: 'activity-finished-02',
    name: 'อบรมการสื่อสารเพื่อชุมชน',
    status: 'จบแล้ว',
    projectNumberStatus: 'ขอเลขสรุปจากกองกิจ',
    projectNumber: null,
    template: { id: 'HOURS-SCI', version: '1.0' },
    rows: [
      { name: 'พิมพ์ชนก แสงทอง', role: 'ผู้เข้าร่วม', hourType: 'กศ.', hours: 3 },
      { name: 'อาจารย์วิภา แก้วใส', role: 'Staff', hourType: 'กศ.', hours: 3 },
    ],
  },
]

// Mock API สำหรับหน้าส่งชั่วโมง รองรับ FR-SBH-01, FR-SBH-03, FR-SBH-04 และ FR-SBH-06
export const hoursSubmissionMock = {
  async getFinishedActivities() {
    return activities.filter((activity) => activity.status === 'จบแล้ว')
  },

  async getSubmission(activityId) {
    const activity = activities.find((item) => item.id === activityId)
    if (!activity) {
      throw new Error('ไม่พบกิจกรรมที่เลือก')
    }

    return {
      ...activity,
      preview: {
        templateId: activity.template.id,
        templateVersion: activity.template.version,
        rows: activity.rows,
      },
    }
  },
}
