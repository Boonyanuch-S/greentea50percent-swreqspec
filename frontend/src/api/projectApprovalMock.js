const approval = {
  id: 'approval-005-001',
  status: 'รออนุมัติ',
  contentApprovedAt: null,
  documents: [
    {
      id: 'project-book',
      type: 'เล่มโครงการ',
      title: 'เล่มโครงการค่ายวิทยาศาสตร์ 2569',
      reference: 'project-book-2569.pdf',
      objectives: ['พัฒนาทักษะการทำงานเป็นทีมของนักศึกษา', 'ส่งเสริมการเรียนรู้ผ่านกิจกรรมวิทยาศาสตร์'],
      indicators: ['ผู้เข้าร่วมไม่น้อยกว่า 80 คน', 'ผู้เข้าร่วมประเมินความพึงพอใจเฉลี่ยไม่น้อยกว่า 4.00'],
      format: 'รูปแบบเอกสารครบถ้วนตามแบบโครงการ',
    },
    {
      id: 'ks-002',
      type: 'กส 002',
      title: 'แบบ กส 002',
      reference: 'ks-002-2569.pdf',
      objectives: ['สรุปรายละเอียดการดำเนินโครงการ'],
      indicators: ['ข้อมูลกิจกรรมและผู้รับผิดชอบครบถ้วน'],
      format: 'แบบฟอร์ม กส 002 พร้อมตรวจสอบ',
    },
    {
      id: 'activity-attachment',
      type: 'ใบแนบกิจกรรม',
      title: 'ใบแนบรายละเอียดกิจกรรม',
      reference: 'activity-attachment-2569.pdf',
      objectives: ['แสดงรายละเอียดกิจกรรมและกำหนดการ'],
      indicators: ['กำหนดการสอดคล้องกับวัตถุประสงค์โครงการ'],
      format: 'ตารางกิจกรรมและกำหนดการจัดรูปแบบแล้ว',
    },
  ],
}

function cloneApproval() {
  return structuredClone(approval)
}

// จำลองข้อมูลหน้าอนุมัติ รองรับ FR-APR-01, FR-APR-02, FR-APR-03 และ FR-APR-04
export const projectApprovalMock = {
  async getApproval() {
    return cloneApproval()
  },

  async getDocument(documentId) {
    const document = approval.documents.find((item) => item.id === documentId)
    return document ? structuredClone(document) : null
  },

  // จำลองการอนุมัติเนื้อหาและการรับไฟล์ใบปะหน้า รองรับ FR-APR-03 และ FR-APR-04
  async approveContent() {
    approval.contentApprovedAt = new Date().toISOString()
    return {
      contentApprovedAt: approval.contentApprovedAt,
      printMessage: 'กรุณาพิมพ์เฉพาะใบปะหน้าเพื่อขอลายเซ็นจริง',
    }
  },

  async uploadCoverSheet(file) {
    approval.status = 'รออนุมัติ'
    return {
      fileName: file.name,
      status: approval.status,
    }
  },
}
