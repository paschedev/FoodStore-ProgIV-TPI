import type { ReactNode } from 'react'

type Props = {
  titulo: string
  children: ReactNode
}

function Modal({ titulo, children }: Props) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-full w-full max-w-md flex-col gap-4 overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-xl font-bold text-slate-800">{titulo}</h2>
        {children}
      </div>
    </div>
  )
}

export default Modal
