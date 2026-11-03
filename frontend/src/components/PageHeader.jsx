// หัวหน้าเดียวกันทุก UC: หมวด ชื่อหน้า คำอธิบาย และส่วนเสริมด้านขวา (ส่วนแสดงผล ไม่ผูก FR)
export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-sm font-semibold text-teal-700">{eyebrow}</p>}
        <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">{title}</h1>
        {description && <div className="mt-1.5 text-slate-600">{description}</div>}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </header>
  )
}

export function CountBadge({ label, value }) {
  return (
    <p className="inline-flex items-baseline gap-2 rounded-xl border border-teal-100 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800">
      {label}
      <span className="text-xl font-bold leading-none text-teal-900">{value}</span>
    </p>
  )
}
