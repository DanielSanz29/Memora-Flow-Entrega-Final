import { query } from '../config/database.js';

const userFields = `
  u.id, u.nombre, u.email, u.password_hash, u.activo,
  r.id AS rol_id, r.nombre AS rol, r.descripcion AS rol_descripcion
`;

export async function findByEmail(email) {
  const rows = await query(
    `SELECT ${userFields}
     FROM usuario u
     INNER JOIN rol r ON r.id = u.rol_id
     WHERE u.email = ?
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

export async function findById(id) {
  const rows = await query(
    `SELECT ${userFields}
     FROM usuario u
     INNER JOIN rol r ON r.id = u.rol_id
     WHERE u.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function listUsers() {
  return query(
    `SELECT u.id, u.nombre, u.email, u.activo, u.creado_en, r.nombre AS rol
     FROM usuario u
     INNER JOIN rol r ON r.id = u.rol_id
     ORDER BY u.id ASC`
  );
}

export function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    activo: Boolean(user.activo)
  };
}
