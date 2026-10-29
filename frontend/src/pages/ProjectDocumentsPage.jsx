import { useEffect, useState } from 'react'
import Button from '../components/Button.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { RETURNED } from '../services/projectDocumentMock.js'
import { formatThaiDate } from '../utils/formatDate.js'
import ProjectDetailPage from './ProjectDetailPage.jsx'
import ProjectDocumentForm from './ProjectDocumentForm.jsx'

// หน้าหลักของกรรมการสโมสร (UC-01): เลือกสร้างโครงการใหม่ (FR-PRJ-01) หรือแก้ไขโครงการที่ถูกตีกลับ (FR-PRJ-06)
export default function ProjectDocumentsPage({ client }) {
  const [projects, setProjects] = useState([])
  const [editing, setEditing] = useState(null) // null = รายการ, 'new' = สร้างใหม่, id = แก้ไข
  const [viewing, setViewing] = useState(null) // id ของโครงการที่เปิดดูรายละเอียด (นอก spec ทีมสั่งเพิ่ม)

  useEffect(() => {
    if (editing === null && viewing === null) {
      client.listMyProjects().then(setProjects)
    }
  }, [client, editing, viewing])

  function handleSubmitted() {
    setEditing(null)
    setViewing(null)
  }

  function openEdit(projectId) {
    setViewing(null)
    setEditing(projectId)
  }

  if (editing !== null) {
    return (
      <ProjectDocumentForm
        client={client}
        projectId={editing === 'new' ? null : editing}
        onSubmitted={handleSubmitted}
        onCancel={() => setEditing(null)}
      />
    )
  }

  if (viewing !== null) {
    return <ProjectDetailPage client={client} projectId={viewing} onBack={() => setViewing(null)} onEdit={() => openEdit(viewing)} />
  }

  return (
    <div>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">เอกสารโครงการ</h1>
          <p className="mt-2 text-slate-600">สร้างเอกสารโครงการใหม่ ดูรายละเอียด หรือแก้ไขโครงการที่ถูกตีกลับ</p>
        </div>
        <Button type="button" className="sm:w-auto" onClick={() => setEditing('new')} data-req="FR-PRJ-01">
          + สร้างโครงการใหม่
        </Button>
      </header>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" aria-label="รายการโครงการ">
        {projects.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">ยังไม่มีโครงการ</p>
        ) : (
          <table className="w-full table-fixed text-left text-sm">
            <thead className="hidden bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-header-group">
              <tr>
                <th className="px-6 py-3">ชื่อโครงการ</th>
                <th className="w-44 whitespace-nowrap px-6 py-3">วันที่จัดกิจกรรม</th>
                <th className="w-60 px-6 py-3">สถานะ</th>
                <th className="w-40 px-6 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  onClick={() => setViewing(project.id)}
                  className="group grid cursor-pointer grid-cols-[1fr_auto] gap-x-3 gap-y-2 p-4 hover:bg-slate-50 md:table-row md:p-0"
                >
                  <td className="col-span-2 md:px-6 md:py-4">
                    <button
                      type="button"
                      className="text-left font-semibold text-slate-900 group-hover:text-teal-700"
                    >
                      {project.projectName || 'ไม่มีชื่อโครงการ'}
                    </button>
                  </td>
                  <td className="col-span-2 whitespace-nowrap text-slate-600 md:px-6 md:py-4">
                    <span className="md:hidden">วันที่จัดกิจกรรม </span>
                    {formatThaiDate(project.activityDate)}
                  </td>
                  <td className="md:px-6 md:py-4">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="flex justify-end gap-2 md:table-cell md:space-x-2 md:px-6 md:py-4 md:text-right">
                    {project.status === RETURNED && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          openEdit(project.id)
                        }}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-white"
                        data-req="FR-PRJ-06"
                      >
                        แก้ไข
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
