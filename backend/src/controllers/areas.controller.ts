import { Request, Response } from 'express'
import { areasRepository } from '../repositories/areas.repository'
import { ok, serverError } from '../utils/response'

export const areasController = {
  async listar(req: Request, res: Response) {
    try {
      const data = await areasRepository.findAll()
      return ok(res, data)
    } catch (error) {
      return serverError(res, error)
    }
  },

  async listarTipos(req: Request, res: Response) {
    try {
      const data = await areasRepository.findAllTiposTramite()
      return ok(res, data)
    } catch (error) {
      return serverError(res, error)
    }
  },
}