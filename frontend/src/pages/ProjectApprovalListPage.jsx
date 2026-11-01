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
      <header className="mb-6 border-b border-slate-200 pb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">{heading}</h1>
            <p className="mt-2 text-slate-600">{description}</p>
          </div>
          {!loading && !error && (
            <div className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-right">
              <p className="text-xs font-semibold text-teal-800">เอกสารที่รอตรวจ</p>
              <p className="mt-0.5 text-2xl font-bold leading-none text-teal-900">{approvals.length}</p>
            </div>
          )}
        </div>
      </header>

      {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
          กำลังโหลดรายการเอกสาร...
        </div>
      ) : !error && approvals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500" aria-hidden="true">
            —
          </div>
          <h2 className="mt-4 text-base font-bold text-slate-800">ไม่มีเอกสารในรายการ</h2>
          <p className="mt-1 text-sm text-slate-500">เมื่อมีเอกสารส่งเข้ามา รายการจะแสดงที่นี่</p>
        </div>
      ) : (
        <ol className="space-y-3" aria-label="รายการเอกสารโครงการ">
          {approvals.map((approval) => (
            <li key={approval.id}>
              <button
                type="button"
                className="group flex w-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                onClick={() => onOpen(approval.id)}
              >
                <span className="flex min-w-0 items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-bold text-teal-800" aria-hidden="true">
                    DOC
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-base font-bold text-slate-950 group-hover:text-teal-800 sm:text-lg">
                      {approval.projectName}
                    </span>
                    <span className="mt-1 block text-sm text-slate-500">เลือกเพื่อเปิดตรวจสอบเอกสารทั้งชุด</span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3 pl-[3.75rem] sm:pl-0">
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800">
                    {approval.status}
                  </span>
                  <span className="text-sm font-bold text-teal-800">เปิดตรวจสอบ →</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
