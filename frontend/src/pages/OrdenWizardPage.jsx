import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Button from '../components/Button.jsx';
import FormField, { inputClass } from '../components/FormField.jsx';
import Loading from '../components/Loading.jsx';
import { api } from '../services/api.js';

export default function OrdenWizardPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const expedienteId = params.get('expedienteId') || '';
  const [expediente, setExpediente] = useState(null);
  const [loading, setLoading] = useState(Boolean(expedienteId));
  const [tipoServicio, setTipoServicio] = useState('incineracion');
  const [observacion, setObservacion] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadExpediente() {
      if (!expedienteId) return;
      try {
        const response = await api.obtenerExpediente(expedienteId);
        setExpediente(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadExpediente();
  }, [expedienteId]);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await api.crearOrden({
        expediente_id: Number(expedienteId),
        tipo_servicio: tipoServicio,
        observacion_general: observacion
      });
      navigate(`/ordenes/${response.data.id}/resumen`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <section className="surface p-6 lg:p-7">
        <h1 className="page-title">Crear orden funeraria</h1>
        <p className="mt-2 text-sm text-slate-500">La orden se registra desde un expediente previamente localizado o creado.</p>
      </section>
      <Alert type="error">{error}</Alert>
      {!expedienteId && (
        <section className="surface p-6">
          <Alert type="info">Para crear una orden es necesario seleccionar antes el expediente correspondiente.</Alert>
          <div className="mt-5">
            <Link className="inline-flex items-center justify-center rounded-xl bg-[#314b4c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#263c3d]" to="/expedientes/buscar">Seleccionar expediente</Link>
          </div>
        </section>
      )}
      {expedienteId && expediente && (
        <>
          <section className="surface p-5">
            <p className="eyebrow">Expediente seleccionado</p>
            <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{expediente.codigo}</h2>
                <p className="mt-1 text-sm text-slate-600">Responsable: {expediente.responsable.nombre} {expediente.responsable.apellidos}</p>
                <p className="text-sm text-slate-500">Fallecido: {expediente.fallecido.nombre} {expediente.fallecido.apellidos}</p>
              </div>
              <Link className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" to="/expedientes/buscar">Cambiar expediente</Link>
            </div>
          </section>
          <form onSubmit={submit} className="surface p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Código de expediente">
                <input className={`${inputClass} bg-slate-50 text-slate-500`} value={expediente.codigo} readOnly />
              </FormField>
              <FormField label="Tipo de servicio">
                <select className={inputClass} value={tipoServicio} onChange={(e) => setTipoServicio(e.target.value)}>
                  <option value="incineracion">Incineración</option>
                  <option value="inhumacion">Inhumación</option>
                </select>
              </FormField>
            </div>
            <div className="mt-4">
              <FormField label="Observación general">
                <textarea className={inputClass} rows="4" value={observacion} onChange={(e) => setObservacion(e.target.value)} placeholder="Notas iniciales de la orden" />
              </FormField>
            </div>
            <div className="mt-5 flex justify-end">
              <Button type="submit" disabled={saving}>{saving ? 'Creando...' : 'Crear orden'}</Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
