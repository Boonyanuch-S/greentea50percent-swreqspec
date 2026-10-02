import { useState } from 'react'

const GENERIC_INVALID_CREDENTIALS_MESSAGE = 'บัญชีหรือรหัสผ่านไม่ถูกต้อง'
const API_ERROR_MESSAGE = 'เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง'

// แสดงและส่งแบบฟอร์ม Login รองรับ FR-AUTH-01, FR-AUTH-02 และ FR-AUTH-03
export default function LoginPage({ client }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    try {
      const result = await client.login({ username, password })
      if (result.status >= 200 && result.status < 300) {
        setMessage('เข้าสู่ระบบสำเร็จ')
      } else if (result.status === 401) {
        setMessage(GENERIC_INVALID_CREDENTIALS_MESSAGE)
      } else {
        setMessage(API_ERROR_MESSAGE)
      }
    } catch {
      setMessage(API_ERROR_MESSAGE)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
        <section className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="login-heading">
          <header className="mb-6">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">University Activity System</p>
            <h1 id="login-heading" className="text-3xl font-bold tracking-tight text-slate-950">เข้าสู่ระบบ</h1>
            <p className="mt-2 text-slate-600">กรอกบัญชีผู้ใช้เพื่อเข้าใช้งานระบบ</p>
          </header>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="username">
              บัญชีผู้ใช้
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700" htmlFor="password">
              รหัสผ่าน
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          {message && <p className="mt-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-700" role="alert">{message}</p>}
        </section>
      </div>
    </main>
  )
}
