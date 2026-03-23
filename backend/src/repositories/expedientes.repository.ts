import prisma from '../utils/prisma'

export const expedientesRepository = {
  async findAll(filtros: {
    estado?: string
    areaId?: number
    prioridad?: string
  }) {
    return prisma.expediente.findMany({
      where: {
        ...(filtros.estado   && { estado:       filtros.estado }),
        ...(filtros.areaId   && { areaActualId: filtros.areaId }),
        ...(filtros.prioridad && { prioridad:   filtros.prioridad }),
      },
      include: {
        ciudadano:   true,
        tipoTramite: true,
        areaActual:  true,
        creadoPor:   { select: { nombres: true, apellidos: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async findById(id: number) {
    return prisma.expediente.findUnique({
      where: { id },
      include: {
        ciudadano:   true,
        tipoTramite: true,
        areaActual:  true,
        creadoPor:   { select: { nombres: true, apellidos: true } },
        movimientos: {
          include: {
            usuario:     { select: { nombres: true, apellidos: true } },
            areaOrigen:  { select: { nombre: true } },
            areaDestino: { select: { nombre: true } },
          },
          orderBy: { fechaHora: 'desc' },
        },
        documentos: true,
      },
    })
  },

  async findByCodigo(codigo: string) {
    return prisma.expediente.findUnique({
      where: { codigo },
      include: {
        ciudadano:   true,
        tipoTramite: true,
        areaActual:  true,
        movimientos: {
          include: {
            areaOrigen:  { select: { nombre: true } },
            areaDestino: { select: { nombre: true } },
          },
          orderBy: { fechaHora: 'asc' },
        },
      },
    })
  },

  async create(data: {
    ciudadanoId:   number
    tipoTramiteId: number
    areaActualId:  number
    creadoPorId:   number
    prioridad:     string
    asunto:        string
    fechaLimite:   Date
  }) {
    return prisma.expediente.create({
      data: { ...data, codigo: '' },
      include: { ciudadano: true, tipoTramite: true, areaActual: true },
    })
  },

  async updateEstado(id: number, estado: string, areaActualId?: number) {
    return prisma.expediente.update({
      where: { id },
      data: {
        estado,
        ...(areaActualId && { areaActualId }),
      },
    })
  },

  async findOrCreateCiudadano(data: {
    tipoDoc:       string
    nroDocumento:  string
    nombreCompleto:string
    correo?:       string
    celular?:      string
  }) {
    return prisma.ciudadano.upsert({
      where: {
        tipoDoc_nroDocumento: {
          tipoDoc:      data.tipoDoc,
          nroDocumento: data.nroDocumento,
        },
      },
      update: {
        nombreCompleto: data.nombreCompleto,
        correo:         data.correo,
        celular:        data.celular,
      },
      create: data,
    })
  },
}