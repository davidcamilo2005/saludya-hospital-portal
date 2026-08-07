import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui";

const enlacesPaciente = [
  { to: "/paciente/citas", label: "Mis citas" },
  { to: "/paciente/agendar", label: "Agendar cita" },
  { to: "/paciente/perfil", label: "Mi perfil" },
];

const enlacesAdmin = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/citas", label: "Citas" },
  { to: "/admin/medicos", label: "Médicos" },
  { to: "/admin/especialidades", label: "Especialidades" },
  { to: "/admin/pacientes", label: "Pacientes" },
];

function itemClasses({ isActive }) {
  return `block rounded-lg px-3 py-2 text-sm font-medium ${
    isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
  }`;
}

export default function DashboardLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const enlaces = isAdmin ? enlacesAdmin : enlacesPaciente;

  const cerrarSesion = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
        <Link to="/" className="mb-6 flex items-center gap-2 text-lg font-bold text-blue-700">
          🏥 SaludYa
        </Link>
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {isAdmin ? "Panel administrador" : "Mi cuenta"}
        </p>
        <nav className="space-y-1">
          {enlaces.map((enlace) => (
            <NavLink key={enlace.to} to={enlace.to} end className={itemClasses}>
              {enlace.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
          <div>
            <p className="text-sm text-slate-500">Bienvenido/a</p>
            <p className="font-semibold text-slate-900">
              {user?.nombre} {user?.apellido}
            </p>
          </div>
          <Button variant="outline" onClick={cerrarSesion}>
            Cerrar sesión
          </Button>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 md:hidden">
          {enlaces.map((enlace) => (
            <NavLink
              key={enlace.to}
              to={enlace.to}
              end
              className={({ isActive }) =>
                `whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-600"
                }`
              }
            >
              {enlace.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
