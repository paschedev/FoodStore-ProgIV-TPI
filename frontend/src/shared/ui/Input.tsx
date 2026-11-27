import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  errores?: Array<string | undefined>
}

function Input({ label, errores = [], id, className = '', ...props }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm text-slate-600">{label}</label>
      <input
        id={id}
        className={`rounded border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none ${className}`}
        {...props}
      />
      {errores.filter(Boolean).map((error) => (
        <p key={error} className="text-xs text-red-600">{error}</p>
      ))}
    </div>
  )
}

export default Input
