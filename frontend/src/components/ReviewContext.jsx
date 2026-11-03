// แสดงการตีกลับรอบก่อน ๆ ให้ทุกขั้นเห็นตรงกันว่าเคยให้แก้เอกสารอะไร ตาม IF-UC01-01 และ IF-UC01-02
export function ReviewHistory({ history }) {
  if (!history?.length) return null
  return (
    <section className="card p-5" aria-labelledby="review-history-heading">
      <h2 id="review-history-heading" className="text-sm font-semibold text-slate-900">ประวัติการตีกลับ</h2>
      <ol className="mt-2 divide-y divide-slate-100">
        {history.map((entry) => (
          <li key={entry.round} className="py-2.5 text-sm">
            <p className="font-medium text-slate-900">รอบที่ {entry.round} · {entry.stage}</p>
            <p className="mt-0.5 whitespace-pre-line text-slate-600">{entry.reason || 'ไม่ได้ระบุเหตุผล'}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function ResultBadge({ result }) {
  const tone = result === 'ครบ'
    ? 'bg-emerald-100 text-emerald-900'
    : result === 'ไม่ครบ' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}>{result ?? 'ยังไม่ตรวจ'}</span>
}

// จับคู่ผล Checklist กับเอกสารจากชื่อรายการ เพื่อให้เห็นผลตรวจข้างไฟล์แต่ละฉบับ ตาม FR-APR-02 และ IF-CHK-02
export function resultForDocument(results, documentType) {
  return results?.find((item) => item.item_name === documentType)?.result
}

// แสดงรายการ Checklist อื่นที่ไม่ใช่ไฟล์ในชุด เพื่อให้ทุกบทบาทเห็นผลตรวจเหมือนกัน
export function OtherChecklistResults({ results, documentTypes, title = 'รายการอื่นที่เจ้าหน้าที่ตรวจ' }) {
  const others = (results ?? []).filter((item) => !documentTypes.includes(item.item_name))
  if (others.length === 0) return null
  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <p className="px-1 text-xs font-semibold text-slate-500">{title}</p>
      <ul className="mt-1.5 space-y-1.5">
        {others.map((item) => (
          <li key={item.item_name} className="flex items-start justify-between gap-2 px-1 text-sm text-slate-700">
            <span className="min-w-0">{item.item_name}</span>
            <ResultBadge result={item.result} />
          </li>
        ))}
      </ul>
    </div>
  )
}
