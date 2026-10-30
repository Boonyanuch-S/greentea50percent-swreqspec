import { useEffect, useState } from 'react'
import ApprovalAction from '../components/ApprovalAction.jsx'
import RejectDialog from '../components/RejectDialog.jsx'
import ReviewerChecklistPanel from '../components/ReviewerChecklistPanel.jsx'

function formatSubmittedAt(value) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

// แสดงรายละเอียดและเนื้อหาเอกสารพร้อม Checklist ตาม FR-VDC-02, FR-VDC-03 และ FR-VDC-04
export default function DocumentReviewPage({
  client,
  session,
  submissionId,
  onBack,
}) {
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    client.getSubmission(submissionId)
      .then((loadedSubmission) => {
        if (active) setSubmission(loadedSubmission)
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
  }, [client, submissionId])

  if (loading) {
    return <p role="status">กำลังโหลดรายละเอียดเอกสาร...</p>
  }

  if (error) {
    return <p role="alert" className="p-6 text-red-700">{error}</p>
  }

  if (!submission) {
    return <p role="alert" className="p-6 text-red-700">ไม่พบเอกสารโครงการ</p>
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          className="mb-5 rounded-lg px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-200"
          onClick={onBack}
        >
          ← กลับคิวเอกสาร
        </button>
        <header className="mb-8 border-b border-slate-200 pb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Faculty Review / Project Documents
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            {submission.project_name}
          </h1>
          <p className="mt-2 text-slate-600">{submission.project_owner}</p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-6">
            <section
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              aria-label="ข้อมูลโครงการ"
            >
              <h2 className="text-xl font-bold text-slate-950">ข้อมูลโครงการ</h2>
              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="text-sm font-semibold text-slate-500">รหัสเอกสาร</dt>
                  <dd>{submission.submission_id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-500">วันที่ส่ง</dt>
                  <dd>{formatSubmittedAt(submission.submitted_at)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-500">สถานะ</dt>
                  <dd>{submission.status}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-500">รายละเอียด</dt>
                  <dd className="whitespace-pre-line">{submission.summary}</dd>
                </div>
              </dl>
            </section>

            <section
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              aria-label="เนื้อหาและรูปแบบเอกสาร"
            >
              <h2 className="text-xl font-bold text-slate-950">เนื้อหาและรูปแบบเอกสาร</h2>
              <p className="mt-4 font-semibold">{submission.document.name}</p>
              <p className="mt-1 text-sm text-slate-600">
                รูปแบบ: {submission.document.format}
              </p>
              <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm">
                {submission.document.content}
              </pre>
              <p className="mt-3 text-xs text-slate-500">ข้อมูลเอกสารจำลองสำหรับการทดสอบหน้าจอ</p>
            </section>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <ReviewerChecklistPanel
                client={client}
                session={session}
                submissionId={submissionId}
              />
            </div>
            {submission.status !== 'ตีกลับให้แก้ไข' && (
              <ApprovalAction
                submissionId={submissionId}
                reviewerUserId={session?.profile?.username}
                session={session}
                onApproved={(result) => {
                  setSubmission((current) => ({ ...current, status: result.status }))
                }}
              />
            )}
            <RejectDialog
              submissionId={submissionId}
              reviewerUserId={session?.profile?.username}
              session={session}
              disabled={submission.status !== 'รอตรวจสอบ'}
              onRejected={(result) => {
                setSubmission((current) => ({ ...current, status: result.status }))
              }}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
