import prisma from '../utils/prisma'

export const documentosRepository = {
  async create(data: {
    expedienteId:   number
    subidoPorId:    number
    nombreOriginal: string
    nombreUuid:     string
    rutaStorage:    string
    etapa:          string
  }) {
    return prisma.documento.create({ data })
  },

  async findByExpediente(expedienteId: number) {
    return prisma.documento.findMany({
      where: { expedienteId },
      include: {
        subidoPor: { select: { nombres: true, apellidos: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async findById(id: number) {
    return prisma.documento.findUnique({ where: { id } })
  },
}