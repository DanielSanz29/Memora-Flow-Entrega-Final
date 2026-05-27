import { AppError } from './AppError.js';

export function cleanText(value) {
  return String(value ?? '').trim();
}

export function escapeHtmlText(value) {
  return cleanText(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function required(value, label) {
  if (value === undefined || value === null || String(value).trim() === '') {
    throw new AppError(`${label} es obligatorio`, 422);
  }
  return cleanText(value);
}

export function assertDni(value) {
  const dni = required(value, 'DNI/NIE');
  if (!/^[0-9A-Za-z]{5,15}$/.test(dni)) {
    throw new AppError('El DNI/NIE debe tener entre 5 y 15 caracteres alfanuméricos', 422);
  }
  return dni.toUpperCase();
}

export function positiveInt(value, label = 'cantidad') {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new AppError(`${label} debe ser un número entero positivo`, 422);
  }
  return number;
}

export function validTipoServicio(value) {
  const tipo = required(value, 'Tipo de servicio');
  if (!['incineracion', 'inhumacion'].includes(tipo)) {
    throw new AppError('Tipo de servicio no válido', 422);
  }
  return tipo;
}
