import type { ReactNode } from 'react'

type Props = {
  mensaje: string
  children?: ReactNode
}

function EstadoVacio({ mensaje, children }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg bg-white p-8 text-center text-slate-500 shadow">
      <p>{mensaje}</p>
      {children}
    </div>
  )
}

export default EstadoVacio
