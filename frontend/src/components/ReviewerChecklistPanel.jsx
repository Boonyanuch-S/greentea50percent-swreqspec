import { useEffect, useState } from 'react'

// ให้ผู้ตรวจเลือกและทำเครื่องหมายรายการที่เกี่ยวข้องกับโครงการ ตาม FR-VDC-03 และ FR-VDC-07
export default function ReviewerChecklistPanel({ client, session, submissionId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

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

  function updateItem(itemId, changes) {
    setSaved(false)
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
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p role="status">กำลังโหลด Checklist...</p>
  }

  return (
    <section aria-labelledby="reviewer-checklist-heading">
      <h2 id="reviewer-checklist-heading" className="text-xl font-bold text-slate-950">
        Checklist กลางฉบับล่าสุด
      </h2>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      {saved && <p role="status" className="mt-3 text-sm text-teal-700">บันทึกผลตรวจแล้ว</p>}
      {items.length === 0 ? (
        <p className="mt-4 text-slate-600">ยังไม่มีรายการใน Checklist กลาง</p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-200">
          {items.map((item) => (
            <li className="py-4" key={item.checklist_item_id}>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={(event) => updateItem(item.checklist_item_id, {
                    selected: event.target.checked,
                    result: event.target.checked ? item.result : null,
                  })}
                />
                <span className="font-medium text-slate-900">{item.item_name}</span>
              </label>
              {item.selected && (
                <label className="mt-3 flex max-w-sm flex-col gap-1 text-sm text-slate-700">
                  สถานะเอกสาร {item.item_name}
                  <select
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    value={item.result ?? ''}
                    onChange={(event) => updateItem(item.checklist_item_id, {
                      result: event.target.value || null,
                    })}
                  >
                    <option value="">เลือกสถานะ</option>
                    <option value="ครบ">ครบ</option>
                    <option value="ไม่ครบ">ไม่ครบ</option>
                  </select>
                </label>
              )}
            </li>
          ))}
        </ul>
      )}
      <button
        className="mt-5 rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white disabled:opacity-60"
        type="button"
        disabled={saving || items.some((item) => item.selected && !item.result)}
        onClick={saveChecklist}
      >
        {saving ? 'กำลังบันทึก...' : 'บันทึกผลตรวจ'}
      </button>
    </section>
  )
}
