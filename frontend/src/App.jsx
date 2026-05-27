import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import BuscarExpedientePage from './pages/BuscarExpedientePage.jsx';
import ExpedienteFormPage from './pages/ExpedienteFormPage.jsx';
import OrdenWizardPage from './pages/OrdenWizardPage.jsx';
import OrdenesPage from './pages/OrdenesPage.jsx';
import ResumenOrdenPage from './pages/ResumenOrdenPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import CatalogosPage from './pages/CatalogosPage.jsx';
import PersonalPedidosPage from './pages/PersonalPedidosPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="/expedientes/buscar" element={<BuscarExpedientePage />} />
        <Route path="/expedientes/nuevo" element={<ExpedienteFormPage />} />
        <Route path="/expedientes/:id/editar" element={<ExpedienteFormPage />} />
        <Route path="/ordenes" element={<OrdenesPage />} />
        <Route path="/ordenes/nueva" element={<OrdenWizardPage />} />
        <Route path="/ordenes/:id/resumen" element={<ResumenOrdenPage />} />
        <Route path="/catalogos" element={<ProtectedRoute roles={["asesor", "recepcion"]}><CatalogosPage /></ProtectedRoute>} />
        <Route path="/seguimiento/personal" element={<ProtectedRoute roles={["gerencia"]}><PersonalPedidosPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={["administrador"]}><AdminPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
