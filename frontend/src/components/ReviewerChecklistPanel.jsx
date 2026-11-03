import { useEffect, useState } from 'react'
import Button from './Button.jsx'
import { Notice } from './Feedback.jsx'

const RESULTS = [
  { value: 'ครบ', activeClass: 'border-emerald-600 bg-emerald-600 text-white' },
  { value: 'ไม่ครบ', activeClass: 'border-rose-600 bg-rose-600 text-white' },
]

// ให้ผู้ตรวจเลือกและทำเครื่องหมายรายการที่เกี่ยวข้องกับโครงการ ตาม FR-VDC-03 และ FR-VDC-07
// ส่งรายการปัจจุบันให้หน้าตรวจผ่าน onItemsChange เพื่อใช้กับการตัดสินใจตาม FR-VDC-04 และ FR-VDC-06
export default function ReviewerChecklistPanel({ client, session, submissionId, onItemsChange }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    let active = true
    client.getSubmissionChecklist(submissionId, session)
      .then((loadedItems) => {
        if (active) setItems(loadedItems)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [client, session, submissionId])

  useEffect(() => {
    onItemsChange?.(items)
  }, [items, onItemsChange])

  function updateItem(itemId, changes) {
    setSaved(false)
    setDirty(true)
    setItems((currentItems) => currentItems.map((item) => (
      item.checklist_item_id === itemId ? { ...item, ...changes } : item
    )))
  }

  async function saveChecklist() {
    setError('')
    setSaved(false)
    setSaving(true)
    try {
      const updatedItems = await client.updateSubmissionChecklist(
        submissionId,
        items,
        session,
      )
      setItems(updatedItems)
      setSaved(true)
      setDirty(false)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  // เพิ่มเอกสารที่เรียกต่างจากรายการเดิมเข้า Checklist กลาง แล้วติ๊กให้โครงการนี้ตาม FR-VDC-03 และ FR-VDC-07
  async function addItem(event) {
    event.preventDefault()
    setError('')
    setSaved(false)
    setAdding(true)
    try {
      const item = await client.addChecklistItem(newItemName.trim(), session)
      setItems((currentItems) => [...currentItems, { ...item, selected: true, result: null }])
      setNewItemName('')
      setDirty(true)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return <p role="status" className="text-sm text-slate-600">กำลังโหลด Checklist...</p>
  }

  const selectedItems = items.filter((item) => item.selected)
  const completeCount = selectedItems.filter((item) => item.result === 'ครบ').length
  const incompleteCount = selectedItems.filter((item) => item.result === 'ไม่ครบ').length

  return (
    <section aria-labelledby="reviewer-checklist-heading">
      <h2 id="reviewer-checklist-heading" className="text-lg font-bold text-slate-950">
        รายการตรวจเอกสาร
      </h2>
      <p className="mt-1 text-sm text-slate-600">ติ๊กเฉพาะเอกสารที่เกี่ยวข้องกับโครงการนี้ ไม่ต้องครบทุกรายการ</p>
      {error && <Notice tone="danger" role="alert" className="mt-3">{error}</Notice>}
      {saved && <Notice tone="success" role="status" className="mt-3">บันทึกผลตรวจแล้ว</Notice>}
      {items.length === 0 ? (
        <p className="mt-4 text-slate-600">ยังไม่มีรายการเอกสาร</p>
      ) : (
        <ul className="mt-3 space-y-1">
          {items.map((item) => (
            <li className={`rounded-xl px-3 py-2.5 transition-colors ${item.selected ? 'bg-teal-50' : 'hover:bg-slate-50'}`} key={item.checklist_item_id}>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="form-checkbox mt-1"
                  checked={item.selected}
                  onChange={(event) => updateItem(item.checklist_item_id, {
                    selected: event.target.checked,
                    result: event.target.checked ? item.result : null,
                  })}
                />
                <span className="text-sm font-medium leading-6 text-slate-900">{item.item_name}</span>
              </label>
              {item.selected && (
                <div role="radiogroup" aria-label={`สถานะเอกสาร ${item.item_name}`} className="mt-2 ml-7 flex gap-2">
                  {RESULTS.map(({ value, activeClass }) => (
                    <label
                      key={value}
                      className={`cursor-pointer rounded-lg border px-3 py-1 text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-teal-600 focus-within:ring-offset-1 ${
                        item.result === value ? activeClass : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        name={`checklist-result-${item.checklist_item_id}`}
                        value={value}
                        checked={item.result === value}
                        onChange={() => updateItem(item.checklist_item_id, { result: value })}
                      />
                      {value}
                    </label>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {client.addChecklistItem && (
        <form className="mt-4 flex items-end gap-2" onSubmit={addItem}>
          <label className="block min-w-0 flex-1 text-sm font-semibold text-slate-700">
            เพิ่มเอกสารที่ไม่มีในรายการ
            <input
              className="form-input mt-1.5"
              aria-describedby="add-checklist-item-hint"
              placeholder="พิมพ์ชื่อเอกสารตามที่โครงการนี้ใช้"
              value={newItemName}
              onChange={(event) => setNewItemName(event.target.value)}
            />
          </label>
          <Button type="submit" variant="secondary" disabled={adding || !newItemName.trim()}>
            เพิ่ม
          </Button>
        </form>
      )}
      {client.addChecklistItem && (
        <p id="add-checklist-item-hint" className="mt-1 text-xs text-slate-500">ชื่อนี้จะเพิ่มในรายการเอกสารให้ทุกคนเห็นด้วย</p>
      )}
      <p className="mt-4 text-sm text-slate-600">
        เลือกแล้ว {selectedItems.length} รายการ · ครบ {completeCount} · ไม่ครบ {incompleteCount}
      </p>
      {dirty && <p className="mt-1 text-sm font-medium text-amber-800">มีการเปลี่ยนแปลงที่ยังไม่บันทึก</p>}
      <Button
        className="mt-2 w-full"
        type="button"
        disabled={saving || items.some((item) => item.selected && !item.result)}
        onClick={saveChecklist}
      >
        {saving ? 'กำลังบันทึก...' : 'บันทึกผลตรวจ'}
      </Button>
    </section>
  )
}
