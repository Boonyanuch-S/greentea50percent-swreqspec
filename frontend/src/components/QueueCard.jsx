import Icon from './Icon.jsx'
import StatusBadge from './StatusBadge.jsx'

const cardClass = 'card flex w-full flex-col gap-4 p-5 text-left sm:flex-row sm:items-center sm:justify-between'

// การ์ดรายการในคิวของ UC-03, UC-05 และ UC-07 กดทั้งใบได้เมื่อส่ง onClick หรือวางปุ่มเองผ่าน action
// titleAs คงระดับหัวข้อของแต่ละคิวไว้ (ส่วนแสดงผล ไม่ผูก FR)
export default function QueueCard({ titleAs: Title = 'span', title, subtitle, meta, urgent, status, actionLabel, action, onClick }) {
  const body = (
    <>
      <span className="flex min-w-0 items-center gap-4">
        <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <Icon name="document" className="h-6 w-6" />
        </span>
        <span className="min-w-0">
          <Title className="block text-base font-bold text-slate-950 transition-colors group-hover:text-teal-800">{title}</Title>
          {urgent && (
            <span className="mt-1 inline-block rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">{urgent}</span>
          )}
          {subtitle && <span className="mt-0.5 block text-sm text-slate-600">{subtitle}</span>}
          {meta && <span className="mt-0.5 block text-sm text-slate-500">{meta}</span>}
        </span>
      </span>
      <span className="flex shrink-0 flex-wrap items-center gap-3 pl-[3.75rem] sm:pl-0">
        {status && <StatusBadge status={status} />}
        {action}
        {actionLabel && (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
            {actionLabel}
            <Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        )}
      </span>
    </>
  )

  if (!onClick) {
    return <div className={cardClass}>{body}</div>
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group ${cardClass} transition hover:border-teal-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2`}
    >
      {body}
    </button>
  )
}
