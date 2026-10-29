import { nameInitial } from '../utils/nameInitial.js'
import { roleLabel } from '../utils/roles.js'

// โครงหน้าหลังเข้าสู่ระบบ: แถบหัวแสดงชื่อระบบ ผู้ใช้ ปุ่มโปรไฟล์ และออกจากระบบ
// ปุ่มโปรไฟล์/ออกจากระบบ: นอก spec 009 ทีมสั่งเพิ่ม (รอเพิ่มลง spec)
export default function AppLayout({ session, section, onHome, onProfile, onLogout, children }) {
  const name = session?.profile?.displayName ?? roleLabel(session?.role)

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button type="button" onClick={onHome} className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              Science SU{section && <span className="hidden sm:inline"> / {section}</span>}
            </p>
            <p className="text-xs text-slate-500">Activity &amp; Hours System</p>
          </button>
          {session && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={onProfile}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-slate-100"
                aria-label="โปรไฟล์"
              >
                <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-800">
                  {nameInitial(name)}
                </span>
                <span className="hidden sm:block">
                  <span className="block text-sm font-semibold text-slate-800">{name}</span>
                  <span className="block text-xs text-slate-500">{roleLabel(session.role)}</span>
                </span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
