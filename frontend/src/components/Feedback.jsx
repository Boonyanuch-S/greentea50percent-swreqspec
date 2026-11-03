import Button from './Button.jsx'
import Icon from './Icon.jsx'

const noticeTones = {
  info: { box: 'border-sky-200 bg-sky-50 text-sky-900', icon: 'info' },
  success: { box: 'border-emerald-200 bg-emerald-50 text-emerald-900', icon: 'checkCircle' },
  warning: { box: 'border-amber-200 bg-amber-50 text-amber-900', icon: 'alert' },
  danger: { box: 'border-rose-200 bg-rose-50 text-rose-800', icon: 'alert' },
}

// กล่องแจ้งข้อมูล/ผลลัพธ์/คำเตือน/ข้อผิดพลาดแบบเดียวกันทุกหน้า (ส่วนแสดงผล ไม่ผูก FR)
export function Notice({ tone = 'info', title, className = '', children, ...props }) {
  const { box, icon } = noticeTones[tone]
  return (
    <div className={`flex gap-3 rounded-xl border p-4 text-sm leading-6 ${box} ${className}`} {...props}>
      <Icon name={icon} className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children}
      </div>
    </div>
  )
}

// เอกสารจากลิงก์เดิมอาจไม่มีแล้ว จึงต้องมีทางกลับรายการเสมอ ไม่ให้ผู้ใช้ติดที่หน้านี้
export function LoadError({ message, backLabel, onBack }) {
  return (
    <div>
      <Notice tone="danger" role="alert">{message}</Notice>
      {onBack && (
        <Button type="button" variant="secondary" className="mt-4" onClick={onBack}>
          {backLabel}
        </Button>
      )}
    </div>
  )
}

export function LoadingCard({ children, className = '', ...props }) {
  return (
    <div className={`card flex items-center justify-center gap-3 p-10 text-sm text-slate-600 ${className}`} {...props}>
      <span aria-hidden="true" className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-teal-700" />
      {children}
    </div>
  )
}

export function EmptyState({ icon = 'inbox', title, description, children }) {
  return (
    <div className="px-6 py-14 text-center">
      <span aria-hidden="true" className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <p className="mt-4 font-semibold text-slate-800">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  )
}
