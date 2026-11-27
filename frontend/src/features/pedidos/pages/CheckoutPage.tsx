import { useForm } from '@tanstack/react-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import Input from '@/shared/ui/Input'
import { formatearPrecio } from '@/shared/utils/formato'
import { useCartStore } from '@/store/cartStore'
import { useCrearPedido } from '../hooks/usePedidos'
import type { FormaPago } from '../types/pedido'

type CheckoutValues = {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string
}

const valoresIniciales: CheckoutValues = {
  direccion_entrega: '',
  forma_pago: 'EFECTIVO',
  notas: '',
}

function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((state) => state.items)
  const total = useCartStore((state) => state.total)
  const vaciar = useCartStore((state) => state.vaciar)
  const crearMutation = useCrearPedido()

  const form = useForm({
    defaultValues: valoresIniciales,
    onSubmit: async ({ value }) => {
      const pedido = await crearMutation.mutateAsync({
        items: items.map(({ producto_id, cantidad }) => ({ producto_id, cantidad })),
        forma_pago: value.forma_pago,
        direccion_entrega: value.direccion_entrega.trim(),
        notas: value.notas.trim() || undefined,
      })
      navigate('/mis-pedidos', { replace: true, state: { pedidoCreado: pedido.id } })
      vaciar()
    },
  })

  if (items.length === 0 && !crearMutation.isSuccess) return <Navigate to="/carrito" replace />

  return (
    <section className="grid gap-6 md:grid-cols-[2fr_1fr]">
      <Card titulo="Datos de entrega">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit().catch(() => undefined)
          }}
          className="flex flex-col gap-4"
        >
          <form.Field
            name="direccion_entrega"
            validators={{
              onChange: ({ value }) => {
                const largo = value.trim().length
                if (largo < 5) return 'La dirección debe tener al menos 5 caracteres'
                if (largo > 200) return 'La dirección no puede superar los 200 caracteres'
                return undefined
              },
            }}
          >
            {(field) => (
              <Input
                id="direccion_entrega"
                label="Dirección de entrega"
                placeholder="Calle, número, piso..."
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                errores={field.state.meta.errors}
              />
            )}
          </form.Field>
          <form.Field name="forma_pago">
            {(field) => (
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-sm text-slate-600">Forma de pago</legend>
                {(['EFECTIVO', 'TRANSFERENCIA'] as const).map((opcion) => (
                  <label key={opcion} className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="forma_pago"
                      value={opcion}
                      checked={field.state.value === opcion}
                      onChange={() => field.handleChange(opcion)}
                    />
                    {opcion === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}
                  </label>
                ))}
              </fieldset>
            )}
          </form.Field>
          <form.Field
            name="notas"
            validators={{
              onChange: ({ value }) => (value.length > 500 ? 'Las notas no pueden superar los 500 caracteres' : undefined),
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1">
                <label htmlFor="notas" className="text-sm text-slate-600">Notas (opcional)</label>
                <textarea
                  id="notas"
                  rows={3}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="rounded border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none"
                />
                {field.state.meta.errors.filter(Boolean).map((mensaje) => (
                  <p key={mensaje} className="text-xs text-red-600">{mensaje}</p>
                ))}
              </div>
            )}
          </form.Field>
          {crearMutation.error && (
            <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {handleApiError(crearMutation.error, 'No se pudo crear el pedido')}
            </p>
          )}
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? 'Enviando pedido...' : 'Confirmar pedido'}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </Card>
      <Card titulo="Resumen">
        <ul className="flex flex-col gap-2 text-sm">
          {items.map((item) => (
            <li key={item.producto_id} className="flex justify-between gap-2 text-slate-600">
              <span>{item.cantidad} × {item.nombre}</span>
              <span>{formatearPrecio(item.precio_unitario * item.cantidad)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-slate-200 pt-3 text-right text-lg font-bold text-slate-800">
          {formatearPrecio(total())}
        </p>
      </Card>
    </section>
  )
}

export default CheckoutPage
