import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import Alert from './Alert.jsx';
import Button from './Button.jsx';
import FormField, { inputClass } from './FormField.jsx';

export default function ProductSelector({ ordenId, onChange }) {
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [servicioId, setServicioId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadCatalogs() {
      try {
        const [prod, serv] = await Promise.all([api.productos(), api.servicios()]);
        setProductos(prod.data);
        setServicios(serv.data);
      } catch (err) {
        setError(err.message);
      }
    }
    loadCatalogs();
  }, []);

  async function addProducto(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (!productoId) throw new Error('Selecciona un producto');
      const response = await api.addProducto(ordenId, { producto_id: Number(productoId), cantidad: Number(cantidad) });
      setSuccess('Producto añadido correctamente');
      setProductoId('');
      setCantidad(1);
      onChange(response.data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function addServicio(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (!servicioId) throw new Error('Selecciona un servicio');
      const response = await api.addServicio(ordenId, { servicio_id: Number(servicioId) });
      setSuccess('Servicio añadido correctamente');
      setServicioId('');
      onChange(response.data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="surface p-5">
      <h2 className="text-lg font-semibold text-slate-900">Productos, flores y servicios</h2>
      <p className="mb-4 text-sm text-slate-500">Añade conceptos económicos a la orden. El presupuesto se recalcula automáticamente.</p>
      <div className="mb-4 space-y-2">
        <Alert type="error">{error}</Alert>
        <Alert type="success">{success}</Alert>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={addProducto} className="space-y-4 surface-muted p-4">
          <h3 className="font-semibold text-slate-800">Añadir producto o flor</h3>
          <FormField label="Producto">
            <select className={inputClass} value={productoId} onChange={(e) => setProductoId(e.target.value)}>
              <option value="">Selecciona producto</option>
              {productos.map((producto) => (
                <option key={producto.id} value={producto.id}>{producto.categoria} · {producto.nombre} · {Number(producto.precio_base).toFixed(2)} €</option>
              ))}
            </select>
          </FormField>
          <FormField label="Cantidad">
            <input className={inputClass} type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
          </FormField>
          <Button type="submit">Añadir producto</Button>
        </form>

        <form onSubmit={addServicio} className="space-y-4 surface-muted p-4">
          <h3 className="font-semibold text-slate-800">Añadir servicio complementario</h3>
          <FormField label="Servicio">
            <select className={inputClass} value={servicioId} onChange={(e) => setServicioId(e.target.value)}>
              <option value="">Selecciona servicio</option>
              {servicios.map((servicio) => (
                <option key={servicio.id} value={servicio.id}>{servicio.nombre} · {Number(servicio.precio_base).toFixed(2)} €</option>
              ))}
            </select>
          </FormField>
          <Button type="submit">Añadir servicio</Button>
        </form>
      </div>
    </section>
  );
}
