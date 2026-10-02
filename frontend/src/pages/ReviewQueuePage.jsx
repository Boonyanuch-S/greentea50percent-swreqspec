import { useEffect, useState } from 'react'

function formatSubmittedAt(value) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

// แสดงคิวเอกสารและให้เลือกเอกสารที่ต้องตรวจ รองรับ FR-VDC-01.
export default function ReviewQueuePage({ client }) {
  const [submissions, setSubmissions] = useState([])
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    client.getReviewQueue().then((items) => {
      if (active) {
        setSubmissions(items)
        setLoading(false)
      }
    })

    return () => {
      active = false
    }
  }, [client])

  const selectedSubmission = submissions.find(
    (submission) => submission.submission_id === selectedSubmissionId,
  )

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 border-b border-slate-200 pb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Faculty Review / Project Documents
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">คิวเอกสารรอตรวจ</h1>
          <p className="mt-2 text-slate-600">รายการเรียงตามวันที่ส่งเข้าก่อนถึงหลัง</p>
        </header>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            กำลังโหลดคิวเอกสาร...
          </div>
        ) : submissions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            ไม่มีเอกสารรอตรวจ
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <ol className="space-y-4" aria-label="รายการเอกสารรอตรวจ">
              {submissions.map((submission) => (
                <li key={submission.submission_id}>
                  <button
                    type="button"
                    className={`w-full rounded-xl border bg-white p-5 text-left shadow-sm transition hover:border-teal-400 ${
                      selectedSubmissionId === submission.submission_id
                        ? 'border-teal-600 ring-2 ring-teal-100'
                        : 'border-slate-200'
                    }`}
                    onClick={() => setSelectedSubmissionId(submission.submission_id)}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-slate-950">{submission.project_name}</h2>
                        <p className="mt-1 text-sm text-slate-500">{submission.project_owner}</p>
                      </div>
                      <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800">
                        {submission.status}
                      </span>
                    </div>
                    <p className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-600">
                      ส่งเมื่อ {formatSubmittedAt(submission.submitted_at)}
                    </p>
                  </button>
                </li>
              ))}
            </ol>

            <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm" aria-live="polite">
              <h2 className="text-lg font-bold text-slate-950">เอกสารที่เลือก</h2>
              {selectedSubmission ? (
                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <p className="font-semibold text-slate-950">{selectedSubmission.project_name}</p>
                  <p>รหัสเอกสาร: {selectedSubmission.submission_id}</p>
                  <p>สถานะ: {selectedSubmission.status}</p>
                  <p>วันที่ส่ง: {formatSubmittedAt(selectedSubmission.submitted_at)}</p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-600">เลือกเอกสารจากคิวเพื่อดูข้อมูลเบื้องต้น</p>
              )}
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}
