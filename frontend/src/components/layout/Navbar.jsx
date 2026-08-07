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
  return `group relative rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
    isActive ? "text-blue-700" : "text-slate-600 hover:text-blue-700"
  }`;
}

/** Subrayado animado: crece desde el centro al pasar el mouse o en la ruta activa. */
function Subrayado({ isActive }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-2 -bottom-0.5 h-0.5 origin-center scale-x-0 rounded-full bg-blue-600 transition-transform duration-200 ease-out group-hover:scale-x-100 ${
        isActive ? "scale-x-100" : ""
      }`}
    />
  );
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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur transition-shadow duration-300">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-bold text-blue-700 transition-transform duration-200 hover:scale-105"
        >
          <span aria-hidden="true" className="inline-block animate-float text-xl">
            🏥
          </span>
          SaludYa
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {enlaces.map((enlace) => (
            <NavLink key={enlace.to} to={enlace.to} className={linkClasses} end={enlace.to === "/"}>
              {({ isActive }) => (
                <>
                  {enlace.label}
                  <Subrayado isActive={isActive} />
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                to={cuentaHref}
                className="text-sm font-medium text-slate-700 transition-colors duration-200 hover:text-blue-700"
              >
                Hola, {user.nombre}
              </Link>
              <Button variant="outline" onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-700 transition-colors duration-200 hover:text-blue-700"
              >
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
          className="text-2xl text-slate-600 transition-transform duration-200 md:hidden"
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuAbierto}
          onClick={() => setMenuAbierto((v) => !v)}
        >
          <span className={`inline-block transition-transform duration-300 ${menuAbierto ? "rotate-90" : ""}`}>
            {menuAbierto ? "✕" : "☰"}
          </span>
        </button>
      </nav>

      {/* El menú móvil siempre está montado (para poder animarlo con
          transición de altura/opacidad) pero colapsado cuando está cerrado. */}
      <div
        className={`grid overflow-hidden border-t border-slate-200 bg-white transition-all duration-300 ease-out md:hidden ${
          menuAbierto ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] border-t-0 opacity-0"
        }`}
      >
        <div className="min-h-0 px-4 py-3">
          <div className="flex flex-col gap-1">
            {enlaces.map((enlace) => (
              <NavLink
                key={enlace.to}
                to={enlace.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
                  }`
                }
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
      </div>
    </header>
  );
}
