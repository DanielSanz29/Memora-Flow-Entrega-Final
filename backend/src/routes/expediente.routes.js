import { Router } from 'express';
import * as expedienteController from '../controllers/expedienteController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/buscar', expedienteController.buscar);
router.post('/', requireRoles('administrador', 'recepcion', 'asesor'), expedienteController.crear);
router.get('/:id', expedienteController.obtener);
router.put('/:id', requireRoles('administrador', 'recepcion', 'asesor'), expedienteController.actualizar);

export default router;
