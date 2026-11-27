import type { ReactNode } from 'react'

type Props = {
  titulo?: string
  acciones?: ReactNode
  className?: string
  children: ReactNode
}

function Card({ titulo, acciones, className = '', children }: Props) {
  return (
    <article className={`rounded-lg bg-white p-5 shadow ${className}`}>
      {titulo && <h3 className="mb-2 text-lg font-semibold text-slate-800">{titulo}</h3>}
      {children}
      {acciones && <div className="mt-4 flex justify-end gap-2">{acciones}</div>}
    </article>
  )
}

export default Card
