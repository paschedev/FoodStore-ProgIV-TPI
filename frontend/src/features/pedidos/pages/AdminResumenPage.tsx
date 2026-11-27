import EstadoError from '@/shared/components/EstadoError'
import Skeleton from '@/shared/components/Skeleton'
import { formatearPrecio } from '@/shared/utils/formato'
import ResumenCard from '../components/ResumenCard'
import { useResumenPedidos } from '../hooks/usePedidos'

function AdminResumenPage() {
  const { data, isPending, isError, refetch } = useResumenPedidos()

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-slate-800">Resumen</h1>
      {isPending ? (
        <Skeleton cantidad={6} alto="h-24" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" />
      ) : isError ? (
        <EstadoError mensaje="No se pudo cargar el resumen" onReintentar={() => refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard titulo="Pedidos de hoy" valor={data.pedidos_hoy} />
          <ResumenCard titulo="Ingresos (entregados)" valor={formatearPrecio(data.ingresos_entregados)} color="border-green-600" />
          <ResumenCard titulo="Pendientes" valor={data.pendientes} color="border-amber-500" />
          <ResumenCard titulo="En preparación" valor={data.en_preparacion} color="border-blue-400" />
          <ResumenCard titulo="Entregados" valor={data.entregados} color="border-green-500" />
          <ResumenCard titulo="Cancelados" valor={data.cancelados} color="border-red-500" />
        </div>
      )}
    </section>
  )
}

export default AdminResumenPage
