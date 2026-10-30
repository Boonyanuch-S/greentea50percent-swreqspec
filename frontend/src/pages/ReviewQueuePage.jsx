import { useEffect, useState } from 'react'

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

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 border-b border-slate-200 pb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Faculty Review / Project Documents
          </p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">คิวเอกสารรอตรวจ</h1>
              <p className="mt-2 text-slate-600">รายการเรียงตามวันที่ส่งเข้าก่อนถึงหลัง</p>
            </div>
            {!loading && submissions.length > 0 && (
              <span className="rounded-full bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-800">
                {submissions.length} รายการ
              </span>
            )}
          </div>
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
          <ol className="space-y-4" aria-label="รายการเอกสารรอตรวจ">
            {submissions.map((submission) => (
              <li key={submission.submission_id}>
                <button
                  type="button"
                  className="group w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:p-6"
                  onClick={() => onOpenSubmission?.(submission)}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-950 transition-colors group-hover:text-teal-800">
                        {submission.project_name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">{submission.project_owner}</p>
                    </div>
                    <span className="w-fit rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800">
                      {submission.status}
                    </span>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
                    <p>ส่งเมื่อ {formatSubmittedAt(submission.submitted_at)}</p>
                    <span className="inline-flex items-center gap-1 font-semibold text-teal-700 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      ดูรายละเอียด <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  )
}
