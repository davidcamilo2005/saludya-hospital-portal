import { useEffect, useMemo, useState } from "react";

import { medicosApi } from "../../api/endpoints";
import { Alert, Badge, Card, EmptyState, PageLoader, Select, SectionHeading } from "../../components/ui";

export default function MedicosPage() {
  const [medicos, setMedicos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("todas");

  useEffect(() => {
    medicosApi
      .listarPublicos()
      .then(setMedicos)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  const especialidadesDisponibles = useMemo(() => {
    const nombres = new Set();
    medicos.forEach((m) => m.especialidades.forEach((e) => nombres.add(e.nombre)));
    return Array.from(nombres).sort();
  }, [medicos]);

  const medicosFiltrados = useMemo(() => {
    if (filtroEspecialidad === "todas") return medicos;
    return medicos.filter((m) => m.especialidades.some((e) => e.nombre === filtroEspecialidad));
  }, [medicos, filtroEspecialidad]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <SectionHeading
        eyebrow="Nuestro equipo"
        title="Médicos"
        description="Filtra por especialidad y elige con quién agendar tu próxima cita."
      />

      {!cargando && !error && especialidadesDisponibles.length > 0 && (
        <div className="mx-auto mt-8 max-w-xs">
          <Select value={filtroEspecialidad} onChange={(e) => setFiltroEspecialidad(e.target.value)}>
            <option value="todas">Todas las especialidades</option>
            {especialidadesDisponibles.map((nombre) => (
              <option key={nombre} value={nombre}>
                {nombre}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="mt-8">
        {cargando && <PageLoader label="Cargando médicos..." />}
        {!cargando && error && <Alert tone="danger">{error}</Alert>}
        {!cargando && !error && medicosFiltrados.length === 0 && (
          <EmptyState title="No hay médicos que coincidan con el filtro" />
        )}
        {!cargando && !error && medicosFiltrados.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {medicosFiltrados.map((medico) => (
              <Card key={medico.id} className="p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl">
                    🩺
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">
                      Dr(a). {medico.nombre} {medico.apellido}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {medico.especialidades.map((esp) => (
                    <Badge key={esp.id} tone="blue">
                      {esp.nombre}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
