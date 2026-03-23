import { expedientesRepository } from '../repositories/expedientes.repository'
import prisma from '../utils/prisma'

export const expedientesService = {
  async listar(filtros: { estado?: string; areaId?: number; prioridad?: string }) {
    return expedientesRepository.findAll(filtros)
  },

  async obtener(id: number) {
    const exp = await expedientesRepository.findById(id)
    if (!exp) throw new Error('Expediente no encontrado')
    return exp
  },

  async consultarPublico(codigo: string) {
    const exp = await expedientesRepository.findByCodigo(codigo)
    if (!exp) throw new Error('Expediente no encontrado')
    return {
      codigo:       exp.codigo,
      asunto:       exp.asunto,
      estado:       exp.estado,
      prioridad:    exp.prioridad,
      fechaLimite:  exp.fechaLimite,
      areaActual:   exp.areaActual.nombre,
      ciudadano:    exp.ciudadano.nombreCompleto,
      tipoTramite:  exp.tipoTramite.nombre,
      movimientos:  exp.movimientos.map(m => ({
        accion:      m.tipoAccion,
        comentario:  m.comentario,
        areaOrigen:  m.areaOrigen?.nombre,
        areaDestino: m.areaDestino?.nombre,
        fecha:       m.fechaHora,
      })),
    }
  },

  async registrar(data: {
    tipoDoc:        string
    nroDocumento:   string
    nombreCompleto: string
    correoC?:       string
    celular?:       string
    tipoTramiteId:  number
    prioridad:      string
    asunto:         string
    creadoPorId:    number
  }) {
    // 1. Buscar o crear ciudadano
    const ciudadano = await expedientesRepository.findOrCreateCiudadano({
      tipoDoc:        data.tipoDoc,
      nroDocumento:   data.nroDocumento,
      nombreCompleto: data.nombreCompleto,
      correo:         data.correoC,
      celular:        data.celular,
    })

    // 2. Obtener tipo de trámite para calcular fecha límite y área destino
    const tipoTramite = await prisma.tipoTramite.findUnique({
      where: { id: data.tipoTramiteId },
    })
    if (!tipoTramite) throw new Error('Tipo de trámite no encontrado')

    // 3. Calcular fecha límite en días hábiles (simplificado: días corridos)
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() + tipoTramite.diasHabiles)

    // 4. Crear expediente
    const expediente = await expedientesRepository.create({
      ciudadanoId:   ciudadano.id,
      tipoTramiteId: data.tipoTramiteId,
      areaActualId:  tipoTramite.areaDestinoId,
      creadoPorId:   data.creadoPorId,
      prioridad:     data.prioridad,
      asunto:        data.asunto,
      fechaLimite,
    })

    // 5. Registrar movimiento inicial
    await prisma.movimiento.create({
      data: {
        expedienteId:   expediente.id,
        usuarioId:      data.creadoPorId,
        tipoAccion:     'Registro',
        comentario:     'Expediente registrado en Mesa de Partes',
        areaDestinoId:  tipoTramite.areaDestinoId,
        estadoResultado:'Recibido',
      },
    })

    // 6. Crear notificación si el ciudadano tiene correo
    if (ciudadano.correo) {
      await prisma.notificacion.create({
        data: {
          expedienteId:      expediente.id,
          destinatarioEmail: ciudadano.correo,
          tipoEvento:        'Registro',
        },
      })
    }

    return expediente
  },

  async derivar(data: {
    expedienteId:  number
    usuarioId:     number
    areaDestinoId: number
    comentario:    string
  }) {
    const exp = await expedientesRepository.findById(data.expedienteId)
    if (!exp) throw new Error('Expediente no encontrado')

    await prisma.movimiento.create({
      data: {
        expedienteId:   data.expedienteId,
        usuarioId:      data.usuarioId,
        tipoAccion:     'Derivacion',
        comentario:     data.comentario,
        areaOrigenId:   exp.areaActualId,
        areaDestinoId:  data.areaDestinoId,
        estadoResultado:'Derivado',
      },
    })

    return expedientesRepository.updateEstado(
      data.expedienteId, 'Derivado', data.areaDestinoId
    )
  },

  async cambiarEstado(data: {
    expedienteId: number
    usuarioId:    number
    estado:       string
    comentario:   string
  }) {
    await prisma.movimiento.create({
      data: {
        expedienteId:   data.expedienteId,
        usuarioId:      data.usuarioId,
        tipoAccion:     'Cambio de estado',
        comentario:     data.comentario,
        estadoResultado: data.estado,
      },
    })

    return expedientesRepository.updateEstado(data.expedienteId, data.estado)
  },
}