const variants = {
  primary: 'bg-teal-700 text-white shadow-sm hover:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400',
  danger: 'bg-rose-700 text-white shadow-sm hover:bg-rose-800 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none',
  dangerOutline: 'border border-rose-300 bg-white text-rose-800 hover:bg-rose-50 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 disabled:text-slate-400',
}

const sizes = {
  md: 'px-4 py-2.5 text-sm',
  sm: 'px-3 py-1.5 text-sm',
}

// ปุ่มกลางของระบบ เลือกความสำคัญด้วย variant (ส่วนแสดงผล ไม่ผูก FR)
export default function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}
