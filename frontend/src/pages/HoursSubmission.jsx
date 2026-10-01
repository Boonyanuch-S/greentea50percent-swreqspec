import { useEffect, useState } from 'react'

// แสดงเฉพาะกิจกรรมที่จบแล้ว รองรับ FR-SBH-01
function ActivitySelector({ activities, selectedId, onChange }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
      เลือกกิจกรรมที่จบแล้ว
      <select
        aria-label="เลือกกิจกรรมที่จบแล้ว"
        className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal shadow-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        value={selectedId}
        onChange={(event) => onChange(event.target.value)}
      >
        {activities.map((activity) => (
          <option key={activity.id} value={activity.id}>
            {activity.name}
          </option>
        ))}
      </select>
    </label>
  )
}

// แสดงหน้าส่งชั่วโมงด้วยข้อมูลจำลอง รองรับ FR-SBH-01, FR-SBH-03, FR-SBH-04 และ FR-SBH-06
export default function HoursSubmission({ client }) {
  const [activities, setActivities] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [submission, setSubmission] = useState(null)
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    client.getFinishedActivities().then((result) => {
      setActivities(result)
      setSelectedId(result[0]?.id ?? '')
      setLoading(false)
    })
  }, [client])

  useEffect(() => {
    if (!selectedId) {
      setSubmission(null)
      return
    }

    setLoading(true)
    setChecked(false)
    setError('')
    client
      .getSubmission(selectedId)
      .then((result) => setSubmission(result))
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false))
  }, [client, selectedId])

  if (loading && !submission) {
    return <main className="min-h-screen bg-slate-100 p-8 text-center text-slate-600">กำลังโหลดข้อมูลการส่งชั่วโมง...</main>
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 border-b border-slate-200 pb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Activity Hours / Submission</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">ส่งข้อมูลชั่วโมงกิจกรรม</h1>
          <p className="mt-2 text-slate-600">ตรวจสอบข้อมูลจากกิจกรรมที่จบแล้วก่อนยืนยันส่ง</p>
        </header>

        {activities.length === 0 ? (
          <section className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-semibold">ไม่พบกิจกรรมที่จบแล้ว</h2>
            <p className="mt-2 text-slate-600">หน้านี้เปิดได้เฉพาะกิจกรรมที่มีสถานะ “จบแล้ว”</p>
          </section>
        ) : (
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <ActivitySelector activities={activities} selectedId={selectedId} onChange={setSelectedId} />
            </section>

            {error ? (
              <p role="alert" className="rounded-lg bg-rose-50 p-4 text-rose-800">{error}</p>
            ) : submission ? (
              <>
                <section className="grid gap-4 sm:grid-cols-2">
                  <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">สถานะกิจกรรม</p>
                    <p className="mt-2 text-xl font-bold text-emerald-700">{submission.status}</p>
                  </article>
                  <article className={`rounded-xl border p-5 shadow-sm ${submission.projectNumber ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                    <p className="text-sm text-slate-600">เลขสรุปโครงการ</p>
                    <p className="mt-2 text-xl font-bold">{submission.projectNumberStatus}</p>
                    {submission.projectNumber && <p className="mt-1 text-sm text-slate-600">{submission.projectNumber}</p>}
                  </article>
                </section>

                {!submission.projectNumber && (
                  <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
                    <p className="font-semibold">ขอเลขสรุปจากกองกิจ</p>
                    <p className="mt-1 text-sm">ยังไม่สามารถส่งข้อมูลชั่วโมงได้จนกว่าเลขสรุปโครงการจะพร้อม</p>
                  </div>
                )}

                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 p-6">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold">Preview ไฟล์ Excel</h2>
                        <p className="mt-1 text-sm text-slate-500">Template: {submission.preview.templateId} / version {submission.preview.templateVersion}</p>
                      </div>
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800">{submission.preview.rows.length} รายการ</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-left text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-6 py-3 font-semibold">ชื่อ</th>
                          <th className="px-6 py-3 font-semibold">บทบาท</th>
                          <th className="px-6 py-3 font-semibold">ประเภทชั่วโมง</th>
                          <th className="px-6 py-3 text-right font-semibold">ชั่วโมง</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {submission.preview.rows.map((row) => (
                          <tr key={`${row.name}-${row.role}`}>
                            <td className="px-6 py-4 font-medium">{row.name}</td>
                            <td className="px-6 py-4 text-slate-600">{row.role}</td>
                            <td className="px-6 py-4 text-slate-600">{row.hourType}</td>
                            <td className="px-6 py-4 text-right text-slate-600">{row.hours}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-start gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 accent-teal-700"
                      checked={checked}
                      onChange={(event) => setChecked(event.target.checked)}
                    />
                    <span>ตรวจสอบความครบถ้วนของข้อมูลในไฟล์แล้ว</span>
                  </label>
                  <button
                    type="button"
                    disabled={!checked || !submission.projectNumber}
                    className="rounded-lg bg-teal-700 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    ยืนยันส่งข้อมูล
                  </button>
                </section>
              </>
            ) : null}
          </div>
        )}
      </div>
    </main>
  )
}
