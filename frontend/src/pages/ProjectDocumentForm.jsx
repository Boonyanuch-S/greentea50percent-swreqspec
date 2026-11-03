import { useEffect, useState } from 'react'
import Button from '../components/Button.jsx'
import { LoadError, LoadingCard, Notice } from '../components/Feedback.jsx'
import Icon from '../components/Icon.jsx'
import PageHeader from '../components/PageHeader.jsx'
import StepIndicator from '../components/StepIndicator.jsx'
import { confirmAction, showDocument, showErrorList, showSuccess } from '../utils/alerts.js'
import { openFile } from '../utils/openFile.js'

const fields = [
  { name: 'projectName', label: 'ชื่อโครงการ', type: 'text', wide: true },
  { name: 'objectives', label: 'วัตถุประสงค์', type: 'textarea', wide: true },
  {
    name: 'activityDate',
    label: 'วันที่จัดกิจกรรม',
    type: 'date',
    // ข้อมูลแจ้งเตือนจากผังขั้นตอนของกองกิจการนักศึกษา แบบที่ 3 และ 4 ไม่บล็อกการส่ง
    hint: 'ควรเสนอล่วงหน้าอย่างน้อย 1 เดือน หรือ 2 เดือนถ้าร่วมกับองค์การนักศึกษา',
  },
  { name: 'location', label: 'สถานที่', type: 'text' },
  { name: 'indicators', label: 'ตัวชี้วัด', type: 'textarea', wide: true },
]

const steps = ['ข้อมูลโครงการ', 'แนบเอกสารตาม Checklist']

function today() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

// ไม่ให้ไปขั้นแนบเอกสารถ้าข้อมูลหลักไม่ครบหรือวันที่ผ่านมาแล้ว ตาม FR-PRJ-02
function validateProjectFields(form) {
  const missing = fields.filter((field) => !form[field.name]?.trim()).map((field) => field.label)
  if (missing.length > 0) return `กรุณากรอก ${missing.join(' ')}`
  return form.activityDate < today() ? 'วันที่จัดกิจกรรมต้องไม่เป็นวันที่ผ่านมาแล้ว' : ''
}

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
  const [loadError, setLoadError] = useState('')
  const [formError, setFormError] = useState('')
  const [centralChecklist, setCentralChecklist] = useState([])

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
    }).catch((requestError) => {
      if (active) setLoadError(requestError.message)
    })

    return () => {
      active = false
    }
  }, [client, projectId])

  // ให้กรรมการเห็นรายการเดียวกับเจ้าหน้าที่ตั้งแต่ก่อนส่ง ตาม FR-PRJ-03 และ IF-CHK-02
  useEffect(() => {
    let active = true
    client.getCentralChecklist?.()
      .then((items) => {
        if (active) setCentralChecklist(items)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [client])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  function handleAttach(itemId, file) {
    setMissing([])
    const attachment = file ? { file, name: file.name, type: file.type, url: URL.createObjectURL?.(file) ?? null } : null
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
    let result
    try {
      result = await client.submitProject({ ...form, id: projectId, attachments })
    } catch (requestError) {
      showErrorList({ title: 'ส่งไม่ได้', text: requestError.message })
      return
    } finally {
      setIsSubmitting(false)
    }
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

  // ไฟล์เดิมของโครงการที่ถูกตีกลับอยู่ใน backend จึงโหลดก่อนเปิดดู
  async function openAttachment(item, attachment) {
    const title = `${item.code} ${item.name}`
    if (attachment.url || !client.getAttachmentFile || !projectId) {
      showDocument({ title, ...attachment })
      return
    }
    try {
      openFile({ title, name: attachment.name, blob: await client.getAttachmentFile(projectId, item.id) })
    } catch (requestError) {
      showErrorList({ title: 'เปิดไฟล์ไม่ได้', text: requestError.message })
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

  const otherCentralItems = centralChecklist.filter((name) => !checklist.some((item) => item.code === name))
  const attachedCount = checklist.filter((item) => attachments[item.id]).length

  if (loadError) {
    return <LoadError message={loadError} backLabel="← กลับรายการโครงการ" onBack={onCancel} />
  }

  if (!form) {
    return <LoadingCard>กำลังโหลดฟอร์มเอกสารโครงการ...</LoadingCard>
  }

  return (
    <div>
      <PageHeader
        title={projectId ? 'แก้ไขโครงการ' : 'สร้างโครงการใหม่'}
        description="กรอกข้อมูลหลักและแนบเอกสารให้ครบตาม Checklist ก่อนส่งให้เจ้าหน้าที่คณะตรวจสอบ"
      />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:order-last">
          {rejectionReason && (
            <Notice tone="danger" title="เหตุผลที่เจ้าหน้าที่ตีกลับ" role="region" data-req="FR-PRJ-06" aria-label="เหตุผลที่ถูกตีกลับ">
              {rejectionReason}
            </Notice>
          )}

          <section className="card p-5" aria-label="สรุปเอกสารแนบ">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">เอกสารแนบ</p>
              <p className="text-sm text-slate-500">{attachedCount}/{checklist.length}</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${checklist.length ? (attachedCount / checklist.length) * 100 : 0}%` }} />
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {checklist.map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${attachments[item.id] ? 'bg-teal-600 text-white' : 'border border-slate-300'}`}
                  >
                    {attachments[item.id] && <Icon name="check" className="h-3 w-3" />}
                  </span>
                  <span className={attachments[item.id] ? 'text-slate-700' : 'text-slate-500'}>{item.code}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-xl border border-dashed border-amber-400 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              รายการเป็นตัวอย่าง รอ Q-01: เกณฑ์ Checklist จริงกำหนดโดยหน่วยงานใด
            </p>
          </section>
        </aside>

        <div className="min-w-0 lg:col-span-2">
          <StepIndicator steps={steps} current={step} />

          {step === 0 && (
            <form
              className="card p-6"
              onSubmit={(event) => {
                event.preventDefault()
                const problem = validateProjectFields(form)
                setFormError(problem)
                if (!problem) setStep(1)
              }}
              data-req="FR-PRJ-02"
            >
              {formError && <Notice tone="danger" role="alert" className="mb-4">{formError}</Notice>}
              <div className="grid gap-5 md:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.name} className={field.wide ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-semibold text-slate-700" htmlFor={field.name}>
                      {field.label}
                      {field.type === 'textarea' ? (
                        <textarea id={field.name} name={field.name} value={form[field.name]} onChange={handleChange} rows={4} required className="form-input mt-2" />
                      ) : (
                        <input
                          id={field.name}
                          name={field.name}
                          type={field.type}
                          value={form[field.name]}
                          onChange={handleChange}
                          required
                          min={field.type === 'date' ? today() : undefined}
                          aria-describedby={field.hint ? `${field.name}-hint` : undefined}
                          className="form-input mt-2"
                        />
                      )}
                    </label>
                    {field.hint && <p id={`${field.name}-hint`} className="mt-1.5 text-sm text-slate-600">{field.hint}</p>}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                {onCancel && (
                  <Button type="button" variant="ghost" onClick={handleCancel}>
                    ยกเลิก
                  </Button>
                )}
                <Button type="submit">ถัดไป: แนบเอกสาร</Button>
              </div>
            </form>
          )}

          {step === 1 && (
            <section className="card p-6" aria-labelledby="checklist-heading" data-req="FR-PRJ-03">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="checklist-heading" className="text-lg font-bold text-slate-950">Checklist เอกสารที่ต้องแนบ</h2>
                <p className="text-sm text-slate-500">
                  แนบแล้ว {attachedCount}/{checklist.length} รายการ
                </p>
              </div>

              <p className="mb-3 text-sm text-slate-600">รับไฟล์ PDF, JPG หรือ PNG ขนาดไม่เกิน 10 MB ถ้าเป็นไฟล์ Word ให้บันทึกเป็น PDF ก่อน</p>
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
                {checklist.map((item) => {
                  const attachment = attachments[item.id]
                  const fileName = attachment?.name
                  const isMissing = missing.some((m) => m.id === item.id)
                  return (
                    <li key={item.id} className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${isMissing ? 'bg-rose-50' : ''}`}>
                      <div className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            fileName ? 'bg-teal-600 text-white' : 'border border-slate-300'
                          }`}
                        >
                          {fileName && <Icon name="check" className="h-3.5 w-3.5" />}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">{item.code} {item.name}</p>
                          <p className={`break-all text-sm ${fileName ? 'text-teal-700' : 'text-slate-500'}`}>{fileName ?? 'ยังไม่ได้แนบไฟล์'}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        {attachment && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openAttachment(item, attachment)}
                          >
                            ดูเอกสาร
                          </Button>
                        )}
                        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors focus-within:ring-2 focus-within:ring-teal-600 focus-within:ring-offset-2 hover:bg-slate-50" data-req="FR-PRJ-04">
                          <Icon name="upload" className="h-4 w-4" />
                          {fileName ? 'เปลี่ยนไฟล์' : 'แนบไฟล์'}
                          <input
                            type="file"
                            className="sr-only"
                            accept=".pdf,.jpg,.jpeg,.png"
                            aria-label={`แนบ ${item.code} ${item.name}`}
                            onChange={(event) => handleAttach(item.id, event.target.files?.[0])}
                          />
                        </label>
                      </div>
                    </li>
                  )
                })}
              </ul>

              {otherCentralItems.length > 0 && (
                <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
                  <p className="font-semibold text-slate-900">รายการเอกสารอื่นที่เจ้าหน้าที่ใช้ตรวจ</p>
                  <p className="mt-0.5 text-slate-600">เตรียมไว้ตามลักษณะโครงการ เจ้าหน้าที่จะเลือกตรวจเฉพาะรายการที่เกี่ยวข้อง</p>
                  <ul className="mt-2 list-disc space-y-0.5 pl-5 text-slate-700">
                    {otherCentralItems.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              )}

              {missing.length > 0 && (
                <Notice tone="danger" title="ส่งไม่ได้ เอกสารแนบยังไม่ครบตาม Checklist" role="alert" className="mt-5" data-req="FR-PRJ-07">
                  <ul className="mt-1 list-disc pl-5">
                    {missing.map((item) => (
                      <li key={item.id}>{item.code} {item.name}</li>
                    ))}
                  </ul>
                </Notice>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between">
                <Button type="button" variant="ghost" onClick={() => setStep(0)}>
                  ย้อนกลับ
                </Button>
                <Button type="button" disabled={isSubmitting} onClick={handleSubmit} data-req="FR-PRJ-05">
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
