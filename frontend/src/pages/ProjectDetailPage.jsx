import { useEffect, useState } from 'react'
import Button from '../components/Button.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { RETURNED } from '../services/projectDocumentMock.js'
import { showDocument } from '../utils/alerts.js'
import { formatThaiDate } from '../utils/formatDate.js'

// ดูรายละเอียดโครงการและเปิดดูเอกสารแนบแต่ละรายการ (แสดงอย่างเดียว): นอก spec 001 ทีมสั่งเพิ่ม
export default function ProjectDetailPage({ client, projectId, onBack, onEdit }) {
  const [project, setProject] = useState(null)
  const [checklist, setChecklist] = useState([])

  useEffect(() => {
    let active = true
    Promise.all([client.getProject(projectId), client.getChecklist()]).then(([loaded, items]) => {
      if (!active) return
      setProject(loaded)
      setChecklist(items)
    })
    return () => {
      active = false
    }
  }, [client, projectId])

  if (!project) {
    return <p className="text-slate-700">กำลังโหลดรายละเอียดโครงการ...</p>
  }

  const details = [
    { label: 'วัตถุประสงค์', value: project.objectives, wide: true },
    { label: 'วันที่จัดกิจกรรม', value: formatThaiDate(project.activityDate) },
    { label: 'สถานที่', value: project.location },
    { label: 'ตัวชี้วัด', value: project.indicators, wide: true },
  ]

  return (
    <div>
      <button type="button" onClick={onBack} className="mb-4 rounded-lg px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-200">
        ← กลับรายการโครงการ
      </button>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <StatusBadge status={project.status} />
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{project.projectName || 'ไม่มีชื่อโครงการ'}</h1>
        </div>
        {project.status === RETURNED && (
          <Button type="button" className="sm:w-auto" onClick={onEdit} data-req="FR-PRJ-06">
            แก้ไขโครงการ
          </Button>
        )}
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:order-last">
          {project.rejectionReason && (
            <section className="rounded-xl border border-red-200 bg-red-50 p-5" aria-label="เหตุผลที่ถูกตีกลับ">
              <p className="text-sm font-semibold text-red-800">เหตุผลที่เจ้าหน้าที่ตีกลับ</p>
              <p className="mt-1 text-sm leading-relaxed text-red-700">{project.rejectionReason}</p>
            </section>
          )}

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm" aria-labelledby="attachments-heading">
            <h2 id="attachments-heading" className="border-b border-slate-100 px-5 py-4 text-sm font-semibold text-slate-900">
              เอกสารแนบ
            </h2>
            <ul className="divide-y divide-slate-100">
              {checklist.map((item) => {
                const attachment = project.attachments?.[item.id]
                return (
                  <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{item.code}</p>
                      <p className={`truncate text-xs ${attachment ? 'text-slate-500' : 'text-red-600'}`}>
                        {attachment?.name ?? 'ยังไม่ได้แนบ'}
                      </p>
                    </div>
                    {attachment && (
                      <button
                        type="button"
                        onClick={() => showDocument({ title: `${item.code} ${item.name}`, ...attachment })}
                        className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                        aria-label={`ดูเอกสาร ${item.code}`}
                      >
                        ดูเอกสาร
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        </aside>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2" aria-label="ข้อมูลโครงการ">
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
