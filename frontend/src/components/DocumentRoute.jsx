import Icon from './Icon.jsx'

const states = {
  done: { dot: 'bg-teal-700 text-white', text: 'text-slate-700', note: '' },
  current: { dot: 'bg-amber-500 text-white', text: 'font-semibold text-slate-950', note: 'ตอนนี้เอกสารอยู่ขั้นนี้' },
  returned: { dot: 'bg-rose-600 text-white', text: 'font-semibold text-rose-800', note: 'ถูกตีกลับที่ขั้นนี้' },
  pending: { dot: 'bg-slate-200 text-slate-500', text: 'text-slate-500', note: '' },
}

// แสดงเส้นทางเอกสารให้กรรมการรู้ว่าเรื่องอยู่ขั้นใด ไม่ต้องสอบถามเจ้าหน้าที่ ตาม FR-PRJ-05
export default function DocumentRoute({ route }) {
  return (
    <section className="card p-5" aria-labelledby="document-route-heading">
      <h2 id="document-route-heading" className="text-sm font-semibold text-slate-900">เส้นทางเอกสาร</h2>
      <ol className="mt-3">
        {route.map((step, index) => {
          const state = states[step.state]
          return (
            <li key={step.key} aria-current={step.state === 'current' ? 'step' : undefined} className="relative flex gap-3 pb-4 last:pb-0">
              {index < route.length - 1 && (
                <span aria-hidden="true" className="absolute left-[0.6875rem] top-6 h-full w-px bg-slate-200" />
              )}
              <span aria-hidden="true" className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${state.dot}`}>
                {step.state === 'done' ? <Icon name="check" className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <div className="min-w-0 text-sm">
                <p className={state.text}>{step.label}</p>
                {state.note && <p className="text-xs text-slate-500">{state.note}</p>}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
