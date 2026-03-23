import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { expedientesApi } from '../../api/expedientes.api'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { useNavigate } from 'react-router-dom'
import type { Expediente } from '../../types'
import { Search, Filter } from 'lucide-react'

const ESTADOS = ['', 'Recibido', 'En proceso', 'Observado', 'Derivado', 'Resuelto', 'Archivado']

export const ExpedientesPage = () => {
  const navigate = useNavigate()
  const [estado, setEstado]   = useState('')
  const [busqueda, setBusqueda] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['expedientes', estado],
    queryFn:  () => expedientesApi.listar(estado ? { estado } : {})
      .then(r => r.data.data as Expediente[]),
  })

  const filtrados = data?.filter(e =>
    e.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.ciudadano.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.asunto.toLowerCase().includes(busqueda.toLowerCase())
  ) ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Expedientes</h1>
          <p className="text-gray-500 text-sm">{filtrados.length} expedientes encontrados</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por código, ciudadano o asunto..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300
              rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={estado}
            onChange={e => setEstado(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ESTADOS.map(e => (
              <option key={e} value={e}>{e || 'Todos los estados'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Código','Ciudadano','Tipo de trámite','Área actual','Estado','Prioridad','Fecha límite'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium
                    text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrados.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No se encontraron expedientes
                </td></tr>
              ) : filtrados.map(exp => (
                <tr
                  key={exp.id}
                  onClick={() => navigate(`/expedientes/${exp.id}`)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-medium text-blue-700">
                    {exp.codigo}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">
                      {exp.ciudadano.nombreCompleto}
                    </p>
                    <p className="text-xs text-gray-500">{exp.ciudadano.nroDocumento}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-48 truncate">
                    {exp.tipoTramite.nombre}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{exp.areaActual.nombre}</td>
                  <td className="px-4 py-3"><Badge text={exp.estado} /></td>
                  <td className="px-4 py-3">
                    <Badge
                      text={exp.prioridad}
                      variant={exp.prioridad === 'Urgente' ? 'warning' :
                               exp.prioridad === 'Muy urgente' ? 'danger' : 'default'}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(exp.fechaLimite).toLocaleDateString('es-PE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}