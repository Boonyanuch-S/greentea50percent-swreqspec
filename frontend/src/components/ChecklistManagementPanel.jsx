import { useEffect, useState } from 'react'

// ให้เจ้าหน้าที่อ่าน เพิ่ม และแก้รายการ Checklist กลาง ตาม FR-VDC-07 และ IF-CHK-02
export default function ChecklistManagementPanel({ client, session }) {
  const [items, setItems] = useState([])
  const [newItemName, setNewItemName] = useState('')
  const [editingItemId, setEditingItemId] = useState(null)
  const [editingItemName, setEditingItemName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(null)

  useEffect(() => {
    let active = true
    client.getLatestChecklist(session)
      .then((checklist) => {
        if (active) {
          setItems(checklist.items)
          setVersion(checklist.version)
        }
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
  }, [client, session])

  async function handleAddItem(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await client.addChecklistItem(newItemName, session)
      const checklist = await client.getLatestChecklist(session)
      setItems(checklist.items)
      setVersion(checklist.version)
      setNewItemName('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleRenameItem(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await client.renameChecklistItem(editingItemId, editingItemName, session)
      const checklist = await client.getLatestChecklist(session)
      setItems(checklist.items)
      setVersion(checklist.version)
      setEditingItemId(null)
      setEditingItemName('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p role="status">กำลังโหลด Checklist กลาง...</p>
  }

  return (
    <section aria-labelledby="checklist-management-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="checklist-management-heading" className="text-xl font-bold text-slate-950">
            Checklist กลาง
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            เพิ่มรายการเอกสารที่ต้องการใช้ร่วมกัน
          </p>
        </div>
        {version && (
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600">
            v{version} <span className="mx-1 text-slate-300">·</span> {items.length} รายการ
          </span>
        )}
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}

      <form
        className="mt-6 flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-end"
        onSubmit={handleAddItem}
      >
        <div className="min-w-0 flex-1">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="new-checklist-item">
            ชื่อรายการ Checklist ใหม่
          </label>
          <input
            id="new-checklist-item"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            placeholder="พิมพ์ชื่อรายการเอกสาร"
            value={newItemName}
            onChange={(event) => setNewItemName(event.target.value)}
            required
          />
        </div>
        <button
          className="rounded-lg bg-teal-700 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:shrink-0"
          type="submit"
          disabled={saving}
        >
          เพิ่มรายการ
        </button>
      </form>

      {items.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center">
          <p className="font-medium text-slate-700">ยังไม่มีรายการใน Checklist กลาง</p>
          <p className="mt-1 text-sm text-slate-500">เพิ่มรายการแรกด้วยช่องด้านบน</p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <li
              className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
              key={item.checklist_item_id}
            >
              {editingItemId === item.checklist_item_id ? (
                <form className="flex flex-1 flex-wrap gap-3" onSubmit={handleRenameItem}>
                  <label className="sr-only" htmlFor={`checklist-item-${item.checklist_item_id}`}>
                    แก้ชื่อ {item.item_name}
                  </label>
                  <input
                    id={`checklist-item-${item.checklist_item_id}`}
                    className="min-w-60 flex-1 rounded-lg border border-slate-300 px-3 py-2"
                    value={editingItemName}
                    onChange={(event) => setEditingItemName(event.target.value)}
                    required
                  />
                  <button
                    className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white disabled:opacity-60"
                    type="submit"
                    disabled={saving}
                  >
                    บันทึก
                  </button>
                  <button
                    className="rounded-lg border border-slate-300 px-4 py-2"
                    type="button"
                    disabled={saving}
                    onClick={() => setEditingItemId(null)}
                  >
                    ยกเลิก
                  </button>
                </form>
              ) : (
                <>
                  <span className="flex-1">{item.item_name}</span>
                  <button
                    className="rounded-lg border border-slate-300 px-4 py-2"
                    type="button"
                    onClick={() => {
                      setEditingItemId(item.checklist_item_id)
                      setEditingItemName(item.item_name)
                    }}
                  >
                    แก้ไข
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
