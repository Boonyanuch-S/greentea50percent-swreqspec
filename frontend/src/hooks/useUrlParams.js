import { useCallback, useMemo, useSyncExternalStore } from 'react'

const URL_CHANGED = 'app:url-changed'
const KEPT_ON_RESET = ['mockup']

function subscribe(onChange) {
  window.addEventListener('popstate', onChange)
  window.addEventListener(URL_CHANGED, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(URL_CHANGED, onChange)
  }
}

function getSearch() {
  return window.location.search
}

// เก็บหน้าปัจจุบันใน URL เพื่อให้รีเฟรชแล้วอยู่หน้าเดิม และปุ่มย้อนกลับของเบราว์เซอร์ใช้งานได้ (ไม่ผูก FR)
export function useUrlParams() {
  const search = useSyncExternalStore(subscribe, getSearch)
  const params = useMemo(() => new URLSearchParams(search), [search])

  const updateParams = useCallback((changes, { replace = false, reset = false } = {}) => {
    const current = new URLSearchParams(window.location.search)
    const next = new URLSearchParams()
    current.forEach((value, key) => {
      if (!reset || KEPT_ON_RESET.includes(key)) next.set(key, value)
    })
    Object.entries(changes).forEach(([key, value]) => {
      if (value === null || value === undefined) next.delete(key)
      else next.set(key, String(value))
    })
    if (next.toString() === current.toString()) return
    const query = next.toString()
    const url = `${window.location.pathname}${query ? `?${query}` : ''}`
    window.history[replace ? 'replaceState' : 'pushState'](null, '', url)
    window.dispatchEvent(new Event(URL_CHANGED))
  }, [])

  return [params, updateParams]
}
