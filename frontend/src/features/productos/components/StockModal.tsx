import { useForm } from '@tanstack/react-form'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import Modal from '@/shared/ui/Modal'
import type { Producto, StockDatos } from '../types/producto'

type Props = {
  producto: Producto
  guardando: boolean
  error?: string
  onSubmit: (datos: StockDatos) => void
  onCerrar: () => void
}

function StockModal({ producto, guardando, error, onSubmit, onCerrar }: Props) {
  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible } as StockDatos,
    onSubmit: ({ value }) => onSubmit(value),
  })

  return (
    <Modal titulo={`Stock de ${producto.nombre}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) =>
              !Number.isInteger(value) || value < 0 ? 'El stock debe ser un entero mayor o igual a 0' : undefined,
          }}
        >
          {(field) => (
            <Input
              id="stock"
              label="Unidades en stock"
              type="number"
              min={0}
              step={1}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.valueAsNumber || 0)}
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>
        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
              />
              Disponible para la venta
            </label>
          )}
        </form.Field>
        {error && <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variante="secondary" onClick={onCerrar}>Cancelar</Button>
          <form.Subscribe selector={(state) => state.canSubmit}>
            {(canSubmit) => (
              <Button type="submit" disabled={!canSubmit || guardando}>
                {guardando ? 'Guardando...' : 'Actualizar stock'}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  )
}

export default StockModal
