import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { expedientesApi } from '../../api/expedientes.api'
import { areasApi } from '../../api/areas.api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import type { TipoTramite } from '../../types'
import { FileText, Search } from 'lucide-react'

export const MesaPartesPage = () => {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    tipoDoc: 'DNI', nroDocumento: '', nombreCompleto: '',
    correoC: '', celular: '', tipoTramiteId: '',
    prioridad: 'Normal', asunto: '',
  })

  const [codigoConsulta, setCodigoConsulta] = useState('')

  const { data: tipos } = useQuery({
    queryKey: ['tipos-tramite'],
    queryFn:  () => areasApi.listarTipos().then(r => r.data.data as TipoTramite[]),
  })

  const mutation = useMutation({
    mutationFn: () => expedientesApi.registrar({
      ...form,
      tipoTramiteId: Number(form.tipoTramiteId),
    }),
    onSuccess: (res) => {
      toast.success(`Expediente ${res.data.data.codigo} registrado`)
      queryClient.invalidateQueries({ queryKey: ['expedientes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setForm({
        tipoDoc: 'DNI', nroDocumento: '', nombreCompleto: '',
        correoC: '', celular: '', tipoTramiteId: '',
        prioridad: 'Normal', asunto: '',
      })
      navigate(`/expedientes/${res.data.data.id}`)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Error al registrar'
      toast.error(msg)
    },
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const tipoSeleccionado = tipos?.find(t => t.id === Number(form.tipoTramiteId))

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mesa de Partes</h1>
        <p className="text-gray-500 text-sm">Registro de nuevos expedientes</p>
      </div>

      <Card title="Datos del ciudadano">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Tipo documento</label>
            <select
              value={form.tipoDoc}
              onChange={e => set('tipoDoc', e.target.value)}
              className="mt-1 w-full text-sm border border-gray-300 rounded-lg px-3 py-2"
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
          <div className="col-span-2">
            <Input
              label="Nombre completo"
              value={form.nombreCompleto}
              onChange={e => set('nombreCompleto', e.target.value)}
              placeholder="Juan Pérez Torres"
            />
          </div>
          <Input
            label="Correo (opcional)"
            type="email"
            value={form.correoC}
            onChange={e => set('correoC', e.target.value)}
            placeholder="ciudadano@email.com"
          />
          <Input
            label="Celular (opcional)"
            value={form.celular}
            onChange={e => set('celular', e.target.value)}
            placeholder="987654321"
          />
        </div>
      </Card>

      <Card title="Datos del trámite">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Tipo de trámite</label>
            <select
              value={form.tipoTramiteId}
              onChange={e => set('tipoTramiteId', e.target.value)}
              className="mt-1 w-full text-sm border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Selecciona el tipo de trámite</option>
              {tipos?.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>

          {tipoSeleccionado && (
            <div className="bg-blue-50 rounded-lg p-3 text-sm flex gap-4">
              <div>
                <span className="text-gray-500">Plazo:</span>
                <span className="ml-1 font-medium text-blue-700">
                  {tipoSeleccionado.diasHabiles} días hábiles
                </span>
              </div>
              <div>
                <span className="text-gray-500">Costo:</span>
                <span className="ml-1 font-medium text-blue-700">
                  S/ {Number(tipoSeleccionado.costoSoles).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Área destino:</span>
                <span className="ml-1 font-medium text-blue-700">
                  {tipoSeleccionado.areaDestino.nombre}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Prioridad</label>
            <select
              value={form.prioridad}
              onChange={e => set('prioridad', e.target.value)}
              className="mt-1 w-full text-sm border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="Normal">Normal</option>
              <option value="Urgente">Urgente</option>
              <option value="Muy urgente">Muy urgente</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Asunto</label>
            <textarea
              value={form.asunto}
              onChange={e => set('asunto', e.target.value)}
              placeholder="Descripción detallada del trámite..."
              rows={3}
              className="mt-1 w-full text-sm border border-gray-300 rounded-lg
                px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button
            onClick={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={!form.nroDocumento || !form.nombreCompleto ||
                      !form.tipoTramiteId || !form.asunto}
            className="w-full py-2.5"
          >
            <FileText size={16} className="mr-2 inline" />
            Registrar expediente
          </Button>
        </div>
      </Card>

      {/* Consulta pública */}
      <Card title="Consulta rápida por código">
        <div className="flex gap-3">
          <input
            type="text"
            value={codigoConsulta}
            onChange={e => setCodigoConsulta(e.target.value.toUpperCase())}
            placeholder="EXP-2025-00001"
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <Button
            variant="secondary"
            onClick={() => {
              const found = codigoConsulta.trim()
              if (found) navigate(`/consulta/${found}`)
            }}
          >
            <Search size={16} />
          </Button>
        </div>
      </Card>
    </div>
  )
}