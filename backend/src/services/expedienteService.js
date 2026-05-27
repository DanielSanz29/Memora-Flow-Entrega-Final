import { AppError } from '../utils/AppError.js';
import { assertDni, cleanText, required } from '../utils/validators.js';
import * as expedienteRepository from '../repositories/expedienteRepository.js';
import { audit } from '../repositories/auditoriaRepository.js';

function normalizeExpedientePayload(body) {
  return {
    responsable: {
      dni: assertDni(body?.responsable?.dni),
      nombre: required(body?.responsable?.nombre, 'Nombre del responsable'),
      apellidos: required(body?.responsable?.apellidos, 'Apellidos del responsable'),
      telefono: cleanText(body?.responsable?.telefono),
      email: cleanText(body?.responsable?.email),
      direccion: cleanText(body?.responsable?.direccion)
    },
    fallecido: {
      dni: body?.fallecido?.dni ? assertDni(body.fallecido.dni) : null,
      nombre: required(body?.fallecido?.nombre, 'Nombre del fallecido'),
      apellidos: required(body?.fallecido?.apellidos, 'Apellidos del fallecido'),
      fecha_defuncion: cleanText(body?.fallecido?.fecha_defuncion) || null,
      lugar_defuncion: cleanText(body?.fallecido?.lugar_defuncion)
    }
  };
}

export async function search(dni) {
  const normalized = assertDni(dni);
  return expedienteRepository.searchByDni(normalized);
}

export async function getById(id) {
  const expediente = await expedienteRepository.findById(id);
  if (!expediente) throw new AppError('Expediente no encontrado', 404);
  return expediente;
}

export async function create(body, user) {
  const payload = normalizeExpedientePayload(body);
  const expedienteId = await expedienteRepository.createExpediente(payload);
  await audit({ usuarioId: user.id, entidad: 'expediente', entidadId: expedienteId, accion: 'crear_expediente', detalle: 'Alta de expediente' });
  return getById(expedienteId);
}

export async function update(id, body, user) {
  const payload = normalizeExpedientePayload(body);
  const ok = await expedienteRepository.updateExpediente(id, payload);
  if (!ok) throw new AppError('Expediente no encontrado', 404);
  await audit({ usuarioId: user.id, entidad: 'expediente', entidadId: Number(id), accion: 'editar_expediente', detalle: 'Actualización de datos de expediente' });
  return getById(id);
}
