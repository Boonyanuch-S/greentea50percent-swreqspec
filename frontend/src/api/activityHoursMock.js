const pendingDocuments = [
  {
    documentId: 'hrs-002',
    activityName: 'ค่ายอาสาพัฒนาชุมชน',
    submittedAt: '2569-09-18T09:00:00+07:00',
    status: 'รอตรวจสอบ',
  },
  {
    documentId: 'hrs-001',
    activityName: 'อบรมทักษะการสื่อสาร',
    submittedAt: '2569-09-20T13:30:00+07:00',
    status: 'รอตรวจสอบ',
  },
  {
    documentId: 'hrs-003',
    activityName: 'กิจกรรมปฐมนิเทศสมาชิกใหม่',
    submittedAt: '2569-09-22T10:15:00+07:00',
    status: 'รอตรวจสอบ',
  },
]

// จำลองข้อมูลคิวเอกสารรอตรวจ รองรับ FR-HRS-01
export const activityHoursMock = {
  async getPendingDocuments() {
    return [...pendingDocuments].sort((left, right) => (
      new Date(left.submittedAt) - new Date(right.submittedAt)
    ))
  },
}
