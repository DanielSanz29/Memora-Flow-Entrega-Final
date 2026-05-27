import { Router } from 'express';
import * as seguimientoController from '../controllers/seguimientoController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRoles('gerencia', 'administrador'));
router.get('/personal-pedidos', seguimientoController.personalPedidos);

export default router;
