import { Router } from 'express'
import { areasController } from '../controllers/areas.controller'
import { verificarToken } from '../middlewares/auth.middleware'

const router = Router()
// Pública — para el formulario ciudadano
router.get('/publico/tipos-tramite', areasController.listarTipos)
router.use(verificarToken)

router.get('/',               areasController.listar)
router.get('/tipos-tramite',  areasController.listarTipos)

export default router