import { useEffect, useState } from 'react'

function formatSubmittedAt(value) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

// แสดงคิวเอกสารชั่วโมงที่รอตรวจเรียงตามวันที่ส่ง รองรับ FR-HRS-01
export default function ActivityHoursQueue({ client }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    client.getPendingDocuments().then((pendingDocuments) => {
      if (active) {
        setDocuments(pendingDocuments)
        setLoading(false)
      }
    })

    return () => {
      active = false
    }
  }, [client])

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 border-b border-slate-200 pb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Student Affairs / Activity Hours
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">คิวตรวจสอบชั่วโมงกิจกรรม</h1>
          <p className="mt-2 text-slate-600">เอกสารที่รอตรวจสอบเรียงจากวันที่ส่งก่อนถึงหลัง</p>
        </header>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            กำลังโหลดคิวเอกสาร...
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            ไม่มีเอกสารที่รอตรวจสอบ
          </div>
        ) : (
          <ol className="space-y-4" aria-label="รายการเอกสารรอตรวจสอบ">
            {documents.map((document) => (
              <li key={document.documentId} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">{document.activityName}</h2>
                    <p className="mt-1 text-sm text-slate-500">รหัสเอกสาร: {document.documentId}</p>
                  </div>
                  <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800">
                    {document.status}
                  </span>
                </div>
                <p className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-600">
                  ส่งเมื่อ {formatSubmittedAt(document.submittedAt)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  )
}
