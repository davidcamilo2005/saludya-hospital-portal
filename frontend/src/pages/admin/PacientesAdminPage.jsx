import { useEffect, useState } from "react";

import { pacientesApi } from "../../api/endpoints";
import { Alert, Badge, Button, Card, EmptyState, PageLoader } from "../../components/ui";

export default function PacientesAdminPage() {
  const [pacientes, setPacientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const cargar = () => {
    setCargando(true);
    pacientesApi
      .listarAdmin()
      .then(setPacientes)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const desactivar = async (paciente) => {
    setError("");
    try {
      await pacientesApi.desactivarAdmin(paciente.id);
      setExito(`Cuenta de ${paciente.usuario.nombre} ${paciente.usuario.apellido} desactivada.`);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  if (cargando) return <PageLoader label="Cargando pacientes..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Pacientes</h1>
      <p className="mt-1 text-sm text-slate-500">Listado de pacientes registrados en la plataforma.</p>

      {exito && <div className="mt-4"><Alert tone="success">{exito}</Alert></div>}
      {error && <div className="mt-4"><Alert tone="danger">{error}</Alert></div>}

      <div className="mt-6">
        {pacientes.length === 0 ? (
          <EmptyState title="No hay pacientes registrados" />
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Correo</th>
                  <th className="px-4 py-3">Documento</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pacientes.map((paciente) => (
                  <tr key={paciente.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {paciente.usuario.nombre} {paciente.usuario.apellido}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{paciente.usuario.email}</td>
                    <td className="px-4 py-3 text-slate-500">{paciente.documento_identidad}</td>
                    <td className="px-4 py-3 text-slate-500">{paciente.telefono || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge tone={paciente.usuario.is_active ? "success" : "slate"}>
                        {paciente.usuario.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {paciente.usuario.is_active && (
                        <Button variant="danger" onClick={() => desactivar(paciente)}>
                          Desactivar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
