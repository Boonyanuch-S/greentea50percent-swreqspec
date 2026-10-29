import { roleLabel } from '../utils/roles.js'

// หน้าหลักชั่วคราวหลัง login สำเร็จตาม FR-AUTH-04 แสดงบทบาทจาก Token
// หน้าหลักจริงของบทบาทนี้ยังรอ Q-01 ของ specs/009 จึงไม่เดาเส้นทาง
export default function RoleHomePage({ role }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="role-home-heading">
      <p className="mb-2 text-sm font-semibold text-teal-700">เข้าสู่ระบบสำเร็จ</p>
      <h1 id="role-home-heading" className="text-2xl font-bold tracking-tight text-slate-950">{roleLabel(role)}</h1>
      <div className="mt-5 rounded-lg border border-dashed border-amber-400 bg-amber-50 p-4 text-sm text-amber-800">
        รอ Q-01: หน้าหลักของบทบาทนี้ยังไม่ได้กำหนด
      </div>
    </section>
  )
}
