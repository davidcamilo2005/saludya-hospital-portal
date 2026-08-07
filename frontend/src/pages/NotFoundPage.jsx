import { Link } from "react-router-dom";

import { Button } from "../components/ui";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl">🔎</p>
      <h1 className="text-3xl font-bold text-slate-900">Página no encontrada</h1>
      <p className="max-w-md text-slate-500">
        La página que buscas no existe o fue movida. Vuelve al inicio para continuar.
      </p>
      <Link to="/">
        <Button variant="primary">Volver al inicio</Button>
      </Link>
    </div>
  );
}
