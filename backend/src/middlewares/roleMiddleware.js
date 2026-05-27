import { AppError } from '../utils/AppError.js';

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      next(new AppError('Usuario no autenticado', 401));
      return;
    }

    if (!roles.includes(req.user.rol)) {
      next(new AppError('No tienes permisos para realizar esta acción', 403));
      return;
    }

    next();
  };
}
