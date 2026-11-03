import { useEffect, useState } from 'react'
import Button from '../components/Button.jsx'
import { LoadError, LoadingCard, Notice } from '../components/Feedback.jsx'
import PageHeader from '../components/PageHeader.jsx'
import ReturnDocumentPicker, { composeReturnReason } from '../components/ReturnDocumentPicker.jsx'
import { OtherChecklistResults, ResultBadge, ReviewHistory, resultForDocument } from '../components/ReviewContext.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { confirmAction, showDocument } from '../utils/alerts.js'

const PENDING_STATUS = 'รออนุมัติ'

// แผงตรวจของกองกิจ รองรับ FR-APR-05, FR-APR-06 และ IF-UC01-02
export default function ProjectOfficeReviewPanel({ client, onBack }) {
  const [approval, setApproval] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [comment, setComment] = useState('')
  const [returnDocuments, setReturnDocuments] = useState([])
  const [reviewContext, setReviewContext] = useState(null)
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
    client.getReviewContext?.()
      .then((context) => {
        if (active) setReviewContext(context)
      })
      .catch(() => {})
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

  // เปิดไฟล์เอกสารและใบปะหน้าที่อัปโหลดเข้ามาเพื่อตรวจทั้งชุดตาม FR-APR-05
  async function openFile(loadFile, title, name) {
    setError('')
    try {
      const file = await loadFile()
      const url = URL.createObjectURL(file)
      await showDocument({ title, name, url, type: file.type })
      URL.revokeObjectURL(url)
    } catch (requestError) {
      setError(requestError.message)
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
      () => client.returnDocuments(composeReturnReason(returnDocuments, comment)),
      (result) => `ส่งเอกสารทั้งชุดกลับให้กรรมการสโมสรแก้ไขแล้ว สถานะเอกสาร: ${result.status}`,
    )
  }

  if (loading) {
    return <LoadingCard>กำลังโหลดเอกสาร...</LoadingCard>
  }

  if (!approval) {
    return <LoadError message={error} backLabel="← กลับรายการเอกสาร" onBack={onBack} />
  }

  const canDecide = approval.status === PENDING_STATUS && Boolean(approval.coverSheet) && !submitting

  return (
    <div>
      {onBack && (
        <Button type="button" variant="ghost" size="sm" className="mb-3 -ml-3" onClick={onBack}>
          ← กลับรายการเอกสาร
        </Button>
      )}
      <PageHeader
        eyebrow="กองกิจการนักศึกษา · เอกสารโครงการ"
        title={approval.projectName ?? 'ตรวจเอกสารโครงการ'}
        description="ตรวจเอกสารทั้งชุดและใบปะหน้าที่เซ็นแล้ว ก่อนให้ผ่านหรือตีกลับ"
      >
        <StatusBadge status={approval.status} label="สถานะ" />
      </PageHeader>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <section className="card p-6" aria-label="เอกสารทั้งชุด">
          <h2 className="text-lg font-bold text-slate-950">เอกสารทั้งชุด</h2>
          <ul className="mt-2 divide-y divide-slate-100">
            {approval.documents.map((document) => (
              <li key={document.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-xs font-semibold text-teal-700">
                    {document.type}
                    {reviewContext && <ResultBadge result={resultForDocument(reviewContext.facultyChecklist, document.type)} />}
                  </p>
                  <p className="mt-0.5 font-semibold text-slate-950">{document.title}</p>
                  <p className="mt-0.5 break-all text-sm text-slate-500">ไฟล์อ้างอิง: {document.reference}</p>
                </div>
                {client.getDocumentFile && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="shrink-0"
                    aria-label={`เปิดไฟล์ ${document.title}`}
                    onClick={() => openFile(() => client.getDocumentFile(document.id), document.title, document.reference)}
                  >
                    เปิดไฟล์
                  </Button>
                )}
              </li>
            ))}
          </ul>
          <OtherChecklistResults
            results={reviewContext?.facultyChecklist}
            documentTypes={approval.documents.map((document) => document.type)}
          />
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
            <p className="min-w-0 break-all text-sm text-slate-700">
              ใบปะหน้าที่เซ็นแล้ว: {approval.coverSheet?.fileName ?? 'ยังไม่มีไฟล์'}
            </p>
            {approval.coverSheet && client.getCoverSheetFile && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="shrink-0"
                aria-label="เปิดไฟล์ใบปะหน้าที่เซ็นแล้ว"
                onClick={() => openFile(() => client.getCoverSheetFile(), 'ใบปะหน้าที่เซ็นแล้ว', approval.coverSheet.fileName)}
              >
                เปิดไฟล์
              </Button>
            )}
          </div>
        </section>

        <div className="space-y-6">
          <ReviewHistory history={reviewContext?.history} />
          {message && <Notice tone="success" role="status">{message}</Notice>}
          {error && <Notice tone="danger" role="alert">{error}</Notice>}

          <section className="card p-6" aria-label="ผลการตรวจ">
            <h2 className="text-lg font-bold text-slate-950">ผลการตรวจ</h2>
            <Button type="button" className="mt-4 w-full" disabled={!canDecide} onClick={handlePass}>
              ตรวจผ่าน
            </Button>
          </section>

          <form className="card p-6" aria-label="การตีกลับเอกสาร" onSubmit={handleReturn}>
            <h2 className="text-lg font-bold text-slate-950">ตีกลับเอกสาร</h2>
            <ReturnDocumentPicker
              documents={approval.documents.map((item) => ({ id: item.id, label: item.type }))}
              selected={returnDocuments}
              onChange={setReturnDocuments}
            />
            <label className="mt-3 block text-sm font-semibold text-slate-700">
              คอมเมนต์รายละเอียดที่ต้องแก้ไข
              <textarea
                className="form-input mt-2 min-h-28"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                aria-required="true"
              />
            </label>
            <Button
              type="submit"
              variant="dangerOutline"
              className="mt-3 w-full"
              disabled={!canDecide || !comment.trim()}
            >
              ตีกลับเอกสารทั้งชุด
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
