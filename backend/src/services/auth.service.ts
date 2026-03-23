import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { authRepository } from '../repositories/auth.repository'
import { JwtPayload } from '../types'
import redis from '../utils/redis'
const MAX_INTENTOS = 5

export const authService = {
  async login(correo: string, password: string) {
    // 1. Buscar usuario
    const usuario = await authRepository.findByCorreo(correo)
    if (!usuario || !usuario.activo) {
      throw new Error('Credenciales inválidas')
    }
    
    // 2. Verificar si está bloqueado
    if (usuario.bloqueadoHasta && usuario.bloqueadoHasta > new Date()) {
      const minutos = Math.ceil(
        (usuario.bloqueadoHasta.getTime() - Date.now()) / 60000
      )
      throw new Error(
        `Cuenta bloqueada. Intente en ${minutos} minutos`
      )
    }

    // 3. Verificar contraseña
    const passwordOk = await bcrypt.compare(password, usuario.passwordHash)
    if (!passwordOk) {
      await authRepository.incrementarIntentos(usuario.id)

      const intentosRestantes = MAX_INTENTOS - (usuario.intentosFallidos + 1)

      if (intentosRestantes <= 0) {
        await authRepository.bloquearUsuario(usuario.id)
        throw new Error('Demasiados intentos fallidos. Cuenta bloqueada 30 minutos')
      }

      throw new Error(`Credenciales inválidas. Intentos restantes: ${intentosRestantes}`)
    }

    // 4. Reset intentos y generar token
    await authRepository.resetearIntentos(usuario.id)

    const payload: JwtPayload = {
      id:     usuario.id,
      correo: usuario.correo,
      rol:    usuario.rol.nombre,
      areaId: usuario.areaId,
    }

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' } as jwt.SignOptions
    )

    return {
      token,
      usuario: {
        id:       usuario.id,
        nombres:  usuario.nombres,
        apellidos:usuario.apellidos,
        correo:   usuario.correo,
        rol:      usuario.rol.nombre,
        area:     usuario.area?.nombre ?? null,
        areaId:   usuario.areaId,
      },
    }
  },
async logout(token: string) {
    // Guardar token en blacklist con TTL de 8 horas
    await redis.set(`blacklist:${token}`, '1', 'EX', 60 * 60 * 8)
  },
  async cambiarPassword(
    usuarioId: number,
    passwordActual: string,
    passwordNueva: string
  ) {
    const usuario = await prisma_findById(usuarioId)
    if (!usuario) throw new Error('Usuario no encontrado')

    const ok = await bcrypt.compare(passwordActual, usuario.passwordHash)
    if (!ok) throw new Error('Contraseña actual incorrecta')

    const hash = await bcrypt.hash(passwordNueva, 12)
    return prisma_updatePassword(usuarioId, hash)
  },
}

// helpers locales (evitan importar prisma directamente en el service)
import prisma from '../utils/prisma'

const prisma_findById = (id: number) =>
  prisma.usuario.findUnique({ where: { id } })

const prisma_updatePassword = (id: number, hash: string) =>
  prisma.usuario.update({
    where: { id },
    data:  { passwordHash: hash },
  })
 