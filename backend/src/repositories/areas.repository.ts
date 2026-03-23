import prisma from '../utils/prisma'

export const areasRepository = {
  async findAll() {
    return prisma.area.findMany({
      where: { activo: true },
      include: { jefe: { select: { nombres: true, apellidos: true } } },
      orderBy: { nombre: 'asc' },
    })
  },

  async findAllTiposTramite() {
    return prisma.tipoTramite.findMany({
      where: { activo: true },
      include: { areaDestino: { select: { nombre: true, sigla: true } } },
      orderBy: { nombre: 'asc' },
    })
  },
}