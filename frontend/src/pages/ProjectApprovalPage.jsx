import { useEffect, useState } from 'react'

function formatDateTime(value) {
  if (!value) return 'ยังไม่ได้อนุมัติเนื้อหา'
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

// แสดงและดำเนินการตรวจเอกสารโครงการ รองรับ FR-APR-01 ถึง FR-APR-04
export default function ProjectApprovalPage({ client }) {
  const [approval, setApproval] = useState(null)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    let active = true
    client.getApproval().then((result) => {
      if (!active) return
      setApproval(result)
      setSelectedDocument(result.documents[0])
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [client])

  async function handleApproveContent() {
    const result = await client.approveContent()
    setApproval((current) => ({ ...current, contentApprovedAt: result.contentApprovedAt }))
    setMessage(result.printMessage)
  }

  async function handleUpload(event) {
    event.preventDefault()
    if (!selectedFile) return
    const result = await client.uploadCoverSheet(selectedFile)
    setApproval((current) => ({ ...current, status: result.status }))
    setMessage(`รับไฟล์ ${result.fileName} แล้ว และเปลี่ยนสถานะเป็น ${result.status}`)
  }

  if (loading) {
    return <main className="min-h-screen bg-slate-100 p-8 text-slate-900">กำลังโหลดหน้าอนุมัติ...</main>
  }

  return (
    <main className="min-h-screen bg-[#f4f1ea] px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-slate-300 pb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Project approval / UC-05</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">อนุมัติเอกสารโครงการ</h1>
              <p className="mt-2 max-w-2xl text-slate-600">ตรวจรายการเอกสารทั้งชุด อนุมัติเนื้อหา และส่งใบปะหน้าที่เซ็นแล้วกลับเข้าสู่ระบบ</p>
            </div>
            <span className="inline-flex w-fit items-center border border-amber-300 bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-900">
              สถานะ: {approval.status}
            </span>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          <aside aria-label="รายการเอกสารโครงการ" className="border border-slate-300 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-950">เอกสารทั้งชุด</h2>
            <nav className="space-y-2">
              {approval.documents.map((document) => {
                const selected = selectedDocument?.id === document.id
                return (
                  <button
                    key={document.id}
                    type="button"
                    className={`w-full border px-4 py-3 text-left transition ${selected ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-amber-500 hover:bg-amber-50'}`}
                    onClick={() => setSelectedDocument(document)}
                  >
                    <span className="block text-xs font-semibold uppercase tracking-wide opacity-70">{document.type}</span>
                    <span className="mt-1 block font-semibold">{document.title}</span>
                  </button>
                )
              })}
            </nav>
          </aside>

          <section className="space-y-6">
            <article className="border border-slate-300 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-700">{selectedDocument.type}</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">{selectedDocument.title}</h2>
                  <p className="mt-2 text-sm text-slate-500">ไฟล์อ้างอิง: {selectedDocument.reference}</p>
                </div>
                <span className="border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">พร้อมตรวจสอบ</span>
              </div>

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
              <article className="border border-slate-300 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-amber-700">ขั้นที่ 1</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">อนุมัติเนื้อหาออนไลน์</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">วันเวลาที่อนุมัติ: {formatDateTime(approval.contentApprovedAt)}</p>
                <button
                  type="button"
                  className="mt-5 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  onClick={handleApproveContent}
                  disabled={Boolean(approval.contentApprovedAt)}
                >
                  {approval.contentApprovedAt ? 'อนุมัติเนื้อหาแล้ว' : 'อนุมัติเนื้อหา'}
                </button>
                {message && <p role="status" className="mt-4 border-l-4 border-amber-500 bg-amber-50 px-3 py-2 text-sm text-amber-900">{message}</p>}
              </article>

              <article className="border border-slate-300 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-amber-700">ขั้นที่ 2</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">อัปโหลดใบปะหน้าที่เซ็นแล้ว</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">เลือกไฟล์สแกนหรือรูปถ่ายใบปะหน้าที่เซ็นแล้วเพื่อส่งกลับเข้าสู่ระบบ</p>
                <form className="mt-5" onSubmit={handleUpload}>
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="cover-sheet">ไฟล์ใบปะหน้า</label>
                  <input
                    id="cover-sheet"
                    className="mt-2 block w-full border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:font-semibold"
                    type="file"
                    onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                  />
                  <button type="submit" className="mt-4 border border-slate-950 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-950 hover:text-white" disabled={!selectedFile}>
                    รับไฟล์ใบปะหน้า
                  </button>
                </form>
              </article>
            </section>
          </section>
        </div>
      </div>
    </main>
  )
}
