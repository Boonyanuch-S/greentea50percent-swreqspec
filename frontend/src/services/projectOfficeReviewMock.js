import { projectApprovalMock } from './projectApprovalMock.js'

const approvalId = 'office-review-005-001'
const projectName = 'โครงการค่ายวิทยาศาสตร์ 2569'
let status = 'รออนุมัติ'

// ข้อมูลจำลองสำหรับหน้าตรวจของกองกิจ รองรับ FR-APR-05 และ AC-APR-02
export const projectOfficeReviewMock = {
  async listApprovals() {
    return status === 'รออนุมัติ' ? [{ id: approvalId, projectName, status }] : []
  },

  forApproval(id) {
    if (id !== approvalId) {
      throw new Error('ไม่พบเอกสารโครงการที่เลือก')
    }

    return {
      async getApproval() {
        const approval = await projectApprovalMock.getApproval()
        return {
          ...approval,
          id: approvalId,
          projectName,
          status,
          coverSheet: { fileName: 'ใบปะหน้า-ลงนามแล้ว.pdf' },
        }
      },

      async passReview() {
        status = 'อนุมัติสมบูรณ์'
        return { status }
      },

      async returnDocuments(comment) {
        if (!comment.trim()) {
          throw new Error('กรุณาระบุคอมเมนต์รายละเอียดที่ต้องแก้ไข')
        }
        status = 'ตีกลับให้แก้ไข'
        return { target_use_case: 'UC-01', status }
      },
    }
  },
}
