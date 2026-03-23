import { Router } from 'express'
import { expedientesController } from '../controllers/expedientes.controller'
import { verificarToken } from '../middlewares/auth.middleware'
import { soloRoles } from '../middlewares/roles.middleware'

const router = Router()

// Ruta pública — consulta ciudadano sin login
router.get('/publico/:codigo', expedientesController.consultarPublico)
// Ruta pública — ciudadano registra su solicitud
router.post('/publico/registrar', expedientesController.registrarPublico)
// Rutas protegidas
router.use(verificarToken)

router.get('/',     expedientesController.listar)
router.get('/:id',  expedientesController.obtener)

router.post('/',
  soloRoles('Administrador', 'Mesa de Partes'),
  expedientesController.registrar
)

router.put('/:id/derivar',
  soloRoles('Administrador', 'Mesa de Partes', 'Jefe de Area', 'Tecnico'),
  expedientesController.derivar
)

router.put('/:id/estado',
  soloRoles('Administrador', 'Jefe de Area', 'Tecnico'),
  expedientesController.cambiarEstado
)

export default router