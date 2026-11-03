import { useEffect, useState } from 'react'
import { EmptyState, LoadingCard, Notice } from '../components/Feedback.jsx'
import PageHeader, { CountBadge } from '../components/PageHeader.jsx'
import QueueCard from '../components/QueueCard.jsx'
import { urgencyLabel, urgentFirst } from '../utils/urgency.js'

function formatSubmittedAt(value) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

// แสดงคิวเอกสารและให้เลือกเอกสารที่ต้องตรวจ รองรับ FR-VDC-01.
export default function ReviewQueuePage({ client, onOpenSubmission }) {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    client.getReviewQueue().then((items) => {
      if (active) {
        setSubmissions(items)
        setLoading(false)
      }
    }).catch((requestError) => {
      if (active) {
        setError(requestError.message)
        setLoading(false)
      }
    })

    return () => {
      active = false
    }
  }, [client])

  return (
    <div>
      <PageHeader
        eyebrow="เจ้าหน้าที่คณะ · เอกสารโครงการ"
        title="คิวเอกสารรอตรวจ"
        description="งานด่วนขึ้นก่อน แล้วเรียงตามวันที่ส่งเข้าก่อนถึงหลัง"
      >
        {!loading && submissions.length > 0 && <CountBadge label="รอตรวจ" value={submissions.length} />}
      </PageHeader>

      {loading ? (
        <LoadingCard>กำลังโหลดคิวเอกสาร...</LoadingCard>
      ) : error ? (
        <Notice tone="danger" role="alert">{error}</Notice>
      ) : submissions.length === 0 ? (
        <div className="card">
          <EmptyState title="ไม่มีเอกสารรอตรวจ" />
        </div>
      ) : (
        <ol className="space-y-3" aria-label="รายการเอกสารรอตรวจ">
          {urgentFirst(submissions, (submission) => submission.activity_date).map((submission) => (
            <li key={submission.submission_id}>
              <QueueCard
                titleAs="h2"
                title={submission.project_name}
                subtitle={submission.project_owner}
                meta={`ส่งเมื่อ ${formatSubmittedAt(submission.submitted_at)}`}
                urgent={urgencyLabel(submission.activity_date)}
                status={submission.status}
                actionLabel="ดูรายละเอียด"
                onClick={() => onOpenSubmission?.(submission)}
              />
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
