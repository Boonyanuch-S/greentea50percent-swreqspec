// ป้องกัน route ฟีเจอร์ย้อนหลังเมื่อไม่มี session ตาม CON-NFR-21 และ NFR-SEC-01
export default function AuthGuard({ userSession, children, loginFallback = null }) {
  if (!userSession?.authenticationReference) {
    return loginFallback
  }

  return children
}
