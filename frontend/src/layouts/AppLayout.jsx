import Button from '../components/Button.jsx'
import { nameInitial } from '../utils/nameInitial.js'
import { roleLabel } from '../utils/roles.js'

// โครงหน้าหลังเข้าสู่ระบบ: แถบหัวแสดงชื่อระบบ ผู้ใช้ ปุ่มโปรไฟล์ และออกจากระบบ
// ปุ่มโปรไฟล์/ออกจากระบบ: นอก spec 009 ทีมสั่งเพิ่ม (รอเพิ่มลง spec)
export default function AppLayout({ session, section, onHome, onProfile, onLogout, children }) {
  const name = session?.profile?.displayName ?? roleLabel(session?.role)

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-20 focus:rounded-lg focus:bg-teal-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        ข้ามไปเนื้อหาหลัก
      </a>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={onHome}
            className="flex min-w-0 items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-sm font-bold text-white">
              SU
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-slate-900">Science SU</span>
              <span className="block truncate text-xs text-slate-500">{section ?? 'Activity & Hours System'}</span>
            </span>
          </button>
          {session && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={onProfile}
                className="flex items-center gap-2 rounded-lg px-2 py-1 text-left transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                aria-label="โปรไฟล์"
              >
                <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-800">
                  {nameInitial(name)}
                </span>
                <span className="hidden max-w-56 md:block">
                  <span className="block truncate text-sm font-semibold text-slate-800">{name}</span>
                  <span className="block truncate text-xs text-slate-500">{roleLabel(session.role)}</span>
                </span>
              </button>
              <Button type="button" variant="secondary" size="sm" onClick={onLogout}>
                ออกจากระบบ
              </Button>
            </div>
          )}
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 outline-none sm:px-6 sm:py-8 lg:px-8">{children}</main>
    </div>
  )
}
