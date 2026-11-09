import { useEffect, useState } from 'react'
import Button from '../components/Button.jsx'
import { EmptyState, LoadingCard, Notice } from '../components/Feedback.jsx'
import PageHeader, { CountBadge } from '../components/PageHeader.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { confirmAction } from '../utils/alerts.js'

// แสดงเฉพาะกิจกรรมที่จบแล้ว รองรับ FR-SBH-01
function ActivitySelector({ activities, selectedId, onChange }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      เลือกกิจกรรมที่จบแล้ว
      <select
        aria-label="เลือกกิจกรรมที่จบแล้ว"
        className="form-input mt-2"
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

// แสดงหน้าส่งชั่วโมงตาม FR-SBH-01, FR-SBH-03, FR-SBH-04, FR-SBH-06 และ FR-SBH-07
export default function HoursSubmission({ client, onOpenLateSubmission }) {
  const [activities, setActivities] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [submission, setSubmission] = useState(null)
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submittedIds, setSubmittedIds] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    client.getFinishedActivities().then((result) => {
      if (!active) return
      setActivities(result)
      setSelectedId(result[0]?.id ?? '')
    }).catch((reason) => {
      if (active) setError(reason.message)
    }).finally(() => {
      if (active) setLoading(false)
    })

    return () => {
      active = false
    }
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

  // ส่งข้อมูลชั่วโมงเข้าคิวของกองกิจตาม FR-SBH-05 หลังยืนยัน
  async function handleSubmitHours() {
    const confirmed = await confirmAction({
      title: 'ยืนยันส่งข้อมูลชั่วโมง?',
      text: `ส่งข้อมูล ${submission.preview.rows.length} รายการให้กองกิจตรวจสอบ`,
      confirmText: 'ส่งข้อมูล',
    })
    if (!confirmed) return
    setSubmitting(true)
    setError('')
    try {
      await client.submitHours(selectedId)
      setSubmittedIds((current) => [...current, selectedId])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !submission) {
    return <LoadingCard>กำลังโหลดข้อมูลการส่งชั่วโมง...</LoadingCard>
  }

  if (error && activities.length === 0) {
    return <Notice tone="danger" role="alert">{error}</Notice>
  }

  return (
    <div>
      <PageHeader
        title="ส่งข้อมูลชั่วโมงกิจกรรม"
        description="ตรวจสอบข้อมูลจากกิจกรรมที่จบแล้วก่อนยืนยันส่ง"
      />

      {activities.length === 0 ? (
        <section className="card">
          <EmptyState title="ไม่พบกิจกรรมที่จบแล้ว" description="หน้านี้เปิดได้เฉพาะกิจกรรมที่มีสถานะ “จบแล้ว”" />
        </section>
      ) : (
        <div className="space-y-6">
          <section className="card grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <ActivitySelector activities={activities} selectedId={selectedId} onChange={setSelectedId} />
            {submission && !error && (
              <dl className="flex flex-wrap gap-x-8 gap-y-3 text-sm sm:pb-1">
                <div>
                  <dt className="text-slate-500">สถานะกิจกรรม</dt>
                  <dd className="mt-1"><StatusBadge status={submission.status} /></dd>
                </div>
                {submission.preview && (
                  <div>
                    <dt className="text-slate-500">เลขสรุปโครงการ</dt>
                    <dd className={`mt-1 font-semibold ${submission.projectNumber ? 'text-emerald-800' : 'text-amber-800'}`}>
                      {submission.projectNumberStatus}
                      {submission.projectNumber && <span className="ml-2 font-normal text-slate-600">{submission.projectNumber}</span>}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </section>

          {error ? (
            <Notice tone="danger" role="alert">{error}</Notice>
          ) : submission ? (
            <>
              {submission.deadlineExceeded === true && (
                <Notice tone="warning" title="กำหนดส่งของกองกิจผ่านแล้ว" role="status">
                  <p>
                    สามารถยื่นคำขอผ่อนผันเวลาส่งช้าได้{' '}
                    <a
                      className="font-semibold text-teal-800 underline"
                      href="?view=late-submission"
                      onClick={(event) => {
                        if (onOpenLateSubmission) {
                          event.preventDefault()
                          onOpenLateSubmission()
                        }
                      }}
                    >
                      ไปที่ UC-11 เพื่อขอผ่อนผันเวลาส่งช้า
                    </a>
                  </p>
                </Notice>
              )}

              {submission.preview && !submission.projectNumber && (
                <Notice tone="warning" title="ขอเลขสรุปจากกองกิจ" role="status">
                  <p>ยังไม่สามารถส่งข้อมูลชั่วโมงได้จนกว่าเลขสรุปโครงการจะพร้อม</p>
                </Notice>
              )}

              {submission.preview && (
                <section className="card overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-950">Preview ไฟล์ Excel</h2>
                      <p className="mt-0.5 text-sm text-slate-500">Template: {submission.preview.templateId} / version {submission.preview.templateVersion}</p>
                    </div>
                    <CountBadge label="รายการ" value={submission.preview.rows.length} />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs text-slate-500">
                        <tr>
                          <th className="px-6 py-3 font-semibold">ชื่อ</th>
                          <th className="px-6 py-3 font-semibold">บทบาท</th>
                          <th className="px-6 py-3 font-semibold">ประเภทชั่วโมง</th>
                          <th className="px-6 py-3 text-right font-semibold">ชั่วโมง</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {submission.preview.rows.map((row) => (
                          <tr key={`${row.name}-${row.role}`} className="transition-colors hover:bg-slate-50">
                            <td className="px-6 py-3.5 font-medium text-slate-900">{row.name}</td>
                            <td className="px-6 py-3.5 text-slate-600">{row.role}</td>
                            <td className="px-6 py-3.5 text-slate-600">{row.hourType}</td>
                            <td className="px-6 py-3.5 text-right tabular-nums text-slate-900">{row.hours}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {submittedIds.includes(selectedId) && (
                <Notice tone="success" role="status">ส่งข้อมูลเข้าคิวตรวจของกองกิจแล้ว</Notice>
              )}

              {submission.preview && (
                <section className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="form-checkbox mt-1"
                      checked={checked}
                      onChange={(event) => setChecked(event.target.checked)}
                    />
                    <span>ตรวจสอบความครบถ้วนของข้อมูลในไฟล์แล้ว</span>
                  </label>
                  <Button
                    type="button"
                    disabled={!checked || !submission.projectNumber || submitting || !client.submitHours || submittedIds.includes(selectedId)}
                    onClick={handleSubmitHours}
                  >
                    {submittedIds.includes(selectedId) ? 'ส่งข้อมูลแล้ว' : submitting ? 'กำลังส่ง...' : 'ยืนยันส่งข้อมูล'}
                  </Button>
                </section>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}
