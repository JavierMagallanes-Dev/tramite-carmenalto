import prisma from '../utils/prisma'

export const reportesRepository = {
  async dashboard() {
    const [
      total, porEstado, porArea, vencidos, hoy
    ] = await Promise.all([
      prisma.expediente.count(),
      prisma.expediente.groupBy({
        by: ['estado'],
        _count: { id: true },
      }),
      prisma.expediente.groupBy({
        by: ['areaActualId'],
        _count: { id: true },
        where: { estado: { notIn: ['Resuelto', 'Archivado'] } },
      }),
      prisma.expediente.count({
        where: {
          fechaLimite: { lt: new Date() },
          estado: { notIn: ['Resuelto', 'Archivado'] },
        },
      }),
      prisma.expediente.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ])

    return { total, porEstado, porArea, vencidos, registradosHoy: hoy }
  },

  async expedientesPorVencer(dias: number) {
    const limite = new Date()
    limite.setDate(limite.getDate() + dias)
    return prisma.expediente.findMany({
      where: {
        fechaLimite: { lte: limite, gte: new Date() },
        estado: { notIn: ['Resuelto', 'Archivado'] },
      },
      include: {
        ciudadano:  true,
        areaActual: true,
        tipoTramite: true,
      },
      orderBy: { fechaLimite: 'asc' },
    })
  },
}