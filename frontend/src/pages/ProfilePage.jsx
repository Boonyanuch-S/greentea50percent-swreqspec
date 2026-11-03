import Button from '../components/Button.jsx'
import PageHeader from '../components/PageHeader.jsx'
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
  ]

  return (
    <div>
      <PageHeader title="โปรไฟล์" description="ข้อมูลบัญชีผู้ใช้ที่เข้าสู่ระบบอยู่" />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <section className="card flex flex-col items-center p-6 text-center">
          <span aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-3xl font-bold text-teal-800">
            {nameInitial(profile.displayName)}
          </span>
          <p className="mt-4 text-lg font-bold text-slate-950">{profile.displayName ?? '-'}</p>
          <p className="mt-1 text-sm text-slate-500">{roleLabel(session.role)}</p>
          <Button type="button" variant="dangerOutline" className="mt-6 w-full" onClick={onLogout}>
            ออกจากระบบ
          </Button>
        </section>

        <section className="card lg:col-span-2" aria-label="ข้อมูลบัญชีผู้ใช้">
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
        <Button type="button" variant="ghost" onClick={onBack}>
          ← กลับหน้าหลัก
        </Button>
      </div>
    </div>
  )
}
