import { Router } from 'express'
import { reportesController } from '../controllers/reportes.controller'
import { verificarToken } from '../middlewares/auth.middleware'

const router = Router()

router.use(verificarToken)

router.get('/dashboard',   reportesController.dashboard)
router.get('/por-vencer',  reportesController.porVencer)

export default router