import { query } from '../config/database.js';

export async function listPersonalOperativo() {
  return query(
    `SELECT u.id, u.nombre, u.email, r.nombre AS rol
     FROM usuario u
     INNER JOIN rol r ON r.id = u.rol_id
     WHERE u.activo = TRUE AND r.nombre IN ('asesor', 'recepcion')
     ORDER BY CASE WHEN r.nombre = 'asesor' THEN 1 ELSE 2 END, u.nombre ASC`
  );
}

export async function listOrdenesAsignadasAAsesores() {
  return query(
    `SELECT u.id AS usuario_id, o.id, o.total_estimado, o.fecha_creacion,
            eo.nombre AS estado, e.codigo AS expediente_codigo
     FROM auditoria a
     INNER JOIN usuario u ON u.id = a.usuario_id
     INNER JOIN rol r ON r.id = u.rol_id AND r.nombre = 'asesor'
     INNER JOIN orden_funeraria o ON o.id = a.entidad_id
     INNER JOIN estado_orden eo ON eo.id = o.estado_id
     INNER JOIN expediente e ON e.id = o.expediente_id
     WHERE a.entidad = 'orden_funeraria' AND a.accion = 'crear_orden'
     ORDER BY o.fecha_creacion DESC, o.id DESC`
  );
}

export async function listOrdenesDerivadasDeRecepcion() {
  return query(
    `SELECT u.id AS usuario_id, o.id, o.total_estimado, o.fecha_creacion,
            eo.nombre AS estado, e.codigo AS expediente_codigo
     FROM auditoria a
     INNER JOIN usuario u ON u.id = a.usuario_id
     INNER JOIN rol r ON r.id = u.rol_id AND r.nombre = 'recepcion'
     INNER JOIN expediente e ON e.id = a.entidad_id
     INNER JOIN orden_funeraria o ON o.expediente_id = e.id
     INNER JOIN estado_orden eo ON eo.id = o.estado_id
     WHERE a.entidad = 'expediente' AND a.accion = 'crear_expediente'
     ORDER BY o.fecha_creacion DESC, o.id DESC`
  );
}
