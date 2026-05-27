import { query, withTransaction } from '../config/database.js';

function mapExpediente(row) {
  if (!row) return null;
  return {
    id: row.id,
    codigo: row.codigo,
    estado: row.estado,
    fecha_apertura: row.fecha_apertura,
    responsable: {
      id: row.cliente_id,
      dni: row.cliente_dni,
      nombre: row.cliente_nombre,
      apellidos: row.cliente_apellidos,
      telefono: row.cliente_telefono,
      email: row.cliente_email,
      direccion: row.cliente_direccion
    },
    fallecido: {
      id: row.fallecido_id,
      dni: row.fallecido_dni,
      nombre: row.fallecido_nombre,
      apellidos: row.fallecido_apellidos,
      fecha_defuncion: row.fecha_defuncion,
      lugar_defuncion: row.lugar_defuncion
    }
  };
}

const expedienteSelect = `
  SELECT e.id, e.codigo, e.estado, e.fecha_apertura,
         c.id AS cliente_id, c.dni AS cliente_dni, c.nombre AS cliente_nombre,
         c.apellidos AS cliente_apellidos, c.telefono AS cliente_telefono,
         c.email AS cliente_email, c.direccion AS cliente_direccion,
         f.id AS fallecido_id, f.dni AS fallecido_dni, f.nombre AS fallecido_nombre,
         f.apellidos AS fallecido_apellidos, f.fecha_defuncion, f.lugar_defuncion
  FROM expediente e
  INNER JOIN cliente_responsable c ON c.id = e.cliente_id
  INNER JOIN fallecido f ON f.id = e.fallecido_id
`;

export async function searchByDni(dni) {
  const rows = await query(
    `${expedienteSelect}
     WHERE c.dni = ? OR f.dni = ?
     ORDER BY e.fecha_apertura DESC`,
    [dni, dni]
  );
  return rows.map(mapExpediente);
}

export async function findById(id) {
  const rows = await query(`${expedienteSelect} WHERE e.id = ? LIMIT 1`, [id]);
  return mapExpediente(rows[0]);
}

export async function createExpediente(data) {
  return withTransaction(async (connection) => {
    const [clienteRows] = await connection.execute('SELECT id FROM cliente_responsable WHERE dni = ? LIMIT 1', [data.responsable.dni]);
    let clienteId = clienteRows[0]?.id;

    if (!clienteId) {
      const [result] = await connection.execute(
        `INSERT INTO cliente_responsable (dni, nombre, apellidos, telefono, email, direccion)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [data.responsable.dni, data.responsable.nombre, data.responsable.apellidos, data.responsable.telefono, data.responsable.email, data.responsable.direccion]
      );
      clienteId = result.insertId;
    }

    let fallecidoId = null;
    if (data.fallecido.dni) {
      const [fallecidoRows] = await connection.execute('SELECT id FROM fallecido WHERE dni = ? LIMIT 1', [data.fallecido.dni]);
      fallecidoId = fallecidoRows[0]?.id || null;
    }

    if (!fallecidoId) {
      const [result] = await connection.execute(
        `INSERT INTO fallecido (dni, nombre, apellidos, fecha_defuncion, lugar_defuncion)
         VALUES (?, ?, ?, ?, ?)`,
        [data.fallecido.dni || null, data.fallecido.nombre, data.fallecido.apellidos, data.fallecido.fecha_defuncion || null, data.fallecido.lugar_defuncion || null]
      );
      fallecidoId = result.insertId;
    }

    const codigo = `EXP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const [expedienteResult] = await connection.execute(
      `INSERT INTO expediente (codigo, cliente_id, fallecido_id, estado)
       VALUES (?, ?, ?, 'abierto')`,
      [codigo, clienteId, fallecidoId]
    );

    return expedienteResult.insertId;
  });
}

export async function updateExpediente(id, data) {
  return withTransaction(async (connection) => {
    const [rows] = await connection.execute('SELECT cliente_id, fallecido_id FROM expediente WHERE id = ? LIMIT 1', [id]);
    const expediente = rows[0];
    if (!expediente) return false;

    await connection.execute(
      `UPDATE cliente_responsable
       SET dni = ?, nombre = ?, apellidos = ?, telefono = ?, email = ?, direccion = ?
       WHERE id = ?`,
      [data.responsable.dni, data.responsable.nombre, data.responsable.apellidos, data.responsable.telefono, data.responsable.email, data.responsable.direccion, expediente.cliente_id]
    );

    await connection.execute(
      `UPDATE fallecido
       SET dni = ?, nombre = ?, apellidos = ?, fecha_defuncion = ?, lugar_defuncion = ?
       WHERE id = ?`,
      [data.fallecido.dni || null, data.fallecido.nombre, data.fallecido.apellidos, data.fallecido.fecha_defuncion || null, data.fallecido.lugar_defuncion || null, expediente.fallecido_id]
    );

    return true;
  });
}
