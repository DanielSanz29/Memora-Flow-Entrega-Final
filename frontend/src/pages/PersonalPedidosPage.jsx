import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Loading from '../components/Loading.jsx';
import { api } from '../services/api.js';

function money(value) {
  return `${Number(value || 0).toFixed(2)} €`;
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function labelRole(role) {
  return role === 'asesor' ? 'Funerario / asesor' : 'Recepcionista';
}

function StaffCard({ person, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(person.id)}
      className={`rounded-2xl border p-5 text-left transition hover:border-slate-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#456265] ${selected ? 'border-[#456265] bg-[#ecf1ef]/60' : 'border-slate-200 bg-white'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="data-label">{labelRole(person.rol)}</p>
          <h2 className="mt-2 text-base font-semibold text-slate-900">{person.nombre}</h2>
          <p className="mt-1 text-xs text-slate-500">{person.email}</p>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#314b4c]">{person.total_pedidos}</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
        <div>
          <p className="data-label">Pedidos</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{person.total_pedidos}</p>
        </div>
        <div>
          <p className="data-label">Importe</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{money(person.importe_total)}</p>
        </div>
      </div>
    </button>
  );
}

export default function PersonalPedidosPage() {
  const [summary, setSummary] = useState({ personal: [], pedidos: [] });
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const response = await api.pedidosPorPersonal();
        setSummary(response.data);
        setSelectedPerson(response.data.personal[0]?.id ?? null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const orders = useMemo(
    () => summary.pedidos.filter((order) => order.usuario_id === selectedPerson),
    [summary.pedidos, selectedPerson]
  );
  const person = summary.personal.find((item) => item.id === selectedPerson);

  if (loading) return <Loading text="Cargando actividad del equipo..." />;

  return (
    <div className="space-y-6">
      <section className="surface p-6 lg:p-8">
        <p className="eyebrow">Gerencia</p>
        <h1 className="page-title mt-3">Funerarios y recepcionistas</h1>
        <p className="page-description">Consulta los pedidos asociados a cada miembro del equipo. En el caso de recepción, se muestran las órdenes derivadas de expedientes dados de alta por ese perfil.</p>
      </section>
      <Alert type="error">{error}</Alert>
      <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="space-y-3">
          {summary.personal.map((item) => (
            <StaffCard key={item.id} person={item} selected={item.id === selectedPerson} onSelect={setSelectedPerson} />
          ))}
        </div>
        <div className="surface overflow-hidden">
          <div className="border-b border-slate-200 p-5">
            <p className="data-label">Pedidos vinculados</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">{person ? person.nombre : 'Personal operativo'}</h2>
            {person?.rol === 'recepcion' && <p className="mt-2 text-sm text-slate-500">Pedidos correspondientes a expedientes iniciados por recepción.</p>}
          </div>
          <div className="overflow-x-auto">
            <table className="table-memora">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Expediente</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={`${order.usuario_id}-${order.id}`}>
                    <td className="font-semibold text-slate-900">#{order.id}</td>
                    <td>{order.expediente_codigo}</td>
                    <td className="capitalize">{order.estado}</td>
                    <td className="font-semibold">{money(order.total_estimado)}</td>
                    <td>{formatDate(order.fecha_creacion)}</td>
                    <td><Link to={`/ordenes/${order.id}/resumen`} className="text-sm font-semibold text-[#314b4c] hover:underline">Ver orden</Link></td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-slate-500">Este usuario todavía no tiene pedidos vinculados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
