import { useEffect, useRef, useState } from 'react'
import Button from '../components/Button.jsx'
import { EmptyState, Notice } from '../components/Feedback.jsx'
import Icon from '../components/Icon.jsx'
import PageHeader from '../components/PageHeader.jsx'
import StatusBadge, { statusText } from '../components/StatusBadge.jsx'
import { confirmAction } from '../utils/alerts.js'

// แสดงข้อมูลเอกสารและรายชื่อ ผลตรวจตาม FR-HRS-01, FR-HRS-02, FR-HRS-03, FR-HRS-06 และ ASM-03
export default function ActivityHoursReview({ client, documentId, documentDetails }) {
  const [activeTab, setActiveTab] = useState('document')
  const documentTabRef = useRef(null)
  const participantsTabRef = useRef(null)
  const [participants, setParticipants] = useState([])
  const [validationResult, setValidationResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedParticipant, setSelectedParticipant] = useState(null)
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [retryAvailable, setRetryAvailable] = useState(false)
  const [approvalAttempted, setApprovalAttempted] = useState(false)
  const [summary, setSummary] = useState(null)
  const [summaryError, setSummaryError] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)
  const latestSummaryRequest = useRef(null)
  const invalidItems = validationResult?.invalid_items ?? []
  const invalidReferences = new Set(invalidItems.map((item) => item.student_reference))
  const totalReportedHours = participants.reduce((total, participant) => {
    const hours = Number(participant.reported_hours)
    return Number.isFinite(hours) ? total + hours : total
  }, 0)
  const resultStats = [
    { label: 'ผู้เข้าร่วม', value: participants.length, valueClass: 'text-slate-950' },
    { label: 'ตรงเกณฑ์', value: participants.filter((item) => !invalidReferences.has(item.student_reference)).length, valueClass: 'text-emerald-700' },
    { label: 'ไม่ตรงเกณฑ์', value: invalidItems.length, valueClass: invalidItems.length > 0 ? 'text-rose-700' : 'text-slate-950' },
    { label: 'ชั่วโมงที่แจ้งรวม', value: totalReportedHours, valueClass: 'text-slate-950' },
  ]
  const documentInfo = [
    { label: 'รหัสเอกสาร', value: documentDetails?.documentId ?? documentId },
    { label: 'กิจกรรม', value: documentDetails?.activityName },
    { label: 'รหัสกิจกรรม', value: documentDetails?.activityId },
    { label: 'ไฟล์เอกสาร', value: documentDetails?.sourceFileReference },
    {
      label: 'วันที่ส่ง',
      value: documentDetails?.submittedAt
        ? new Intl.DateTimeFormat('th-TH', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(documentDetails.submittedAt))
        : null,
    },
    {
      label: 'สถานะเอกสาร',
      value: validationResult ? null : statusText(documentDetails?.status),
    },
  ].filter(({ value }) => value !== undefined && value !== null && value !== '')

  function handleTabKeyDown(event) {
    const nextTab = event.key === 'ArrowRight' || event.key === 'ArrowDown'
      ? 'participants'
      : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
        ? 'document'
        : event.key === 'Home'
          ? 'document'
          : event.key === 'End'
            ? 'participants'
            : null
    if (!nextTab) return
    event.preventDefault()
    setActiveTab(nextTab)
    const tabRef = nextTab === 'document' ? documentTabRef : participantsTabRef
    tabRef.current?.focus()
  }

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    setValidationResult(null)

    Promise.resolve()
      .then(async () => {
        const documentParticipants = await client.getDocumentParticipants(documentId)
        const result = await client.getDocumentValidationResult(documentId)
        if (active) {
          setParticipants(documentParticipants)
          setValidationResult(result)
          setLoading(false)
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : String(requestError))
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [client, documentId])

  useEffect(() => {
    if (!selectedParticipant) {
      return undefined
    }

    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setSelectedParticipant(null)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [selectedParticipant])

  // การบันทึกเข้า REG ย้อนกลับเองไม่ได้ จึงถามยืนยันก่อนส่งตาม FR-HRS-04
  async function handleApprove() {
    const confirmed = await confirmAction({
      title: 'ยืนยันบันทึกชั่วโมงเข้าระบบ REG?',
      text: `ระบบจะส่งข้อมูลผู้เข้าร่วม ${participants.length} รายการไปบันทึก`,
      confirmText: 'ยืนยันอนุมัติ',
    })
    if (confirmed) submitHours()
  }

  async function submitHours(retry = false) {
    setActionLoading(true)
    setActionError('')
    setActionMessage('')
    setRetryAvailable(false)
    if (!retry) {
      setApprovalAttempted(true)
    }

    try {
      const result = retry
        ? await client.retryRegSubmission(documentId)
        : await client.approveDocument(documentId)
      setValidationResult((current) => (
        current ? { ...current, document_status: result.status } : current
      ))
      setActionMessage(
        result.notification_status
          ? 'บันทึกชั่วโมงสำเร็จ และส่งคำขอแจ้งยืนยันแล้ว'
          : result.status,
      )
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : String(requestError))
      setRetryAvailable(!retry && requestError.status === 502)
    } finally {
      setActionLoading(false)
    }
  }

  // เปิดรายละเอียดพร้อมสรุปข้อมูลรายบุคคล แล้วกลับมาตรวจเกณฑ์ต่อได้ตาม FR-HRS-08 และ AC-HRS-07
  async function openParticipant(participant) {
    setSelectedParticipant(participant)
    setSummary(null)
    setSummaryError('')
    latestSummaryRequest.current = participant.student_reference
    setSummaryLoading(true)
    try {
      const result = await client.getIndividualSummary(documentId, participant.student_reference)
      if (latestSummaryRequest.current === participant.student_reference) setSummary(result)
    } catch (requestError) {
      if (latestSummaryRequest.current === participant.student_reference) {
        setSummaryError(requestError instanceof Error ? requestError.message : String(requestError))
      }
    } finally {
      if (latestSummaryRequest.current === participant.student_reference) setSummaryLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-2">
      <PageHeader
        eyebrow="กองกิจการนักศึกษา · ชั่วโมงกิจกรรม"
        title="ตรวจสอบใบสรุปชั่วโมงกิจกรรม"
        description="ตรวจสอบรายละเอียดเอกสารและข้อมูลผู้เข้าร่วมกิจกรรม"
      />

      <div
        role="tablist"
        aria-label="ข้อมูลเอกสารและรายชื่อผู้เข้าร่วม"
        onKeyDown={handleTabKeyDown}
        className="flex gap-1 overflow-x-auto overflow-y-hidden shadow-[inset_0_-1px_0_var(--color-slate-200)]"
      >
        <button
          ref={documentTabRef}
          id="activity-hours-document-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === 'document'}
          aria-controls="activity-hours-document-panel"
          tabIndex={activeTab === 'document' ? 0 : -1}
          onClick={() => setActiveTab('document')}
          className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600 ${
            activeTab === 'document'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
          }`}
        >
          ข้อมูลเอกสาร
        </button>
        <button
          ref={participantsTabRef}
          id="activity-hours-participants-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === 'participants'}
          aria-controls="activity-hours-participants-panel"
          tabIndex={activeTab === 'participants' ? 0 : -1}
          onClick={() => setActiveTab('participants')}
          className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600 ${
            activeTab === 'participants'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
          }`}
        >
          รายชื่อผู้เข้าร่วม
        </button>
      </div>

      {activeTab === 'document' && (
        <section
          id="activity-hours-document-panel"
          role="tabpanel"
          aria-labelledby="activity-hours-document-tab"
          tabIndex={0}
          className="space-y-6 outline-none"
        >
      {validationResult && (
        <section
          aria-label="ผลการตรวจสอบ"
          className={`rounded-2xl border p-5 ${
            invalidItems.length > 0 ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">ผลการตรวจสอบประเภทชั่วโมง</h2>
              <p role={invalidItems.length > 0 ? 'alert' : 'status'} className="mt-1 text-sm text-slate-700">
                {invalidItems.length > 0
                  ? `พบรายการไม่ตรงเกณฑ์ ${invalidItems.length} รายการ`
                  : 'ประเภทชั่วโมงตรงตามเกณฑ์ทุกรายการ'}
              </p>
            </div>
            <StatusBadge status={validationResult.document_status} label="สถานะเอกสาร" />
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {resultStats.map(({ label, value, valueClass }) => (
              <div key={label} className="rounded-xl bg-white/70 px-3 py-2">
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className={`mt-0.5 text-xl font-bold ${valueClass}`}>{value}</dd>
              </div>
            ))}
          </dl>

          {invalidItems.length > 0 && (
            <>
              <ul className="mt-4 space-y-2">
                {invalidItems.map((item) => {
                  const participant = participants.find(({ student_reference: reference }) => reference === item.student_reference)
                  return (
                    <li
                      key={item.student_reference}
                      className="flex flex-col gap-2 rounded-xl border border-rose-200 bg-white p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        {participant && <p className="font-semibold text-slate-950">{participant.participant_name}</p>}
                        <p className={participant ? 'text-slate-600' : 'font-semibold text-slate-950'}>
                          {item.student_reference} · {item.reported_hour_type}
                        </p>
                        <p className="mt-1 text-rose-700">{item.validation_message}</p>
                      </div>
                      {participant && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="w-fit shrink-0"
                          aria-label={`ดูรายละเอียดของ ${participant.participant_name}`}
                          onClick={() => openParticipant(participant)}
                        >
                          ดูรายละเอียด
                        </Button>
                      )}
                    </li>
                  )
                })}
              </ul>
              {/* ระบุผลของการคืนเอกสารให้ชัดตาม FR-HRS-06 และ ASM-03 */}
              <p className="mt-3 text-sm font-medium text-rose-800">
                ส่งเอกสารทั้งฉบับคืนให้กรรมการสโมสรแก้ไขแล้ว และยังไม่บันทึกชั่วโมงรายการใดเข้าระบบ REG
              </p>
            </>
          )}
        </section>
      )}

      {validationResult?.document_status === 'รอตรวจสอบ'
        && validationResult.invalid_items.length === 0
        && !approvalAttempted && (
          <section className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-slate-950">ตรวจสอบครบแล้ว</p>
              <p className="mt-1 text-sm text-slate-600">ยืนยันอนุมัติเพื่อส่งข้อมูล {participants.length} รายการไปบันทึกที่ระบบ REG</p>
            </div>
            <Button type="button" onClick={handleApprove} disabled={actionLoading}>
              {actionLoading ? 'กำลังส่งข้อมูล...' : 'ยืนยันอนุมัติ'}
            </Button>
          </section>
        )}
      {actionError && (
        <Notice tone="danger" role="alert">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{actionError}</span>
            {retryAvailable && (
              <Button type="button" variant="dangerOutline" size="sm" className="w-fit" onClick={() => submitHours(true)} disabled={actionLoading}>
                {actionLoading ? 'กำลังส่งซ้ำ...' : 'ลองส่งซ้ำ'}
              </Button>
            )}
          </div>
        </Notice>
      )}
      {actionMessage && (
        <Notice tone="success" role="status">{actionMessage}</Notice>
      )}
          <section aria-label="รายละเอียดเอกสาร" className="card p-6">
            <h2 className="text-lg font-bold text-slate-950">รายละเอียดเอกสาร</h2>
            <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {documentInfo.map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-sm text-slate-500">{label}</dt>
                  <dd className="mt-0.5 break-words font-medium text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </section>
      )}

      {activeTab === 'participants' && (
        <section
          id="activity-hours-participants-panel"
          role="tabpanel"
          aria-labelledby="activity-hours-participants-tab"
          tabIndex={0}
          className="space-y-6 outline-none"
        >
      <section className="card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Icon name="users" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-950">ข้อมูลผู้เข้าร่วม</h2>
              <p className="text-sm text-slate-500">ประเภทชั่วโมงตามที่ระบุในเอกสาร</p>
            </div>
          </div>
          <span className="text-sm font-semibold text-slate-600">
            {loading || error ? 'กำลังโหลดรายชื่อ...' : `${participants.length} รายชื่อ`}
          </span>
        </div>
        {loading ? (
          <div role="status" className="space-y-4 p-6 sm:p-7">
            <span className="sr-only">กำลังโหลดรายชื่อผู้เข้าร่วม...</span>
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex animate-pulse items-center gap-4 py-2">
                <span className="h-10 w-10 rounded-xl bg-slate-100" />
                <span className="h-4 flex-1 rounded bg-slate-100" />
                <span className="h-7 w-28 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <Notice tone="danger" role="alert" className="m-5 sm:m-6">
            โหลดรายชื่อผู้เข้าร่วมไม่สำเร็จ: {error}
          </Notice>
        ) : participants.length === 0 ? (
          <EmptyState icon="users" title="ยังไม่มีรายชื่อผู้เข้าร่วม" description="เมื่อมีข้อมูล ระบบจะแสดงรายการในส่วนนี้" />
        ) : (
          <div className="overflow-x-auto">
            <table aria-label="รายชื่อผู้เข้าร่วมและประเภทชั่วโมง" className="w-full min-w-[32rem] text-left">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
                <tr>
                  <th scope="col" className="w-20 px-5 py-3 text-center sm:px-6">ลำดับ</th>
                  <th scope="col" className="px-5 py-3 sm:px-6">ผู้เข้าร่วม</th>
                  <th scope="col" className="px-5 py-3 sm:px-6">ประเภทชั่วโมง</th>
                  {validationResult && (
                    <th scope="col" className="px-5 py-3 sm:px-6">ผลตรวจ</th>
                  )}
                  <th scope="col" className="px-5 py-3 sm:px-6">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participants.map((participant, index) => (
                  <tr
                    key={participant.student_reference}
                    className={`transition-colors ${
                      validationResult?.invalid_items.some(
                        (item) => item.student_reference === participant.student_reference,
                      )
                        ? 'bg-rose-50/70 hover:bg-rose-50'
                        : 'hover:bg-teal-50/40'
                    }`}
                  >
                    <td className="px-5 py-3 text-center text-sm tabular-nums text-slate-500 sm:px-6">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="px-5 py-3 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-800">
                          {participant.participant_name.trim().charAt(0) || '?'}
                        </span>
                        <span className="font-semibold text-slate-900">{participant.participant_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 sm:px-6">
                      <span className="text-sm text-slate-700">{participant.reported_hour_type}</span>
                    </td>
                    {validationResult && (
                      <td className="px-5 py-3 sm:px-6">
                        {validationResult.invalid_items.some(
                          (item) => item.student_reference === participant.student_reference,
                        ) ? (
                          <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-800">
                            ไม่ตรงเกณฑ์
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-900">
                            ตรงเกณฑ์
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-5 py-3 sm:px-6">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        aria-label={`ดูรายละเอียดของ ${participant.participant_name}`}
                        onClick={() => openParticipant(participant)}
                      >
                        ดูรายละเอียด
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
        </section>
      )}

      {selectedParticipant && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedParticipant(null)
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="participant-detail-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-sm font-semibold text-teal-700">ชั่วโมงกิจกรรม</p>
                <h2 id="participant-detail-title" className="text-xl font-bold text-slate-950">
                  รายละเอียดผู้เข้าร่วม
                </h2>
              </div>
              <button
                type="button"
                aria-label="ปิดรายละเอียด"
                onClick={() => setSelectedParticipant(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </header>
            <div className="max-h-[60vh] space-y-5 overflow-y-auto px-6 py-6">
              <div className="flex items-center gap-4">
                <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-100 text-lg font-bold text-teal-800">
                  {selectedParticipant.participant_name.trim().charAt(0) || '?'}
                </span>
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    {selectedParticipant.participant_name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    รหัสอ้างอิง {selectedParticipant.student_reference}
                  </p>
                </div>
              </div>
              <dl className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-slate-500">ประเภทชั่วโมง</dt>
                  <dd className="mt-1 font-semibold text-slate-900">
                    {selectedParticipant.reported_hour_type}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">ชั่วโมงที่แจ้ง</dt>
                  <dd className="mt-1 font-semibold text-slate-900">
                    {selectedParticipant.reported_hours}
                  </dd>
                </div>
              </dl>
              <section aria-label="สรุปข้อมูลรายบุคคล">
                <h3 className="font-bold text-slate-950">สรุปข้อมูลรายบุคคล</h3>
                {summaryLoading && <p role="status" className="mt-2 text-sm text-slate-600">กำลังโหลดสรุปข้อมูล...</p>}
                {summaryError && (
                  <Notice tone="danger" role="alert" className="mt-2">โหลดสรุปข้อมูลไม่สำเร็จ: {summaryError}</Notice>
                )}
                {summary !== null && (
                  <dl className="mt-2 divide-y divide-slate-100 text-sm">
                    {Object.entries(summary).map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4 py-2">
                        <dt className="text-slate-500">{label}</dt>
                        <dd className="break-words text-right font-medium text-slate-900">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </section>
            </div>
            <footer className="flex justify-end border-t border-slate-100 px-6 py-4">
              <Button type="button" onClick={() => setSelectedParticipant(null)}>
                กลับไปยังรายชื่อ
              </Button>
            </footer>
          </section>
        </div>
      )}
    </div>
  )
}
