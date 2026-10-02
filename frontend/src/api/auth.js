const BASE = import.meta.env.VITE_API_BASE ?? '/api'

// ส่ง username/password ไปยัง Login API รองรับ FR-AUTH-02 และ FR-AUTH-03
export const authApi = {
  async login({ username, password }) {
    const response = await fetch(`${BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    let body = null
    try {
      body = await response.json()
    } catch {
      body = null
    }

    return { status: response.status, body }
  },
}
