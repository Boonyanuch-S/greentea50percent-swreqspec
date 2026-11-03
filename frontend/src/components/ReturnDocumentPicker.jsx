// ให้ผู้ตรวจระบุว่าเอกสารฉบับใดต้องแก้ กรรมการจะได้แก้ถูกจุด ตาม FR-APR-06, FR-VDC-06 และ Q-04 ของ specs/003
export default function ReturnDocumentPicker({ documents, selected, onChange, disabled = false }) {
  if (documents.length === 0) return null

  function toggle(label) {
    onChange(selected.includes(label) ? selected.filter((item) => item !== label) : [...selected, label])
  }

  return (
    <fieldset className="mt-3">
      <legend className="text-sm font-semibold text-slate-700">เอกสารที่ต้องแก้</legend>
      <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1.5">
        {documents.map(({ id, label }) => (
          <label key={id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="form-checkbox"
              checked={selected.includes(label)}
              disabled={disabled}
              onChange={() => toggle(label)}
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function composeReturnReason(selected, text) {
  const detail = text.trim()
  return selected.length > 0 ? `เอกสารที่ต้องแก้: ${selected.join(', ')}\n${detail}` : detail
}
