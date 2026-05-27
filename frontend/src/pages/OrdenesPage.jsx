import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import FormField, { inputClass } from '../components/FormField.jsx';
import Loading from '../components/Loading.jsx';
import { api } from '../services/api.js';

function money(value) {
  return `${Number(value || 0).toFixed(2)} €`;
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function StatusBadge({ estado }) {
  const variants = {
    borrador: 'border-slate-200 bg-slate-50 text-slate-700',
    'en preparación': 'border-sky-200 bg-sky-50 text-sky-800',
    'pendiente de validación': 'border-amber-200 bg-amber-50 text-amber-900',
    cerrada: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    anulada: 'border-red-200 bg-red-50 text-red-800'
  };
  const style = variants[estado] || variants.borrador;
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}>{estado}</span>;
}

export default function OrdenesPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.listarOrdenes();
        setOrdenes(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return ordenes.filter((orden) => {
      const matchesState = !estado || orden.estado === estado;
      const text = `${orden.id} ${orden.expediente_codigo} ${orden.responsable} ${orden.fallecido}`.toLowerCase();
      const matchesText = !term || text.includes(term);
      return matchesState && matchesText;
    });
  }, [ordenes, search, estado]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <section className="surface p-6 lg:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="eyebrow">Seguimiento</p>
            <h1 className="page-title mt-3">Historial de órdenes</h1>
            <p className="page-description">Consulta todas las órdenes registradas, su estado actual y accede al detalle para actualizar o continuar la gestión.</p>
          </div>
          <Link className="inline-flex items-center justify-center rounded-xl bg-[#314b4c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#263c3d]" to="/ordenes/nueva">Nueva orden</Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_250px]">
          <FormField label="Buscar por expediente o persona">
            <input className={inputClass} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Código, responsable o fallecido" />
          </FormField>
          <FormField label="Estado">
            <select className={inputClass} value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="en preparación">En preparación</option>
              <option value="pendiente de validación">Pendiente de validación</option>
              <option value="cerrada">Cerrada</option>
              <option value="anulada">Anulada</option>
            </select>
          </FormField>
        </div>
      </section>
      <Alert type="error">{error}</Alert>
      <section className="surface overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="text-sm text-slate-600"><strong className="text-slate-900">{filtered.length}</strong> órdenes visibles de {ordenes.length} registradas</p>
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="table-memora">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Expediente</th>
                <th>Personas vinculadas</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Actualización</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((orden) => (
                <tr key={orden.id}>
                  <td className="font-semibold text-slate-900">#{orden.id}</td>
                  <td>{orden.expediente_codigo}</td>
                  <td>
                    <p className="font-medium text-slate-700">{orden.responsable}</p>
                    <p className="text-xs text-slate-500">{orden.fallecido}</p>
                  </td>
                  <td><StatusBadge estado={orden.estado} /></td>
                  <td className="font-semibold">{money(orden.total_estimado)}</td>
                  <td>{formatDate(orden.fecha_actualizacion || orden.fecha_creacion)}</td>
                  <td><Link className="text-sm font-semibold text-[#314b4c] hover:underline" to={`/ordenes/${orden.id}/resumen`}>Abrir / editar</Link></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="7" className="py-8 text-center text-slate-500">No se han encontrado órdenes con esos filtros.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="grid gap-3 p-4 md:hidden">
          {filtered.map((orden) => (
            <article key={orden.id} className="surface-muted p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">Orden #{orden.id}</p>
                  <p className="text-xs text-slate-500">{orden.expediente_codigo}</p>
                </div>
                <StatusBadge estado={orden.estado} />
              </div>
              <p className="mt-3 text-sm text-slate-700">{orden.responsable}</p>
              <p className="text-xs text-slate-500">{orden.fallecido}</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                <strong>{money(orden.total_estimado)}</strong>
                <Link className="text-sm font-semibold text-[#314b4c]" to={`/ordenes/${orden.id}/resumen`}>Abrir / editar</Link>
              </div>
            </article>
          ))}
          {filtered.length === 0 && <p className="py-5 text-center text-sm text-slate-500">No se han encontrado órdenes con esos filtros.</p>}
        </div>
      </section>
    </div>
  );
}
