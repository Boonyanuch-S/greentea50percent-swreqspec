import Icon from './Icon.jsx'

// เมนูสลับงานของแต่ละบทบาท ใช้แทนเมนูที่เคยเขียนแยกกันใน App.jsx (ส่วนแสดงผล ไม่ผูก FR)
export default function TabNav({ label, tabs, active, onChange }) {
  return (
    <nav className="mb-6 overflow-x-auto overflow-y-hidden pb-0.5" aria-label={label}>
      <div className="inline-flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={active === tab.id}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600 ${
              active === tab.id
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Icon name={tab.icon} className="h-4.5 w-4.5" />
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
