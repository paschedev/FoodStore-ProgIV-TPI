import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primary' | 'secondary' | 'outline' | 'danger'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante
}

const clasesPorVariante: Record<Variante, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-slate-200 text-slate-700 hover:bg-slate-300',
  outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

function Button({ variante = 'primary', type = 'button', className = '', children, ...props }: Props) {
  return (
    <button
      type={type}
      className={`rounded px-4 py-2 text-sm font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${clasesPorVariante[variante]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
