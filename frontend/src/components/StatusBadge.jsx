const tones = {
  pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  progress: 'bg-sky-50 text-sky-800 ring-sky-200',
  success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200',
  neutral: 'bg-slate-50 text-slate-700 ring-slate-200',
}

const dots = {
  pending: 'bg-amber-500',
  progress: 'bg-sky-500',
  success: 'bg-emerald-500',
  danger: 'bg-rose-500',
  neutral: 'bg-slate-400',
}

// สีตามความหมายของสถานะจากทุก UC: รอ = เหลือง, กำลังดำเนินการ = ฟ้า, เสร็จ = เขียว, ต้องแก้ = แดง
const statusTones = {
  'รอเจ้าหน้าที่คณะตรวจสอบ': 'pending',
  'รอตรวจสอบ': 'pending',
  'รออนุมัติ': 'pending',
  'รอกองกิจตรวจสอบ': 'pending',
  'ส่งต่ออาจารย์': 'progress',
  'พร้อมตรวจสอบ': 'progress',
  'อนุมัติสมบูรณ์': 'success',
  'จบแล้ว': 'success',
  'บันทึกชั่วโมงสำเร็จ': 'success',
  'ถูกตีกลับ': 'danger',
  'ตีกลับให้แก้ไข': 'danger',
  'ส่งคืน UC-02': 'danger',
}

// ค่าสถานะจาก API บางค่ามีรหัสภายใน จึงแปลงเป็นคำที่บอกลักษณะงานก่อนแสดงให้ผู้ใช้เห็น
const statusLabels = {
  'ส่งคืน UC-02': 'ส่งคืนกรรมการสโมสรแก้ไข',
}

export function statusText(status) {
  return statusLabels[status] ?? status
}

export default function StatusBadge({ status, label }) {
  const tone = statusTones[status] ?? 'neutral'
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tones[tone]}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dots[tone]}`} />
      {label ? `${label}: ${statusText(status)}` : statusText(status)}
    </span>
  )
}
