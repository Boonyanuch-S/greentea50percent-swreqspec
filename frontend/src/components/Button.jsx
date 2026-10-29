export default function Button({ className = '', ...props }) {
  return (
    <button
      className={`w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 ${className}`}
      {...props}
    />
  )
}
