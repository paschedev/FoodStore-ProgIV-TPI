type Props = {
  titulo: string
  valor: string | number
  color?: string
}

function ResumenCard({ titulo, valor, color = 'border-blue-600' }: Props) {
  return (
    <div className={`flex flex-col gap-1 rounded-lg border-l-4 bg-white p-4 shadow ${color}`}>
      <span className="text-sm text-slate-500">{titulo}</span>
      <span className="text-2xl font-bold text-slate-800">{valor}</span>
    </div>
  )
}

export default ResumenCard
