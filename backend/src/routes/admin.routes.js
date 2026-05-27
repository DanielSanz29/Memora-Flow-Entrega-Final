import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRoles('administrador'));
router.get('/usuarios', adminController.usuarios);
router.get('/catalogos', adminController.catalogos);

export default router;
