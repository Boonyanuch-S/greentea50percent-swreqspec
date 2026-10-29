// โครงหน้าแบบการ์ดกลางจอ ใช้กับหน้าเข้าสู่ระบบและหน้าหลักชั่วคราว
export default function AuthLayout({ labelledBy, children }) {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
        <section className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby={labelledBy}>
          {children}
        </section>
      </div>
    </main>
  )
}
