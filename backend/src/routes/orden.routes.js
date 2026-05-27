import { Router } from 'express';
import * as ordenController from '../controllers/ordenController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', ordenController.listar);
router.post('/', requireRoles('administrador', 'asesor'), ordenController.crear);
router.get('/:id', ordenController.obtener);
router.put('/:id', requireRoles('administrador', 'asesor', 'gerencia'), ordenController.actualizar);
router.get('/:id/resumen', ordenController.resumen);
router.get('/:id/pdf', ordenController.pdf);
router.post('/:id/productos', requireRoles('administrador', 'asesor'), ordenController.addProducto);
router.delete('/:id/productos/:detalleId', requireRoles('administrador', 'asesor'), ordenController.deleteProducto);
router.post('/:id/servicios', requireRoles('administrador', 'asesor'), ordenController.addServicio);
router.post('/:id/observaciones', requireRoles('administrador', 'asesor', 'gerencia', 'recepcion'), ordenController.addObservacion);

export default router;
