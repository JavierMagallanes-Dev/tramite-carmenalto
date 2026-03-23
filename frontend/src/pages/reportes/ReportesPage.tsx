import { useQuery } from '@tanstack/react-query'
import { reportesApi } from '../../api/reportes.api'
import { Card } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'

export const ReportesPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  () => reportesApi.dashboard().then(r => r.data.data),
  })

  const { data: porVencer } = useQuery({
    queryKey: ['por-vencer-7'],
    queryFn:  () => reportesApi.porVencer(7).then(r => r.data.data),
  })

  if (isLoading) return (
    <div className="flex justify-center py-12"><Spinner size="lg" /></div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
        <p className="text-gray-500 text-sm">Estadísticas del sistema</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card title="Expedientes por estado">
          <div className="flex flex-col gap-2">
            {data?.porEstado?.map((e: { estado: string; _count: { id: number } }) => (
              <div key={e.estado}
                className="flex items-center justify-between p-2
                  bg-gray-50 rounded-lg">
                <Badge text={e.estado} />
                <span className="font-bold text-gray-800">{e._count.id}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Resumen general">
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-600">Total expedientes</span>
              <span className="font-bold text-blue-700">{data?.total}</span>
            </div>
            <div className="flex justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-gray-600">Vencidos</span>
              <span className="font-bold text-red-700">{data?.vencidos}</span>
            </div>
            <div className="flex justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-600">Registrados hoy</span>
              <span className="font-bold text-green-700">{data?.registradosHoy}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Próximos a vencer (7 días)">
        {(porVencer as unknown[])?.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No hay expedientes por vencer en los próximos 7 días
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b">
                <th className="pb-2">Código</th>
                <th className="pb-2">Asunto</th>
                <th className="pb-2">Área</th>
                <th className="pb-2">Vence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(porVencer as {
                id: number; codigo: string; asunto: string;
                fechaLimite: string; areaActual: { nombre: string }
              }[])?.map(exp => (
                <tr key={exp.id}>
                  <td className="py-2 font-mono text-blue-700">{exp.codigo}</td>
                  <td className="py-2 text-gray-600 max-w-xs truncate">{exp.asunto}</td>
                  <td className="py-2 text-gray-600">{exp.areaActual.nombre}</td>
                  <td className="py-2 text-orange-600 font-medium">
                    {new Date(exp.fechaLimite).toLocaleDateString('es-PE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}