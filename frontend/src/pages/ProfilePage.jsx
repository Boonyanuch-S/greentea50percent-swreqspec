import { nameInitial } from '../utils/nameInitial.js'
import { roleLabel } from '../utils/roles.js'

// หน้าโปรไฟล์ผู้ใช้ แสดงอย่างเดียว แก้ไขไม่ได้: นอก spec 009 ทีมสั่งเพิ่ม (รอเพิ่มลง spec)
export default function ProfilePage({ session, onBack, onLogout }) {
  const profile = session.profile ?? {}
  const rows = [
    { label: 'ชื่อ-สกุล', value: profile.displayName ?? '-' },
    { label: 'อีเมล', value: profile.username ?? '-' },
    { label: 'บทบาท', value: roleLabel(session.role) },
    { label: 'สังกัด', value: profile.unit ?? '-' },
    { label: 'Token หมดอายุ', value: new Date(session.expiresAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.' },
  ]

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">โปรไฟล์</h1>
        <p className="mt-2 text-slate-600">ข้อมูลบัญชีผู้ใช้ที่เข้าสู่ระบบอยู่</p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <section className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <span aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-3xl font-bold text-teal-800">
            {nameInitial(profile.displayName)}
          </span>
          <p className="mt-4 text-lg font-bold text-slate-950">{profile.displayName ?? '-'}</p>
          <p className="mt-1 text-sm text-slate-500">{roleLabel(session.role)}</p>
          <button
            type="button"
            onClick={onLogout}
            className="mt-6 w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            ออกจากระบบ
          </button>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2" aria-label="ข้อมูลบัญชีผู้ใช้">
          <dl className="divide-y divide-slate-100">
            {rows.map((row) => (
              <div key={row.label} className="grid gap-1 px-6 py-4 sm:grid-cols-4">
                <dt className="text-sm font-semibold text-slate-500">{row.label}</dt>
                <dd className="text-slate-900 sm:col-span-3">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <div className="mt-6">
        <button type="button" onClick={onBack} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200">
          ← กลับหน้าหลัก
        </button>
      </div>
    </div>
  )
}
