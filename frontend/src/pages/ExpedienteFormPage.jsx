import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Button from '../components/Button.jsx';
import FormField, { inputClass } from '../components/FormField.jsx';
import Loading from '../components/Loading.jsx';
import { api } from '../services/api.js';

const emptyForm = {
  responsable: { dni: '', nombre: '', apellidos: '', telefono: '', email: '', direccion: '' },
  fallecido: { dni: '', nombre: '', apellidos: '', fecha_defuncion: '', lugar_defuncion: '' }
};

export default function ExpedienteFormPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    responsable: { ...emptyForm.responsable, dni: params.get('dni') || '' }
  }));
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const response = await api.obtenerExpediente(id);
        const expediente = response.data;
        setForm({
          responsable: expediente.responsable,
          fallecido: {
            ...expediente.fallecido,
            fecha_defuncion: expediente.fallecido.fecha_defuncion ? expediente.fallecido.fecha_defuncion.slice(0, 10) : ''
          }
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function updateGroup(group, key, value) {
    setForm((current) => ({ ...current, [group]: { ...current[group], [key]: value } }));
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = id ? await api.actualizarExpediente(id, form) : await api.crearExpediente(form);
      navigate(`/ordenes/nueva?expedienteId=${response.data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="surface p-6 lg:p-7">
        <h1 className="page-title">{id ? 'Editar expediente' : 'Nuevo expediente'}</h1>
        <p className="mt-2 text-sm text-slate-500">Separa claramente familiar responsable y persona fallecida para evitar errores documentales.</p>
      </section>
      <Alert type="error">{error}</Alert>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Familiar responsable</h2>
          <div className="space-y-4">
            <FormField label="DNI/NIE"><input className={inputClass} value={form.responsable.dni} onChange={(e) => updateGroup('responsable', 'dni', e.target.value)} required /></FormField>
            <FormField label="Nombre"><input className={inputClass} value={form.responsable.nombre} onChange={(e) => updateGroup('responsable', 'nombre', e.target.value)} required /></FormField>
            <FormField label="Apellidos"><input className={inputClass} value={form.responsable.apellidos} onChange={(e) => updateGroup('responsable', 'apellidos', e.target.value)} required /></FormField>
            <FormField label="Teléfono"><input className={inputClass} value={form.responsable.telefono || ''} onChange={(e) => updateGroup('responsable', 'telefono', e.target.value)} /></FormField>
            <FormField label="Email"><input className={inputClass} type="email" value={form.responsable.email || ''} onChange={(e) => updateGroup('responsable', 'email', e.target.value)} /></FormField>
            <FormField label="Dirección"><input className={inputClass} value={form.responsable.direccion || ''} onChange={(e) => updateGroup('responsable', 'direccion', e.target.value)} /></FormField>
          </div>
        </section>
        <section className="surface p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Persona fallecida</h2>
          <div className="space-y-4">
            <FormField label="DNI/NIE"><input className={inputClass} value={form.fallecido.dni || ''} onChange={(e) => updateGroup('fallecido', 'dni', e.target.value)} /></FormField>
            <FormField label="Nombre"><input className={inputClass} value={form.fallecido.nombre} onChange={(e) => updateGroup('fallecido', 'nombre', e.target.value)} required /></FormField>
            <FormField label="Apellidos"><input className={inputClass} value={form.fallecido.apellidos} onChange={(e) => updateGroup('fallecido', 'apellidos', e.target.value)} required /></FormField>
            <FormField label="Fecha de defunción"><input className={inputClass} type="date" value={form.fallecido.fecha_defuncion || ''} onChange={(e) => updateGroup('fallecido', 'fecha_defuncion', e.target.value)} /></FormField>
            <FormField label="Lugar de defunción"><input className={inputClass} value={form.fallecido.lugar_defuncion || ''} onChange={(e) => updateGroup('fallecido', 'lugar_defuncion', e.target.value)} /></FormField>
          </div>
        </section>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => navigate('/expedientes/buscar')}>Cancelar</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar y crear orden'}</Button>
      </div>
    </form>
  );
}
