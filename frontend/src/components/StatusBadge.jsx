const styles = {
  'รอเจ้าหน้าที่คณะตรวจสอบ': 'bg-amber-50 text-amber-800 ring-amber-200',
  'ถูกตีกลับ': 'bg-red-50 text-red-700 ring-red-200',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[status] ?? 'bg-slate-50 text-slate-700 ring-slate-200'}`}>
      {status}
    </span>
  )
}
