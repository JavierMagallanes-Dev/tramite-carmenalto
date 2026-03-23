import prisma from '../utils/prisma'

export const usuariosRepository = {
  async findAll() {
    return prisma.usuario.findMany({
      include: { rol: true, area: true },
      orderBy: { id: 'asc' },
    })
  },

  async findById(id: number) {
    return prisma.usuario.findUnique({
      where: { id },
      include: { rol: true, area: true },
    })
  },

  async create(data: {
    dni: string
    nombres: string
    apellidos: string
    correo: string
    passwordHash: string
    areaId?: number
    rolId: number
  }) {
    return prisma.usuario.create({ data })
  },

  async update(id: number, data: {
    nombres?: string
    apellidos?: string
    correo?: string
    areaId?: number
    rolId?: number
    activo?: boolean
  }) {
    return prisma.usuario.update({ where: { id }, data })
  },
}