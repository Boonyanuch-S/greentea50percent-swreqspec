import { useEffect, useState } from 'react'

const fields = [
  { name: 'projectName', label: 'ชื่อโครงการ', type: 'text' },
  { name: 'objectives', label: 'วัตถุประสงค์', type: 'textarea' },
  { name: 'activityDate', label: 'วันที่จัดกิจกรรม', type: 'date' },
  { name: 'location', label: 'สถานที่', type: 'text' },
  { name: 'indicators', label: 'ตัวชี้วัด', type: 'textarea' },
]

// แสดงฟอร์มเอกสารโครงการเปล่า รองรับ FR-PRJ-01 และ FR-PRJ-02
export default function ProjectDocumentForm({ client }) {
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    client.getNewProjectForm().then((emptyForm) => {
      if (active) {
        setForm(emptyForm)
        setLoading(false)
      }
    })

    return () => {
      active = false
    }
  }, [client])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  if (loading) {
    return <main className="min-h-screen bg-slate-100 p-8 text-slate-700">กำลังโหลดฟอร์มเอกสารโครงการ...</main>
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 border-b border-slate-200 pb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Science Club / Project Document
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">สร้างโครงการใหม่</h1>
          <p className="mt-2 text-slate-600">กรอกข้อมูลหลักของเอกสารโครงการ</p>
        </header>

        <form className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={(event) => event.preventDefault()}>
          {fields.map((field) => (
            <label key={field.name} className="block text-sm font-semibold text-slate-700" htmlFor={field.name}>
              {field.label}
              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  rows={4}
                  className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={form[field.name]}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              )}
            </label>
          ))}
        </form>
      </div>
    </main>
  )
}
