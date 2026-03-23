import { Router } from 'express'
import { usuariosController } from '../controllers/usuarios.controller'
import { verificarToken } from '../middlewares/auth.middleware'
import { soloRoles } from '../middlewares/roles.middleware'

const router = Router()

router.use(verificarToken)

router.get('/',     soloRoles('Administrador'), usuariosController.listar)
router.get('/:id',  soloRoles('Administrador'), usuariosController.obtener)
router.post('/',    soloRoles('Administrador'), usuariosController.crear)
router.put('/:id',  soloRoles('Administrador'), usuariosController.actualizar)

export default router