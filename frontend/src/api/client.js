// จุดเดียวที่หน้าจอใช้เรียก API หลังบ้าน (ตามสัญญา API ใน plan.md ข้อ 4)
// ตอน test ให้ส่ง client จำลองเข้าไปในหน้าจอแทน ไม่ต้องรันหลังบ้านจริง
// เรียกผ่าน /api (ดู proxy ใน vite.config.js) หลังบ้านต้องรันอยู่ที่ port 8000
const BASE = import.meta.env.VITE_API_BASE ?? '/api'

// ปฏิเสธการเรียกคิว/รายละเอียดเอกสารเมื่อไม่มี Login ตาม CON-NFR-21 และ NFR-SEC-01
export function requireReviewAuthentication(userSession) {
  if (!userSession?.authenticationReference) {
    throw new Error('ต้องยืนยันตัวตนก่อนเข้าถึงเอกสาร')
  }
  return userSession.authenticationReference
}

async function reviewFetch(path, userSession, options = {}) {
  const authenticationReference = requireReviewAuthentication(userSession)
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      Authorization: authenticationReference,
    },
  })
}

export const api = {
  async getSlots({ dateFrom, packageCode }) {
    const q = new URLSearchParams({ date_from: dateFrom, package_code: packageCode })
    const res = await fetch(`${BASE}/slots?${q}`)
    return res.json()
  },
  async createBooking({ slotId }) {
    const res = await fetch(`${BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot_id: slotId }),
    })
    return { status: res.status, body: await res.json() }
  },
  async getReviewQueue(userSession) {
    const res = await reviewFetch('/review-queue', userSession)
    return { status: res.status, body: await res.json() }
  },
  async getSubmission(submissionId, userSession) {
    const res = await reviewFetch(`/submissions/${submissionId}`, userSession)
    return { status: res.status, body: await res.json() }
  },
}
