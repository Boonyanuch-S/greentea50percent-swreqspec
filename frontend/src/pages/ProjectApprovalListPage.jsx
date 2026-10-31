import { useEffect, useState } from 'react'

// แสดงรายการเอกสารให้เลือกเปิด รองรับ FR-APR-01 และ FR-APR-05
export default function ProjectApprovalListPage({ client, eyebrow, heading, description, onOpen }) {
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

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 border-b border-slate-200 pb-6">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">{heading}</h1>
        <p className="mt-2 text-slate-600">{description}</p>
      </header>

      {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          กำลังโหลดรายการเอกสาร...
        </div>
      ) : !error && approvals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          ไม่มีเอกสารในรายการ
        </div>
      ) : (
        <ol className="space-y-4" aria-label="รายการเอกสารโครงการ">
          {approvals.map((approval) => (
            <li key={approval.id}>
              <button
                type="button"
                className="group flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                onClick={() => onOpen(approval.id)}
              >
                <span className="text-lg font-bold text-slate-950 group-hover:text-teal-800">{approval.projectName}</span>
                <span className="w-fit rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800">
                  {approval.status}
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
