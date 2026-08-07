import { Route, Routes } from "react-router-dom";

import DashboardLayout from "./components/layout/DashboardLayout";
import PublicLayout from "./components/layout/PublicLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import LandingPage from "./pages/public/LandingPage";
import EspecialidadesPage from "./pages/public/EspecialidadesPage";
import MedicosPage from "./pages/public/MedicosPage";
import ContactoPage from "./pages/public/ContactoPage";
import FaqPage from "./pages/public/FaqPage";
import LoginPage from "./pages/auth/LoginPage";
import RegistroPage from "./pages/auth/RegistroPage";

import PerfilPage from "./pages/paciente/PerfilPage";
import AgendarCitaPage from "./pages/paciente/AgendarCitaPage";
import MisCitasPage from "./pages/paciente/MisCitasPage";

import DashboardPage from "./pages/admin/DashboardPage";
import MedicosAdminPage from "./pages/admin/MedicosAdminPage";
import EspecialidadesAdminPage from "./pages/admin/EspecialidadesAdminPage";
import CitasAdminPage from "./pages/admin/CitasAdminPage";
import PacientesAdminPage from "./pages/admin/PacientesAdminPage";

import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      {/* Módulo público (Fase 1: Epic 1) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/especialidades" element={<EspecialidadesPage />} />
        <Route path="/medicos" element={<MedicosPage />} />
        <Route path="/contacto" element={<ContactoPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />
      </Route>

      {/* Módulo paciente (Fase 1: Epic 2 y 3) */}
      <Route element={<ProtectedRoute rolRequerido="paciente" />}>
        <Route element={<DashboardLayout />}>
          <Route path="/paciente/perfil" element={<PerfilPage />} />
          <Route path="/paciente/agendar" element={<AgendarCitaPage />} />
          <Route path="/paciente/citas" element={<MisCitasPage />} />
        </Route>
      </Route>

      {/* Módulo administrador (Fase 1: Epic 4) */}
      <Route element={<ProtectedRoute rolRequerido="administrador" />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/citas" element={<CitasAdminPage />} />
          <Route path="/admin/medicos" element={<MedicosAdminPage />} />
          <Route path="/admin/especialidades" element={<EspecialidadesAdminPage />} />
          <Route path="/admin/pacientes" element={<PacientesAdminPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
