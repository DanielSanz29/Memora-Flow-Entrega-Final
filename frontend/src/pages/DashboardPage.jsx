import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function ActionCard({ title, text, to, label }) {
  return (
    <Link to={to} className="surface group p-5 transition duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
        </div>
        <span className="mt-1 text-lg text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600" aria-hidden="true">→</span>
      </div>
    </Link>
  );
}

function Stat({ label, value, description }) {
  return (
    <div className="surface-muted p-4">
      <p className="data-label">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <section className="surface overflow-hidden p-6 lg:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow">Panel de trabajo</p>
            <h1 className="page-title mt-3">Bienvenido/a, {user?.nombre}</h1>
            <p className="page-description">Gestiona expedientes y órdenes funerarias desde un flujo único, con presupuesto calculado y documento PDF de cierre.</p>
          </div>
          <span className="badge-state">Sesión activa · {user?.rol}</span>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <Stat label="Inicio del flujo" value="DNI / NIE" description="Localización del expediente" />
          <Stat label="Gestión" value="Órdenes" description="Consulta y edición de estados" />
          <Stat label="Documento" value="PDF" description="Resumen final descargable" />
        </div>
      </section>
      <section>
        <div className="mb-4">
          <p className="eyebrow">Acciones principales</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Operaciones disponibles</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ActionCard label="Expedientes" title="Buscar expediente" text="Localiza un caso por DNI/NIE o inicia un nuevo alta." to="/expedientes/buscar" />
          <ActionCard label="Órdenes" title="Historial de órdenes" text="Consulta las órdenes creadas, sus estados y abre su edición." to="/ordenes" />
          <ActionCard label="Nueva orden" title="Crear orden" text="Selecciona un expediente existente y registra un nuevo servicio." to="/ordenes/nueva" />
          {['asesor', 'recepcion'].includes(user?.rol) && <ActionCard label="Catálogos" title="Ver catálogos" text="Consulta ataúdes, flores y urnas disponibles con imagen y precio base." to="/catalogos" />}
          {user?.rol === 'gerencia' && <ActionCard label="Equipo" title="Ver funerarios y recepcionistas" text="Consulta los pedidos vinculados a cada miembro del equipo." to="/seguimiento/personal" />}
          {user?.rol === 'administrador' && <ActionCard label="Sistema" title="Administración" text="Consulta usuarios, roles, estados y catálogos." to="/admin" />}
        </div>
      </section>
    </div>
  );
}
