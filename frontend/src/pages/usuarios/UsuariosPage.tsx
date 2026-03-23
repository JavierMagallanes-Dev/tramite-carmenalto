import { useQuery } from '@tanstack/react-query'
import client from '../../api/client'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'

export const UsuariosPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn:  () => client.get('/usuarios').then(r => r.data.data),
  })

  if (isLoading) return (
    <div className="flex justify-center py-12"><Spinner size="lg" /></div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
        <p className="text-gray-500 text-sm">{data?.length} usuarios registrados</p>
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
              {['DNI','Nombre','Correo','Área','Rol','Estado'].map(h => (
                <th key={h} className="pb-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.map((u: {
              id: number; dni: string; nombres: string; apellidos: string;
              correo: string; area: string | null; rol: string; activo: boolean
            }) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="py-3 font-mono text-gray-600">{u.dni}</td>
                <td className="py-3 font-medium text-gray-800">
                  {u.nombres} {u.apellidos}
                </td>
                <td className="py-3 text-gray-600">{u.correo}</td>
                <td className="py-3 text-gray-600">{u.area ?? '—'}</td>
                <td className="py-3">
                  <Badge
                    text={u.rol}
                    variant={u.rol === 'Administrador' ? 'info' : 'default'}
                  />
                </td>
                <td className="py-3">
                  <Badge
                    text={u.activo ? 'Activo' : 'Inactivo'}
                    variant={u.activo ? 'success' : 'danger'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}