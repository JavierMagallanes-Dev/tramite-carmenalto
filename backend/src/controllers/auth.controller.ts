import { Request, Response } from 'express'
import { authService } from '../services/auth.service'
import { ok, badRequest, serverError } from '../utils/response'

export const authController = {
  async login(req: Request, res: Response) {
    try {
      const { correo, password } = req.body

      if (!correo || !password) {
        return badRequest(res, 'Correo y contraseña son requeridos')
      }

      const resultado = await authService.login(correo, password)
      return ok(res, resultado, 'Login exitoso')
    } catch (error) {
      if (error instanceof Error) {
        return badRequest(res, error.message)
      }
      return serverError(res, error)
    }
  },

  async me(req: Request, res: Response) {
    try {
      return ok(res, req.usuario)
    } catch (error) {
      return serverError(res, error)
    }
  },

  async cambiarPassword(req: Request, res: Response) {
    try {
      const { passwordActual, passwordNueva } = req.body
      const usuarioId = req.usuario!.id

      if (!passwordActual || !passwordNueva) {
        return badRequest(res, 'Ambas contraseñas son requeridas')
      }

      if (passwordNueva.length < 8) {
        return badRequest(res, 'La nueva contraseña debe tener al menos 8 caracteres')
      }

      await authService.cambiarPassword(usuarioId, passwordActual, passwordNueva)
      return ok(res, null, 'Contraseña actualizada correctamente')
    } catch (error) {
      if (error instanceof Error) {
        return badRequest(res, error.message)
      }
      return serverError(res, error)
    }
  },
  async logout(req: Request, res: Response) {
    try {
      const token = req.headers.authorization!.split(' ')[1]
      await authService.logout(token)
      return ok(res, null, 'Sesión cerrada correctamente')
    } catch (error) {
      return serverError(res, error)
    }
  },
}