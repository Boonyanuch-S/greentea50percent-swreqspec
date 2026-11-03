import { useState } from 'react'
import { approvalApi } from '../api/client.js'
import Button from './Button.jsx'
import { Notice } from './Feedback.jsx'

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
      className="card p-6"
      aria-label="การอนุมัติเอกสาร"
    >
      <h2 className="text-lg font-bold text-slate-950">การอนุมัติเอกสาร</h2>
      {!reviewerUserId && (
        <Notice tone="danger" role="alert" className="mt-3">
          ไม่พบข้อมูลผู้อนุมัติใน session
        </Notice>
      )}
      {error && <Notice tone="danger" role="alert" className="mt-3">{error}</Notice>}
      {approvalResult && (
        <Notice tone="success" role="status" aria-live="polite" className="mt-4">
          <p>สถานะการอนุมัติ: {approvalResult.status}</p>
          <p>ส่งต่อไปยัง: อาจารย์ที่ปรึกษา</p>
        </Notice>
      )}
      <Button
        type="button"
        className="mt-4 w-full"
        disabled={approving || !reviewerUserId || approvalResult !== null}
        onClick={approve}
      >
        {approving ? 'กำลังส่งต่อ...' : 'อนุมัติและส่งต่อให้อาจารย์'}
      </Button>
    </section>
  )
}
