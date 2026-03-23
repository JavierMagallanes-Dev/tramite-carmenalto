import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { expedientesApi } from '../../api/expedientes.api'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Building2, Search, FileText, Send, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import type { TipoTramite } from '../../types'

type Vista = 'inicio' | 'registrar' | 'consultar' | 'exito'

export const ConsultaPublicaPage = () => {
  const [vista, setVista] = useState<Vista>('inicio')
  const [codigoGenerado, setCodigoGenerado] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <Building2 size={22} />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">
              Municipalidad Distrital de Carmen Alto
            </p>
            <p className="text-xs text-gray-500">Portal de Trámite Documentario</p>
          </div>
          <div className="ml-auto">
            <a href="/login"
              className="text-xs text-blue-600 hover:underline">
              Acceso empleados →
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {vista === 'inicio' && (
          <Inicio
            onRegistrar={() => setVista('registrar')}
            onConsultar={() => setVista('consultar')}
          />
        )}
        {vista === 'registrar' && (
          <FormularioRegistro
            onVolver={() => setVista('inicio')}
            onExito={(codigo) => { setCodigoGenerado(codigo); setVista('exito') }}
          />
        )}
        {vista === 'consultar' && (
          <ConsultaEstado onVolver={() => setVista('inicio')} />
        )}
        {vista === 'exito' && (
          <Exito
            codigo={codigoGenerado}
            onNuevo={() => setVista('registrar')}
            onConsultar={() => setVista('consultar')}
          />
        )}
      </div>
    </div>
  )
}

// ─── Pantalla de inicio ───────────────────────────────────────────────────────
const Inicio = ({
  onRegistrar, onConsultar,
}: { onRegistrar: () => void; onConsultar: () => void }) => (
  <div className="flex flex-col items-center gap-6 text-center">
    <div>
      <h1 className="text-3xl font-bold text-gray-800">¿En qué podemos ayudarte?</h1>
      <p className="text-gray-500 mt-2">
        Realiza tu trámite o consulta el estado de tu expediente
      </p>
    </div>
    <div className="grid grid-cols-2 gap-4 w-full mt-4">
      <button
        onClick={onRegistrar}
        className="bg-white rounded-2xl border-2 border-blue-200 hover:border-blue-500
          p-8 flex flex-col items-center gap-3 transition-all hover:shadow-md group"
      >
        <div className="bg-blue-100 group-hover:bg-blue-600 text-blue-600
          group-hover:text-white p-4 rounded-xl transition-colors">
          <Send size={28} />
        </div>
        <div>
          <p className="font-bold text-gray-800">Registrar solicitud</p>
          <p className="text-xs text-gray-500 mt-1">
            Presenta tu trámite en línea
          </p>
        </div>
      </button>
      <button
        onClick={onConsultar}
        className="bg-white rounded-2xl border-2 border-green-200 hover:border-green-500
          p-8 flex flex-col items-center gap-3 transition-all hover:shadow-md group"
      >
        <div className="bg-green-100 group-hover:bg-green-600 text-green-600
          group-hover:text-white p-4 rounded-xl transition-colors">
          <Search size={28} />
        </div>
        <div>
          <p className="font-bold text-gray-800">Consultar estado</p>
          <p className="text-xs text-gray-500 mt-1">
            Sigue el avance de tu expediente
          </p>
        </div>
      </button>
    </div>
  </div>
)

// ─── Formulario de registro ───────────────────────────────────────────────────
const FormularioRegistro = ({
  onVolver, onExito,
}: { onVolver: () => void; onExito: (codigo: string) => void }) => {
  const [form, setForm] = useState({
    tipoDoc: 'DNI', nroDocumento: '', nombreCompleto: '',
    correoC: '', celular: '', tipoTramiteId: '', asunto: '',
  })
  const [archivo, setArchivo] = useState<File | null>(null)
  const [paso, setPaso]       = useState(1)

  const { data: tipos } = useQuery({
    queryKey: ['tipos-publico'],
    queryFn:  () => axios.get('/api/areas/publico/tipos-tramite')
      .then(r => r.data.data as TipoTramite[]),
  })

 const mutation = useMutation({
  mutationFn: async () => {
    // 1. Registrar expediente
    const res = await axios.post('/api/expedientes/publico/registrar', {
      ...form,
      tipoTramiteId: Number(form.tipoTramiteId),
    })
    const expediente = res.data.data

    // 2. Si hay archivo adjunto, subirlo
    if (archivo) {
      const formData = new FormData()
      formData.append('archivo', archivo)
      await axios.post(
        `/api/documentos/publico/subir/${expediente.id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
    }

    return expediente
  },
  onSuccess: (data) => {
    onExito(data.codigo)
  },
  onError: (err: unknown) => {
    const msg = (err as { response?: { data?: { message?: string } } })
      ?.response?.data?.message ?? 'Error al registrar'
    toast.error(msg)
  },
})

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const tipoSeleccionado = tipos?.find(t => t.id === Number(form.tipoTramiteId))

  const paso1Completo = form.tipoDoc && form.nroDocumento &&
                        form.nombreCompleto && form.correoC

  const paso2Completo = form.tipoTramiteId && form.asunto

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onVolver} className="text-gray-400 hover:text-gray-600 text-sm">
          ← Volver
        </button>
        <h2 className="text-xl font-bold text-gray-800">Registrar solicitud</h2>
      </div>

      {/* Pasos */}
      <div className="flex items-center gap-2 mb-2">
        {[1, 2, 3].map(n => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center
              text-sm font-bold transition-colors
              ${paso >= n
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-500'}`}>
              {n}
            </div>
            {n < 3 && <div className={`h-0.5 w-12 ${paso > n ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
        <span className="text-xs text-gray-500 ml-2">
          {paso === 1 ? 'Tus datos' : paso === 2 ? 'Tu trámite' : 'Adjunto'}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

        {/* PASO 1 — Datos personales */}
        {paso === 1 && (
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-gray-800">Tus datos personales</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tipo documento
                </label>
                <select
                  value={form.tipoDoc}
                  onChange={e => set('tipoDoc', e.target.value)}
                  className="mt-1 w-full text-sm border border-gray-300
                    rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                  <option value="CE">Carné de extranjería</option>
                </select>
              </div>
              <Input
                label="Nro. documento"
                value={form.nroDocumento}
                onChange={e => set('nroDocumento', e.target.value)}
                placeholder="12345678"
              />
            </div>
            <Input
              label="Nombre completo"
              value={form.nombreCompleto}
              onChange={e => set('nombreCompleto', e.target.value)}
              placeholder="Juan Pérez Torres"
            />
            <Input
              label="Correo electrónico"
              type="email"
              value={form.correoC}
              onChange={e => set('correoC', e.target.value)}
              placeholder="tucorreo@gmail.com"
            />
            <Input
              label="Celular (opcional)"
              value={form.celular}
              onChange={e => set('celular', e.target.value)}
              placeholder="987654321"
            />
            <Button
              onClick={() => setPaso(2)}
              disabled={!paso1Completo}
              className="w-full py-2.5 mt-2"
            >
              Continuar →
            </Button>
          </div>
        )}

        {/* PASO 2 — Datos del trámite */}
        {paso === 2 && (
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-gray-800">Datos de tu trámite</h3>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Tipo de trámite
              </label>
              <select
                value={form.tipoTramiteId}
                onChange={e => set('tipoTramiteId', e.target.value)}
                className="mt-1 w-full text-sm border border-gray-300
                  rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona el tipo de trámite</option>
                {tipos?.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nombre} — S/ {Number(t.costoSoles).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {tipoSeleccionado && (
              <div className="bg-blue-50 rounded-xl p-4 text-sm flex flex-col gap-1">
                <p className="font-medium text-blue-800">
                  {tipoSeleccionado.nombre}
                </p>
                <p className="text-blue-600">
                  Plazo: {tipoSeleccionado.diasHabiles} días hábiles ·
                  Costo: S/ {Number(tipoSeleccionado.costoSoles).toFixed(2)}
                </p>
                <p className="text-blue-600 text-xs">
                  Área: {tipoSeleccionado.areaDestino.nombre}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">
                Descripción de tu solicitud
              </label>
              <textarea
                value={form.asunto}
                onChange={e => set('asunto', e.target.value)}
                placeholder="Describe detalladamente lo que necesitas tramitar..."
                rows={4}
                className="mt-1 w-full text-sm border border-gray-300 rounded-lg
                  px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setPaso(1)} className="flex-1">
                ← Atrás
              </Button>
              <Button
                onClick={() => setPaso(3)}
                disabled={!paso2Completo}
                className="flex-1 py-2.5"
              >
                Continuar →
              </Button>
            </div>
          </div>
        )}

        {/* PASO 3 — Adjunto y envío */}
        {paso === 3 && (
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-gray-800">Adjunta tu documento</h3>

            <div
              onClick={() => document.getElementById('file-input')?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center
                cursor-pointer transition-colors
                ${archivo
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={e => setArchivo(e.target.files?.[0] ?? null)}
              />
              {archivo ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle size={32} className="text-green-500" />
                  <p className="font-medium text-green-700">{archivo.name}</p>
                  <p className="text-xs text-green-600">
                    {(archivo.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-xs text-gray-400">Clic para cambiar</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <FileText size={32} className="text-gray-400" />
                  <p className="font-medium text-gray-600">
                    Arrastra tu archivo aquí o haz clic
                  </p>
                  <p className="text-xs text-gray-400">PDF, JPG o PNG · máx. 10MB</p>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200
              rounded-lg p-3">
              El archivo adjunto es opcional. Puedes presentar documentación
              física en Mesa de Partes con tu número de expediente.
            </p>

            {/* Resumen */}
            <div className="bg-gray-50 rounded-xl p-4 text-sm flex flex-col gap-2">
              <p className="font-medium text-gray-700">Resumen de tu solicitud</p>
              <p><span className="text-gray-500">Ciudadano:</span>
                <span className="ml-2">{form.nombreCompleto}</span></p>
              <p><span className="text-gray-500">Trámite:</span>
                <span className="ml-2">{tipoSeleccionado?.nombre}</span></p>
              <p><span className="text-gray-500">Correo de notificación:</span>
                <span className="ml-2">{form.correoC}</span></p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setPaso(2)} className="flex-1">
                ← Atrás
              </Button>
              <Button
                onClick={() => mutation.mutate()}
                loading={mutation.isPending}
                className="flex-1 py-2.5"
              >
                <Send size={16} className="mr-2 inline" />
                Enviar solicitud
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Pantalla de éxito ────────────────────────────────────────────────────────
const Exito = ({
  codigo, onNuevo, onConsultar,
}: { codigo: string; onNuevo: () => void; onConsultar: () => void }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8
    flex flex-col items-center gap-5 text-center">
    <div className="bg-green-100 text-green-600 p-5 rounded-full">
      <CheckCircle size={40} />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-gray-800">¡Solicitud enviada!</h2>
      <p className="text-gray-500 mt-1">
        Tu expediente ha sido registrado exitosamente
      </p>
    </div>
    <div className="bg-blue-50 border border-blue-200 rounded-xl px-8 py-4">
      <p className="text-xs text-blue-600 mb-1">Tu número de expediente</p>
      <p className="text-3xl font-bold font-mono text-blue-700">{codigo}</p>
      <p className="text-xs text-blue-500 mt-1">
        Guarda este código para consultar el estado de tu trámite
      </p>
    </div>
    <p className="text-sm text-gray-500 max-w-sm">
      Recibirás notificaciones al correo que registraste. También puedes
      consultar el estado en cualquier momento con tu número de expediente.
    </p>
    <div className="flex gap-3 w-full">
      <Button variant="secondary" onClick={onNuevo} className="flex-1">
        Nueva solicitud
      </Button>
      <Button onClick={onConsultar} className="flex-1">
        Consultar estado
      </Button>
    </div>
  </div>
)

// ─── Consulta de estado ───────────────────────────────────────────────────────
const ConsultaEstado = ({ onVolver }: { onVolver: () => void }) => {
  const [codigo,    setCodigo]    = useState('')
  const [loading,   setLoading]   = useState(false)
  const [resultado, setResultado] = useState<Record<string, unknown> | null>(null)

  const consultar = async () => {
    if (!codigo.trim()) return
    setLoading(true)
    try {
      const res = await expedientesApi.consultarPublico(codigo.trim().toUpperCase())
      setResultado(res.data.data as Record<string, unknown>)
    } catch {
      toast.error('No se encontró el expediente')
      setResultado(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button onClick={onVolver} className="text-gray-400 hover:text-gray-600 text-sm">
          ← Volver
        </button>
        <h2 className="text-xl font-bold text-gray-800">Consultar estado</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <label className="text-sm font-medium text-gray-700">
          Ingresa tu número de expediente
        </label>
        <div className="flex gap-3 mt-2">
          <input
            type="text"
            value={codigo}
            onChange={e => setCodigo(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && consultar()}
            placeholder="EXP-2025-00001"
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2.5
              focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <Button onClick={consultar} loading={loading} className="px-6">
            <Search size={16} />
          </Button>
        </div>

        {resultado && (
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xl font-bold text-blue-700">
                {resultado.codigo as string}
              </span>
              <Badge text={resultado.estado as string} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Tipo de trámite</p>
                <p className="font-medium">{resultado.tipoTramite as string}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Área actual</p>
                <p className="font-medium">{resultado.areaActual as string}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Fecha límite</p>
                <p className="font-medium">
                  {new Date(resultado.fechaLimite as string)
                    .toLocaleDateString('es-PE')}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Prioridad</p>
                <Badge text={resultado.prioridad as string} />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="text-gray-400 text-xs mb-1">Asunto</p>
              <p className="text-gray-700">{resultado.asunto as string}</p>
            </div>

            {(resultado.movimientos as unknown[])?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Historial del trámite
                </p>
                <div className="flex flex-col gap-2">
                  {(resultado.movimientos as {
                    accion: string; fecha: string; comentario?: string
                  }[]).map((m, i) => (
                    <div key={i}
                      className="flex items-start justify-between text-xs
                        bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                      <div>
                        <p className="font-medium text-gray-700">{m.accion}</p>
                        {m.comentario && (
                          <p className="text-gray-500 mt-0.5">{m.comentario}</p>
                        )}
                      </div>
                      <span className="text-gray-400 shrink-0 ml-4">
                        {new Date(m.fecha).toLocaleDateString('es-PE')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
