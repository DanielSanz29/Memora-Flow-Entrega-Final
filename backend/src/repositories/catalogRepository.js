import { query } from '../config/database.js';

export async function getProductos() {
  return query(
    `SELECT p.id, p.nombre, p.descripcion, p.precio_base, p.activo,
            c.id AS categoria_id, c.nombre AS categoria
     FROM producto p
     INNER JOIN categoria_producto c ON c.id = p.categoria_id
     WHERE p.activo = TRUE
     ORDER BY c.nombre, p.nombre`
  );
}

export async function getProductoById(id) {
  const rows = await query(
    `SELECT p.id, p.nombre, p.descripcion, p.precio_base, p.activo,
            c.nombre AS categoria
     FROM producto p
     INNER JOIN categoria_producto c ON c.id = p.categoria_id
     WHERE p.id = ? AND p.activo = TRUE
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function getServicios() {
  return query(
    `SELECT id, nombre, descripcion, precio_base, activo
     FROM servicio_complementario
     WHERE activo = TRUE
     ORDER BY nombre`
  );
}

export async function getServicioById(id) {
  const rows = await query(
    `SELECT id, nombre, descripcion, precio_base, activo
     FROM servicio_complementario
     WHERE id = ? AND activo = TRUE
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function getEstados() {
  return query('SELECT id, nombre, descripcion, orden_logico FROM estado_orden ORDER BY orden_logico ASC');
}

export async function getEstadoByNombre(nombre) {
  const rows = await query('SELECT id, nombre FROM estado_orden WHERE nombre = ? LIMIT 1', [nombre]);
  return rows[0] || null;
}

export async function getRoles() {
  return query('SELECT id, nombre, descripcion FROM rol ORDER BY id ASC');
}

export async function getCategorias() {
  return query('SELECT id, nombre, descripcion FROM categoria_producto ORDER BY nombre ASC');
}
