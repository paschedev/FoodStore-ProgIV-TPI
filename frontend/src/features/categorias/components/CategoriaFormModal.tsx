import { useForm } from '@tanstack/react-form'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import Modal from '@/shared/ui/Modal'
import type { Categoria, CategoriaDatos } from '../types/categoria'

type Props = {
  categoria: Categoria | null
  guardando: boolean
  error?: string
  onSubmit: (datos: CategoriaDatos) => void
  onCerrar: () => void
}

function CategoriaFormModal({ categoria, guardando, error, onSubmit, onCerrar }: Props) {
  const valoresIniciales: CategoriaDatos = {
    nombre: categoria?.nombre ?? '',
    descripcion: categoria?.descripcion ?? '',
  }

  const form = useForm({
    defaultValues: valoresIniciales,
    onSubmit: ({ value }) => onSubmit({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() }),
  })

  return (
    <Modal titulo={categoria ? 'Editar categoría' : 'Nueva categoría'}>
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
              if (largo < 2) return 'El nombre debe tener al menos 2 caracteres'
              if (largo > 100) return 'El nombre no puede superar los 100 caracteres'
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

export default CategoriaFormModal
