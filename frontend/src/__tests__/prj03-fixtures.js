// ข้อมูลและ client สำหรับ test ของ AC-PRJ-03 (TC-PRJ-03-*) ใน test-cases.md
// ใช้ getNewProjectForm ของ client จริง (api/client.js) เพื่อให้ test ตรวจฟอร์มเปล่าที่ระบบสร้างจริง
// ส่วนที่ต้องเรียกหลังบ้านแทนด้วยข้อมูลจำลอง
import { vi } from 'vitest'
import { createProjectDocumentClient } from '../api/client.js'
import { RETURNED } from '../services/projectDocumentMock.js'

// ช่องตาม FR-PRJ-02 (หน้าจอใช้ชื่อช่องวันที่ว่า "วันที่จัดกิจกรรม")
export const FIELD_LABELS = ['ชื่อโครงการ', 'วัตถุประสงค์', 'วันที่จัดกิจกรรม', 'สถานที่', 'ตัวชี้วัด']

export const returnedProject = {
  id: 'prj-returned-1',
  projectName: 'โครงการเดิมที่ถูกตีกลับ',
  objectives: 'วัตถุประสงค์เดิม',
  activityDate: '2099-12-01',
  location: 'อาคารเดิม',
  indicators: 'ตัวชี้วัดเดิม',
  status: RETURNED,
}

export const rejectionReason = 'กรุณาแก้ไขกส 002 ให้ครบถ้วน'

export function createClient({ projects = [] } = {}) {
  const real = createProjectDocumentClient({ token: 'test-token', role: 'club_committee' })
  return {
    getNewProjectForm: real.getNewProjectForm,
    listMyProjects: vi.fn(async () => projects),
    getProjectForEdit: vi.fn(async () => ({ ...returnedProject, attachments: {}, rejectionReason })),
    getChecklist: vi.fn(async () => []),
    getCentralChecklist: vi.fn(async () => []),
    submitProject: vi.fn(async () => ({ ok: true, project: {} })),
  }
}
