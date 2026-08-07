import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui";

const enlaces = [
  { to: "/", label: "Inicio" },
  { to: "/especialidades", label: "Especialidades" },
  { to: "/medicos", label: "Médicos" },
  { to: "/contacto", label: "Contacto" },
  { to: "/faq", label: "Preguntas frecuentes" },
];

function linkClasses({ isActive }) {
  return `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "text-blue-700" : "text-slate-600 hover:text-blue-700"
  }`;
}

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();

  const cuentaHref = isAdmin ? "/admin" : "/paciente/citas";

  const cerrarSesion = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-blue-700">
          <span aria-hidden="true">🏥</span> SaludYa
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {enlaces.map((enlace) => (
            <NavLink key={enlace.to} to={enlace.to} className={linkClasses} end={enlace.to === "/"}>
              {enlace.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link to={cuentaHref} className="text-sm font-medium text-slate-700 hover:text-blue-700">
                Hola, {user.nombre}
              </Link>
              <Button variant="outline" onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-blue-700">
                Iniciar sesión
              </Link>
              <Link to="/registro">
                <Button variant="primary">Registrarme</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="text-2xl text-slate-600 md:hidden"
          aria-label="Abrir menú"
          onClick={() => setMenuAbierto((v) => !v)}
        >
          ☰
        </button>
      </nav>

      {menuAbierto && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {enlaces.map((enlace) => (
              <NavLink
                key={enlace.to}
                to={enlace.to}
                className={linkClasses}
                onClick={() => setMenuAbierto(false)}
                end={enlace.to === "/"}
              >
                {enlace.label}
              </NavLink>
            ))}
            <hr className="my-2" />
            {isAuthenticated ? (
              <>
                <Link to={cuentaHref} className="px-3 py-2 text-sm font-medium text-slate-700">
                  Hola, {user.nombre}
                </Link>
                <button
                  onClick={cerrarSesion}
                  className="px-3 py-2 text-left text-sm font-medium text-slate-700"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 text-sm font-medium text-slate-700">
                  Iniciar sesión
                </Link>
                <Link to="/registro" className="px-3 py-2 text-sm font-medium text-blue-700">
                  Registrarme
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
