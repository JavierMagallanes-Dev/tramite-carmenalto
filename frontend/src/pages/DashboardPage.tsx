import { useQuery } from '@tanstack/react-query'
import { reportesApi } from '../api/reportes.api'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { useAuthStore } from '../store/auth.store'
import {
  FileText, Clock, CheckCircle, AlertTriangle
} from 'lucide-react'

export const DashboardPage = () => {
  const usuario = useAuthStore(s => s.usuario)

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  () => reportesApi.dashboard().then(r => r.data.data),
    refetchInterval: 60000,
  })

  const { data: porVencer } = useQuery({
    queryKey: ['por-vencer'],
    queryFn:  () => reportesApi.porVencer(3).then(r => r.data.data),
  })

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <Spinner size="lg" />
    </div>
  )

  const estadoMap: Record<string, number> = {}
  data?.porEstado?.forEach((e: { estado: string; _count: { id: number } }) => {
    estadoMap[e.estado] = e._count.id
  })

  const stats = [
    { label: 'Total expedientes', value: data?.total ?? 0,
      icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'En proceso', value: estadoMap['En proceso'] ?? 0,
      icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Resueltos', value: estadoMap['Resuelto'] ?? 0,
      icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Vencidos', value: data?.vencidos ?? 0,
      icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Bienvenido, {usuario?.nombres} · {usuario?.rol}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="flex flex-col gap-3">
            <div className={`${bg} ${color} w-10 h-10 rounded-lg
              flex items-center justify-center`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {(porVencer as unknown[])?.length > 0 && (
        <Card title="Expedientes próximos a vencer (3 días)">
          <div className="flex flex-col gap-2">
            {(porVencer as {
              id: number; codigo: string; asunto: string;
              fechaLimite: string; areaActual: { nombre: string }
            }[]).map(exp => (
              <div key={exp.id}
                className="flex items-center justify-between p-3
                  bg-orange-50 rounded-lg border border-orange-100">
                <div>
                  <span className="font-mono text-sm font-medium text-orange-700">
                    {exp.codigo}
                  </span>
                  <p className="text-sm text-gray-600 truncate max-w-md">
                    {exp.asunto}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{exp.areaActual.nombre}</p>
                  <p className="text-xs font-medium text-orange-600">
                    Vence: {new Date(exp.fechaLimite).toLocaleDateString('es-PE')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Registrados hoy">
        <p className="text-3xl font-bold text-blue-600">
          {data?.registradosHoy ?? 0}
        </p>
        <p className="text-sm text-gray-500 mt-1">expedientes nuevos hoy</p>
      </Card>
    </div>
  )
}