import { useState } from 'react'
import { rejectionApi } from '../api/client.js'
import Button from './Button.jsx'
import { Notice } from './Feedback.jsx'
import ReturnDocumentPicker, { composeReturnReason } from './ReturnDocumentPicker.jsx'

// รับเหตุผล ยืนยันการตีกลับ และแสดงผลตาม FR-VDC-06 และ IF-UC01-01
export default function RejectDialog({
  submissionId,
  reviewerUserId,
  session,
  disabled = false,
  suggestedReason = '',
  documents = [],
  onRejected,
}) {
  const [open, setOpen] = useState(false)
  const [reasonText, setReasonText] = useState('')
  const [selectedDocuments, setSelectedDocuments] = useState([])
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
        composeReturnReason(selectedDocuments, reason),
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
      className="card p-6"
      aria-label="การตีกลับเอกสาร"
    >
      <h2 className="text-lg font-bold text-slate-950">การตีกลับเอกสาร</h2>
      {error && !open && <Notice tone="danger" role="alert" className="mt-3">{error}</Notice>}
      {rejectionResult && (
        <Notice tone="danger" role="status" aria-live="polite" className="mt-4">
          <p>สถานะการตีกลับ: {rejectionResult.status}</p>
          <p className="mt-1">เหตุผล: {rejectionResult.reason_text}</p>
          <p className="mt-1">
            ส่งเหตุผลให้กรรมการสโมสรแก้ไขแล้ว (คิวจำลอง)
          </p>
        </Notice>
      )}
      {!rejectionResult && (
        <Button
          type="button"
          variant="dangerOutline"
          className="mt-4 w-full"
          disabled={disabled || submitting || !reviewerUserId}
          onClick={() => {
            setError('')
            // ร่างเหตุผลจากรายการที่ผู้ตรวจระบุว่าไม่ครบ ผู้ตรวจแก้ไขได้ก่อนยืนยันตาม FR-VDC-06
            setReasonText((current) => current || suggestedReason)
            setOpen(true)
          }}
        >
          ตีกลับเอกสาร
        </Button>
      )}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-dialog-title"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 id="reject-dialog-title" className="text-lg font-bold text-slate-950">
              ยืนยันการตีกลับ
            </h3>
            {error && <Notice tone="danger" role="alert" className="mt-3">{error}</Notice>}
            <ReturnDocumentPicker documents={documents} selected={selectedDocuments} onChange={setSelectedDocuments} />
            <label className="mt-4 block text-sm font-semibold text-slate-700">
              เหตุผลในการตีกลับ
              <textarea
                autoFocus
                className="form-input mt-2 min-h-28"
                value={reasonText}
                onChange={(event) => setReasonText(event.target.value)}
                aria-required="true"
              />
            </label>
            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" variant="ghost" disabled={submitting} onClick={() => setOpen(false)}>
                ยกเลิก
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={submitting || !reasonText.trim()}
                onClick={reject}
              >
                {submitting ? 'กำลังส่งเหตุผล...' : 'ยืนยันตีกลับ'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
