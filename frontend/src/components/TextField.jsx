export default function TextField({ id, label, ...inputProps }) {
  return (
    <label className="block text-sm font-semibold text-slate-700" htmlFor={id}>
      {label}
      <input id={id} name={id} className="form-input mt-2" {...inputProps} />
    </label>
  )
}
