const dashboardBySemester = {
  '2569-1': {
    statusCounts: [
      { status: 'รอตรวจสอบ', count: 4 },
      { status: 'อนุมัติสมบูรณ์', count: 8 },
      { status: 'ตีกลับ', count: 2 },
    ],
    skillGroups: [
      { name: 'การสื่อสาร', count: 5 },
      { name: 'การทำงานเป็นทีม', count: 6 },
      { name: 'ความคิดสร้างสรรค์', count: 3 },
    ],
  },
  '2568-2': {
    statusCounts: [
      { status: 'รอตรวจสอบ', count: 1 },
      { status: 'อนุมัติสมบูรณ์', count: 5 },
      { status: 'ตีกลับ', count: 1 },
    ],
    skillGroups: [
      { name: 'การสื่อสาร', count: 2 },
      { name: 'การทำงานเป็นทีม', count: 3 },
      { name: 'ความเป็นผู้นำ', count: 2 },
    ],
  },
}

const terms = [
  { id: '2569-1', label: 'ภาคการศึกษาที่ 1/2569' },
  { id: '2568-2', label: 'ภาคการศึกษาที่ 2/2568' },
]

// Mock API สำหรับหน้าจอ Dashboard รองรับ FR-DSH-01, FR-DSH-02 และ ASM-02
export const dashboardMock = {
  async getSummary(semesterId) {
    return {
      semesterId,
      terms,
      ...(dashboardBySemester[semesterId] ?? { statusCounts: [], skillGroups: [] }),
    }
  },
}
