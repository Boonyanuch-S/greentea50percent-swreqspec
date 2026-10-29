// API จำลองของเอกสารโครงการ (UC-01) เก็บข้อมูลในหน่วยความจำ ไม่เรียก backend จริง
// เอกสารแนบเก็บเป็น { name, url } โดย url มีเฉพาะไฟล์ที่ผู้ใช้แนบในรอบนี้ ไฟล์ตัวอย่างไม่มีเนื้อหาจริง
export const PENDING_FACULTY_REVIEW = 'รอเจ้าหน้าที่คณะตรวจสอบ'
export const RETURNED = 'ถูกตีกลับ'

const emptyProjectDocument = {
  projectName: '',
  objectives: '',
  activityDate: '',
  location: '',
  indicators: '',
}

// Checklist ตัวอย่าง: ชื่อและรหัสแบบฟอร์มอ้างอิงจาก "เอกสารองค์กรนักศึกษามหาวิทยาลัยศิลปากร (กศ.001-017)"
// ของกองกิจการนักศึกษา https://dsa.su.ac.th/ksu/?page_id=306
// เกณฑ์ว่าเอกสารใดบังคับแนบจริงยังรอ Q-01 (IF-CHK-01)
const sampleChecklist = [
  { id: 'ks-001', code: 'กศ.001', name: 'บันทึกข้อความ' },
  { id: 'ks-002-1', code: 'กศ.002.1', name: 'แบบเสนอขออนุมัติโครงการตามแผนดำเนินงาน (องค์กรกิจกรรมนักศึกษา)' },
  { id: 'ks-003', code: 'กศ.003', name: 'แบบเสนอขออนุมัติโครงการ (ประกันคุณภาพการศึกษา)' },
]

const CAMPUS = 'คณะวิทยาศาสตร์ มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์'

// โครงการตัวอย่างของสโมสรนักศึกษาคณะวิทยาศาสตร์ (ข้อมูลสมมติ)
function createStore() {
  return [
    {
      id: 'prj-001',
      projectName: 'ค่ายวิทยาศาสตร์สัญจรเพื่อน้อง ครั้งที่ 1',
      objectives:
        '1. เพื่อถ่ายทอดความรู้วิทยาศาสตร์พื้นฐานผ่านการทดลองให้นักเรียนระดับมัธยมศึกษาตอนต้น\n' +
        '2. เพื่อให้นักศึกษาผู้จัดได้พัฒนาทักษะการทำงานเป็นทีมและการสื่อสาร',
      activityDate: '2026-12-12',
      location: 'โรงเรียนในเขตอำเภอเมืองนครปฐม จ.นครปฐม',
      indicators:
        '1. นักเรียนเข้าร่วมไม่น้อยกว่าร้อยละ 80 ของกลุ่มเป้าหมาย (80 คน)\n' +
        '2. ผู้เข้าร่วมมีความพึงพอใจเฉลี่ยไม่น้อยกว่า 3.51 จาก 5',
      attachments: { 'ks-001': { name: 'กศ001-บันทึกข้อความ-ค่ายวิทย์.pdf' }, 'ks-002-1': { name: 'กศ002.1-ค่ายวิทย์.pdf' } },
      status: RETURNED,
      rejectionReason:
        'ยังไม่ได้แนบ กศ.003 แบบเสนอขออนุมัติโครงการ (ประกันคุณภาพการศึกษา) และตัวชี้วัดข้อ 2 ยังไม่วัดผลตามวัตถุประสงค์ข้อ 2 (ทักษะของนักศึกษาผู้จัด)',
    },
    {
      id: 'prj-002',
      projectName: 'โครงการต้อนรับนักศึกษาใหม่คณะวิทยาศาสตร์ (Science Freshy Day) ประจำปีการศึกษา 2569',
      objectives:
        '1. เพื่อให้นักศึกษาใหม่รู้จักคณะ ภาควิชา และรุ่นพี่\n2. เพื่อสร้างความสัมพันธ์อันดีระหว่างนักศึกษาทุกชั้นปี',
      activityDate: '2026-11-20',
      location: CAMPUS,
      indicators: '1. นักศึกษาใหม่เข้าร่วมไม่น้อยกว่าร้อยละ 70\n2. ผู้เข้าร่วมมีความพึงพอใจเฉลี่ยไม่น้อยกว่า 3.51 จาก 5',
      attachments: {
        'ks-001': { name: 'กศ001-freshy.pdf' },
        'ks-002-1': { name: 'กศ002.1-freshy.pdf' },
        'ks-003': { name: 'กศ003-freshy.pdf' },
      },
      status: PENDING_FACULTY_REVIEW,
      rejectionReason: null,
    },
    {
      id: 'prj-003',
      projectName: 'กีฬาสีสัมพันธ์คณะวิทยาศาสตร์ ประจำปีการศึกษา 2569',
      objectives: '1. เพื่อส่งเสริมการออกกำลังกายและสุขภาพที่ดีของนักศึกษา\n2. เพื่อเสริมสร้างความสามัคคีระหว่างภาควิชา',
      activityDate: '2027-01-23',
      location: CAMPUS,
      indicators: '1. มีนักศึกษาจากทุกภาควิชาเข้าร่วม\n2. ผู้เข้าร่วมมีความพึงพอใจเฉลี่ยไม่น้อยกว่า 3.51 จาก 5',
      attachments: {
        'ks-001': { name: 'กศ001-กีฬาสี.pdf' },
        'ks-002-1': { name: 'กศ002.1-กีฬาสี.pdf' },
        'ks-003': { name: 'กศ003-กีฬาสี.pdf' },
      },
      status: PENDING_FACULTY_REVIEW,
      rejectionReason: null,
    },
  ]
}

export function createProjectDocumentMock() {
  let projects = createStore()
  let nextId = 4

  return {
    async listMyProjects() {
      return projects.map(({ id, projectName, activityDate, status }) => ({ id, projectName, activityDate, status }))
    },

    // FR-PRJ-01
    async getNewProjectForm() {
      return { ...emptyProjectDocument }
    },

    // ดูรายละเอียดโครงการและเอกสารแนบ: นอก spec 001 ทีมสั่งเพิ่ม
    async getProject(projectId) {
      return structuredClone(projects.find((p) => p.id === projectId))
    },

    // FR-PRJ-06 โหลดข้อมูลเดิมพร้อมเหตุผลที่ถูกตีกลับ
    async getProjectForEdit(projectId) {
      const project = projects.find((p) => p.id === projectId)
      return structuredClone(project)
    },

    // FR-PRJ-03, IF-CHK-01
    async getChecklist() {
      return sampleChecklist.map((item) => ({ ...item }))
    },

    // FR-PRJ-05 เมื่อครบบันทึกเข้าคิว / FR-PRJ-07 ไม่ครบปฏิเสธโดยไม่บันทึกหรือเปลี่ยนสถานะ
    async submitProject({ id, attachments, ...fields }) {
      const missing = sampleChecklist.filter((item) => !attachments?.[item.id])
      if (missing.length > 0) {
        return { ok: false, missing }
      }

      const saved = { ...fields, attachments, status: PENDING_FACULTY_REVIEW, rejectionReason: null }
      if (id) {
        projects = projects.map((p) => (p.id === id ? { ...p, ...saved } : p))
        return { ok: true, project: { id, ...saved } }
      }

      const project = { id: `prj-${String(nextId++).padStart(3, '0')}`, ...saved }
      projects = [project, ...projects]
      return { ok: true, project }
    },
  }
}

export const projectDocumentMock = createProjectDocumentMock()
