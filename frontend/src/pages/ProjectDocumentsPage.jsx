import { useEffect, useState } from 'react'
import Button from '../components/Button.jsx'
import { EmptyState, LoadingCard, Notice } from '../components/Feedback.jsx'
import Icon from '../components/Icon.jsx'
import PageHeader from '../components/PageHeader.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useUrlParams } from '../hooks/useUrlParams.js'
import { RETURNED } from '../services/projectDocumentMock.js'
import { formatThaiDate } from '../utils/formatDate.js'
import ProjectDetailPage from './ProjectDetailPage.jsx'
import ProjectDocumentForm from './ProjectDocumentForm.jsx'

// หน้าหลักของกรรมการสโมสร (UC-01): เลือกสร้างโครงการใหม่ (FR-PRJ-01) หรือแก้ไขโครงการที่ถูกตีกลับ (FR-PRJ-06)
export default function ProjectDocumentsPage({ client }) {
  const [projects, setProjects] = useState(null) // null = กำลังโหลด
  const [params, updateParams] = useUrlParams()
  const editing = params.get('edit') // null = รายการ, 'new' = สร้างใหม่, id = แก้ไข
  const viewing = params.get('project') // id ของโครงการที่เปิดดูรายละเอียด (นอก spec ทีมสั่งเพิ่ม)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editing === null && viewing === null) {
      setError('')
      client.listMyProjects()
        .then(setProjects)
        .catch((requestError) => {
          setError(requestError.message)
          setProjects([])
        })
    }
  }, [client, editing, viewing])

  function handleSubmitted() {
    updateParams({ edit: null, project: null }, { replace: true })
  }

  function openEdit(projectId) {
    updateParams({ edit: projectId, project: null })
  }

  if (editing !== null) {
    return (
      <ProjectDocumentForm
        client={client}
        projectId={editing === 'new' ? null : editing}
        onSubmitted={handleSubmitted}
        onCancel={() => updateParams({ edit: null })}
      />
    )
  }

  if (viewing !== null) {
    return <ProjectDetailPage client={client} projectId={viewing} onBack={() => updateParams({ project: null })} onEdit={() => openEdit(viewing)} />
  }

  return (
    <div>
      <PageHeader title="เอกสารโครงการ" description="สร้างเอกสารโครงการใหม่ ดูรายละเอียด หรือแก้ไขโครงการที่ถูกตีกลับ">
        <Button type="button" className="w-full sm:w-auto" onClick={() => updateParams({ edit: 'new' })} data-req="FR-PRJ-01">
          + สร้างโครงการใหม่
        </Button>
      </PageHeader>

      {error && <Notice tone="danger" role="alert" className="mb-4">{error}</Notice>}
      {projects === null ? (
        <LoadingCard>กำลังโหลดรายการโครงการ...</LoadingCard>
      ) : (
      <section className="card overflow-hidden" aria-label="รายการโครงการ">
        {projects.length === 0 ? (
          <EmptyState title="ยังไม่มีโครงการ" description="เริ่มจากปุ่ม “สร้างโครงการใหม่” ด้านบน" />
        ) : (
          <table className="w-full table-fixed text-left text-sm">
            <thead className="hidden bg-slate-50 text-xs font-semibold text-slate-500 md:table-header-group">
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
                  onClick={() => updateParams({ project: project.id })}
                  className="group grid cursor-pointer grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 p-4 transition-colors hover:bg-slate-50 md:table-row md:p-0"
                >
                  <td className="col-span-2 md:px-6 md:py-4">
                    <button
                      type="button"
                      className="flex items-center gap-3 rounded text-left font-semibold text-slate-900 group-hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                    >
                      <Icon name="document" className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-teal-600" />
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
                  <td className="flex justify-end gap-2 md:table-cell md:px-6 md:py-4 md:text-right">
                    {project.status === RETURNED && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation()
                          openEdit(project.id)
                        }}
                        data-req="FR-PRJ-06"
                      >
                        แก้ไข
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      )}
    </div>
  )
}
