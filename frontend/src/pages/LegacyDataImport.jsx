import { useState } from 'react'

// รับไฟล์ข้อมูลเดิมและแสดงสถานะการรับไฟล์ รองรับ FR-IMP-01 และ ASM-04
export default function LegacyDataImport({ client }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadState, setUploadState] = useState({ status: 'ยังไม่ได้เลือกไฟล์' })
  const [isUploading, setIsUploading] = useState(false)

  function handleFileChange(event) {
    setSelectedFile(event.target.files?.[0] ?? null)
    setUploadState({ status: 'พร้อมตรวจสอบไฟล์' })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!selectedFile) {
      setUploadState({ status: 'กรุณาเลือกไฟล์ก่อนอัปโหลด' })
      return
    }

    setIsUploading(true)
    const result = await client.upload(selectedFile)
    setUploadState(result)
    setIsUploading(false)
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 border-b border-slate-200 pb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Science Club / Legacy Data
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">นำเข้าข้อมูลเดิม</h1>
          <p className="mt-2 text-slate-600">อัปโหลดไฟล์กิจกรรมและรายชื่อผู้สมัครเดิมเพื่อเตรียมตรวจสอบ</p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="upload-heading">
          <h2 id="upload-heading" className="text-lg font-bold text-slate-950">เลือกไฟล์ข้อมูล</h2>
          <p className="mt-1 text-sm text-slate-500">รองรับไฟล์ Excel หรือ CSV</p>
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="legacy-file">
              ไฟล์ Excel/CSV
              <input
                id="legacy-file"
                className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal file:mr-4 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:font-semibold file:text-teal-800 hover:file:bg-teal-100"
                type="file"
                accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange}
              />
            </label>
            <button
              className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              type="submit"
              disabled={isUploading}
            >
              {isUploading ? 'กำลังรับไฟล์...' : 'อัปโหลดเพื่อเตรียมตรวจสอบ'}
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="status-heading">
          <h2 id="status-heading" className="text-lg font-bold text-slate-950">สถานะการรับไฟล์</h2>
          <p className="mt-3 text-slate-700" role="status">{uploadState.status}</p>
          {uploadState.filename && <p className="mt-1 text-sm text-slate-500">ไฟล์: {uploadState.filename}</p>}
          {uploadState.importId && <p className="mt-1 text-sm text-slate-500">รหัสการนำเข้า: {uploadState.importId}</p>}
        </section>
      </div>
    </main>
  )
}
