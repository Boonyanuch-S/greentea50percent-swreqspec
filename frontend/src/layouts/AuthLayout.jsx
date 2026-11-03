import Icon from '../components/Icon.jsx'

const highlights = [
  { icon: 'document', text: 'จัดทำและส่งเอกสารโครงการ' },
  { icon: 'checklist', text: 'ตรวจและอนุมัติเอกสารตามลำดับขั้น' },
  { icon: 'clock', text: 'ส่งและบันทึกชั่วโมงกิจกรรม' },
]

// โครงหน้าเข้าสู่ระบบ: แถบแนะนำระบบด้านซ้าย (จอใหญ่) และการ์ดแบบฟอร์มด้านขวา
export default function AuthLayout({ labelledBy, children }) {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-teal-800 to-teal-950 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-teal-800">
            SU
          </span>
          <span className="font-bold">Science SU</span>
        </div>
        <div className="max-w-md">
          <p className="text-3xl font-bold leading-snug">ระบบจัดการเอกสารกิจกรรมและส่งชั่วโมงอัตโนมัติ</p>
          <ul className="mt-8 space-y-4 text-teal-50">
            {highlights.map((item) => (
              <li key={item.text} className="flex items-center gap-3">
                <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon name={item.icon} />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-teal-200">Activity &amp; Hours System</p>
      </div>
      <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:min-h-0">
        <section className="card w-full max-w-md p-6 sm:p-8" aria-labelledby={labelledBy}>
          {children}
        </section>
      </div>
    </main>
  )
}
