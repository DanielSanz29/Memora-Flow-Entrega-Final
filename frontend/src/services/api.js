// En producción el frontend se sirve desde el mismo servicio Express; por eso /api funciona sin CORS ni URL fija.
const API_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('memora_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('memora_token', token);
  else localStorage.removeItem('memora_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/pdf')) {
    if (!response.ok) throw new Error('No se pudo generar el PDF');
    return response.blob();
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Error de comunicación con la API');
  }
  return data;
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/auth/me'),
  buscarExpediente: (dni) => request(`/expedientes/buscar?dni=${encodeURIComponent(dni)}`),
  crearExpediente: (payload) => request('/expedientes', { method: 'POST', body: payload }),
  obtenerExpediente: (id) => request(`/expedientes/${id}`),
  actualizarExpediente: (id, payload) => request(`/expedientes/${id}`, { method: 'PUT', body: payload }),
  listarOrdenes: () => request('/ordenes'),
  crearOrden: (payload) => request('/ordenes', { method: 'POST', body: payload }),
  obtenerOrden: (id) => request(`/ordenes/${id}/resumen`),
  actualizarOrden: (id, payload) => request(`/ordenes/${id}`, { method: 'PUT', body: payload }),
  productos: () => request('/productos'),
  servicios: () => request('/servicios'),
  pedidosPorPersonal: () => request('/seguimiento/personal-pedidos'),
  addProducto: (ordenId, payload) => request(`/ordenes/${ordenId}/productos`, { method: 'POST', body: payload }),
  deleteProducto: (ordenId, detalleId) => request(`/ordenes/${ordenId}/productos/${detalleId}`, { method: 'DELETE' }),
  addServicio: (ordenId, payload) => request(`/ordenes/${ordenId}/servicios`, { method: 'POST', body: payload }),
  addObservacion: (ordenId, payload) => request(`/ordenes/${ordenId}/observaciones`, { method: 'POST', body: payload }),
  descargarPdf: (ordenId) => request(`/ordenes/${ordenId}/pdf`),
  adminUsuarios: () => request('/admin/usuarios'),
  adminCatalogos: () => request('/admin/catalogos')
};

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
