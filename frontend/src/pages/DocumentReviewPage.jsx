import { useEffect, useMemo, useState } from 'react'
import ApprovalAction from '../components/ApprovalAction.jsx'
import Button from '../components/Button.jsx'
import DocumentFileViewer from '../components/DocumentFileViewer.jsx'
import { LoadError, LoadingCard, Notice } from '../components/Feedback.jsx'
import PageHeader from '../components/PageHeader.jsx'
import RejectDialog from '../components/RejectDialog.jsx'
import { ReviewHistory } from '../components/ReviewContext.jsx'
import ReviewerChecklistPanel from '../components/ReviewerChecklistPanel.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

function formatSubmittedAt(value) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function findDocumentResult(checklistItems, document) {
  const documentItemId = document?.checklist_item_id
  const documentNames = [document?.type, document?.title, document?.name].filter(Boolean)

  if (documentItemId != null) {
    const byStableId = checklistItems.find(
      (item) => String(item.checklist_item_id) === String(documentItemId),
    )
    if (byStableId) {
      return byStableId.result
    }
  }

  return checklistItems.find((item) => documentNames.includes(item.item_name))?.result ?? null
}

// ผูกไฟล์กับเอกสารที่เปิดอยู่ เพื่อใช้ตัวแสดงไฟล์ชุดเดียวกับหน้าอนุมัติ
function useFileClient(client, submissionId) {
  return useMemo(
    () => ({ getDocumentFile: (documentId) => client.getDocumentFile(submissionId, documentId) }),
    [client, submissionId],
  )
}

// แสดงรายละเอียดและเนื้อหาเอกสารพร้อม Checklist ตาม FR-VDC-02, FR-VDC-03 และ FR-VDC-04
export default function DocumentReviewPage({
  client,
  session,
  submissionId,
  onBack,
}) {
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checklistItems, setChecklistItems] = useState([])
  const [selectedDocumentId, setSelectedDocumentId] = useState(null)
  const fileClient = useFileClient(client, submissionId)

  useEffect(() => {
    let active = true
    client.getSubmission(submissionId)
      .then((loadedSubmission) => {
        if (active) setSubmission(loadedSubmission)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [client, submissionId])

  if (loading) {
    return <LoadingCard role="status">กำลังโหลดรายละเอียดเอกสาร...</LoadingCard>
  }

  if (error) {
    return <LoadError message={error} backLabel="← กลับคิวเอกสาร" onBack={onBack} />
  }

  if (!submission) {
    return <LoadError message="ไม่พบเอกสารโครงการ" backLabel="← กลับคิวเอกสาร" onBack={onBack} />
  }

  const documents = submission.documents ?? []
  const selectedDocument = documents.find((item) => item.id === selectedDocumentId) ?? documents[0]
  const incompleteItems = checklistItems.filter((item) => item.selected && item.result === 'ไม่ครบ')

  return (
    <div>
      <Button type="button" variant="ghost" size="sm" className="mb-3 -ml-3" onClick={onBack}>
        ← กลับคิวเอกสาร
      </Button>
      <PageHeader
        eyebrow="เจ้าหน้าที่คณะ · เอกสารโครงการ"
        title={submission.project_name}
        description={submission.project_owner}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="space-y-6 lg:sticky lg:top-20">
          <section className="card p-6" aria-label="เนื้อหาและรูปแบบเอกสาร">
            <h2 className="text-lg font-bold text-slate-950">เนื้อหาและรูปแบบเอกสาร</h2>
            {selectedDocument ? (
              <>
                <div className="mt-3 mb-3 flex flex-wrap gap-2">
                  {documents.map((item) => (
                    <Button
                      key={item.id}
                      type="button"
                      size="sm"
                      variant={item.id === selectedDocument.id ? 'primary' : 'secondary'}
                      aria-pressed={item.id === selectedDocument.id}
                      onClick={() => setSelectedDocumentId(item.id)}
                    >
                      {item.type}
                      {findDocumentResult(checklistItems, item) && ` · ${findDocumentResult(checklistItems, item)}`}
                    </Button>
                  ))}
                </div>
                <DocumentFileViewer key={selectedDocument.id} client={fileClient} document={selectedDocument} />
              </>
            ) : submission.document ? (
              <>
                <p className="mt-4 font-semibold text-slate-900">{submission.document.name}</p>
                <p className="mt-0.5 text-sm text-slate-600">
                  รูปแบบ: {submission.document.format}
                </p>
                <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 font-sans text-sm leading-7 text-slate-800">
                  {submission.document.content}
                </pre>
                <p className="mt-3 text-xs text-slate-500">ข้อมูลเอกสารจำลองสำหรับการทดสอบหน้าจอ</p>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-600">ยังไม่มีไฟล์เอกสาร</p>
            )}
          </section>

          <section className="card p-6" aria-label="ข้อมูลโครงการ">
            <h2 className="text-lg font-bold text-slate-950">ข้อมูลโครงการ</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-slate-500">รหัสเอกสาร</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{submission.submission_id}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">วันที่ส่ง</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{formatSubmittedAt(submission.submitted_at)}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">สถานะ</dt>
                <dd className="mt-1"><StatusBadge status={submission.status} /></dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-slate-500">รายละเอียด</dt>
                <dd className="mt-0.5 whitespace-pre-line leading-7 text-slate-800">{submission.summary}</dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="space-y-6">
          <ReviewHistory history={submission.history} />
          <div className="card p-6">
            <ReviewerChecklistPanel
              client={client}
              session={session}
              submissionId={submissionId}
              onItemsChange={setChecklistItems}
            />
          </div>
          {incompleteItems.length > 0 && submission.status === 'รอตรวจสอบ' && (
            <Notice tone="warning" title={`มีเอกสารไม่ครบ ${incompleteItems.length} รายการ`}>
              <p>ตรวจก่อนอนุมัติ หากต้องแก้ไขให้ตีกลับ ระบบจะร่างเหตุผลจากรายการที่ไม่ครบให้</p>
            </Notice>
          )}
          {submission.status !== 'ตีกลับให้แก้ไข' && (
            <ApprovalAction
              submissionId={submissionId}
              reviewerUserId={session?.profile?.username}
              session={session}
              onApproved={(result) => {
                setSubmission((current) => ({ ...current, status: result.status }))
              }}
            />
          )}
          <RejectDialog
            submissionId={submissionId}
            reviewerUserId={session?.profile?.username}
            session={session}
            disabled={submission.status !== 'รอตรวจสอบ'}
            documents={documents.map((item) => ({ id: item.id, label: item.type }))}
            suggestedReason={incompleteItems.length > 0
              ? `เอกสารไม่ครบ: ${incompleteItems.map((item) => item.item_name).join(', ')}`
              : ''}
            onRejected={(result) => {
              setSubmission((current) => ({ ...current, status: result.status }))
            }}
          />
        </div>
      </div>
    </div>
  )
}
