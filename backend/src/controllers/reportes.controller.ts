import { Request, Response } from 'express'
import { reportesRepository } from '../repositories/reportes.repository'
import { ok, serverError } from '../utils/response'

export const reportesController = {
  async dashboard(req: Request, res: Response) {
    try {
      const data = await reportesRepository.dashboard()
      return ok(res, data)
    } catch (error) {
      return serverError(res, error)
    }
  },

  async porVencer(req: Request, res: Response) {
    try {
      const dias = parseInt(req.query.dias as string) || 3
      const data = await reportesRepository.expedientesPorVencer(dias)
      return ok(res, data)
    } catch (error) {
      return serverError(res, error)
    }
  },
}