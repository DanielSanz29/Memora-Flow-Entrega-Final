import { Router } from 'express';
import * as catalogController from '../controllers/catalogController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/productos', catalogController.productos);
router.get('/servicios', catalogController.servicios);

export default router;
