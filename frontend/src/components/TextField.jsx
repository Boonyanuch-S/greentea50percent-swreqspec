export default function TextField({ id, label, ...inputProps }) {
  return (
    <label className="block text-sm font-semibold text-slate-700" htmlFor={id}>
      {label}
      <input
        id={id}
        name={id}
        className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        {...inputProps}
      />
    </label>
  )
}
