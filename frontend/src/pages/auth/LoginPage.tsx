import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authApi } from '../../api/auth.api'
import { useAuthStore } from '../../store/auth.store'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface FormData {
  correo:   string
  password: string
}

export const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()
  const [loading, setLoading] = useState(false)
  const setAuth   = useAuthStore(s => s.setAuth)
  const navigate  = useNavigate()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authApi.login(data.correo, data.password)
      const { token, usuario } = res.data.data
      setAuth(token, usuario)
      toast.success(`Bienvenido, ${usuario.nombres}`)
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Error al iniciar sesión'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100
      flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 text-white p-3 rounded-xl mb-4">
            <Building2 size={28} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">
            Municipalidad Distrital de Carmen Alto
          </h1>
          <p className="text-sm text-gray-500 mt-1">Sistema de Trámite Documentario</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="usuario@carmenalto.gob.pe"
            error={errors.correo?.message}
            {...register('correo', { required: 'El correo es requerido' })}
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', { required: 'La contraseña es requerida' })}
          />
          <Button type="submit" loading={loading} className="mt-2 w-full py-2.5">
            Ingresar al sistema
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            ¿Ciudadano? Consulta tu trámite en{' '}
            <a href="/consulta" className="text-blue-600 hover:underline">
              el portal público
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}