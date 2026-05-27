import { query } from '../config/database.js';

export async function audit({ usuarioId = null, entidad, entidadId, accion, detalle = null }) {
  await query(
    `INSERT INTO auditoria (usuario_id, entidad, entidad_id, accion, detalle)
     VALUES (?, ?, ?, ?, ?)`,
    [usuarioId, entidad, entidadId, accion, detalle]
  );
}
