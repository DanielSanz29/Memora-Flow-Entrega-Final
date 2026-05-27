import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Button from '../components/Button.jsx';
import FormField, { inputClass } from '../components/FormField.jsx';
import { api } from '../services/api.js';

export default function BuscarExpedientePage() {
  const [dni, setDni] = useState('');
  const [resultados, setResultados] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function buscar(e) {
    e.preventDefault();
    setError('');
    setSearched(false);
    try {
      const response = await api.buscarExpediente(dni);
      setResultados(response.data);
      setSearched(true);
    } catch (err) {
      setError(err.message);
      setResultados([]);
    }
  }

  return (
    <div className="space-y-6">
      <section className="surface p-6 lg:p-7">
        <h1 className="page-title">Búsqueda de expediente</h1>
        <p className="mt-2 text-sm text-slate-500">Introduce el DNI/NIE del familiar responsable o de la persona fallecida.</p>
        <form onSubmit={buscar} className="mt-5 flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <FormField label="DNI/NIE">
              <input className={inputClass} value={dni} onChange={(e) => setDni(e.target.value)} required />
            </FormField>
          </div>
          <Button type="submit">Buscar</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(`/expedientes/nuevo?dni=${encodeURIComponent(dni)}`)}>Crear expediente</Button>
        </form>
      </section>
      <Alert type="error">{error}</Alert>
      {searched && resultados.length === 0 && (
        <Alert type="warning">No se han encontrado expedientes. Puedes crear uno nuevo con este DNI/NIE.</Alert>
      )}
      <section className="grid gap-4">
        {resultados.map((expediente) => (
          <article key={expediente.id} className="surface p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{expediente.codigo}</h2>
                <p className="text-sm text-slate-500">Responsable: {expediente.responsable.nombre} {expediente.responsable.apellidos} · {expediente.responsable.dni}</p>
                <p className="text-sm text-slate-500">Fallecido: {expediente.fallecido.nombre} {expediente.fallecido.apellidos}</p>
              </div>
              <div className="flex gap-2">
                <Link className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" to={`/expedientes/${expediente.id}/editar`}>Editar</Link>
                <Link className="inline-flex items-center justify-center rounded-xl bg-[#314b4c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#263c3d]" to={`/ordenes/nueva?expedienteId=${expediente.id}`}>Crear orden</Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
