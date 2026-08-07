import { useEffect, useState } from "react";

import { especialidadesApi } from "../../api/endpoints";
import { Alert, Card, EmptyState, PageLoader, SectionHeading } from "../../components/ui";

export default function EspecialidadesPage() {
  const [especialidades, setEspecialidades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    especialidadesApi
      .listarPublicas()
      .then(setEspecialidades)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <SectionHeading
        eyebrow="Servicios"
        title="Especialidades médicas"
        description="Conoce las especialidades disponibles antes de agendar tu cita."
      />

      <div className="mt-10">
        {cargando && <PageLoader label="Cargando especialidades..." />}
        {!cargando && error && <Alert tone="danger">{error}</Alert>}
        {!cargando && !error && especialidades.length === 0 && (
          <EmptyState title="Aún no hay especialidades registradas" />
        )}
        {!cargando && !error && especialidades.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {especialidades.map((esp) => (
              <Card key={esp.id} className="p-5">
                <h3 className="text-lg font-semibold text-slate-900">{esp.nombre}</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {esp.descripcion || "Descripción no disponible."}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
