import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Button from '../components/Button.jsx';
import FormField, { inputClass } from '../components/FormField.jsx';
import Loading from '../components/Loading.jsx';
import ObservacionesList from '../components/ObservacionesList.jsx';
import ProductSelector from '../components/ProductSelector.jsx';
import { api, downloadBlob } from '../services/api.js';

function money(value) {
  return `${Number(value || 0).toFixed(2)} €`;
}

export default function ResumenOrdenPage() {
  const { id } = useParams();
  const [orden, setOrden] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [observacion, setObservacion] = useState('');
  const [estadoId, setEstadoId] = useState('');
  const [estados] = useState([
    { id: 1, nombre: 'borrador' },
    { id: 2, nombre: 'en preparación' },
    { id: 3, nombre: 'pendiente de validación' },
    { id: 4, nombre: 'cerrada' },
    { id: 5, nombre: 'anulada' }
  ]);

  async function load() {
    setError('');
    try {
      const response = await api.obtenerOrden(id);
      setOrden(response.data);
      setEstadoId(String(response.data.estado_id));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function removeDetalle(detalleId) {
    setError('');
    try {
      const response = await api.deleteProducto(id, detalleId);
      setOrden(response.data);
      setSuccess('Línea eliminada correctamente');
    } catch (err) {
      setError(err.message);
    }
  }

  async function addObservacion(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await api.addObservacion(id, { texto: observacion });
      setOrden(response.data);
      setObservacion('');
      setSuccess('Observación añadida');
    } catch (err) {
      setError(err.message);
    }
  }

  async function cambiarEstado() {
    setError('');
    setSuccess('');
    try {
      const response = await api.actualizarOrden(id, { estado_id: Number(estadoId) });
      setOrden(response.data);
      setSuccess('Estado actualizado');
    } catch (err) {
      setError(err.message);
    }
  }

  async function descargarPdf() {
    setError('');
    try {
      const blob = await api.descargarPdf(id);
      downloadBlob(blob, `orden-${id}.pdf`);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!orden && !error) return <Loading />;

  return (
    <div className="space-y-6">
      <section className="surface p-6 lg:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="page-title">Resumen de orden #{orden?.id}</h1>
            <p className="mt-2 text-sm text-slate-500">Expediente {orden?.expediente.codigo} · Servicio: {orden?.tipo_servicio}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" to="/ordenes">Volver al historial</Link>
            <Button onClick={descargarPdf}>Generar PDF</Button>
          </div>
        </div>
      </section>
      <Alert type="error">{error}</Alert>
      <Alert type="success">{success}</Alert>
      {orden && (
        <>
          <section className="grid gap-4 lg:grid-cols-3">
            <article className="surface p-5">
              <h2 className="font-bold text-slate-900">Responsable</h2>
              <p className="mt-2 text-sm text-slate-600">{orden.responsable.nombre} {orden.responsable.apellidos}</p>
              <p className="text-sm text-slate-500">{orden.responsable.dni}</p>
              <p className="text-sm text-slate-500">{orden.responsable.telefono}</p>
            </article>
            <article className="surface p-5">
              <h2 className="font-bold text-slate-900">Fallecido</h2>
              <p className="mt-2 text-sm text-slate-600">{orden.fallecido.nombre} {orden.fallecido.apellidos}</p>
              <p className="text-sm text-slate-500">{orden.fallecido.dni || '-'}</p>
              <p className="text-sm text-slate-500">{orden.fallecido.lugar_defuncion || '-'}</p>
            </article>
            <article className="surface p-5">
              <h2 className="font-bold text-slate-900">Estado y total</h2>
              <p className="mt-2 text-sm text-slate-600">Estado actual: {orden.estado}</p>
              <p className="mt-2 page-title">{money(orden.total_estimado)}</p>
            </article>
          </section>

          <ProductSelector ordenId={id} onChange={(updated) => setOrden(updated)} />

          <section className="grid gap-6 lg:grid-cols-2">
            <article className="surface p-5">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Líneas de productos y flores</h2>
              <div className="overflow-x-auto">
                <table className="table-memora">
                  <thead >
                    <tr><th className="py-2">Concepto</th><th>Cant.</th><th>Subtotal</th><th></th></tr>
                  </thead>
                  <tbody>
                    {orden.detalles.map((detalle) => (
                      <tr key={detalle.id} className="hover:bg-slate-50/70">
                        <td className="py-2">{detalle.concepto}</td>
                        <td>{detalle.cantidad}</td>
                        <td>{money(detalle.subtotal)}</td>
                        <td><button className="text-sm font-semibold text-red-700" onClick={() => removeDetalle(detalle.id)}>Eliminar</button></td>
                      </tr>
                    ))}
                    {orden.detalles.length === 0 && <tr><td className="py-3 text-slate-500" colSpan="4">Sin productos.</td></tr>}
                  </tbody>
                </table>
              </div>
            </article>
            <article className="surface p-5">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Servicios complementarios</h2>
              <div className="space-y-2">
                {orden.servicios.map((servicio) => (
                  <div key={servicio.id} className="flex justify-between surface-muted p-3 text-sm">
                    <span>{servicio.nombre}</span>
                    <strong>{money(servicio.precio_aplicado)}</strong>
                  </div>
                ))}
                {orden.servicios.length === 0 && <p className="text-sm text-slate-500">Sin servicios añadidos.</p>}
              </div>
            </article>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <article className="surface p-5">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Seguimiento y observaciones</h2>
              <form className="mb-4 space-y-3" onSubmit={addObservacion}>
                <textarea className={inputClass} rows="3" value={observacion} onChange={(e) => setObservacion(e.target.value)} placeholder="Añadir observación interna" required />
                <Button type="submit">Añadir observación</Button>
              </form>
              <ObservacionesList observaciones={orden.observaciones} />
            </article>
            <article className="surface p-5">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Cambio de estado</h2>
              <FormField label="Estado de la orden">
                <select className={inputClass} value={estadoId} onChange={(e) => setEstadoId(e.target.value)}>
                  {estados.map((estado) => <option key={estado.id} value={estado.id}>{estado.nombre}</option>)}
                </select>
              </FormField>
              <Button className="mt-4" variant="secondary" onClick={cambiarEstado}>Actualizar estado</Button>
              <div className="mt-6 surface-muted p-4">
                <p className="text-sm text-slate-500">Observación general</p>
                <p className="mt-1 text-sm text-slate-800">{orden.observacion_general || 'Sin observación general.'}</p>
              </div>
            </article>
          </section>

          <section className="surface p-5">
            <div className="mb-4">
              <p className="eyebrow">Trazabilidad</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">Historial de estados de la orden</h2>
              <p className="mt-1 text-sm text-slate-500">Registro de creación y cambios de estado realizados durante la gestión.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="table-memora">
                <thead>
                  <tr><th>Fecha</th><th>Acción</th><th>Detalle</th><th>Usuario</th></tr>
                </thead>
                <tbody>
                  {(orden.historial_estados || []).map((evento) => (
                    <tr key={evento.id}>
                      <td>{new Date(evento.fecha).toLocaleString('es-ES')}</td>
                      <td className="font-semibold text-slate-800">{evento.accion === 'crear_orden' ? 'Creación' : 'Cambio de estado'}</td>
                      <td>{evento.detalle}</td>
                      <td>{evento.usuario || 'Sistema'}</td>
                    </tr>
                  ))}
                  {(orden.historial_estados || []).length === 0 && (
                    <tr><td colSpan="4" className="py-5 text-center text-slate-500">Todavía no se han registrado cambios de estado para esta orden.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
