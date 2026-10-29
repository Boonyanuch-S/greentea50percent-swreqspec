import Swal from 'sweetalert2'

// กล่องแจ้งเตือน/ยืนยันกลางของระบบ (SweetAlert2: ทีมเลือกเอง ไม่ได้มาจาก spec)
// heightAuto/scrollbarPadding ปิดไว้ เพื่อไม่ให้หน้าเว็บหดหรือขยับตอนกล่องเปิด
const base = { heightAuto: false, scrollbarPadding: false }

const themed = Swal.mixin({
  ...base,
  confirmButtonColor: '#0f766e',
  cancelButtonColor: '#64748b',
  reverseButtons: true,
  focusCancel: true,
})

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

// คืน true เมื่อผู้ใช้กดยืนยัน
export async function confirmAction({ title, text, confirmText = 'ยืนยัน', cancelText = 'ยกเลิก', danger = false }) {
  const result = await themed.fire({
    icon: danger ? 'warning' : 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: danger ? '#dc2626' : '#0f766e',
  })
  return result.isConfirmed
}

export function showSuccess({ title, text }) {
  return themed.fire({ icon: 'success', title, text, confirmButtonText: 'ตกลง' })
}

export function showWarning({ title, text, confirmText = 'ตกลง' }) {
  return themed.fire({ icon: 'warning', title, text, confirmButtonText: confirmText, allowOutsideClick: false })
}

// แสดงข้อผิดพลาดพร้อมรายการ (เช่น เอกสารที่ยังขาด)
export function showErrorList({ title, text, items = [] }) {
  const list = items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
  return themed.fire({
    icon: 'error',
    title,
    html: `<p>${escapeHtml(text)}</p>${list ? `<ul style="text-align:left;margin:12px auto 0;max-width:28rem;list-style:disc;padding-left:1.25rem">${list}</ul>` : ''}`,
    confirmButtonText: 'ตกลง',
  })
}

// เปิดดูเอกสารแนบ: PDF/รูปแสดงในกล่อง ไฟล์ตัวอย่างที่ไม่มีเนื้อหาแจ้งว่าไม่มีไฟล์จริง
export function showDocument({ title, name, url, type = '' }) {
  if (!url) {
    return themed.fire({
      icon: 'info',
      title: name,
      text: 'ไฟล์ตัวอย่างใน prototype ยังไม่มีเนื้อหาจริง',
      confirmButtonText: 'ปิด',
    })
  }
  if (type.startsWith('image/')) {
    return themed.fire({ title, text: name, imageUrl: url, imageAlt: name, width: '56rem', confirmButtonText: 'ปิด' })
  }
  const safeUrl = escapeHtml(url)
  return themed.fire({
    title,
    html: `<p style="margin-bottom:12px">${escapeHtml(name)}</p><iframe src="${safeUrl}" title="${escapeHtml(name)}" style="width:100%;height:60vh;border:1px solid #e2e8f0;border-radius:8px"></iframe>`,
    width: '64rem',
    confirmButtonText: 'ปิด',
    footer: `<a href="${safeUrl}" target="_blank" rel="noopener">เปิดในแท็บใหม่</a>`,
  })
}

export function showToast(title) {
  return Swal.fire({ ...base, toast: true, position: 'top-end', icon: 'success', title, showConfirmButton: false, timer: 2000, timerProgressBar: true })
}
