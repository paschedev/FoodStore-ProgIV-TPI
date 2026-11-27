type Props = {
  estado: string
}

const estilos: Record<string, { texto: string; clases: string }> = {
  PENDIENTE: { texto: 'Pendiente', clases: 'bg-amber-100 text-amber-800' },
  EN_PREPARACION: { texto: 'En preparación', clases: 'bg-blue-100 text-blue-800' },
  ENTREGADO: { texto: 'Entregado', clases: 'bg-green-100 text-green-800' },
  CANCELADO: { texto: 'Cancelado', clases: 'bg-red-100 text-red-800' },
}

function BadgeEstado({ estado }: Props) {
  const estilo = estilos[estado] ?? { texto: estado, clases: 'bg-slate-200 text-slate-700' }
  return <span className={`rounded px-2 py-0.5 text-xs font-semibold ${estilo.clases}`}>{estilo.texto}</span>
}

export default BadgeEstado
