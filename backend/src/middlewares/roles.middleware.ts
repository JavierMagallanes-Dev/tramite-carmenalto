import { Request, Response, NextFunction } from 'express'
import { forbidden } from '../utils/response'

export const soloRoles = (...rolesPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) return forbidden(res)

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return forbidden(res)
    }

    next()
  }
}