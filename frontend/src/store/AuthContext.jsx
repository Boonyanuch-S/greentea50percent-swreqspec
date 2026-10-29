import { createContext, useCallback, useEffect, useState } from 'react'
import { isTokenExpired, msUntilExpiry } from '../utils/token.js'

export const AuthContext = createContext(null)

// เก็บ Token และบทบาทหลัง login (FR-AUTH-04) และบังคับ login ใหม่เมื่อ Token หมดอายุ (IF-TOKEN-01, AC-AUTH-04)
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
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
