import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Button from '../components/Button.jsx';
import FormField, { inputClass } from '../components/FormField.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.09)] lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#23393a] p-10 text-white lg:flex">
          <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full border border-white/10 bg-white/[0.03]" aria-hidden="true" />
          <div className="absolute -bottom-32 left-16 h-72 w-72 rounded-full border border-white/10" aria-hidden="true" />
          <div className="relative">
            <div className="mb-14 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-sm font-bold tracking-wide">MF</div>
              <div>
                <p className="text-xl font-semibold">Memora Flow</p>
                <p className="text-sm text-white/60">Gestión interna asistida</p>
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/55">Operativa funeraria</p>
            <h1 className="mt-5 max-w-md text-4xl font-semibold leading-tight tracking-tight">Información ordenada para una gestión más precisa.</h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/70">Expedientes, órdenes, productos, presupuesto y documentación en un flujo interno sobrio y verificable.</p>
          </div>
          <div className="relative grid grid-cols-3 gap-3 text-xs">
            {['Expedientes', 'Presupuesto', 'PDF final'].map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/[0.06] p-3 text-white/80">{item}</div>
            ))}
          </div>
        </section>
        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#314b4c] text-sm font-bold text-white">MF</div>
              <h1 className="text-2xl font-semibold text-slate-900">Memora Flow</h1>
            </div>
            <p className="eyebrow">Acceso protegido</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Inicio de sesión</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Introduce tus credenciales internas para acceder al sistema.</p>
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <Alert type="error">{error}</Alert>
              <FormField label="Correo electrónico" required>
                <input className={inputClass} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </FormField>
              <FormField label="Contraseña" required>
                <input className={inputClass} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </FormField>
              <Button className="w-full" size="lg" type="submit" disabled={loading}>
                {loading ? 'Comprobando acceso...' : 'Acceder al sistema'}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
