import { useContext } from 'react'
import { AuthContext } from '../store/AuthContext.jsx'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth ต้องใช้ภายใน AuthProvider')
  }
  return context
}
