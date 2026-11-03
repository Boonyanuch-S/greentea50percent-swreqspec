import { useEffect, useRef, useState } from 'react'
import Button from '../components/Button.jsx'
import DocumentFileViewer from '../components/DocumentFileViewer.jsx'
import { LoadError, LoadingCard, Notice } from '../components/Feedback.jsx'
import Icon from '../components/Icon.jsx'
import PageHeader from '../components/PageHeader.jsx'
import ReturnDocumentPicker, { composeReturnReason } from '../components/ReturnDocumentPicker.jsx'
import { OtherChecklistResults, ResultBadge, ReviewHistory, resultForDocument } from '../components/ReviewContext.jsx'
import StepIndicator from '../components/StepIndicator.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { confirmAction, showDocument } from '../utils/alerts.js'

const FORWARDED_STATUS = 'ส่งต่ออาจารย์'
// จุดที่อาจารย์ตรวจคุณภาพเอกสาร ตามบทสัมภาษณ์อาจารย์ที่ปรึกษาและ FR-APR-02
const REVIEW_POINTS = [
  'เข้าใจวัตถุประสงค์ของโครงการ',
  'รูปแบบและคำสะกดถูกต้อง',
  'ตัวชี้วัดตรงกับของคณะ',
  'มีแผน PDCA ครบ',
]
const PENDING_STATUS = 'รออนุมัติ'

function StepLabel({ number, done }) {
  return (
    <p className="flex items-center gap-2 text-sm font-semibold text-teal-700">
      <span aria-hidden="true" className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-teal-700 text-white' : 'bg-teal-50 text-teal-800'}`}>
        {done ? <Icon name="check" className="h-3.5 w-3.5" /> : number}
      </span>
      ขั้นที่ {number}
    </p>
  )
}

function formatDateTime(value) {
  if (!value) return 'ยังไม่ได้อนุมัติเนื้อหา'
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

// แสดงและดำเนินการตรวจเอกสารโครงการ รองรับ FR-APR-01 ถึง FR-APR-04
export default function ProjectApprovalPage({ client, onBack }) {
  const [approval, setApproval] = useState(null)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [returnComment, setReturnComment] = useState('')
  const [returnDocuments, setReturnDocuments] = useState([])
  const [reviewContext, setReviewContext] = useState(null)
  const [fileUnavailable, setFileUnavailable] = useState(false)
  const [tickedPoints, setTickedPoints] = useState({})
  const [reviewedIds, setReviewedIds] = useState([]) // อาจารย์ต้องยืนยันเองทีละฉบับ ระบบไม่ติ๊กให้
  const latestDocumentId = useRef(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const result = await client.getApproval()
        const firstDocument = await client.getDocument(result.documents[0].id)
        if (!active) return
        setApproval(result)
        setSelectedDocument(firstDocument)
        setReviewedIds(result.reviewedDocumentIds ?? [])
        if (client.getReviewContext) setReviewContext(await client.getReviewContext())
      } catch (requestError) {
        if (active) setError(requestError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [client])

  // เปิดเฉพาะเอกสารที่เลือกตาม FR-APR-01 และ AC-APR-03
  async function handleSelectDocument(documentId) {
    latestDocumentId.current = documentId
    setError('')
    try {
      const document = await client.getDocument(documentId)
      if (latestDocumentId.current === documentId) setSelectedDocument(document)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  function toggleReviewPoint(documentId, point) {
    setTickedPoints((current) => {
      const points = current[documentId] ?? []
      return {
        ...current,
        [documentId]: points.includes(point) ? points.filter((item) => item !== point) : [...points, point],
      }
    })
  }

  // เปิดใบปะหน้าที่อัปโหลดแล้วเพื่อตรวจไฟล์ก่อนส่งซ้ำตาม FR-APR-04 และ ASM-03
  async function handleOpenCoverSheet() {
    setError('')
    try {
      const file = await client.getCoverSheetFile()
      const url = URL.createObjectURL(file)
      await showDocument({ title: 'ใบปะหน้าที่เซ็นแล้ว', name: approval.coverSheet.fileName, url, type: file.type })
      URL.revokeObjectURL(url)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  // ยืนยันการตรวจเอกสารรายฉบับตาม FR-APR-02 ก่อนเปิดให้อนุมัติเนื้อหา การยกเลิกไม่ต้องยืนยันเพราะย้อนกลับได้
  async function toggleReviewed(document) {
    const reviewed = !reviewedIds.includes(document.id)
    if (reviewed) {
      const confirmed = await confirmAction({
        title: 'ยืนยันว่าตรวจฉบับนี้แล้ว?',
        text: `${document.title}: ตรวจวัตถุประสงค์ ตัวชี้วัด และรูปแบบเอกสารครบแล้ว`,
        confirmText: 'ตรวจแล้ว',
      })
      if (!confirmed) return
    }
    setError('')
    try {
      setReviewedIds(await client.setDocumentReviewed(document.id, reviewed))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  // บันทึกเวลาอนุมัติและแจ้งพิมพ์ใบปะหน้าตาม FR-APR-03 (กล่องยืนยันตาม FR-APR-08)
  async function handleApproveContent() {
    const confirmed = await confirmAction({
      title: 'อนุมัติเนื้อหา?',
      text: `ตรวจเอกสารครบ ${approval.documents.length} ฉบับแล้ว ระบบจะบันทึกวันเวลาอนุมัติ จากนั้นต้องพิมพ์ใบปะหน้าเพื่อขอลายเซ็นจริง`,
      confirmText: 'อนุมัติเนื้อหา',
    })
    if (!confirmed) return
    setError('')
    try {
      const result = await client.approveContent()
      setApproval((current) => ({ ...current, contentApprovedAt: result.contentApprovedAt }))
      setMessage(result.printMessage)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  // ส่งใบปะหน้าที่เซ็นแล้วตาม FR-APR-04 และ IF-UPLOAD-01 (กล่องยืนยันตาม FR-APR-08)
  async function handleUpload(event) {
    event.preventDefault()
    if (!selectedFile) return
    const confirmed = await confirmAction({
      title: 'ส่งใบปะหน้า?',
      text: `ส่งไฟล์ ${selectedFile.name} เข้าสู่ระบบ`,
      confirmText: 'ส่งไฟล์',
    })
    if (!confirmed) return
    setError('')
    try {
      const result = await client.uploadCoverSheet(selectedFile)
      setApproval((current) => ({
        ...current,
        status: result.status,
        coverSheet: { fileName: result.fileName },
      }))
      setMessage(`รับไฟล์ ${result.fileName} แล้ว และเปลี่ยนสถานะเป็น ${result.status}`)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  // ส่งเอกสารทั้งชุดกลับพร้อมความเห็นของอาจารย์ตาม IF-UC01-02 และกล่องยืนยันตาม FR-APR-08
  async function handleReturn(event) {
    event.preventDefault()
    const confirmed = await confirmAction({
      title: 'ส่งเอกสารกลับ?',
      text: 'ระบบจะส่งเอกสารทั้งชุดพร้อมความเห็นกลับให้กรรมการสโมสรแก้ไข',
      confirmText: 'ส่งเอกสารกลับ',
      danger: true,
    })
    if (!confirmed) return
    setError('')
    try {
      const result = await client.returnDocuments(composeReturnReason(returnDocuments, returnComment))
      setApproval((current) => ({ ...current, status: result.status }))
      setMessage(`ส่งเอกสารทั้งชุดกลับให้กรรมการสโมสรแก้ไขแล้ว สถานะเอกสาร: ${result.status}`)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  if (loading) {
    return <LoadingCard>กำลังโหลดหน้าอนุมัติ...</LoadingCard>
  }

  if (!approval) {
    return <LoadError message={error} backLabel="← กลับรายการเอกสาร" onBack={onBack} />
  }

  const isForwarded = approval.status === FORWARDED_STATUS
  const canUpload = (isForwarded || approval.status === PENDING_STATUS) && Boolean(approval.contentApprovedAt)
  const reviewedCount = approval.documents.filter((document) => reviewedIds.includes(document.id)).length
  const isSelectedReviewed = reviewedIds.includes(selectedDocument.id)
  const canMarkReviewed = isForwarded && !approval.contentApprovedAt
  const selectedPoints = isSelectedReviewed ? REVIEW_POINTS : tickedPoints[selectedDocument.id] ?? []
  const allPointsTicked = selectedPoints.length === REVIEW_POINTS.length
  const documentCount = approval.documents.length
  const nextDocument = approval.documents[approval.documents.findIndex((document) => document.id === selectedDocument.id) + 1]
  const currentStep = approval.coverSheet ? 3 : approval.contentApprovedAt ? 2 : reviewedCount === documentCount ? 1 : 0

  return (
    <div>
      {onBack && (
        <Button type="button" variant="ghost" size="sm" className="mb-3 -ml-3" onClick={onBack}>
          ← กลับรายการเอกสาร
        </Button>
      )}
      <PageHeader
        eyebrow="อาจารย์ที่ปรึกษา · เอกสารโครงการ"
        title={approval.projectName ?? 'อนุมัติเอกสารโครงการ'}
        description="ตรวจรายการเอกสารทั้งชุด อนุมัติเนื้อหา และส่งใบปะหน้าที่เซ็นแล้วกลับเข้าสู่ระบบ"
      >
        <StatusBadge status={approval.status} label="สถานะ" />
      </PageHeader>

      {(isForwarded || approval.status === PENDING_STATUS) && (
        <StepIndicator
          steps={[`ตรวจเอกสาร ${reviewedCount}/${documentCount}`, 'อนุมัติเนื้อหา', 'อัปโหลดใบปะหน้า']}
          current={currentStep}
        />
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside aria-label="รายการเอกสารโครงการ" className="card p-4 lg:sticky lg:top-20">
          <h2 className="px-1 text-base font-bold text-slate-950">เอกสารทั้งชุด</h2>
          <p className="mb-3 px-1 text-sm text-slate-500">ตรวจแล้ว {reviewedCount}/{documentCount} รายการ</p>
          <nav className="space-y-1.5">
            {approval.documents.map((document) => {
              const selected = selectedDocument?.id === document.id
              return (
                <button
                  key={document.id}
                  type="button"
                  aria-pressed={selected}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 ${selected ? 'border-teal-300 bg-teal-50 text-teal-900' : 'border-transparent text-slate-700 hover:bg-slate-100'}`}
                  onClick={() => handleSelectDocument(document.id)}
                >
                  {reviewContext && (
                    <span className="mb-1 flex items-center gap-1.5 text-xs text-slate-500">
                      ผลตรวจคณะ <ResultBadge result={resultForDocument(reviewContext.facultyChecklist, document.type)} />
                    </span>
                  )}
                  <span className="flex items-start justify-between gap-2 text-sm font-semibold">
                    {document.title}
                    {reviewedIds.includes(document.id) && (
                      <>
                        <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                        <span className="sr-only">ตรวจแล้ว</span>
                      </>
                    )}
                  </span>
                </button>
              )
            })}
          </nav>
          <OtherChecklistResults
            results={reviewContext?.facultyChecklist}
            documentTypes={approval.documents.map((document) => document.type)}
          />
        </aside>

        <div className="min-w-0 space-y-6">
          <ReviewHistory history={reviewContext?.history} />
          <article className="card p-6">
            <div className="mb-5 border-b border-slate-100 pb-5">
              <p className="text-sm font-semibold text-teal-700">{selectedDocument.type}</p>
              <h2 className="mt-0.5 text-xl font-bold text-slate-950">{selectedDocument.title}</h2>
              <p className="mt-1 text-sm text-slate-500">ไฟล์อ้างอิง: {selectedDocument.reference}</p>
            </div>

            {client.getDocumentFile && (
              <DocumentFileViewer
                key={selectedDocument.id}
                client={client}
                document={selectedDocument}
                onAvailabilityChange={(available) => setFileUnavailable(!available)}
              />
            )}

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <h3 className="mb-2 font-bold text-slate-950">วัตถุประสงค์</h3>
                <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 text-slate-700">
                  {selectedDocument.objectives.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-bold text-slate-950">ตัวชี้วัด</h3>
                <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 text-slate-700">
                  {selectedDocument.indicators.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-bold text-slate-950">รูปแบบเอกสาร</h3>
                <p className="text-sm leading-6 text-slate-700">{selectedDocument.format}</p>
              </div>
            </div>

            <fieldset className="mt-6 rounded-xl bg-slate-50 p-4">
              <legend className="px-1 text-sm font-semibold text-slate-900">จุดตรวจของอาจารย์</legend>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {REVIEW_POINTS.map((point) => (
                  <label key={point} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={selectedPoints.includes(point)}
                      disabled={!canMarkReviewed || isSelectedReviewed}
                      onChange={() => toggleReviewPoint(selectedDocument.id, point)}
                    />
                    {point}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant={isSelectedReviewed ? 'primary' : 'secondary'}
                aria-pressed={isSelectedReviewed}
                disabled={!canMarkReviewed || (fileUnavailable && !isSelectedReviewed) || !allPointsTicked}
                onClick={() => toggleReviewed(selectedDocument)}
              >
                {isSelectedReviewed && <Icon name="check" className="h-4 w-4" />}
                ตรวจฉบับนี้แล้ว
              </Button>
              {nextDocument ? (
                <Button type="button" variant="ghost" onClick={() => handleSelectDocument(nextDocument.id)}>
                  เอกสารถัดไป: {nextDocument.title}
                  <Icon name="arrowRight" className="h-4 w-4" />
                </Button>
              ) : (
                <a
                  href="#approval-actions"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                >
                  ไปขั้นตอนการอนุมัติ
                  <Icon name="arrowRight" className="h-4 w-4" />
                </a>
              )}
            </div>
          </article>

          {message && <Notice tone="success" role="status">{message}</Notice>}
          {error && <Notice tone="danger" role="alert">{error}</Notice>}

          <section id="approval-actions" className="grid scroll-mt-24 gap-6 md:grid-cols-2">
            <article className="card flex flex-col p-6">
              <StepLabel number={1} done={Boolean(approval.contentApprovedAt)} />
              <h2 className="mt-2 text-lg font-bold text-slate-950">อนุมัติเนื้อหาออนไลน์</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">วันเวลาที่อนุมัติ: {formatDateTime(approval.contentApprovedAt)}</p>
              <p className="mt-1 flex-1 text-sm font-medium text-amber-800">
                {canMarkReviewed && reviewedCount < documentCount
                  ? `ตรวจเอกสารให้ครบก่อน เหลืออีก ${documentCount - reviewedCount} ฉบับ`
                  : ''}
              </p>
              <Button
                type="button"
                className="mt-5 w-full"
                onClick={handleApproveContent}
                disabled={!canMarkReviewed || reviewedCount < documentCount}
              >
                {approval.contentApprovedAt ? 'อนุมัติเนื้อหาแล้ว' : 'อนุมัติเนื้อหา'}
              </Button>
            </article>

            <article className="card p-6">
              <StepLabel number={2} done={Boolean(approval.coverSheet)} />
              <h2 className="mt-2 text-lg font-bold text-slate-950">อัปโหลดใบปะหน้าที่เซ็นแล้ว</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {approval.coverSheet
                  ? `ไฟล์ล่าสุด: ${approval.coverSheet.fileName}`
                  : 'เลือกไฟล์สแกนหรือรูปถ่ายใบปะหน้าที่เซ็นแล้วเพื่อส่งกลับเข้าสู่ระบบ'}
              </p>
              {!approval.contentApprovedAt && (
                <p className="mt-1 text-sm font-medium text-amber-800">อัปโหลดได้หลังอนุมัติเนื้อหาในขั้นที่ 1</p>
              )}
              {approval.coverSheet && client.getCoverSheetFile && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  aria-label="เปิดไฟล์ใบปะหน้าที่เซ็นแล้ว"
                  onClick={handleOpenCoverSheet}
                >
                  เปิดไฟล์
                </Button>
              )}
              <form className="mt-4" onSubmit={handleUpload}>
                <label className="block text-sm font-semibold text-slate-700" htmlFor="cover-sheet">ไฟล์ใบปะหน้า</label>
                <input
                  id="cover-sheet"
                  className="form-input mt-2 !px-2 !py-1.5 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-teal-800 hover:file:bg-teal-100"
                  type="file"
                  accept={approval.coverSheetAccept}
                  disabled={!canUpload}
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                />
                <Button type="submit" className="mt-3 w-full" disabled={!canUpload || !selectedFile}>
                  รับไฟล์ใบปะหน้า
                </Button>
              </form>
            </article>

            <form className="card md:col-span-2" aria-label="การส่งเอกสารกลับ" onSubmit={handleReturn}>
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
                  <span>
                    <span className="block text-lg font-bold text-slate-950">ส่งเอกสารกลับให้แก้ไข</span>
                    <span className="block text-sm text-slate-500">ใช้เมื่อไม่เห็นด้วยกับเอกสารบางส่วน</span>
                  </span>
                  <Icon name="arrowRight" className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-6 pb-6">
                  <ReturnDocumentPicker
                    documents={approval.documents.map((item) => ({ id: item.id, label: item.type }))}
                    selected={returnDocuments}
                    onChange={setReturnDocuments}
                    disabled={!isForwarded}
                  />
                  <label className="mt-3 block text-sm font-semibold text-slate-700">
                    ความเห็นของอาจารย์
                    <textarea
                      className="form-input mt-2 min-h-28"
                      value={returnComment}
                      onChange={(event) => setReturnComment(event.target.value)}
                      disabled={!isForwarded}
                      aria-required="true"
                    />
                  </label>
                  <Button
                    type="submit"
                    variant="dangerOutline"
                    className="mt-3"
                    disabled={!isForwarded || !returnComment.trim()}
                  >
                    ส่งเอกสารกลับ
                  </Button>
                </div>
              </details>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
