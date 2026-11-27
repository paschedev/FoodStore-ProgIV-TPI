import { useForm } from '@tanstack/react-form'
import type { Categoria } from '@/features/categorias'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import Modal from '@/shared/ui/Modal'
import type { Producto, ProductoDatos } from '../types/producto'

type Props = {
  producto: Producto | null
  categorias: Categoria[]
  guardando: boolean
  error?: string
  onSubmit: (datos: ProductoDatos) => void
  onCerrar: () => void
}

function ProductoFormModal({ producto, categorias, guardando, error, onSubmit, onCerrar }: Props) {
  const valoresIniciales: ProductoDatos = {
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    precio_base: producto?.precio_base ?? 0,
    imagen_url: producto?.imagen_url ?? '',
    stock: producto?.stock ?? 0,
    disponible: producto?.disponible ?? true,
    categoria_id: producto?.categoria_id ?? categorias[0]?.id ?? 0,
  }

  const form = useForm({
    defaultValues: valoresIniciales,
    onSubmit: ({ value }) =>
      onSubmit({
        ...value,
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
        imagen_url: value.imagen_url.trim(),
      }),
  })

  return (
    <Modal titulo={producto ? 'Editar producto' : 'Nuevo producto'}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) => {
              const largo = value.trim().length
              if (largo === 0) return 'El nombre es obligatorio'
              if (largo > 150) return 'El nombre no puede superar los 150 caracteres'
              return undefined
            },
          }}
        >
          {(field) => (
            <Input
              id="nombre"
              label="Nombre"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>
        <form.Field name="descripcion">
          {(field) => (
            <Input
              id="descripcion"
              label="Descripción"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>
        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) => (value < 0 ? 'El precio no puede ser negativo' : undefined),
            }}
          >
            {(field) => (
              <Input
                id="precio_base"
                label="Precio"
                type="number"
                min={0}
                step="0.01"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.valueAsNumber || 0)}
                errores={field.state.meta.errors}
              />
            )}
          </form.Field>
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
                label="Stock"
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
        </div>
        <form.Field
          name="categoria_id"
          validators={{
            onChange: ({ value }) => (value ? undefined : 'Elegí una categoría'),
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-1">
              <label htmlFor="categoria_id" className="text-sm text-slate-600">Categoría</label>
              <select
                id="categoria_id"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                className="rounded border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none"
              >
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                ))}
              </select>
              {field.state.meta.errors.filter(Boolean).map((mensaje) => (
                <p key={mensaje} className="text-xs text-red-600">{mensaje}</p>
              ))}
            </div>
          )}
        </form.Field>
        <form.Field name="imagen_url">
          {(field) => (
            <Input
              id="imagen_url"
              label="URL de la imagen"
              placeholder="https://..."
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
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
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting || guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  )
}

export default ProductoFormModal
