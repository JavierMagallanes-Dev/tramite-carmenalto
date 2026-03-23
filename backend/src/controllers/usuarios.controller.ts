import { Request, Response } from 'express'
import { usuariosService } from '../services/usuarios.service'
import { ok, created, badRequest, notFound, serverError } from '../utils/response'

export const usuariosController = {
  async listar(req: Request, res: Response) {
    try {
      const data = await usuariosService.listar()
      return ok(res, data)
    } catch (error) {
      return serverError(res, error)
    }
  },

  async obtener(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string) 
      const data = await usuariosService.obtener(id)
      return ok(res, data)
    } catch (error) {
      if (error instanceof Error) return notFound(res, error.message)
      return serverError(res, error)
    }
  },

  async crear(req: Request, res: Response) {
    try {
      const { dni, nombres, apellidos, correo, password, areaId, rolId } = req.body
      if (!dni || !nombres || !apellidos || !correo || !password || !rolId) {
        return badRequest(res, 'Todos los campos obligatorios son requeridos')
      }
      const data = await usuariosService.crear(
        { dni, nombres, apellidos, correo, password, areaId, rolId }
      )
      return created(res, data)
    } catch (error) {
      if (error instanceof Error) return badRequest(res, error.message)
      return serverError(res, error)
    }
  },

  async actualizar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string) 
      const data = await usuariosService.actualizar(id, req.body)
      return ok(res, data, 'Usuario actualizado')
    } catch (error) {
      if (error instanceof Error) return badRequest(res, error.message)
      return serverError(res, error)
    }
  },
}