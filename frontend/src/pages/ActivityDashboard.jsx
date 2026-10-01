import { useEffect, useState } from 'react'

const statusStyles = {
  'รอตรวจสอบ': 'border-amber-200 bg-amber-50 text-amber-900',
  'อนุมัติสมบูรณ์': 'border-emerald-200 bg-emerald-50 text-emerald-900',
  ตีกลับ: 'border-rose-200 bg-rose-50 text-rose-900',
}

function totalActivities(statusCounts) {
  return statusCounts.reduce((total, item) => total + item.count, 0)
}

// แสดงภาพรวมกิจกรรมตามเทอม รองรับ FR-DSH-01, FR-DSH-02 และ ASM-02
export default function ActivityDashboard({ client }) {
  const [selectedSemester, setSelectedSemester] = useState('2569-1')
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    client.getSummary(selectedSemester).then((result) => {
      if (active) {
        setSummary(result)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [client, selectedSemester])

  const statusCounts = summary?.statusCounts ?? []
  const skillGroups = summary?.skillGroups ?? []
  const maxSkillCount = Math.max(...skillGroups.map((item) => item.count), 0)
  const hasData = statusCounts.length > 0 || skillGroups.length > 0

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              Science Club / Activity Overview
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">ภาพรวมกิจกรรม</h1>
            <p className="mt-2 text-slate-600">ข้อมูลกิจกรรมของสโมสรคณะวิทยาศาสตร์ที่คุณดูแล</p>
          </div>
          <label className="flex min-w-64 flex-col gap-2 text-sm font-semibold text-slate-700">
            เทอมที่ต้องการดู
            <select
              aria-label="เทอมที่ต้องการดู"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal shadow-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              value={selectedSemester}
              onChange={(event) => setSelectedSemester(event.target.value)}
            >
              {(summary?.terms ?? []).map((term) => (
                <option key={term.id} value={term.id}>
                  {term.label}
                </option>
              ))}
            </select>
          </label>
        </header>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
            กำลังโหลดข้อมูล Dashboard...
          </div>
        ) : !hasData ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">ยังไม่มีข้อมูลกิจกรรม</h2>
            <p className="mt-2 text-slate-600">ไม่พบกิจกรรมในเทอมที่เลือก</p>
          </div>
        ) : (
          <div className="space-y-6">
            <section aria-labelledby="status-heading">
              <div className="mb-3 flex items-center justify-between">
                <h2 id="status-heading" className="text-lg font-bold text-slate-950">จำนวนกิจกรรมตามสถานะ</h2>
                <span className="text-sm text-slate-500">รวม {totalActivities(statusCounts)} กิจกรรม</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {statusCounts.map((item) => (
                  <article key={item.status} className={`rounded-xl border p-5 shadow-sm ${statusStyles[item.status] ?? 'border-slate-200 bg-white'}`}>
                    <p className="text-sm font-medium">{item.status}</p>
                    <p className="mt-3 text-4xl font-bold">{item.count}</p>
                    <p className="mt-1 text-sm opacity-75">กิจกรรม</p>
                  </article>
                ))}
              </div>
            </section>

            <section aria-labelledby="skills-heading" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 id="skills-heading" className="text-lg font-bold text-slate-950">สัดส่วนตามกลุ่มทักษะ/ตัวชี้วัด</h2>
                <p className="mt-1 text-sm text-slate-500">จำนวนกิจกรรมที่มีข้อมูลในแต่ละกลุ่ม</p>
              </div>
              <div className="space-y-5">
                {skillGroups.map((item) => (
                  <div key={item.name}>
                    <div className="mb-2 flex justify-between gap-4 text-sm">
                      <span className="font-medium text-slate-700">{item.name}</span>
                      <span className="font-semibold text-teal-700">{item.count} กิจกรรม</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-teal-600 transition-all"
                        style={{ width: `${(item.count / maxSkillCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
