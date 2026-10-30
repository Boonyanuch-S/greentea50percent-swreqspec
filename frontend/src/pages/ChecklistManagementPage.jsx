import ChecklistManagementPanel from '../components/ChecklistManagementPanel.jsx'

// แสดงการจัดการ Checklist กลางล่าสุดตาม FR-VDC-07 และ IF-CHK-02
export default function ChecklistManagementPage({ client, session }) {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 border-b border-slate-200 pb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Faculty Review / Checklist
          </p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                จัดการ Checklist กลาง
              </h1>
              <p className="mt-2 text-slate-600">
                เจ้าหน้าที่คณะทุกคนใช้รายการฉบับล่าสุดร่วมกัน
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-800">
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <path d="m5 10 3.2 3.2L15.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="2.5" y="2.5" width="15" height="15" rx="3" stroke="currentColor" strokeWidth="1.4" />
              </svg>
              ฉบับกลาง
            </span>
          </div>
        </header>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <ChecklistManagementPanel client={client} session={session} />
        </div>
      </div>
    </main>
  )
}
