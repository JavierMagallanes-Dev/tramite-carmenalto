import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { expedientesApi } from '../../api/expedientes.api'
import { areasApi } from '../../api/areas.api'
import { documentosApi } from '../../api/documentos.api' // ✅ import agregado
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { Card } from '../../components/ui/Card'
import { useAuthStore } from '../../store/auth.store'
import toast from 'react-hot-toast'
import { ArrowLeft, Send, RefreshCw, FileText } from 'lucide-react' // ✅ FileText agregado
import type { Area } from '../../types'

export const ExpedienteDetallePage = () => {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const usuario     = useAuthStore(s => s.usuario)

  const [showDerivar, setShowDerivar]   = useState(false)
  const [showEstado,  setShowEstado]    = useState(false)
  const [areaDestino, setAreaDestino]   = useState('')
  const [comentario,  setComentario]    = useState('')
  const [nuevoEstado, setNuevoEstado]   = useState('')

  const { data: exp, isLoading } = useQuery({
    queryKey: ['expediente', id],
    queryFn:  () => expedientesApi.obtener(Number(id)).then(r => r.data.data),
  })

  const { data: areas } = useQuery({
    queryKey: ['areas'],
    queryFn:  () => areasApi.listar().then(r => r.data.data as Area[]),
  })

  const mutDerivar = useMutation({
    mutationFn: () => expedientesApi.derivar(Number(id), {
      areaDestinoId: Number(areaDestino),
      comentario,
    }),
    onSuccess: () => {
      toast.success('Expediente derivado correctamente')
      queryClient.invalidateQueries({ queryKey: ['expediente', id] })
      setShowDerivar(false)
      setComentario('')
    },
    onError: () => toast.error('Error al derivar el expediente'),
  })

  const mutEstado = useMutation({
    mutationFn: () => expedientesApi.cambiarEstado(Number(id), {
      estado: nuevoEstado, comentario,
    }),
    onSuccess: () => {
      toast.success('Estado actualizado')
      queryClient.invalidateQueries({ queryKey: ['expediente', id] })
      setShowEstado(false)
      setComentario('')
    },
    onError: () => toast.error('Error al cambiar estado'),
  })

  if (isLoading) return (
    <div className="flex justify-center py-12"><Spinner size="lg" /></div>
  )
  if (!exp) return <p>Expediente no encontrado</p>

  const puedeDeriviar = ['Administrador','Mesa de Partes','Jefe de Area','Tecnico']
    .includes(usuario?.rol ?? '')
  const puedeCambiarEstado = ['Administrador','Jefe de Area','Tecnico']
    .includes(usuario?.rol ?? '')

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/expedientes')}
          className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-mono">{exp.codigo}</h1>
          <p className="text-gray-500 text-sm">{exp.tipoTramite.nombre}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge text={exp.estado} />
          <Badge
            text={exp.prioridad}
            variant={exp.prioridad === 'Urgente' ? 'warning' :
                     exp.prioridad === 'Muy urgente' ? 'danger' : 'default'}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card title="Datos del ciudadano">
          <div className="flex flex-col gap-2 text-sm">
            <div><span className="text-gray-500">Nombre:</span>
              <span className="ml-2 font-medium">{exp.ciudadano.nombreCompleto}</span></div>
            <div><span className="text-gray-500">Documento:</span>
              <span className="ml-2">{exp.ciudadano.tipoDoc} {exp.ciudadano.nroDocumento}</span></div>
            {exp.ciudadano.correo && (
              <div><span className="text-gray-500">Correo:</span>
                <span className="ml-2">{exp.ciudadano.correo}</span></div>
            )}
          </div>
        </Card>

        <Card title="Datos del expediente">
          <div className="flex flex-col gap-2 text-sm">
            <div><span className="text-gray-500">Área actual:</span>
              <span className="ml-2 font-medium">{exp.areaActual.nombre}</span></div>
            <div><span className="text-gray-500">Fecha límite:</span>
              <span className="ml-2">
                {new Date(exp.fechaLimite).toLocaleDateString('es-PE')}
              </span></div>
            <div><span className="text-gray-500">Registrado por:</span>
              <span className="ml-2">
                {exp.creadoPor.nombres} {exp.creadoPor.apellidos}
              </span></div>
          </div>
        </Card>
      </div>

      <Card title="Asunto">
        <p className="text-gray-700 text-sm">{exp.asunto}</p>
      </Card>

      {/* Acciones */}
      <div className="flex gap-3">
        {puedeDeriviar && (
          <Button variant="secondary" onClick={() => { setShowDerivar(!showDerivar); setShowEstado(false) }}>
            <Send size={16} className="mr-2 inline" /> Derivar
          </Button>
        )}
        {puedeCambiarEstado && (
          <Button variant="secondary" onClick={() => { setShowEstado(!showEstado); setShowDerivar(false) }}>
            <RefreshCw size={16} className="mr-2 inline" /> Cambiar estado
          </Button>
        )}
      </div>

      {showDerivar && (
        <Card title="Derivar expediente">
          <div className="flex flex-col gap-3">
            <select
              value={areaDestino}
              onChange={e => setAreaDestino(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 w-full"
            >
              <option value="">Selecciona el área destino</option>
              {areas?.map((a: Area) => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
            <textarea
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              placeholder="Comentario de derivación..."
              rows={3}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 w-full resize-none"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => mutDerivar.mutate()}
                loading={mutDerivar.isPending}
                disabled={!areaDestino || !comentario}
              >
                Confirmar derivación
              </Button>
              <Button variant="ghost" onClick={() => setShowDerivar(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {showEstado && (
        <Card title="Cambiar estado">
          <div className="flex flex-col gap-3">
            <select
              value={nuevoEstado}
              onChange={e => setNuevoEstado(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 w-full"
            >
              <option value="">Selecciona el nuevo estado</option>
              {['En proceso','Observado','Resuelto','Archivado'].map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
            <textarea
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              placeholder="Comentario..."
              rows={3}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 w-full resize-none"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => mutEstado.mutate()}
                loading={mutEstado.isPending}
                disabled={!nuevoEstado}
              >
                Confirmar cambio
              </Button>
              <Button variant="ghost" onClick={() => setShowEstado(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Historial */}
      <Card title="Historial de movimientos">
        <div className="flex flex-col gap-3">
          {exp.movimientos?.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin movimientos</p>
          ) : exp.movimientos?.map((m: {
            id: number; tipoAccion: string; comentario: string;
            fechaHora: string; usuario: { nombres: string; apellidos: string };
            areaOrigen?: { nombre: string }; areaDestino?: { nombre: string }
          }) => (
            <div key={m.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">
                    {m.tipoAccion}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(m.fechaHora).toLocaleString('es-PE')}
                  </span>
                </div>
                {m.comentario && (
                  <p className="text-sm text-gray-600 mt-0.5">{m.comentario}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  Por: {m.usuario.nombres} {m.usuario.apellidos}
                  {m.areaOrigen && ` · De: ${m.areaOrigen.nombre}`}
                  {m.areaDestino && ` → ${m.areaDestino.nombre}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ✅ Documentos adjuntos */}
      <DocumentosExpediente expedienteId={Number(id)} />
    </div>
  )
}

// ✅ Componente nuevo agregado al final del archivo
const DocumentosExpediente = ({ expedienteId }: { expedienteId: number }) => {
  const { data: docs, isLoading } = useQuery({
    queryKey: ['documentos', expedienteId],
    queryFn:  () => documentosApi.listar(expedienteId).then(r => r.data.data),
  })

  const handleDescargar = async (docId: number, nombre: string) => {
  try {
    const res = await documentosApi.descargar(docId)
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a   = document.createElement('a')
    a.href     = url
    a.download = nombre
    a.click()
    window.URL.revokeObjectURL(url)
  } catch {
    toast.error('Error al descargar el archivo')
  }
}

  if (isLoading) return null

  if (!docs || docs.length === 0) return (
    <Card title="Documentos adjuntos">
      <p className="text-gray-400 text-sm">Sin documentos adjuntos</p>
    </Card>
  )

  return (
    <Card title="Documentos adjuntos">
      <div className="flex flex-col gap-2">
        {docs.map((doc: {
          id: number
          nombreOriginal: string
          etapa: string
          createdAt: string
          subidoPor: { nombres: string; apellidos: string }
        }) => (
          <div key={doc.id}
            className="flex items-center justify-between p-3
              bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                <FileText size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {doc.nombreOriginal}
                </p>
                <p className="text-xs text-gray-400">
                  {doc.etapa} · {new Date(doc.createdAt).toLocaleDateString('es-PE')}
                  · {doc.subidoPor.nombres} {doc.subidoPor.apellidos}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => handleDescargar(doc.id, doc.nombreOriginal)}
              className="text-xs px-3 py-1.5"
            >
              Descargar
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}