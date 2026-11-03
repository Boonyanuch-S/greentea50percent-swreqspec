import { showDocument } from './alerts.js'

// เปิดไฟล์ที่โหลดด้วย Token ในกล่องแสดงเอกสาร แล้วคืนหน่วยความจำเมื่อปิด
export async function openFile({ title, name, blob }) {
  const url = URL.createObjectURL(blob)
  await showDocument({ title, name, url, type: blob.type })
  URL.revokeObjectURL(url)
}
