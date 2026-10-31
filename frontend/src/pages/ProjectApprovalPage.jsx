import { useEffect, useRef, useState } from 'react'
import Button from '../components/Button.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { confirmAction } from '../utils/alerts.js'

const FORWARDED_STATUS = 'ส่งต่ออาจารย์'
const PENDING_STATUS = 'รออนุมัติ'

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

  // บันทึกเวลาอนุมัติและแจ้งพิมพ์ใบปะหน้าตาม FR-APR-03 (กล่องยืนยันตาม FR-APR-08)
  async function handleApproveContent() {
    const confirmed = await confirmAction({
      title: 'อนุมัติเนื้อหา?',
      text: 'ระบบจะบันทึกวันเวลาอนุมัติ จากนั้นต้องพิมพ์ใบปะหน้าเพื่อขอลายเซ็นจริง',
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
      const result = await client.returnDocuments(returnComment)
      setApproval((current) => ({ ...current, status: result.status }))
      setMessage(`ส่งเอกสารทั้งชุดกลับ ${result.target_use_case} แล้ว สถานะเอกสาร: ${result.status}`)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
        กำลังโหลดหน้าอนุมัติ...
      </div>
    )
  }

  if (!approval) {
    return <p role="alert" className="p-6 text-red-700">{error}</p>
  }

  const isForwarded = approval.status === FORWARDED_STATUS
  const canUpload = (isForwarded || approval.status === PENDING_STATUS) && Boolean(approval.contentApprovedAt)

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
          Advisor Approval / Project Documents
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">อนุมัติเอกสารโครงการ</h1>
            {approval.projectName && <p className="mt-2 font-semibold text-slate-800">{approval.projectName}</p>}
            <p className="mt-2 text-slate-600">ตรวจรายการเอกสารทั้งชุด อนุมัติเนื้อหา และส่งใบปะหน้าที่เซ็นแล้วกลับเข้าสู่ระบบ</p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800">
            สถานะ: {approval.status}
          </span>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[16rem_1fr]">
        <aside aria-label="รายการเอกสารโครงการ" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-950">เอกสารทั้งชุด</h2>
          <nav className="space-y-2">
            {approval.documents.map((document) => {
              const selected = selectedDocument?.id === document.id
              return (
                <button
                  key={document.id}
                  type="button"
                  aria-pressed={selected}
                  className={`w-full rounded-lg border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 ${selected ? 'border-teal-700 bg-teal-700 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-slate-50'}`}
                  onClick={() => handleSelectDocument(document.id)}
                >
                  <span className="block text-xs font-semibold uppercase tracking-wide opacity-70">{document.type}</span>
                  <span className="mt-1 block font-semibold">{document.title}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="space-y-6">
          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-teal-700">{selectedDocument.type}</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">{selectedDocument.title}</h2>
                <p className="mt-2 text-sm text-slate-500">ไฟล์อ้างอิง: {selectedDocument.reference}</p>
              </div>
              <div className="shrink-0">
                <StatusBadge status="พร้อมตรวจสอบ" />
              </div>
            </div>

            {/* ข้อความทั่วไปทุกครั้งตามคำตอบ Q-02 ไม่บล็อกการอนุมัติตาม FR-APR-07 */}
            <p role="note" className="mb-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
              กรุณาตรวจสอบเนื้อหาอย่างละเอียดว่าไม่ได้ถูกสร้างจาก AI โดยไม่ผ่านการตรวจสอบ
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <h3 className="mb-3 font-bold text-slate-950">วัตถุประสงค์</h3>
                <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                  {selectedDocument.objectives.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="mb-3 font-bold text-slate-950">ตัวชี้วัด</h3>
                <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                  {selectedDocument.indicators.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="mb-3 font-bold text-slate-950">รูปแบบเอกสาร</h3>
                <p className="text-sm leading-6 text-slate-700">{selectedDocument.format}</p>
              </div>
            </div>
          </article>

          <section className="grid gap-6 md:grid-cols-2">
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-teal-700">ขั้นที่ 1</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">อนุมัติเนื้อหาออนไลน์</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">วันเวลาที่อนุมัติ: {formatDateTime(approval.contentApprovedAt)}</p>
              <Button
                type="button"
                className="mt-5 sm:w-auto"
                onClick={handleApproveContent}
                disabled={!isForwarded || Boolean(approval.contentApprovedAt)}
              >
                {approval.contentApprovedAt ? 'อนุมัติเนื้อหาแล้ว' : 'อนุมัติเนื้อหา'}
              </Button>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-teal-700">ขั้นที่ 2</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">อัปโหลดใบปะหน้าที่เซ็นแล้ว</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {approval.coverSheet
                  ? `ไฟล์ล่าสุด: ${approval.coverSheet.fileName}`
                  : 'เลือกไฟล์สแกนหรือรูปถ่ายใบปะหน้าที่เซ็นแล้วเพื่อส่งกลับเข้าสู่ระบบ'}
              </p>
              <form className="mt-5" onSubmit={handleUpload}>
                <label className="block text-sm font-semibold text-slate-700" htmlFor="cover-sheet">ไฟล์ใบปะหน้า</label>
                <input
                  id="cover-sheet"
                  className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal file:mr-4 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:font-semibold file:text-teal-800 hover:file:bg-teal-100"
                  type="file"
                  accept={approval.coverSheetAccept}
                  disabled={!canUpload}
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                />
                <Button type="submit" className="mt-4 sm:w-auto" disabled={!canUpload || !selectedFile}>
                  รับไฟล์ใบปะหน้า
                </Button>
              </form>
            </article>

            <form
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2"
              aria-label="การส่งเอกสารกลับ"
              onSubmit={handleReturn}
            >
              <h2 className="text-xl font-bold text-slate-950">ส่งเอกสารกลับให้แก้ไข</h2>
              <label className="mt-4 flex flex-col gap-2 text-sm font-semibold text-slate-700">
                ความเห็นของอาจารย์
                <textarea
                  className="min-h-28 rounded-lg border border-slate-300 p-3 font-normal"
                  value={returnComment}
                  onChange={(event) => setReturnComment(event.target.value)}
                  disabled={!isForwarded}
                  aria-required="true"
                />
              </label>
              <button
                type="submit"
                className="mt-4 rounded-lg border border-rose-300 px-4 py-2 font-semibold text-rose-800 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!isForwarded || !returnComment.trim()}
              >
                ส่งเอกสารกลับ
              </button>
            </form>

            {message && <p role="status" className="rounded-lg bg-teal-50 p-4 text-sm text-teal-900 md:col-span-2">{message}</p>}
            {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700 md:col-span-2">{error}</p>}
          </section>
        </div>
      </div>
    </div>
  )
}
