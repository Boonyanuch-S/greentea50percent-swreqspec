import { useEffect, useState } from 'react'
import { EmptyState, LoadingCard, Notice } from '../components/Feedback.jsx'
import PageHeader, { CountBadge } from '../components/PageHeader.jsx'
import QueueCard from '../components/QueueCard.jsx'
import { urgencyLabel, urgentFirst } from '../utils/urgency.js'

// บอกขั้นถัดไปของโครงการจากสถานะตาม FR-APR-03, FR-APR-04 และ FR-APR-05
function nextStepText(approval, actionableStatus) {
  switch (approval.status) {
    case 'ส่งต่ออาจารย์':
      return approval.contentApprovedAt ? 'อนุมัติเนื้อหาแล้ว เหลืออัปโหลดใบปะหน้า' : 'รออนุมัติเนื้อหา'
    case 'รออนุมัติ':
      return actionableStatus === 'รออนุมัติ' ? 'ตรวจเอกสารทั้งชุดและใบปะหน้า' : 'รอกองกิจตรวจสอบ'
    case 'อนุมัติสมบูรณ์':
      return 'อนุมัติครบทุกขั้นแล้ว'
    case 'ตีกลับให้แก้ไข':
      return 'ส่งกลับให้กรรมการสโมสรแก้ไขแล้ว'
    default:
      return null
  }
}

// แสดงรายการเอกสารให้เลือกเปิด รองรับ FR-APR-01 และ FR-APR-05
// actionableStatus แยกงานที่ต้องทำออกจากงานที่ส่งต่อไปแล้ว ไม่ส่งมาจะถือเป็นงานที่ต้องทำทั้งหมด
export default function ProjectApprovalListPage({ client, eyebrow, heading, description, actionableStatus, onOpen }) {
  const [approvals, setApprovals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    client.listApprovals()
      .then((items) => {
        if (active) setApprovals(items)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [client])

  const pending = urgentFirst(
    approvals.filter((approval) => !actionableStatus || approval.status === actionableStatus),
    (approval) => approval.activityDate,
  )
  const handled = approvals.filter((approval) => !pending.includes(approval))

  function renderApprovals(items, label, actionLabel) {
    return (
      <ol className="space-y-3" aria-label={label}>
        {items.map((approval) => (
          <li key={approval.id}>
            <QueueCard
              title={approval.projectName}
              subtitle={nextStepText(approval, actionableStatus)}
              urgent={items === pending ? urgencyLabel(approval.activityDate) : null}
              status={approval.status}
              actionLabel={actionLabel}
              onClick={() => onOpen(approval.id)}
            />
          </li>
        ))}
      </ol>
    )
  }

  return (
    <div>
      <PageHeader eyebrow={eyebrow} title={heading} description={description}>
        {!loading && !error && <CountBadge label="โครงการที่รอดำเนินการ" value={pending.length} />}
      </PageHeader>

      {error && <Notice tone="danger" role="alert">{error}</Notice>}
      {loading ? (
        <LoadingCard>กำลังโหลดรายการเอกสาร...</LoadingCard>
      ) : !error && (
        <div className="space-y-6">
          {pending.length === 0 ? (
            <div className="card">
              <EmptyState
                title="ไม่มีโครงการที่รอดำเนินการ"
                description="เมื่อมีเอกสารส่งเข้ามา รายการจะแสดงที่นี่"
              />
            </div>
          ) : (
            renderApprovals(pending, 'รายการเอกสารโครงการ', 'เปิดตรวจสอบ')
          )}
          {handled.length > 0 && (
            <section aria-labelledby="handled-approvals-heading">
              <h2 id="handled-approvals-heading" className="mb-3 text-sm font-semibold text-slate-600">
                ดำเนินการแล้ว ({handled.length})
              </h2>
              {renderApprovals(handled, 'รายการที่ดำเนินการแล้ว', 'ดูรายละเอียด')}
            </section>
          )}
        </div>
      )}
    </div>
  )
}
