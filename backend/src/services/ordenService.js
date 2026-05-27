import { AppError } from '../utils/AppError.js';
import { cleanText, escapeHtmlText, positiveInt, required, validTipoServicio } from '../utils/validators.js';
import * as ordenRepository from '../repositories/ordenRepository.js';
import * as catalogRepository from '../repositories/catalogRepository.js';
import * as expedienteRepository from '../repositories/expedienteRepository.js';
import { audit } from '../repositories/auditoriaRepository.js';

function mapOrden(base, detalles, servicios, observaciones, historialEstados) {
  return {
    id: base.id,
    expediente_id: base.expediente_id,
    tipo_servicio: base.tipo_servicio,
    estado: base.estado,
    estado_id: base.estado_id,
    total_estimado: Number(base.total_estimado || 0),
    observacion_general: base.observacion_general,
    fecha_creacion: base.fecha_creacion,
    fecha_actualizacion: base.fecha_actualizacion,
    expediente: {
      id: base.expediente_id,
      codigo: base.expediente_codigo,
      estado: base.expediente_estado
    },
    responsable: {
      dni: base.responsable_dni,
      nombre: base.responsable_nombre,
      apellidos: base.responsable_apellidos,
      telefono: base.responsable_telefono,
      email: base.responsable_email,
      direccion: base.responsable_direccion
    },
    fallecido: {
      dni: base.fallecido_dni,
      nombre: base.fallecido_nombre,
      apellidos: base.fallecido_apellidos,
      fecha_defuncion: base.fecha_defuncion,
      lugar_defuncion: base.lugar_defuncion
    },
    detalles,
    servicios,
    observaciones,
    historial_estados: historialEstados
  };
}

export async function list() {
  const ordenes = await ordenRepository.listOrdenes();
  return ordenes.map((orden) => ({
    ...orden,
    responsable: `${orden.responsable_nombre} ${orden.responsable_apellidos}`,
    fallecido: `${orden.fallecido_nombre} ${orden.fallecido_apellidos}`
  }));
}

export async function getOrden(id) {
  const base = await ordenRepository.findOrdenBase(id);
  if (!base) throw new AppError('Orden no encontrada', 404);
  const [detalles, servicios, observaciones, historialEstados] = await Promise.all([
    ordenRepository.listDetalles(id),
    ordenRepository.listServiciosOrden(id),
    ordenRepository.listObservaciones(id),
    ordenRepository.listHistorialEstados(id)
  ]);
  return mapOrden(base, detalles, servicios, observaciones, historialEstados);
}

export async function create(body, user) {
  const expedienteId = Number(required(body?.expediente_id, 'Expediente'));
  const tipoServicio = validTipoServicio(body?.tipo_servicio);
  const observacionGeneral = cleanText(body?.observacion_general);

  const expediente = await expedienteRepository.findById(expedienteId);
  if (!expediente) throw new AppError('No existe el expediente indicado', 404);

  const estado = await catalogRepository.getEstadoByNombre('borrador');
  if (!estado) throw new AppError('No existe el estado inicial borrador', 500);

  const ordenId = await ordenRepository.createOrden({ expedienteId, tipoServicio, estadoId: estado.id, observacionGeneral });
  await audit({ usuarioId: user.id, entidad: 'orden_funeraria', entidadId: ordenId, accion: 'crear_orden', detalle: `Estado inicial: ${estado.nombre}. Servicio: ${tipoServicio}` });
  return getOrden(ordenId);
}

export async function update(id, body, user) {
  const current = await getOrden(id);
  const data = {};

  if (body.tipo_servicio) data.tipoServicio = validTipoServicio(body.tipo_servicio);
  if (body.estado_id) data.estadoId = Number(body.estado_id);
  if (body.observacion_general !== undefined) data.observacionGeneral = cleanText(body.observacion_general);

  let nuevoEstado = null;
  if (data.estadoId) {
    const estados = await catalogRepository.getEstados();
    nuevoEstado = estados.find((estado) => estado.id === data.estadoId) || null;
    if (!nuevoEstado) throw new AppError('Estado no válido', 422);
  }

  const ok = await ordenRepository.updateOrden(id, data);
  if (!ok) throw new AppError('No se pudo actualizar la orden', 400);

  if (data.estadoId && data.estadoId !== current.estado_id) {
    await audit({ usuarioId: user.id, entidad: 'orden_funeraria', entidadId: Number(id), accion: 'cambiar_estado', detalle: `Cambio de estado: ${current.estado} -> ${nuevoEstado.nombre}` });
  } else {
    await audit({ usuarioId: user.id, entidad: 'orden_funeraria', entidadId: Number(id), accion: 'editar_orden', detalle: 'Actualización de orden' });
  }

  return getOrden(id);
}

export async function addProducto(ordenId, body, user) {
  await getOrden(ordenId);
  const productoId = Number(required(body?.producto_id, 'Producto'));
  const cantidad = positiveInt(body?.cantidad, 'Cantidad');

  const producto = await catalogRepository.getProductoById(productoId);
  if (!producto) throw new AppError('Producto no encontrado o inactivo', 404);

  const precioUnitario = Number(producto.precio_base);
  const subtotal = cantidad * precioUnitario;
  const detalleId = await ordenRepository.addDetalle({
    ordenId,
    productoId,
    concepto: producto.nombre,
    cantidad,
    precioUnitario,
    subtotal
  });

  await ordenRepository.recalculateTotal(ordenId);
  await audit({ usuarioId: user.id, entidad: 'detalle_orden', entidadId: detalleId, accion: 'añadir_producto', detalle: producto.nombre });
  return getOrden(ordenId);
}

export async function deleteProducto(ordenId, detalleId, user) {
  await getOrden(ordenId);
  const ok = await ordenRepository.deleteDetalle(ordenId, detalleId);
  if (!ok) throw new AppError('Línea de detalle no encontrada', 404);
  await ordenRepository.recalculateTotal(ordenId);
  await audit({ usuarioId: user.id, entidad: 'detalle_orden', entidadId: Number(detalleId), accion: 'eliminar_producto', detalle: `Orden ${ordenId}` });
  return getOrden(ordenId);
}

export async function addServicio(ordenId, body, user) {
  await getOrden(ordenId);
  const servicioId = Number(required(body?.servicio_id, 'Servicio'));
  const servicio = await catalogRepository.getServicioById(servicioId);
  if (!servicio) throw new AppError('Servicio no encontrado o inactivo', 404);

  await ordenRepository.addServicio({ ordenId, servicioId, precioAplicado: Number(servicio.precio_base) });
  await ordenRepository.recalculateTotal(ordenId);
  await audit({ usuarioId: user.id, entidad: 'orden_servicio_complementario', entidadId: Number(ordenId), accion: 'añadir_servicio', detalle: servicio.nombre });
  return getOrden(ordenId);
}

export async function addObservacion(ordenId, body, user) {
  await getOrden(ordenId);
  const texto = escapeHtmlText(required(body?.texto, 'Observación'));
  const observacionId = await ordenRepository.addObservacion({ ordenId, usuarioId: user.id, texto });
  await audit({ usuarioId: user.id, entidad: 'observacion', entidadId: observacionId, accion: 'añadir_observacion', detalle: `Orden ${ordenId}` });
  return getOrden(ordenId);
}
