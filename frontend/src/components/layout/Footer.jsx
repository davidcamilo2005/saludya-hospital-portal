import { Link } from "react-router-dom";

import { CONTACTO } from "../../constants/institucional";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-blue-700">🏥 SaludYa</p>
          <p className="mt-2 text-sm text-slate-500">
            Portal Web de Gestión Hospitalaria. Gestiona tus citas médicas sin salir de casa.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700">Navegación</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-500">
            <li><Link to="/especialidades" className="hover:text-blue-700">Especialidades</Link></li>
            <li><Link to="/medicos" className="hover:text-blue-700">Médicos</Link></li>
            <li><Link to="/faq" className="hover:text-blue-700">Preguntas frecuentes</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700">Contacto</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-500">
            <li>{CONTACTO.direccion}</li>
            <li>{CONTACTO.telefono}</li>
            <li>{CONTACTO.email}</li>
            <li>{CONTACTO.horario}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} SaludYa. Proyecto académico con fines demostrativos.
      </div>
    </footer>
  );
}
