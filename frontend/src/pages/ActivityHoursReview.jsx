import { useEffect, useRef, useState } from 'react'

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
  const [summaryParticipantName, setSummaryParticipantName] = useState('')
  const [summary, setSummary] = useState(null)
  const [summaryError, setSummaryError] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)
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
      value: validationResult?.document_status ?? documentDetails?.status,
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

  async function loadIndividualSummary(participant) {
    setSummaryLoading(true)
    setSummaryError('')
    setSummary(null)
    setSummaryParticipantName(participant.participant_name)
    try {
      const result = await client.getIndividualSummary(
        documentId,
        participant.student_reference,
      )
      setSummary(result)
    } catch (requestError) {
      setSummaryError(requestError instanceof Error ? requestError.message : String(requestError))
    } finally {
      setSummaryLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8 text-slate-900">
      <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.03]">
        <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-teal-500 to-emerald-400" />
        <div aria-hidden="true" className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-teal-50" />
        <div aria-hidden="true" className="absolute right-24 top-16 h-28 w-28 rounded-full border-[18px] border-emerald-50" />
        <div className="relative flex flex-col gap-6 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-9 sm:py-8">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-800">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-teal-500 ring-4 ring-teal-100" />
                Activity Hours
              </span>
              <span className="text-slate-300" aria-hidden="true">/</span>
              <span className="text-xs font-medium text-slate-500">Student Affairs</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              ข้อมูลเอกสาร
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              ตรวจสอบรายละเอียดเอกสารและข้อมูลผู้เข้าร่วมกิจกรรม
            </p>
          </div>
        </div>
      </header>

      <div
        role="tablist"
        aria-label="ข้อมูลเอกสารและรายชื่อผู้เข้าร่วม"
        onKeyDown={handleTabKeyDown}
        className="flex w-fit max-w-full gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm"
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
          className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
            activeTab === 'document'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
          className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
            activeTab === 'participants'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
          <section aria-label="รายละเอียดเอกสาร" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">รายละเอียดเอกสาร</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {documentInfo.map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-slate-50 p-4">
                  <dt className="text-sm text-slate-500">{label}</dt>
                  <dd className="mt-1 break-words font-semibold text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

      {validationResult && (
        <section
          aria-label="ผลการตรวจสอบ"
          className={`rounded-2xl border p-5 ${
            validationResult.invalid_items.length > 0
              ? 'border-amber-200 bg-amber-50'
              : 'border-emerald-200 bg-emerald-50'
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">ผลการตรวจสอบประเภทชั่วโมง</h2>
              <p
                role={validationResult.invalid_items.length > 0 ? 'alert' : 'status'}
                className="mt-1 text-sm text-slate-700"
              >
                {validationResult.invalid_items.length > 0
                  ? `พบรายการไม่ตรงเกณฑ์ ${validationResult.invalid_items.length} รายการ`
                  : 'ประเภทชั่วโมงตรงตามเกณฑ์ทุกรายการ'}
              </p>
            </div>
            <span className="inline-flex w-fit items-center rounded-full border border-amber-200 bg-white px-3 py-1 text-sm font-semibold text-amber-800">
              สถานะเอกสาร: {validationResult.document_status}
            </span>
          </div>
          {validationResult.invalid_items.length > 0 && (
            <ul className="mt-4 space-y-2 border-t border-amber-200 pt-4">
              {validationResult.invalid_items.map((item) => (
                <li
                  key={item.student_reference}
                  className="rounded-xl border border-amber-200 bg-white p-3 text-sm"
                >
                  <p className="font-semibold text-slate-900">
                    {item.student_reference} · {item.reported_hour_type}
                  </p>
                  <p className="mt-1 text-amber-800">{item.validation_message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {validationResult?.document_status === 'รอตรวจสอบ'
        && validationResult.invalid_items.length === 0
        && !approvalAttempted && (
          <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-slate-900">ตรวจสอบครบแล้ว</p>
              <p className="mt-1 text-sm text-slate-600">ยืนยันอนุมัติเพื่อส่งข้อมูลไปบันทึกที่ระบบ REG</p>
            </div>
            <button
              type="button"
              onClick={() => submitHours()}
              disabled={actionLoading}
              className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            >
              {actionLoading ? 'กำลังส่งข้อมูล...' : 'ยืนยันอนุมัติ'}
            </button>
          </section>
        )}
      {actionError && (
        <section role="alert" className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
          <span>{actionError}</span>
          {retryAvailable && (
            <button
              type="button"
              onClick={() => submitHours(true)}
              disabled={actionLoading}
              className="w-fit rounded-lg border border-red-300 bg-white px-3 py-2 font-semibold text-red-800 hover:bg-red-100 disabled:cursor-wait disabled:opacity-60"
            >
              {actionLoading ? 'กำลังส่งซ้ำ...' : 'ลองส่งซ้ำ'}
            </button>
          )}
        </section>
      )}
      {actionMessage && (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
          {actionMessage}
        </p>
      )}
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
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.03]">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M8 7h8m-8 5h8m-8 5h5m5 4H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8l5 5v11a2 2 0 0 1-2 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <h2 className="font-bold text-slate-900">ข้อมูลผู้เข้าร่วม</h2>
              <p className="mt-1 text-sm text-slate-500">ประเภทชั่วโมงตามที่ระบุในเอกสาร</p>
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
          <div role="alert" className="m-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:m-7">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="mt-0.5 h-5 w-5 shrink-0">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
              <path d="M12 8v5m0 3h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <span>
              <span className="block font-semibold">
                โหลดรายชื่อผู้เข้าร่วมไม่สำเร็จ: <span className="font-normal text-red-700">{error}</span>
              </span>
            </span>
          </div>
        ) : participants.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span aria-hidden="true" className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path d="M8 7h8m-8 5h8m-8 5h5m5 4H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8l5 5v11a2 2 0 0 1-2 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="mt-4 font-semibold text-slate-800">ยังไม่มีรายชื่อผู้เข้าร่วม</p>
            <p className="mt-1 text-sm text-slate-500">เมื่อมีข้อมูล ระบบจะแสดงรายการในส่วนนี้</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table aria-label="รายชื่อผู้เข้าร่วมและประเภทชั่วโมง" className="w-full min-w-[32rem] text-left">
              <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="w-20 px-5 py-3.5 text-center sm:px-7">ลำดับ</th>
                  <th scope="col" className="px-5 py-3.5 sm:px-7">ผู้เข้าร่วม</th>
                  <th scope="col" className="px-5 py-3.5 sm:px-7">ประเภทชั่วโมง</th>
                  {validationResult && (
                    <th scope="col" className="px-5 py-3.5 sm:px-7">ผลตรวจ</th>
                  )}
                  <th scope="col" className="px-5 py-3.5 sm:px-7">สรุป UC-04</th>
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
                        ? 'bg-amber-50/70 hover:bg-amber-50'
                        : 'hover:bg-teal-50/40'
                    }`}
                  >
                    <td className="px-5 py-4 text-center text-sm tabular-nums text-slate-400 sm:px-7">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="px-5 py-4 sm:px-7">
                      <div className="flex items-center gap-3">
                        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-emerald-50 text-sm font-bold text-teal-800 ring-1 ring-inset ring-teal-200/70">
                          {participant.participant_name.trim().charAt(0) || '?'}
                        </span>
                        <button
                          type="button"
                          aria-label={`ดูรายละเอียดของ ${participant.participant_name}`}
                          onClick={() => setSelectedParticipant(participant)}
                          className="inline-flex items-center gap-1 font-semibold text-teal-800 decoration-teal-700 underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
                        >
                          {participant.participant_name}
                          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-teal-600">
                            <path d="m7.5 4.5 5.5 5.5-5.5 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 sm:px-7">
                      <span className="inline-flex items-center gap-2 rounded-lg border border-teal-100 bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-800">
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                        {participant.reported_hour_type}
                      </span>
                    </td>
                    {validationResult && (
                      <td className="px-5 py-4 sm:px-7">
                        {validationResult.invalid_items.some(
                          (item) => item.student_reference === participant.student_reference,
                        ) ? (
                          <span className="inline-flex rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-900">
                            ไม่ตรงเกณฑ์
                          </span>
                        ) : (
                          <span className="inline-flex rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-900">
                            ตรงเกณฑ์
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-5 py-4 sm:px-7">
                      <button
                        type="button"
                        aria-label={`ดูสรุป UC-04 ของ ${participant.participant_name}`}
                        onClick={() => loadIndividualSummary(participant)}
                        disabled={summaryLoading}
                        className="rounded-lg border border-teal-200 px-2.5 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-50 disabled:cursor-wait disabled:opacity-60"
                      >
                        ดูสรุป UC-04
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {summaryLoading && (
        <p role="status" className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          กำลังเรียก UC-04...
        </p>
      )}
      {summaryError && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          เรียก UC-04 ไม่สำเร็จ: {summaryError}
        </p>
      )}
      {summary !== null && (
        <section aria-label="สรุปข้อมูลจาก UC-04" className="rounded-2xl border border-teal-200 bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-bold text-slate-900">สรุปข้อมูลจาก UC-04</h2>
            <p className="text-sm text-slate-600">ผู้เข้าร่วม: {summaryParticipantName}</p>
          </div>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
            {JSON.stringify(summary, null, 2)}
          </pre>
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
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/20"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
                  Activity Hours
                </p>
                <h2 id="participant-detail-title" className="mt-1 text-xl font-bold text-slate-950">
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
            <div className="space-y-5 px-6 py-6">
              <div className="flex items-center gap-4">
                <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-lg font-bold text-teal-800 ring-1 ring-inset ring-teal-100">
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
              <dl className="grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
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
            </div>
            <footer className="flex justify-end border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedParticipant(null)}
                className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
              >
                กลับไปยังรายชื่อ
              </button>
            </footer>
          </section>
        </div>
      )}
        </section>
      )}
    </div>
  )
}
