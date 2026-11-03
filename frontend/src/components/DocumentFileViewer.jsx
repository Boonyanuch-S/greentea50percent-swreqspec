import { useEffect, useState } from 'react'
import { LoadingCard, Notice } from './Feedback.jsx'

// แสดงไฟล์เอกสารที่อัปโหลดเข้ามาเพื่อให้ผู้ตรวจอ่านจากไฟล์จริง ตาม FR-APR-01 และ FR-APR-02
export default function DocumentFileViewer({ client, document, onAvailabilityChange }) {
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    let url = null
    client.getDocumentFile(document.id)
      .then((blob) => {
        if (!active) return
        url = URL.createObjectURL(blob)
        setFile({ url, type: blob.type })
        onAvailabilityChange?.(true)
      })
      .catch((requestError) => {
        if (!active) return
        setError(requestError.message)
        onAvailabilityChange?.(false)
      })
    return () => {
      active = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [client, document.id])

  if (error) {
    return (
      <Notice tone="danger" role="alert" title="เปิดไฟล์เอกสารไม่ได้" className="mb-6">
        <p>{error} จึงยังยืนยันว่าตรวจฉบับนี้แล้วไม่ได้</p>
      </Notice>
    )
  }
  if (!file) {
    return <LoadingCard className="mb-6">กำลังเปิดไฟล์เอกสาร...</LoadingCard>
  }
  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-slate-200">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm">
        <span className="min-w-0 truncate font-medium text-slate-700">{document.reference}</span>
        <a href={file.url} target="_blank" rel="noreferrer" className="shrink-0 font-semibold text-teal-700 underline underline-offset-2">
          เปิดในแท็บใหม่
        </a>
      </div>
      {file.type.startsWith('image/') ? (
        <img src={file.url} alt={`ไฟล์เอกสาร ${document.title}`} className="mx-auto max-h-[36rem] bg-slate-100" />
      ) : (
        <iframe src={file.url} title={`ไฟล์เอกสาร ${document.title}`} className="h-[36rem] w-full bg-slate-100" />
      )}
    </div>
  )
}
