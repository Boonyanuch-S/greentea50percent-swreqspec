// แสดงขั้นตอนปัจจุบันของฟอร์ม (ปุ่มนำทาง ไม่ผูก FR)
export default function StepIndicator({ steps, current }) {
  return (
    <ol className="mb-6 flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {steps.map((label, index) => {
        const active = index === current
        const done = index < current
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-3">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                active ? 'bg-teal-700 text-white' : done ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {index + 1}
            </span>
            <span className={`truncate text-sm font-semibold ${active ? 'text-slate-950' : 'text-slate-500'}`}>{label}</span>
          </li>
        )
      })}
    </ol>
  )
}
