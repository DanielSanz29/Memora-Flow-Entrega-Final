import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import * as userRepository from '../repositories/userRepository.js';

export async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      throw new AppError('Token no proporcionado', 401);
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'memora_flow_secret_dev');
    const user = await userRepository.findById(payload.id);

    if (!user || !user.activo) {
      throw new AppError('Usuario no autorizado', 401);
    }

    req.user = userRepository.publicUser(user);
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new AppError('Token no válido o caducado', 401));
      return;
    }
    next(error);
  }
}
