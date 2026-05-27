import { useEffect, useState } from 'react';
import Alert from '../components/Alert.jsx';
import Loading from '../components/Loading.jsx';
import { api } from '../services/api.js';

function Table({ title, rows, columns }) {
  return (
    <section className="surface p-5">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>
      <div className="overflow-x-auto">
        <table className="table-memora">
          <thead >
            <tr>{columns.map((col) => <th key={col.key} className="py-2 pr-3">{col.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${title}-${row.id ?? row.nombre}`} className="hover:bg-slate-50/70">
                {columns.map((col) => <td key={col.key} className="py-2 pr-3 text-slate-700">{String(row[col.key] ?? '-')}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function AdminPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [catalogos, setCatalogos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [u, c] = await Promise.all([api.adminUsuarios(), api.adminCatalogos()]);
        setUsuarios(u.data);
        setCatalogos(c.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <section className="surface p-6 lg:p-7">
        <h1 className="page-title">Administración básica</h1>
        <p className="mt-2 text-sm text-slate-500">Vista funcional de consulta de usuarios, roles, estados, productos y servicios.</p>
      </section>
      <Alert type="error">{error}</Alert>
      <Table title="Usuarios" rows={usuarios} columns={[{ key: 'id', label: 'ID' }, { key: 'nombre', label: 'Nombre' }, { key: 'email', label: 'Email' }, { key: 'rol', label: 'Rol' }, { key: 'activo', label: 'Activo' }]} />
      {catalogos && (
        <div className="grid gap-6">
          <Table title="Roles" rows={catalogos.roles} columns={[{ key: 'id', label: 'ID' }, { key: 'nombre', label: 'Nombre' }, { key: 'descripcion', label: 'Descripción' }]} />
          <Table title="Estados" rows={catalogos.estados} columns={[{ key: 'id', label: 'ID' }, { key: 'nombre', label: 'Nombre' }, { key: 'descripcion', label: 'Descripción' }]} />
          <Table title="Productos" rows={catalogos.productos} columns={[{ key: 'id', label: 'ID' }, { key: 'categoria', label: 'Categoría' }, { key: 'nombre', label: 'Nombre' }, { key: 'precio_base', label: 'Precio' }]} />
          <Table title="Servicios" rows={catalogos.servicios} columns={[{ key: 'id', label: 'ID' }, { key: 'nombre', label: 'Nombre' }, { key: 'precio_base', label: 'Precio' }, { key: 'activo', label: 'Activo' }]} />
        </div>
      )}
    </div>
  );
}
