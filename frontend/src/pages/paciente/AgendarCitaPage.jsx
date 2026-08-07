import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { citasApi, especialidadesApi, medicosApi } from "../../api/endpoints";
import { Alert, Button, Card, FormField, Input, PageLoader, Select } from "../../components/ui";

// Franjas de 30 minutos entre las 7:00 y las 17:00 (regla de negocio, Fase 1).
const HORARIOS = Array.from({ length: 21 }, (_, i) => {
  const minutosTotales = 7 * 60 + i * 30;
  const horas = String(Math.floor(minutosTotales / 60)).padStart(2, "0");
  const minutos = String(minutosTotales % 60).padStart(2, "0");
  return `${horas}:${minutos}`;
});

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AgendarCitaPage() {
  const navigate = useNavigate();
  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [enviando, setEnviando] = useState(false);

  const [form, setForm] = useState({ especialidad_id: "", medico_id: "", fecha: "", hora: "" });

  useEffect(() => {
    Promise.all([especialidadesApi.listarPublicas(), medicosApi.listarPublicos()])
      .then(([esp, med]) => {
        setEspecialidades(esp);
        setMedicos(med);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  const medicosDeLaEspecialidad = useMemo(() => {
    if (!form.especialidad_id) return [];
    return medicos.filter((m) => m.especialidades.some((e) => String(e.id) === form.especialidad_id));
  }, [medicos, form.especialidad_id]);

  const actualizar = (campo) => (e) => {
    const valor = e.target.value;
    setForm((f) => ({
      ...f,
      [campo]: valor,
      ...(campo === "especialidad_id" ? { medico_id: "" } : {}),
    }));
  };

  const esDomingo = (fechaISO) => {
    if (!fechaISO) return false;
    const [anio, mes, dia] = fechaISO.split("-").map(Number);
    return new Date(anio, mes - 1, dia).getDay() === 0;
  };

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (esDomingo(form.fecha)) {
      setError("No se pueden agendar citas los domingos. Elige otro día.");
      return;
    }

    setEnviando(true);
    try {
      await citasApi.agendar({
        medico_id: Number(form.medico_id),
        especialidad_id: Number(form.especialidad_id),
        fecha: form.fecha,
        hora: `${form.hora}:00`,
      });
      setExito("¡Cita agendada correctamente!");
      setTimeout(() => navigate("/paciente/citas"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <PageLoader label="Cargando especialidades y médicos..." />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Agendar cita</h1>
      <p className="mt-1 text-sm text-slate-500">
        Horario disponible: lunes a sábado, de 7:00 a.m. a 5:00 p.m.
      </p>

      <Card className="mt-6 p-6">
        <form onSubmit={enviar} className="space-y-4">
          {exito && <Alert tone="success">{exito}</Alert>}
          {error && <Alert tone="danger">{error}</Alert>}

          <FormField label="Especialidad" htmlFor="especialidad_id">
            <Select
              id="especialidad_id"
              required
              value={form.especialidad_id}
              onChange={actualizar("especialidad_id")}
            >
              <option value="">Selecciona una especialidad</option>
              {especialidades.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.nombre}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Médico" htmlFor="medico_id">
            <Select
              id="medico_id"
              required
              disabled={!form.especialidad_id}
              value={form.medico_id}
              onChange={actualizar("medico_id")}
            >
              <option value="">
                {form.especialidad_id ? "Selecciona un médico" : "Primero elige una especialidad"}
              </option>
              {medicosDeLaEspecialidad.map((medico) => (
                <option key={medico.id} value={medico.id}>
                  Dr(a). {medico.nombre} {medico.apellido}
                </option>
              ))}
            </Select>
            {form.especialidad_id && medicosDeLaEspecialidad.length === 0 && (
              <p className="mt-1 text-sm text-slate-500">
                No hay médicos disponibles para esta especialidad por ahora.
              </p>
            )}
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Fecha" htmlFor="fecha">
              <Input
                id="fecha"
                type="date"
                required
                min={hoyISO()}
                value={form.fecha}
                onChange={actualizar("fecha")}
              />
            </FormField>
            <FormField label="Hora" htmlFor="hora">
              <Select id="hora" required value={form.hora} onChange={actualizar("hora")}>
                <option value="">Selecciona una hora</option>
                {HORARIOS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={enviando}>
            {enviando ? "Agendando..." : "Confirmar cita"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
