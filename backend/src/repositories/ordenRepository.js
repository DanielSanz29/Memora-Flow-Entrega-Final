import { query, withTransaction } from '../config/database.js';

export async function createOrden({ expedienteId, tipoServicio, estadoId, observacionGeneral }) {
  const result = await query(
    `INSERT INTO orden_funeraria (expediente_id, tipo_servicio, estado_id, observacion_general)
     VALUES (?, ?, ?, ?)`,
    [expedienteId, tipoServicio, estadoId, observacionGeneral]
  );
  return result.insertId;
}


export async function listOrdenes() {
  return query(
    `SELECT o.id, o.tipo_servicio, o.total_estimado, o.fecha_creacion, o.fecha_actualizacion,
            eo.nombre AS estado, e.codigo AS expediente_codigo,
            c.nombre AS responsable_nombre, c.apellidos AS responsable_apellidos,
            f.nombre AS fallecido_nombre, f.apellidos AS fallecido_apellidos
     FROM orden_funeraria o
     INNER JOIN estado_orden eo ON eo.id = o.estado_id
     INNER JOIN expediente e ON e.id = o.expediente_id
     INNER JOIN cliente_responsable c ON c.id = e.cliente_id
     INNER JOIN fallecido f ON f.id = e.fallecido_id
     ORDER BY COALESCE(o.fecha_actualizacion, o.fecha_creacion) DESC, o.id DESC`
  );
}

export async function listHistorialEstados(ordenId) {
  return query(
    `SELECT a.id, a.accion, a.detalle, a.fecha, u.nombre AS usuario
     FROM auditoria a
     LEFT JOIN usuario u ON u.id = a.usuario_id
     WHERE a.entidad = 'orden_funeraria'
       AND a.entidad_id = ?
       AND a.accion IN ('crear_orden', 'cambiar_estado')
     ORDER BY a.fecha DESC, a.id DESC`,
    [ordenId]
  );
}

export async function findOrdenBase(id) {
  const rows = await query(
    `SELECT o.id, o.expediente_id, o.tipo_servicio, o.total_estimado,
            o.observacion_general, o.fecha_creacion, o.fecha_actualizacion,
            eo.id AS estado_id, eo.nombre AS estado,
            e.codigo AS expediente_codigo, e.estado AS expediente_estado,
            c.dni AS responsable_dni, c.nombre AS responsable_nombre, c.apellidos AS responsable_apellidos,
            c.telefono AS responsable_telefono, c.email AS responsable_email, c.direccion AS responsable_direccion,
            f.dni AS fallecido_dni, f.nombre AS fallecido_nombre, f.apellidos AS fallecido_apellidos,
            f.fecha_defuncion, f.lugar_defuncion
     FROM orden_funeraria o
     INNER JOIN estado_orden eo ON eo.id = o.estado_id
     INNER JOIN expediente e ON e.id = o.expediente_id
     INNER JOIN cliente_responsable c ON c.id = e.cliente_id
     INNER JOIN fallecido f ON f.id = e.fallecido_id
     WHERE o.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function listDetalles(ordenId) {
  return query(
    `SELECT d.id, d.producto_id, d.concepto, d.cantidad, d.precio_unitario, d.subtotal,
            p.nombre AS producto_nombre, c.nombre AS categoria
     FROM detalle_orden d
     LEFT JOIN producto p ON p.id = d.producto_id
     LEFT JOIN categoria_producto c ON c.id = p.categoria_id
     WHERE d.orden_id = ?
     ORDER BY d.id ASC`,
    [ordenId]
  );
}

export async function listServiciosOrden(ordenId) {
  return query(
    `SELECT sc.id, sc.nombre, sc.descripcion, osc.precio_aplicado, osc.creado_en
     FROM orden_servicio_complementario osc
     INNER JOIN servicio_complementario sc ON sc.id = osc.servicio_id
     WHERE osc.orden_id = ?
     ORDER BY sc.nombre ASC`,
    [ordenId]
  );
}

export async function listObservaciones(ordenId) {
  return query(
    `SELECT ob.id, ob.texto, ob.fecha_creacion, u.nombre AS usuario, u.email AS usuario_email
     FROM observacion ob
     INNER JOIN usuario u ON u.id = ob.usuario_id
     WHERE ob.orden_id = ?
     ORDER BY ob.fecha_creacion DESC, ob.id DESC`,
    [ordenId]
  );
}

export async function addDetalle({ ordenId, productoId, concepto, cantidad, precioUnitario, subtotal }) {
  const result = await query(
    `INSERT INTO detalle_orden (orden_id, producto_id, concepto, cantidad, precio_unitario, subtotal)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [ordenId, productoId, concepto, cantidad, precioUnitario, subtotal]
  );
  return result.insertId;
}

export async function deleteDetalle(ordenId, detalleId) {
  const result = await query('DELETE FROM detalle_orden WHERE id = ? AND orden_id = ?', [detalleId, ordenId]);
  return result.affectedRows > 0;
}

export async function addServicio({ ordenId, servicioId, precioAplicado }) {
  await query(
    `INSERT INTO orden_servicio_complementario (orden_id, servicio_id, precio_aplicado)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE precio_aplicado = VALUES(precio_aplicado)`,
    [ordenId, servicioId, precioAplicado]
  );
}

export async function addObservacion({ ordenId, usuarioId, texto }) {
  const result = await query(
    `INSERT INTO observacion (orden_id, usuario_id, texto)
     VALUES (?, ?, ?)`,
    [ordenId, usuarioId, texto]
  );
  return result.insertId;
}

export async function updateOrden(id, data) {
  const fields = [];
  const params = [];

  if (data.tipoServicio) {
    fields.push('tipo_servicio = ?');
    params.push(data.tipoServicio);
  }
  if (data.estadoId) {
    fields.push('estado_id = ?');
    params.push(data.estadoId);
  }
  if (data.observacionGeneral !== undefined) {
    fields.push('observacion_general = ?');
    params.push(data.observacionGeneral);
  }

  if (!fields.length) return false;
  fields.push('fecha_actualizacion = NOW()');
  params.push(id);

  const result = await query(`UPDATE orden_funeraria SET ${fields.join(', ')} WHERE id = ?`, params);
  return result.affectedRows > 0;
}

export async function recalculateTotal(ordenId) {
  return withTransaction(async (connection) => {
    const [detalleRows] = await connection.execute(
      'SELECT COALESCE(SUM(subtotal), 0) AS total_detalles FROM detalle_orden WHERE orden_id = ?',
      [ordenId]
    );
    const [servicioRows] = await connection.execute(
      'SELECT COALESCE(SUM(precio_aplicado), 0) AS total_servicios FROM orden_servicio_complementario WHERE orden_id = ?',
      [ordenId]
    );
    const total = Number(detalleRows[0].total_detalles || 0) + Number(servicioRows[0].total_servicios || 0);
    await connection.execute(
      'UPDATE orden_funeraria SET total_estimado = ?, fecha_actualizacion = NOW() WHERE id = ?',
      [total, ordenId]
    );
    return total;
  });
}
