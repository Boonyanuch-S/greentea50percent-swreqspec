const pendingSubmissions = [
  {
    submission_id: 2,
    project_name: 'โครงการอบรมทักษะการสื่อสาร',
    project_owner: 'สโมสรนักศึกษาคณะวิทยาศาสตร์',
    submitted_at: '2026-09-20T13:30:00+07:00',
    status: 'รอตรวจสอบ',
  },
  {
    submission_id: 1,
    project_name: 'โครงการค่ายอาสาพัฒนาชุมชน',
    project_owner: 'สโมสรนักศึกษาคณะวิทยาศาสตร์',
    submitted_at: '2026-09-18T09:00:00+07:00',
    status: 'รอตรวจสอบ',
  },
  {
    submission_id: 3,
    project_name: 'โครงการปฐมนิเทศสมาชิกใหม่',
    project_owner: 'สโมสรนักศึกษาคณะวิทยาศาสตร์',
    submitted_at: '2026-09-22T10:15:00+07:00',
    status: 'รอตรวจสอบ',
  },
]

// จำลองคิวเอกสารรอตรวจตาม FR-VDC-01.
export const reviewQueueMock = {
  async getReviewQueue() {
    return [...pendingSubmissions].sort((left, right) => (
      new Date(left.submitted_at) - new Date(right.submitted_at)
    ))
  },
}
