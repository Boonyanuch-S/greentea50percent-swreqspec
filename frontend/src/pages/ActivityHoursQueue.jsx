import { useEffect, useState } from 'react'
import Button from '../components/Button.jsx'
import { EmptyState, LoadingCard, Notice } from '../components/Feedback.jsx'
import PageHeader, { CountBadge } from '../components/PageHeader.jsx'
import QueueCard from '../components/QueueCard.jsx'

function formatSubmittedAt(value) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

// แสดงคิวเอกสารชั่วโมงที่รอตรวจเรียงตามวันที่ส่ง รองรับ FR-HRS-01
export default function ActivityHoursQueue({ client, onSelectDocument }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    Promise.resolve()
      .then(() => client.getPendingDocuments())
      .then((pendingDocuments) => {
        if (active) {
          setDocuments(pendingDocuments)
          setLoading(false)
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : String(requestError))
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
        eyebrow="กองกิจการนักศึกษา · ชั่วโมงกิจกรรม"
        title="คิวตรวจสอบชั่วโมงกิจกรรม"
        description="เอกสารที่รอตรวจสอบเรียงจากวันที่ส่งก่อนถึงหลัง"
      >
        {!loading && !error && documents.length > 0 && <CountBadge label="รอตรวจ" value={documents.length} />}
      </PageHeader>

      {loading ? (
        <LoadingCard>กำลังโหลดคิวเอกสาร...</LoadingCard>
      ) : error ? (
        <Notice tone="danger" role="alert">โหลดคิวเอกสารไม่สำเร็จ: {error}</Notice>
      ) : documents.length === 0 ? (
        <div className="card">
          <EmptyState title="ไม่มีเอกสารที่รอตรวจสอบ" />
        </div>
      ) : (
        <ol className="space-y-3" aria-label="รายการเอกสารรอตรวจสอบ">
          {documents.map((document) => (
            <li key={document.documentId}>
              <QueueCard
                titleAs="h2"
                title="ใบสรุปชั่วโมงกิจกรรม"
                subtitle={document.activityName ?? `รหัสเอกสาร: ${document.documentId}`}
                meta={`${document.activityName ? `รหัสเอกสาร: ${document.documentId} · ` : ''}ส่งเมื่อ ${formatSubmittedAt(document.submittedAt)}`}
                status={document.status}
                action={(
                  <Button type="button" size="sm" onClick={() => onSelectDocument(document)}>
                    ตรวจสอบเอกสาร
                  </Button>
                )}
              />
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
