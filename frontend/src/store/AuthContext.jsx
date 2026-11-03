import { createContext, useCallback, useEffect, useState } from 'react'
import { SESSION_REJECTED, isTokenExpired, msUntilExpiry } from '../utils/token.js'

export const AuthContext = createContext(null)

const SESSION_KEY = 'science-su-session'

// เก็บใน sessionStorage ให้รีเฟรชแล้วไม่หลุด แต่หมดเมื่อปิดแท็บ ไม่ต่ออายุ Token ตาม IF-TOKEN-01
function loadSession() {
  try {
    return JSON.parse(window.sessionStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

function saveSession(session) {
  try {
    if (session) window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else window.sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // เบราว์เซอร์ปิด storage: ใช้ session ในหน้าเดิมต่อได้ แต่รีเฟรชแล้วต้อง login ใหม่
  }
}

// เก็บ Token และบทบาทหลัง login (FR-AUTH-04) และบังคับ login ใหม่เมื่อ Token หมดอายุ (IF-TOKEN-01, AC-AUTH-04)
export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession)
  const [tokenExpired, setTokenExpired] = useState(false)

  const signIn = useCallback(({ token, expires_at, role, profile = null }) => {
    setTokenExpired(false)
    setSession({ token, expiresAt: expires_at, role, profile })
  }, [])

  // ออกจากระบบ: นอก spec 009 ทีมสั่งเพิ่ม (รอเพิ่มลง spec)
  const signOut = useCallback(() => {
    setTokenExpired(false)
    setSession(null)
  }, [])

  const expireSession = useCallback(() => {
    setSession(null)
    setTokenExpired(true)
  }, [])

  const dismissExpiredNotice = useCallback(() => setTokenExpired(false), [])

  useEffect(() => {
    saveSession(session)
  }, [session])

  // Token ใช้ไม่ได้แล้วฝั่ง API เช่น backend เริ่มใหม่ จึงพากลับหน้า login ตาม FR-AUTH-01
  useEffect(() => {
    window.addEventListener(SESSION_REJECTED, expireSession)
    return () => window.removeEventListener(SESSION_REJECTED, expireSession)
  }, [expireSession])

  useEffect(() => {
    if (!session) return undefined
    if (isTokenExpired(session.expiresAt)) {
      expireSession()
      return undefined
    }
    const timer = setTimeout(expireSession, msUntilExpiry(session.expiresAt))
    return () => clearTimeout(timer)
  }, [session, expireSession])

  return (
    <AuthContext.Provider value={{ session, tokenExpired, signIn, signOut, expireSession, dismissExpiredNotice }}>
      {children}
    </AuthContext.Provider>
  )
}
