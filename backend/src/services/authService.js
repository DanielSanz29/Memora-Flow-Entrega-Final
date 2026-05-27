import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import { cleanText, required } from '../utils/validators.js';
import * as userRepository from '../repositories/userRepository.js';
import { audit } from '../repositories/auditoriaRepository.js';

export async function login({ email, password }) {
  const cleanEmail = required(email, 'Email').toLowerCase();
  const cleanPassword = required(password, 'Contraseña');

  const user = await userRepository.findByEmail(cleanEmail);
  if (!user || !user.activo) {
    throw new AppError('Credenciales incorrectas', 401);
  }

  const validPassword = await bcrypt.compare(cleanPassword, user.password_hash);
  if (!validPassword) {
    throw new AppError('Credenciales incorrectas', 401);
  }

  const publicData = userRepository.publicUser(user);
  const token = jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    process.env.JWT_SECRET || 'memora_flow_secret_dev',
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  await audit({ usuarioId: user.id, entidad: 'usuario', entidadId: user.id, accion: 'login', detalle: 'Inicio de sesión correcto' });

  return { token, user: publicData };
}

export function toPublicUser(user) {
  return userRepository.publicUser(user);
}
