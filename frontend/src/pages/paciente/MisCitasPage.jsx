import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { citasApi } from "../../api/endpoints";
import {
  Alert,
  Button,
  Card,
  EmptyState,
  EstadoCitaBadge,
  Modal,
  PageLoader,
  Textarea,
} from "../../components/ui";

function CitaCard({ cita, onCancelar }) {
  const esFutura = new Date(`${cita.fecha}T${cita.hora}`) > new Date();
  const puedeCancelar = cita.estado === "pendiente" && esFutura;

  return (
    <Card className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-slate-900">
          Dr(a). {cita.medico.nombre} {cita.medico.apellido} · {cita.especialidad.nombre}
        </p>
        <p className="text-sm text-slate-500">
          {cita.fecha} a las {cita.hora.slice(0, 5)}
        </p>
        {cita.motivo_cancelacion && (
          <p className="mt-1 text-xs text-slate-400">Motivo de cancelación: {cita.motivo_cancelacion}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <EstadoCitaBadge estado={cita.estado} />
        {puedeCancelar && (
          <Button variant="danger" onClick={() => onCancelar(cita)}>
            Cancelar
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function MisCitasPage() {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [cancelando, setCancelando] = useState(false);

  const cargar = () => {
    setCargando(true);
    citasApi
      .misCitas()
      .then(setCitas)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const confirmarCancelacion = async () => {
    setCancelando(true);
    try {
      await citasApi.cancelar(citaSeleccionada.id, motivo || null);
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

  const pendientes = citas.filter((c) => c.estado === "pendiente");
  const historial = citas.filter((c) => c.estado !== "pendiente");

  if (cargando) return <PageLoader label="Cargando tus citas..." />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Mis citas</h1>
        <Link to="/paciente/agendar">
          <Button variant="primary">Agendar nueva cita</Button>
        </Link>
      </div>

      {exito && (
        <div className="mt-4">
          <Alert tone="success">{exito}</Alert>
        </div>
      )}
      {error && (
        <div className="mt-4">
          <Alert tone="danger">{error}</Alert>
        </div>
      )}

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Próximas / pendientes
        </h2>
        {pendientes.length === 0 ? (
          <EmptyState title="No tienes citas pendientes" description="Agenda una desde el botón superior." />
        ) : (
          <div className="space-y-3">
            {pendientes.map((cita) => (
              <CitaCard key={cita.id} cita={cita} onCancelar={setCitaSeleccionada} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Historial</h2>
        {historial.length === 0 ? (
          <EmptyState title="Aún no tienes historial de citas" />
        ) : (
          <div className="space-y-3">
            {historial.map((cita) => (
              <CitaCard key={cita.id} cita={cita} onCancelar={setCitaSeleccionada} />
            ))}
          </div>
        )}
      </section>

      <Modal open={Boolean(citaSeleccionada)} title="Cancelar cita" onClose={() => setCitaSeleccionada(null)}>
        <p className="text-sm text-slate-600">
          ¿Confirmas que deseas cancelar esta cita? El horario quedará disponible para otros pacientes.
        </p>
        <div className="mt-4">
          <Textarea
            placeholder="Motivo de la cancelación (opcional)"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setCitaSeleccionada(null)}>
            Volver
          </Button>
          <Button variant="danger" onClick={confirmarCancelacion} disabled={cancelando}>
            {cancelando ? "Cancelando..." : "Sí, cancelar"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
