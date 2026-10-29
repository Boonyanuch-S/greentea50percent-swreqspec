import { useEffect, useState } from 'react'
import Button from '../components/Button.jsx'
import StepIndicator from '../components/StepIndicator.jsx'
import { confirmAction, showDocument, showErrorList, showSuccess } from '../utils/alerts.js'

const fields = [
  { name: 'projectName', label: 'ชื่อโครงการ', type: 'text', wide: true },
  { name: 'objectives', label: 'วัตถุประสงค์', type: 'textarea', wide: true },
  { name: 'activityDate', label: 'วันที่จัดกิจกรรม', type: 'date' },
  { name: 'location', label: 'สถานที่', type: 'text' },
  { name: 'indicators', label: 'ตัวชี้วัด', type: 'textarea', wide: true },
]

const steps = ['ข้อมูลโครงการ', 'แนบเอกสารตาม Checklist']

const inputClass =
  'mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100'

// ฟอร์มเอกสารโครงการ 2 ขั้น
// ขั้น 1 กรอกข้อมูล (FR-PRJ-01, FR-PRJ-02, FR-PRJ-06) ขั้น 2 Checklist และแนบเอกสาร (FR-PRJ-03, FR-PRJ-04)
// กดส่งแล้วบันทึกเข้าคิวเมื่อครบ (FR-PRJ-05) หรือปฏิเสธพร้อมรายการที่ขาด (FR-PRJ-07)
export default function ProjectDocumentForm({ client, projectId = null, onSubmitted, onCancel }) {
  const [form, setForm] = useState(null)
  const [attachments, setAttachments] = useState({})
  const [rejectionReason, setRejectionReason] = useState(null)
  const [checklist, setChecklist] = useState([])
  const [step, setStep] = useState(0)
  const [missing, setMissing] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    const load = projectId ? client.getProjectForEdit(projectId) : client.getNewProjectForm()
    Promise.all([load, client.getChecklist?.() ?? []]).then(([loaded, items]) => {
      if (!active) return
      const { attachments: loadedAttachments = {}, rejectionReason: reason = null, ...data } = loaded
      setForm(data)
      setAttachments(loadedAttachments)
      setRejectionReason(reason)
      setChecklist(items)
    })

    return () => {
      active = false
    }
  }, [client, projectId])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  function handleAttach(itemId, file) {
    setMissing([])
    const attachment = file ? { name: file.name, type: file.type, url: URL.createObjectURL?.(file) ?? null } : null
    setAttachments((current) => ({ ...current, [itemId]: attachment }))
  }

  async function handleSubmit() {
    const confirmed = await confirmAction({
      title: 'ยืนยันส่งโครงการ?',
      text: 'ระบบจะส่งเอกสารโครงการเข้าคิวให้เจ้าหน้าที่คณะตรวจสอบ',
      confirmText: 'ส่งโครงการ',
    })
    if (!confirmed) return

    setIsSubmitting(true)
    const result = await client.submitProject({ ...form, id: projectId, attachments })
    setIsSubmitting(false)
    if (result.ok) {
      await showSuccess({ title: 'ส่งโครงการเรียบร้อย', text: `สถานะ: ${result.project.status}` })
      onSubmitted?.(result.project)
    } else {
      setMissing(result.missing)
      showErrorList({
        title: 'ส่งไม่ได้',
        text: 'เอกสารแนบยังไม่ครบตาม Checklist',
        items: result.missing.map((item) => `${item.code} ${item.name}`),
      })
    }
  }

  // ไม่มีบันทึกร่าง (ASM-03) จึงยืนยันก่อนทิ้งข้อมูลที่กรอก
  async function handleCancel() {
    const confirmed = await confirmAction({
      title: 'ยกเลิกการกรอกเอกสาร?',
      text: 'ข้อมูลและไฟล์ที่ยังไม่ได้ส่งจะไม่ถูกบันทึก',
      confirmText: 'ยกเลิกการกรอก',
      cancelText: 'กรอกต่อ',
      danger: true,
    })
    if (confirmed) onCancel?.()
  }

  const attachedCount = checklist.filter((item) => attachments[item.id]).length

  if (!form) {
    return <p className="text-slate-700">กำลังโหลดฟอร์มเอกสารโครงการ...</p>
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">{projectId ? 'แก้ไขโครงการ' : 'สร้างโครงการใหม่'}</h1>
        <p className="mt-2 text-slate-600">กรอกข้อมูลหลักและแนบเอกสารให้ครบตาม Checklist ก่อนส่งให้เจ้าหน้าที่คณะตรวจสอบ</p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:order-last">
          {rejectionReason && (
            <section className="rounded-xl border border-red-200 bg-red-50 p-5" data-req="FR-PRJ-06" aria-label="เหตุผลที่ถูกตีกลับ">
              <p className="text-sm font-semibold text-red-800">เหตุผลที่เจ้าหน้าที่ตีกลับ</p>
              <p className="mt-1 text-sm leading-relaxed text-red-700">{rejectionReason}</p>
            </section>
          )}

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="สรุปเอกสารแนบ">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">เอกสารแนบ</p>
              <p className="text-sm text-slate-500">{attachedCount}/{checklist.length}</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${checklist.length ? (attachedCount / checklist.length) * 100 : 0}%` }} />
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {checklist.map((item) => (
                <li key={item.id} className="flex items-start gap-2">
                  <span aria-hidden="true" className={attachments[item.id] ? 'text-teal-600' : 'text-slate-300'}>●</span>
                  <span className={attachments[item.id] ? 'text-slate-700' : 'text-slate-500'}>{item.code}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-lg border border-dashed border-amber-400 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              รายการเป็นตัวอย่าง รอ Q-01: เกณฑ์ Checklist จริงกำหนดโดยหน่วยงานใด
            </p>
          </section>
        </aside>

        <div className="min-w-0 lg:col-span-2">
          <StepIndicator steps={steps} current={step} />

          {step === 0 && (
            <form
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              onSubmit={(event) => {
                event.preventDefault()
                setStep(1)
              }}
              data-req="FR-PRJ-02"
            >
              <div className="grid gap-5 md:grid-cols-2">
                {fields.map((field) => (
                  <label
                    key={field.name}
                    className={`block text-sm font-semibold text-slate-700 ${field.wide ? 'md:col-span-2' : ''}`}
                    htmlFor={field.name}
                  >
                    {field.label}
                    {field.type === 'textarea' ? (
                      <textarea id={field.name} name={field.name} value={form[field.name]} onChange={handleChange} rows={4} className={inputClass} />
                    ) : (
                      <input id={field.name} name={field.name} type={field.type} value={form[field.name]} onChange={handleChange} className={inputClass} />
                    )}
                  </label>
                ))}
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                {onCancel && (
                  <button type="button" onClick={handleCancel} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                    ยกเลิก
                  </button>
                )}
                <Button type="submit" className="sm:w-auto">ถัดไป: แนบเอกสาร</Button>
              </div>
            </form>
          )}

          {step === 1 && (
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="checklist-heading" data-req="FR-PRJ-03">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="checklist-heading" className="text-lg font-bold text-slate-950">Checklist เอกสารที่ต้องแนบ</h2>
                <p className="text-sm text-slate-500">
                  แนบแล้ว {attachedCount}/{checklist.length} รายการ
                </p>
              </div>

              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                {checklist.map((item) => {
                  const attachment = attachments[item.id]
                  const fileName = attachment?.name
                  const isMissing = missing.some((m) => m.id === item.id)
                  return (
                    <li key={item.id} className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${isMissing ? 'bg-red-50' : ''}`}>
                      <div className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            fileName ? 'bg-teal-600 text-white' : 'border border-slate-300 text-transparent'
                          }`}
                        >
                          ✓
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">{item.code} {item.name}</p>
                          <p className={`text-sm ${fileName ? 'text-teal-700' : 'text-slate-500'}`}>{fileName ?? 'ยังไม่ได้แนบไฟล์'}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        {attachment && (
                          <button
                            type="button"
                            onClick={() => showDocument({ title: `${item.code} ${item.name}`, ...attachment })}
                            className="rounded-lg px-3 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                          >
                            ดูเอกสาร
                          </button>
                        )}
                        <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" data-req="FR-PRJ-04">
                          {fileName ? 'เปลี่ยนไฟล์' : 'แนบไฟล์'}
                          <input
                            type="file"
                            className="sr-only"
                            aria-label={`แนบ ${item.code} ${item.name}`}
                            onChange={(event) => handleAttach(item.id, event.target.files?.[0])}
                          />
                        </label>
                      </div>
                    </li>
                  )
                })}
              </ul>

              {missing.length > 0 && (
                <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" data-req="FR-PRJ-07">
                  <p className="font-semibold">ส่งไม่ได้ เอกสารแนบยังไม่ครบตาม Checklist</p>
                  <ul className="mt-2 list-disc pl-5">
                    {missing.map((item) => (
                      <li key={item.id}>{item.code} {item.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between">
                <button type="button" onClick={() => setStep(0)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                  ย้อนกลับ
                </button>
                <Button type="button" className="sm:w-auto" disabled={isSubmitting} onClick={handleSubmit} data-req="FR-PRJ-05">
                  {isSubmitting ? 'กำลังส่ง...' : 'ส่งให้เจ้าหน้าที่คณะตรวจสอบ'}
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
