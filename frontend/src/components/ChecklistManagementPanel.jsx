import { useEffect, useState } from 'react'
import Button from './Button.jsx'
import { EmptyState, Notice } from './Feedback.jsx'

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
    return <p role="status" className="text-sm text-slate-600">กำลังโหลดรายการเอกสาร...</p>
  }

  return (
    <section aria-labelledby="checklist-management-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="checklist-management-heading" className="text-lg font-bold text-slate-950">
          รายการเอกสารที่ใช้ร่วมกัน
        </h2>
        {version && (
          <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800">
            ฉบับที่ {version} <span className="mx-1 text-teal-300">·</span> {items.length} รายการ
          </span>
        )}
      </div>

      <Notice className="mt-4">
        <p>
          รายการนี้เป็นตัวเลือก ไม่ใช่ชุดบังคับ ผู้ตรวจติ๊กเฉพาะเอกสารที่เกี่ยวข้องได้ในหน้าตรวจของแต่ละโครงการ
          และแก้ชื่อหรือเพิ่มรายการให้ตรงกับที่ใช้เรียกจริงได้
        </p>
        <p className="mt-1">การแก้ชื่อมีผลทันทีกับทุกโครงการที่กำลังตรวจ โดยผลที่ติ๊กไว้ยังอยู่</p>
        <p className="mt-1">
          รายการเริ่มต้นอ้างอิงจาก{' '}
          <a
            href="https://dsa.su.ac.th/ksu/?page_id=306"
            target="_blank"
            rel="noreferrer"
            className="font-semibold underline underline-offset-2"
          >
            เอกสารกิจกรรมนักศึกษา กองกิจการนักศึกษา
          </a>
        </p>
      </Notice>
      {error && <Notice tone="danger" role="alert" className="mt-3">{error}</Notice>}

      {items.length === 0 ? (
        <EmptyState title="ยังไม่มีรายการเอกสาร" description="เพิ่มรายการแรกด้วยช่องด้านล่าง" />
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {items.map((item) => (
            <li className="flex flex-wrap items-center gap-3 py-2.5" key={item.checklist_item_id}>
              {editingItemId === item.checklist_item_id ? (
                <form className="flex flex-1 flex-wrap gap-3" onSubmit={handleRenameItem}>
                  <label className="sr-only" htmlFor={`checklist-item-${item.checklist_item_id}`}>
                    แก้ชื่อ {item.item_name}
                  </label>
                  <input
                    id={`checklist-item-${item.checklist_item_id}`}
                    className="form-input min-w-60 flex-1"
                    value={editingItemName}
                    onChange={(event) => setEditingItemName(event.target.value)}
                    required
                  />
                  <Button type="submit" disabled={saving}>
                    บันทึก
                  </Button>
                  <Button
                    variant="secondary"
                    type="button"
                    disabled={saving}
                    onClick={() => setEditingItemId(null)}
                  >
                    ยกเลิก
                  </Button>
                </form>
              ) : (
                <>
                  <span className="min-w-0 flex-1 text-sm leading-6 text-slate-800">{item.item_name}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={() => {
                      setEditingItemId(item.checklist_item_id)
                      setEditingItemName(item.item_name)
                    }}
                  >
                    แก้ไข
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <form
        className="mt-4 flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-end"
        onSubmit={handleAddItem}
      >
        <div className="min-w-0 flex-1">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="new-checklist-item">
            ชื่อเอกสารใหม่
          </label>
          <input
            id="new-checklist-item"
            className="form-input"
            placeholder="พิมพ์ชื่อรายการเอกสาร"
            value={newItemName}
            onChange={(event) => setNewItemName(event.target.value)}
            required
          />
        </div>
        <Button className="sm:shrink-0" type="submit" disabled={saving}>
          เพิ่มรายการ
        </Button>
      </form>
    </section>
  )
}
