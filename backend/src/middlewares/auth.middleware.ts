import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JwtPayload } from '../types'
import { unauthorized } from '../utils/response'
import redis from '../utils/redis'

declare global {
  namespace Express {
    interface Request {
      usuario?: JwtPayload
    }
  }
}

export const verificarToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res)
  }

  const token = authHeader.split(' ')[1]

  try {
    // Verificar si el token fue invalidado (logout)
    const invalidado = await redis.get(`blacklist:${token}`)
    if (invalidado) return unauthorized(res)

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload

    req.usuario = payload
    next()
  } catch {
    return unauthorized(res)
  }
}