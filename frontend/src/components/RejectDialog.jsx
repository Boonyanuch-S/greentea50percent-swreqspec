import { useState } from 'react'
import { rejectionApi } from '../api/client.js'

// รับเหตุผล ยืนยันการตีกลับ และแสดงผลตาม FR-VDC-06 และ IF-UC01-01
export default function RejectDialog({
  submissionId,
  reviewerUserId,
  session,
  disabled = false,
  onRejected,
}) {
  const [open, setOpen] = useState(false)
  const [reasonText, setReasonText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [rejectionResult, setRejectionResult] = useState(null)
  const [error, setError] = useState('')

  async function reject() {
    setError('')
    if (!reviewerUserId) {
      setError('ไม่พบข้อมูลผู้อนุมัติใน session')
      return
    }

    const reason = reasonText.trim()
    if (!reason) {
      setError('กรุณาระบุเหตุผลในการตีกลับ')
      return
    }

    setSubmitting(true)
    try {
      const result = await rejectionApi.rejectSubmission(
        submissionId,
        reviewerUserId,
        reason,
        session,
      )
      setRejectionResult(result)
      setOpen(false)
      onRejected?.(result)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'ไม่สามารถตีกลับเอกสารได้ กรุณาลองใหม่อีกครั้ง',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-label="การตีกลับเอกสาร"
    >
      <h2 className="text-xl font-bold text-slate-950">การตีกลับเอกสาร</h2>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      {rejectionResult && (
        <div role="status" aria-live="polite" className="mt-4 rounded-lg bg-rose-50 p-4 text-rose-900">
          <p>สถานะการตีกลับ: {rejectionResult.status}</p>
          <p className="mt-1">เหตุผล: {rejectionResult.reason_text}</p>
          <p className="mt-1 text-sm">
            ส่งเหตุผลเข้าคิวจำลอง {rejectionResult.notification.target_use_case} แล้ว
          </p>
        </div>
      )}
      {!rejectionResult && (
        <button
          type="button"
          className="mt-5 rounded-lg border border-rose-300 px-4 py-2 font-semibold text-rose-800 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled || submitting || !reviewerUserId}
          onClick={() => {
            setError('')
            setOpen(true)
          }}
        >
          ตีกลับเอกสาร
        </button>
      )}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-dialog-title"
        >
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h3 id="reject-dialog-title" className="text-lg font-bold text-slate-950">
              ยืนยันการตีกลับ
            </h3>
            <label className="mt-4 flex flex-col gap-2 text-sm font-semibold text-slate-700">
              เหตุผลในการตีกลับ
              <textarea
                autoFocus
                className="min-h-28 rounded-lg border border-slate-300 p-3 font-normal"
                value={reasonText}
                onChange={(event) => setReasonText(event.target.value)}
                aria-required="true"
              />
            </label>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
                disabled={submitting}
                onClick={() => setOpen(false)}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="rounded-lg bg-rose-700 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitting || !reasonText.trim()}
                onClick={reject}
              >
                {submitting ? 'กำลังส่งเหตุผล...' : 'ยืนยันตีกลับ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
