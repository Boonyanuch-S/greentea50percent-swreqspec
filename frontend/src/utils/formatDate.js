// แสดงวันที่ yyyy-mm-dd เป็นวันที่ภาษาไทยแบบ พ.ศ.
export function formatThaiDate(isoDate) {
  if (!isoDate) return '-'
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}
