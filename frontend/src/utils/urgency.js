const DAY_MS = 24 * 60 * 60 * 1000
// ผังของกองกิจกำหนดให้เสนอก่อนจัดอย่างน้อย 1 เดือน โครงการที่เหลือเวลาน้อยกว่านี้จึงควรตรวจก่อน
const URGENT_DAYS = 30

export function daysUntil(dateText, now = new Date()) {
  if (!dateText) return null
  const days = Math.ceil((new Date(`${dateText}T00:00:00`) - now) / DAY_MS)
  return Number.isNaN(days) ? null : days
}

export function urgencyLabel(dateText, now = new Date()) {
  const days = daysUntil(dateText, now)
  if (days === null || days > URGENT_DAYS) return null
  return days < 0 ? 'ด่วน: เลยวันจัดกิจกรรมแล้ว' : `ด่วน: จัดกิจกรรมในอีก ${days} วัน`
}

// ดึงงานด่วนขึ้นก่อน โดยคงลำดับเดิมในแต่ละกลุ่ม
export function urgentFirst(items, getDate) {
  const isUrgent = (item) => urgencyLabel(getDate(item)) !== null
  return [...items.filter(isUrgent), ...items.filter((item) => !isUrgent(item))]
}
