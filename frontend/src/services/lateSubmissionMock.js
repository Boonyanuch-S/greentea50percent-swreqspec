const lateActivities = [
  {
    activityId: 'activity-late-001',
    name: 'ค่ายอาสาพัฒนาชุมชน',
    activityDate: '2026-05-18',
    regularSubmissionDeadline: '2026-06-18',
    status: 'เลยกำหนดปกติ',
  },
  {
    activityId: 'activity-late-002',
    name: 'อบรมทักษะการสื่อสาร',
    activityDate: '2026-06-12',
    regularSubmissionDeadline: '2026-07-12',
    status: 'เลยกำหนดปกติ',
  },
]

// จำลองรายการกิจกรรมที่เลยกำหนด รองรับ FR-LATE-01.
export const lateSubmissionMock = {
  async getLateActivities() {
    return lateActivities.map((activity) => ({ ...activity }))
  },
}
