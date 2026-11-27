import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import { useRegistrar } from '../hooks/useRegistrar'
import type { RegistroDatos } from '../types/auth.types'

const valoresIniciales: RegistroDatos = {
  username: '',
  full_name: '',
  email: '',
  password: '',
}

function RegisterPage() {
  const navigate = useNavigate()
  const registrarMutation = useRegistrar()

  const form = useForm({
    defaultValues: valoresIniciales,
    onSubmit: ({ value }) => {
      registrarMutation.mutate(
        {
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        },
        { onSuccess: () => navigate('/login', { replace: true, state: { registrado: true } }) },
      )
    },
  })

  return (
    <div className="mx-auto max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="flex flex-col gap-4 rounded-lg bg-white p-6 shadow"
      >
        <h1 className="text-2xl font-bold text-slate-800">Crear cuenta</h1>
        <form.Field
          name="username"
          validators={{
            onChange: ({ value }) =>
              value.trim().length < 3 ? 'El usuario debe tener al menos 3 caracteres' : undefined,
          }}
        >
          {(field) => (
            <Input
              id="username"
              label="Usuario"
              autoComplete="username"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>
        <form.Field
          name="full_name"
          validators={{ onChange: ({ value }) => (!value.trim() ? 'El nombre es obligatorio' : undefined) }}
        >
          {(field) => (
            <Input
              id="full_name"
              label="Nombre completo"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>
        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) =>
              !/^\S+@\S+\.\S+$/.test(value.trim()) ? 'Ingresá un email válido' : undefined,
          }}
        >
          {(field) => (
            <Input
              id="email"
              label="Email"
              type="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>
        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => {
              if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
              if (value.length > 72) return 'La contraseña no puede superar los 72 caracteres'
              return undefined
            },
          }}
        >
          {(field) => (
            <Input
              id="password"
              label="Contraseña"
              type="password"
              autoComplete="new-password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>
        {registrarMutation.error && (
          <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {handleApiError(registrarMutation.error, 'No se pudo crear la cuenta')}
          </p>
        )}
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting || registrarMutation.isPending}>
              {registrarMutation.isPending ? 'Creando cuenta...' : 'Registrarme'}
            </Button>
          )}
        </form.Subscribe>
        <p className="text-center text-sm text-slate-600">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">Iniciá sesión</Link>
        </p>
      </form>
    </div>
  )
}

export default RegisterPage
