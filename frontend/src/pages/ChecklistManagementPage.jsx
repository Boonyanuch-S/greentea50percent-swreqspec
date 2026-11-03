import ChecklistManagementPanel from '../components/ChecklistManagementPanel.jsx'
import PageHeader from '../components/PageHeader.jsx'

// แสดงการจัดการรายการเอกสารล่าสุดตาม FR-VDC-07 และ IF-CHK-02
export default function ChecklistManagementPage({ client, session }) {
  return (
    <div>
      <PageHeader
        eyebrow="เจ้าหน้าที่คณะ · รายการเอกสาร"
        title="จัดการรายการเอกสาร"
        description="เจ้าหน้าที่คณะทุกคนใช้รายการฉบับล่าสุดร่วมกัน"
      />
      <div className="card p-5 sm:p-6">
        <ChecklistManagementPanel client={client} session={session} />
      </div>
    </div>
  )
}
