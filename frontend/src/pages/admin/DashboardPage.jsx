import { useEffect, useState } from "react";

import { dashboardApi } from "../../api/endpoints";
import { Alert, Card, EmptyState, PageLoader, Reveal } from "../../components/ui";

function StatCard({ label, valor, icono, delay }) {
  return (
    <Reveal delay={delay}>
      <Card hover className="group flex h-full items-center gap-4 p-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
          {icono}
        </span>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{valor}</p>
        </div>
      </Card>
    </Reveal>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    dashboardApi
      .stats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <PageLoader label="Cargando estadísticas..." />;
  if (error) return <Alert tone="danger">{error}</Alert>;

  const especialidades = Object.entries(stats.citas_por_especialidad);
  const maximo = Math.max(1, ...especialidades.map(([, total]) => total));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Resumen operativo del hospital en tiempo real.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Citas de hoy" valor={stats.citas_hoy} icono="📅" delay={0} />
        <StatCard label="Citas pendientes" valor={stats.citas_pendientes} icono="⏳" delay={60} />
        <StatCard label="Médicos activos" valor={stats.medicos_activos} icono="🩺" delay={120} />
        <StatCard label="Pacientes registrados" valor={stats.pacientes_registrados} icono="🧑‍🤝‍🧑" delay={180} />
      </div>

      <Card className="mt-6 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Citas activas por especialidad</h2>
        {especialidades.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Aún no hay citas registradas" />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {especialidades.map(([nombre, total]) => (
              <div key={nombre}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-700">{nombre}</span>
                  <span className="font-medium text-slate-500">{total}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-2 origin-left animate-scale-in rounded-full bg-blue-600 transition-[width] duration-700 ease-out"
                    style={{ width: `${(total / maximo) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
