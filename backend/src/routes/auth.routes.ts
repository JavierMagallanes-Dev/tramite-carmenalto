import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { verificarToken } from '../middlewares/auth.middleware'

const router = Router()

// POST /api/auth/login
router.post('/login', authController.login)

// GET /api/auth/me  (requiere token)
router.get('/me', verificarToken, authController.me)

// PUT /api/auth/cambiar-password  (requiere token)
router.put('/cambiar-password', verificarToken, authController.cambiarPassword)

// POST /api/auth/logout  (requiere token)
router.post('/logout', verificarToken, authController.logout)
export default router