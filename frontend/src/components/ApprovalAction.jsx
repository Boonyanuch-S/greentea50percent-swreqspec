import { useState } from 'react'
import { approvalApi } from '../api/client.js'

// อนุมัติจากหน้ารายละเอียดและแสดงผล API ตาม FR-VDC-04 และ FR-VDC-05
export default function ApprovalAction({
  submissionId,
  reviewerUserId,
  session,
  onApproved,
}) {
  const [approving, setApproving] = useState(false)
  const [approvalResult, setApprovalResult] = useState(null)
  const [error, setError] = useState('')

  async function approve() {
    setError('')
    if (!reviewerUserId) {
      setError('ไม่พบข้อมูลผู้อนุมัติใน session')
      return
    }

    setApproving(true)
    try {
      const result = await approvalApi.approveSubmission(
        submissionId,
        reviewerUserId,
        session,
      )
      setApprovalResult(result)
      onApproved?.(result)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'ไม่สามารถอนุมัติเอกสารได้ กรุณาลองใหม่อีกครั้ง',
      )
    } finally {
      setApproving(false)
    }
  }

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-label="การอนุมัติเอกสาร"
    >
      <h2 className="text-xl font-bold text-slate-950">การอนุมัติเอกสาร</h2>
      {!reviewerUserId && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          ไม่พบข้อมูลผู้อนุมัติใน session
        </p>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      {approvalResult && (
        <div role="status" aria-live="polite" className="mt-4 rounded-lg bg-teal-50 p-4 text-teal-900">
          <p>สถานะการอนุมัติ: {approvalResult.status}</p>
          <p>ส่งต่อไปยัง: {approvalResult.handoff.target_use_case}</p>
        </div>
      )}
      <button
        type="button"
        className="mt-5 rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        disabled={approving || !reviewerUserId || approvalResult !== null}
        onClick={approve}
      >
        {approving ? 'กำลังส่งต่อ...' : 'อนุมัติและส่งต่อให้อาจารย์'}
      </button>
    </section>
  )
}
