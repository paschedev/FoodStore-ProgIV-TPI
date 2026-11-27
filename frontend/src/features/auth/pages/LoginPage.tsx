import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import { useAuthStore } from '@/store/authStore'

type LoginFormValues = {
  username: string
  password: string
}

const valoresIniciales: LoginFormValues = {
  username: '',
  password: '',
}

type EstadoNavegacion = { from?: string; registrado?: boolean } | null

function LoginPage() {
  const usuario = useAuthStore((state) => state.usuario)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const location = useLocation()
  const estado = location.state as EstadoNavegacion
  const [error, setError] = useState('')

  const form = useForm({
    defaultValues: valoresIniciales,
    onSubmit: async ({ value }) => {
      setError('')
      try {
        await login(value.username.trim(), value.password)
        navigate(estado?.from ?? '/', { replace: true })
      } catch (err) {
        setError(handleApiError(err, 'No se pudo iniciar sesión'))
      }
    },
  })

  if (usuario) return <Navigate to={estado?.from ?? '/'} replace />

  return (
    <div className="mx-auto max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="flex flex-col gap-4 rounded-lg bg-white p-6 shadow"
      >
        <h1 className="text-2xl font-bold text-slate-800">Iniciar sesión</h1>
        {estado?.registrado && (
          <p className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            Cuenta creada. Ya podés iniciar sesión.
          </p>
        )}
        <form.Field
          name="username"
          validators={{ onChange: ({ value }) => (!value.trim() ? 'El usuario es obligatorio' : undefined) }}
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
          name="password"
          validators={{ onChange: ({ value }) => (!value ? 'La contraseña es obligatoria' : undefined) }}
        >
          {(field) => (
            <Input
              id="password"
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>
        {error && (
          <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </Button>
          )}
        </form.Subscribe>
        <p className="text-center text-sm text-slate-600">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:underline">Registrate</Link>
        </p>
      </form>
    </div>
  )
}

export default LoginPage
