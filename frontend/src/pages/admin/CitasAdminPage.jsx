import { useEffect, useState } from "react";

import { citasApi } from "../../api/endpoints";
import {
  Alert,
  Button,
  Card,
  EmptyState,
  EstadoCitaBadge,
  Input,
  Modal,
  PageLoader,
  Select,
  Textarea,
} from "../../components/ui";

const ESTADOS = [
  { value: "", label: "Todos los estados" },
  { value: "pendiente", label: "Pendiente" },
  { value: "completada", label: "Completada" },
  { value: "cancelada", label: "Cancelada" },
];

export default function CitasAdminPage() {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [filtros, setFiltros] = useState({ estado: "", fecha: "" });

  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [cancelando, setCancelando] = useState(false);

  const cargar = () => {
    setCargando(true);
    const params = {};
    if (filtros.estado) params.estado = filtros.estado;
    if (filtros.fecha) params.fecha = filtros.fecha;
    citasApi
      .listarAdmin(params)
      .then(setCitas)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, [filtros]);

  const confirmarCancelacion = async () => {
    setCancelando(true);
    try {
      await citasApi.cancelarAdmin(citaSeleccionada.id, motivo || null);
      setExito("Cita cancelada correctamente.");
      setCitaSeleccionada(null);
      setMotivo("");
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelando(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Gestión de citas</h1>
      <p className="mt-1 text-sm text-slate-500">Consulta y administra todas las citas del hospital.</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Select
          className="max-w-xs"
          value={filtros.estado}
          onChange={(e) => setFiltros((f) => ({ ...f, estado: e.target.value }))}
        >
          {ESTADOS.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </Select>
        <Input
          type="date"
          className="max-w-xs"
          value={filtros.fecha}
          onChange={(e) => setFiltros((f) => ({ ...f, fecha: e.target.value }))}
        />
      </div>

      {exito && <div className="mt-4"><Alert tone="success">{exito}</Alert></div>}
      {error && <div className="mt-4"><Alert tone="danger">{error}</Alert></div>}

      <div className="mt-6">
        {cargando ? (
          <PageLoader label="Cargando citas..." />
        ) : citas.length === 0 ? (
          <EmptyState title="No hay citas para los filtros seleccionados" />
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Médico</th>
                  <th className="px-4 py-3">Especialidad</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {citas.map((cita) => (
                  <tr key={cita.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      Dr(a). {cita.medico.nombre} {cita.medico.apellido}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{cita.especialidad.nombre}</td>
                    <td className="px-4 py-3 text-slate-500">{cita.fecha}</td>
                    <td className="px-4 py-3 text-slate-500">{cita.hora.slice(0, 5)}</td>
                    <td className="px-4 py-3"><EstadoCitaBadge estado={cita.estado} /></td>
                    <td className="px-4 py-3 text-right">
                      {cita.estado === "pendiente" && (
                        <Button variant="danger" onClick={() => setCitaSeleccionada(cita)}>
                          Cancelar
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

      <Modal open={Boolean(citaSeleccionada)} title="Cancelar cita" onClose={() => setCitaSeleccionada(null)}>
        <p className="text-sm text-slate-600">
          Esta acción cancelará la cita y notificará el motivo al registro del paciente.
        </p>
        <div className="mt-4">
          <Textarea
            placeholder="Motivo de la cancelación"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setCitaSeleccionada(null)}>
            Volver
          </Button>
          <Button variant="danger" onClick={confirmarCancelacion} disabled={cancelando}>
            {cancelando ? "Cancelando..." : "Confirmar cancelación"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
