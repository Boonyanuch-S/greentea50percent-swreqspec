import { useEffect, useState } from 'react'
import Button from '../components/Button.jsx'
import { confirmAction } from '../utils/alerts.js'

const PENDING_STATUS = 'รออนุมัติ'

// แผงตรวจของกองกิจ รองรับ FR-APR-05, FR-APR-06 และ IF-UC01-02
export default function ProjectOfficeReviewPanel({ client, onBack }) {
  const [approval, setApproval] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    client.getApproval()
      .then((result) => {
        if (active) setApproval(result)
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

  async function submitDecision(request, successMessage) {
    setError('')
    setSubmitting(true)
    try {
      const result = await request()
      setApproval((current) => ({ ...current, status: result.status }))
      setMessage(successMessage(result))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ตรวจผ่านแล้วเป็นอนุมัติสมบูรณ์ตาม FR-APR-05 (กล่องยืนยันตาม FR-APR-08)
  async function handlePass() {
    const confirmed = await confirmAction({
      title: 'ยืนยันตรวจผ่าน?',
      text: 'เอกสารจะเป็นอนุมัติสมบูรณ์ และระบบจะแจ้งกรรมการสโมสร',
      confirmText: 'ตรวจผ่าน',
    })
    if (!confirmed) return
    submitDecision(
      () => client.passReview(),
      (result) => `ตรวจผ่านแล้ว สถานะเอกสาร: ${result.status}`,
    )
  }

  // ส่งเอกสารทั้งชุดกลับพร้อมคอมเมนต์ตาม FR-APR-06 และ IF-UC01-02 (กล่องยืนยันตาม FR-APR-08)
  async function handleReturn(event) {
    event.preventDefault()
    const confirmed = await confirmAction({
      title: 'ตีกลับเอกสารทั้งชุด?',
      text: 'ระบบจะส่งเอกสารทั้งชุดพร้อมคอมเมนต์กลับให้กรรมการสโมสรแก้ไข',
      confirmText: 'ตีกลับเอกสาร',
      danger: true,
    })
    if (!confirmed) return
    submitDecision(
      () => client.returnDocuments(comment),
      (result) => `ส่งเอกสารทั้งชุดกลับ ${result.target_use_case} แล้ว สถานะเอกสาร: ${result.status}`,
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
        กำลังโหลดเอกสาร...
      </div>
    )
  }

  if (!approval) {
    return <p role="alert" className="p-6 text-red-700">{error}</p>
  }

  const canDecide = approval.status === PENDING_STATUS && Boolean(approval.coverSheet) && !submitting

  return (
    <div className="mx-auto max-w-5xl">
      {onBack && (
        <button
          type="button"
          className="mb-5 rounded-lg px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-200"
          onClick={onBack}
        >
          ← กลับรายการเอกสาร
        </button>
      )}
      <header className="mb-8 border-b border-slate-200 pb-6">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
          Student Affairs Review / Project Documents
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">ตรวจเอกสารโครงการ</h1>
            {approval.projectName && <p className="mt-2 font-semibold text-slate-800">{approval.projectName}</p>}
            <p className="mt-2 text-slate-600">ตรวจเอกสารทั้งชุดและใบปะหน้าที่เซ็นแล้ว ก่อนให้ผ่านหรือตีกลับ</p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800">
            สถานะ: {approval.status}
          </span>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" aria-label="เอกสารทั้งชุด">
          <h2 className="text-xl font-bold text-slate-950">เอกสารทั้งชุด</h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {approval.documents.map((document) => (
              <li key={document.id} className="py-3">
                <p className="text-sm font-semibold text-teal-700">{document.type}</p>
                <p className="mt-1 font-semibold text-slate-950">{document.title}</p>
                <p className="mt-1 text-sm text-slate-500">ไฟล์อ้างอิง: {document.reference}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
            ใบปะหน้าที่เซ็นแล้ว: {approval.coverSheet?.fileName ?? 'ยังไม่มีไฟล์'}
          </p>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" aria-label="ผลการตรวจ">
            <h2 className="text-xl font-bold text-slate-950">ผลการตรวจ</h2>
            <Button type="button" className="mt-5 sm:w-auto" disabled={!canDecide} onClick={handlePass}>
              ตรวจผ่าน
            </Button>
          </section>

          <form
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            aria-label="การตีกลับเอกสาร"
            onSubmit={handleReturn}
          >
            <h2 className="text-xl font-bold text-slate-950">ตีกลับเอกสาร</h2>
            <label className="mt-4 flex flex-col gap-2 text-sm font-semibold text-slate-700">
              คอมเมนต์รายละเอียดที่ต้องแก้ไข
              <textarea
                className="min-h-28 rounded-lg border border-slate-300 p-3 font-normal"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                aria-required="true"
              />
            </label>
            <button
              type="submit"
              className="mt-4 rounded-lg border border-rose-300 px-4 py-2 font-semibold text-rose-800 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!canDecide || !comment.trim()}
            >
              ตีกลับเอกสารทั้งชุด
            </button>
          </form>

          {message && <p role="status" className="rounded-lg bg-teal-50 p-4 text-sm text-teal-900">{message}</p>}
          {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        </div>
      </div>
    </div>
  )
}
