import prisma from '../utils/prisma'

export const authRepository = {
  async findByCorreo(correo: string) {
    return prisma.usuario.findUnique({
      where: { correo },
      include: {
        rol:  true,
        area: true,
      },
    })
  },

  async incrementarIntentos(id: number) {
    return prisma.usuario.update({
      where: { id },
      data: { intentosFallidos: { increment: 1 } },
    })
  },

  async bloquearUsuario(id: number) {
    const hasta = new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
    return prisma.usuario.update({
      where: { id },
      data: {
        bloqueadoHasta:   hasta,
        intentosFallidos: 0,
      },
    })
  },

  async resetearIntentos(id: number) {
    return prisma.usuario.update({
      where: { id },
      data: {
        intentosFallidos: 0,
        bloqueadoHasta:   null,
      },
    })
  },
}