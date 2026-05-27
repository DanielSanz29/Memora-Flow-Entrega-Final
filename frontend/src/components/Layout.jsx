import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Button from './Button.jsx';

const baseItems = [
  { to: '/', label: 'Panel principal', mobileLabel: 'Panel', end: true },
  { to: '/expedientes/buscar', label: 'Expedientes', mobileLabel: 'Expedientes' },
  { to: '/ordenes', label: 'Órdenes', mobileLabel: 'Órdenes', end: true },
  { to: '/ordenes/nueva', label: 'Nueva orden', mobileLabel: 'Nueva orden' }
];

function navigationItems(user) {
  const roleItems = [];
  if (['asesor', 'recepcion'].includes(user?.rol)) {
    roleItems.push({ to: '/catalogos', label: 'Ver catálogos', mobileLabel: 'Catálogos' });
  }
  if (user?.rol === 'gerencia') {
    roleItems.push({ to: '/seguimiento/personal', label: 'Funerarios y recepción', mobileLabel: 'Personal' });
  }
  return [...baseItems, ...roleItems];
}

const linkClass = ({ isActive }) =>
  `group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${isActive
    ? 'bg-[#314b4c] text-white shadow-sm'
    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`;

const mobileLinkClass = ({ isActive }) =>
  `whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition ${isActive
    ? 'bg-[#314b4c] text-white'
    : 'border border-slate-200 bg-white text-slate-600'}`;

function NavMenu({ user }) {
  return (
    <nav aria-label="Navegación principal" className="space-y-1.5">
      {navigationItems(user).map((item) => (
        <NavLink key={item.to} end={item.end} to={item.to} className={linkClass}>
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
          {item.label}
        </NavLink>
      ))}
      {user?.rol === 'administrador' && (
        <NavLink to="/admin" className={linkClass}>
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
          Administración
        </NavLink>
      )}
    </nav>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200/80 bg-white/95 p-5 backdrop-blur lg:flex lg:flex-col">
        <div className="mb-8 flex items-center gap-3 px-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#314b4c] text-sm font-bold tracking-wide text-white">MF</div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">Memora Flow</h1>
            <p className="text-xs text-slate-500">Gestión asistida interna</p>
          </div>
        </div>
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Operativa</p>
        <NavMenu user={user} />
        <div className="mt-auto surface-muted p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
              {(user?.nombre || 'U').slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{user?.nombre}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="truncate rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">{user?.rol}</span>
            <Button size="sm" variant="ghost" onClick={handleLogout}>Salir</Button>
          </div>
        </div>
      </aside>
      <main className="lg:pl-72">
        <header className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#314b4c] text-xs font-bold text-white">MF</div>
              <div>
                <p className="font-semibold text-slate-900">Memora Flow</p>
                <p className="text-xs text-slate-500">{user?.nombre}</p>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={handleLogout}>Cerrar sesión</Button>
          </div>
          <nav aria-label="Navegación móvil" className="mx-auto mt-4 flex max-w-6xl gap-2 overflow-x-auto pb-1">
            {navigationItems(user).map((item) => (
              <NavLink key={item.to} end={item.end} to={item.to} className={mobileLinkClass}>{item.mobileLabel}</NavLink>
            ))}
            {user?.rol === 'administrador' && <NavLink to="/admin" className={mobileLinkClass}>Administración</NavLink>}
          </nav>
        </header>
        <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
