import { useEffect, useState } from 'react'

function formatDate(value) {
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(new Date(value))
}

// แสดงกิจกรรมที่เลยกำหนดและให้เลือกเริ่มคำขอ รองรับ FR-LATE-01.
export default function LateSubmissionPage({ client }) {
  const [activities, setActivities] = useState([])
  const [selectedActivityId, setSelectedActivityId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    client.getLateActivities().then((items) => {
      if (active) {
        setActivities(items)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [client])

  const selectedActivity = activities.find((activity) => activity.activityId === selectedActivityId)

  function handleStartRequest() {
    if (selectedActivity) {
      setMessage(`เลือกกิจกรรม ${selectedActivity.name} เพื่อเริ่มคำขอย้อนหลัง`)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 border-b border-slate-200 pb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Science Club / Late Hours</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">ขอบันทึกชั่วโมงย้อนหลัง</h1>
          <p className="mt-2 text-slate-600">เลือกกิจกรรมที่เลยกำหนดเวลาปกติเพื่อเริ่มคำขอ</p>
        </header>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">กำลังโหลดรายการกิจกรรม...</div>
        ) : activities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">ไม่พบกิจกรรมที่เลยกำหนด</div>
        ) : (
          <div className="space-y-5">
            <ol className="space-y-4" aria-label="กิจกรรมที่เลยกำหนด">
              {activities.map((activity) => (
                <li key={activity.activityId}>
                  <button
                    type="button"
                    className={`w-full rounded-xl border bg-white p-5 text-left shadow-sm transition hover:border-teal-400 ${selectedActivityId === activity.activityId ? 'border-teal-600 ring-2 ring-teal-100' : 'border-slate-200'}`}
                    onClick={() => setSelectedActivityId(activity.activityId)}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-slate-950">{activity.name}</h2>
                        <p className="mt-1 text-sm text-slate-500">วันที่จัดกิจกรรม: {formatDate(activity.activityDate)}</p>
                      </div>
                      <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800">{activity.status}</span>
                    </div>
                    <p className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-600">กำหนดส่งปกติ: {formatDate(activity.regularSubmissionDeadline)}</p>
                  </button>
                </li>
              ))}
            </ol>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" aria-live="polite">
              <h2 className="text-lg font-bold text-slate-950">เริ่มคำขอย้อนหลัง</h2>
              <p className="mt-2 text-sm text-slate-600">
                {selectedActivity ? `กิจกรรมที่เลือก: ${selectedActivity.name}` : 'เลือกกิจกรรมจากรายการก่อนเริ่มคำขอ'}
              </p>
              <button
                type="button"
                className="mt-4 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={!selectedActivity}
                onClick={handleStartRequest}
              >
                เริ่มคำขอ
              </button>
              {message && <p className="mt-4 text-sm text-teal-800" role="status">{message}</p>}
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
