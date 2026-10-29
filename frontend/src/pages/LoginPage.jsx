import { useState } from 'react'
import Button from '../components/Button.jsx'
import TextField from '../components/TextField.jsx'
import AuthLayout from '../layouts/AuthLayout.jsx'

const GENERIC_INVALID_CREDENTIALS_MESSAGE = 'บัญชีหรือรหัสผ่านไม่ถูกต้อง'
const API_ERROR_MESSAGE = 'เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง'

// แสดงและส่งแบบฟอร์ม Login รองรับ FR-AUTH-01, FR-AUTH-02, FR-AUTH-03 และ FR-AUTH-05
// เมื่อสำเร็จส่ง token/role ให้ onLoginSuccess เพื่อเข้าหน้าตามบทบาท (FR-AUTH-04)
export default function LoginPage({ client, onLoginSuccess }) {
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
        onLoginSuccess?.(result.body)
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
    <AuthLayout labelledBy="login-heading">
      <header className="mb-6">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Science SU · Activity &amp; Hours System</p>
        <h1 id="login-heading" className="text-3xl font-bold tracking-tight text-slate-950">เข้าสู่ระบบ</h1>
        <p className="mt-2 text-slate-600">ระบบจัดการเอกสารกิจกรรมและส่งชั่วโมงอัตโนมัติ</p>
      </header>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <TextField
          id="username"
          label="บัญชีผู้ใช้"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <TextField
          id="password"
          label="รหัสผ่าน"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
        </Button>
      </form>

      {message && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{message}</p>}
    </AuthLayout>
  )
}
