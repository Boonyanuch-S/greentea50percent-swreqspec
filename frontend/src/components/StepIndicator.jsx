import Icon from './Icon.jsx'

// แสดงขั้นตอนปัจจุบันของฟอร์ม (ปุ่มนำทาง ไม่ผูก FR)
export default function StepIndicator({ steps, current }) {
  return (
    <ol className="card mb-6 flex items-center gap-3 p-4">
      {steps.map((label, index) => {
        const active = index === current
        const done = index < current
        return (
          <li key={label} aria-current={active ? 'step' : undefined} className="flex min-w-0 flex-1 items-center gap-3">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                active ? 'bg-teal-700 text-white' : done ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {done ? <Icon name="check" className="h-4 w-4" /> : index + 1}
            </span>
            <span className={`text-sm font-semibold ${active ? 'text-slate-950' : 'text-slate-500'}`}>{label}</span>
          </li>
        )
      })}
    </ol>
  )
}
