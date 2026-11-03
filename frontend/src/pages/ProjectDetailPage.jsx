import { useEffect, useState } from 'react'
import Button from '../components/Button.jsx'
import DocumentRoute from '../components/DocumentRoute.jsx'
import { OtherChecklistResults, ResultBadge, ReviewHistory, resultForDocument } from '../components/ReviewContext.jsx'
import { LoadError, LoadingCard, Notice } from '../components/Feedback.jsx'
import PageHeader from '../components/PageHeader.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { RETURNED } from '../services/projectDocumentMock.js'
import { showDocument } from '../utils/alerts.js'
import { openFile } from '../utils/openFile.js'
import { formatThaiDate } from '../utils/formatDate.js'

// ดูรายละเอียดโครงการและเปิดดูเอกสารแนบแต่ละรายการ (แสดงอย่างเดียว): นอก spec 001 ทีมสั่งเพิ่ม
export default function ProjectDetailPage({ client, projectId, onBack, onEdit }) {
  const [project, setProject] = useState(null)
  const [checklist, setChecklist] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([client.getProject(projectId), client.getChecklist()]).then(([loaded, items]) => {
      if (!active) return
      setProject(loaded)
      setChecklist(items)
    }).catch((requestError) => {
      if (active) setError(requestError.message)
    })
    return () => {
      active = false
    }
  }, [client, projectId])

  // เปิดไฟล์ที่เก็บใน backend ถ้า client รองรับ มิฉะนั้นใช้ข้อมูลไฟล์ที่มีอยู่
  async function openAttachment(item, attachment) {
    const title = `${item.code} ${item.name}`
    if (!client.getAttachmentFile) {
      showDocument({ title, ...attachment })
      return
    }
    try {
      openFile({ title, name: attachment.name, blob: await client.getAttachmentFile(projectId, item.id) })
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  if (error && !project) {
    return <LoadError message={error} backLabel="← กลับรายการโครงการ" onBack={onBack} />
  }

  if (!project) {
    return <LoadingCard>กำลังโหลดรายละเอียดโครงการ...</LoadingCard>
  }

  const details = [
    { label: 'วัตถุประสงค์', value: project.objectives, wide: true },
    { label: 'วันที่จัดกิจกรรม', value: formatThaiDate(project.activityDate) },
    { label: 'สถานที่', value: project.location },
    { label: 'ตัวชี้วัด', value: project.indicators, wide: true },
  ]

  return (
    <div>
      <Button type="button" variant="ghost" size="sm" className="mb-3 -ml-3" onClick={onBack}>
        ← กลับรายการโครงการ
      </Button>

      <PageHeader title={project.projectName || 'ไม่มีชื่อโครงการ'} description={<StatusBadge status={project.status} />}>
        {project.status === RETURNED && (
          <Button type="button" className="w-full sm:w-auto" onClick={onEdit} data-req="FR-PRJ-06">
            แก้ไขโครงการ
          </Button>
        )}
      </PageHeader>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:order-last">
          {error && <Notice tone="danger" role="alert">{error}</Notice>}
          {project.route && <DocumentRoute route={project.route} />}
          <ReviewHistory history={project.history} />
          {project.rejectionReason && (
            <Notice tone="danger" title="เหตุผลที่เจ้าหน้าที่ตีกลับ" role="region" aria-label="เหตุผลที่ถูกตีกลับ">
              {project.rejectionReason}
            </Notice>
          )}

          <section className="card" aria-labelledby="attachments-heading">
            <h2 id="attachments-heading" className="border-b border-slate-100 px-5 py-4 text-sm font-semibold text-slate-900">
              เอกสารแนบ
            </h2>
            <ul className="divide-y divide-slate-100">
              {checklist.map((item) => {
                const attachment = project.attachments?.[item.id]
                return (
                  <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        {item.code}
                        {project.checklistResults && (
                          <ResultBadge result={resultForDocument(project.checklistResults, item.code)} />
                        )}
                      </p>
                      <p className={`truncate text-xs ${attachment ? 'text-slate-500' : 'text-rose-600'}`}>
                        {attachment?.name ?? 'ยังไม่ได้แนบ'}
                      </p>
                    </div>
                    {attachment && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="shrink-0"
                        onClick={() => openAttachment(item, attachment)}
                        aria-label={`ดูเอกสาร ${item.code}`}
                      >
                        ดูเอกสาร
                      </Button>
                    )}
                  </li>
                )
              })}
            </ul>
            <div className="px-5 pb-4">
              <OtherChecklistResults
                results={project.checklistResults}
                documentTypes={checklist.map((item) => item.code)}
              />
            </div>
          </section>
        </aside>

        <section className="card lg:col-span-2" aria-label="ข้อมูลโครงการ">
          <dl className="grid gap-x-6 md:grid-cols-2">
            {details.map((row) => (
              <div key={row.label} className={`border-b border-slate-100 px-6 py-4 last:border-b-0 ${row.wide ? 'md:col-span-2' : ''}`}>
                <dt className="text-sm font-semibold text-slate-500">{row.label}</dt>
                <dd className="mt-1 whitespace-pre-line text-slate-900">{row.value || '-'}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  )
}
