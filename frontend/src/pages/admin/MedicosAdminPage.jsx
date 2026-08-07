import { useEffect, useState } from "react";

import { especialidadesApi, medicosApi } from "../../api/endpoints";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  FormField,
  Input,
  Modal,
  PageLoader,
} from "../../components/ui";
import { InitialsAvatar } from "../../components/illustrations";

const FORM_INICIAL = {
  nombre: "",
  apellido: "",
  documento_identidad: "",
  email: "",
  telefono: "",
  especialidad_ids: [],
};

export default function MedicosAdminPage() {
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);

  const cargar = () => {
    setCargando(true);
    Promise.all([medicosApi.listarTodosAdmin(), especialidadesApi.listarTodasAdmin()])
      .then(([med, esp]) => {
        setMedicos(med);
        setEspecialidades(esp);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm(FORM_INICIAL);
    setModalAbierto(true);
  };

  const abrirEditar = (medico) => {
    setEditando(medico);
    setForm({
      nombre: medico.nombre,
      apellido: medico.apellido,
      documento_identidad: medico.documento_identidad,
      email: medico.email || "",
      telefono: medico.telefono || "",
      especialidad_ids: medico.especialidades.map((e) => e.id),
    });
    setModalAbierto(true);
  };

  const alternarEspecialidad = (id) => {
    setForm((f) => {
      const yaSeleccionada = f.especialidad_ids.includes(id);
      return {
        ...f,
        especialidad_ids: yaSeleccionada
          ? f.especialidad_ids.filter((eid) => eid !== id)
          : [...f.especialidad_ids, id],
      };
    });
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError("");
    if (form.especialidad_ids.length === 0) {
      setError("Selecciona al menos una especialidad para el médico.");
      return;
    }
    setGuardando(true);
    try {
      const payload = { ...form, email: form.email || null, telefono: form.telefono || null };
      if (editando) {
        await medicosApi.actualizar(editando.id, payload);
        setExito("Médico actualizado correctamente.");
      } else {
        await medicosApi.crear(payload);
        setExito("Médico creado correctamente.");
      }
      setModalAbierto(false);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const desactivar = async (medico) => {
    setError("");
    try {
      await medicosApi.desactivar(medico.id);
      setExito(`Médico "${medico.nombre} ${medico.apellido}" desactivado.`);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  if (cargando) return <PageLoader label="Cargando médicos..." />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Médicos</h1>
        <Button variant="primary" onClick={abrirCrear}>
          + Nuevo médico
        </Button>
      </div>

      {exito && <div className="mt-4"><Alert tone="success">{exito}</Alert></div>}
      {error && <div className="mt-4"><Alert tone="danger">{error}</Alert></div>}

      <div className="mt-6">
        {medicos.length === 0 ? (
          <EmptyState title="No hay médicos registrados" />
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Documento</th>
                  <th className="px-4 py-3">Especialidades</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicos.map((medico) => (
                  <tr key={medico.id} className="animate-fade-in transition-colors duration-150 hover:bg-blue-50/40">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <InitialsAvatar nombre={medico.nombre} apellido={medico.apellido} size="sm" />
                        Dr(a). {medico.nombre} {medico.apellido}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{medico.documento_identidad}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {medico.especialidades.map((e) => (
                          <Badge key={e.id} tone="blue">{e.nombre}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={medico.is_active ? "success" : "slate"}>
                        {medico.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => abrirEditar(medico)}>
                          Editar
                        </Button>
                        {medico.is_active && (
                          <Button variant="danger" onClick={() => desactivar(medico)}>
                            Desactivar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      <Modal
        open={modalAbierto}
        title={editando ? "Editar médico" : "Nuevo médico"}
        onClose={() => setModalAbierto(false)}
      >
        <form onSubmit={guardar} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nombre" htmlFor="nombre">
              <Input
                id="nombre"
                required
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              />
            </FormField>
            <FormField label="Apellido" htmlFor="apellido">
              <Input
                id="apellido"
                required
                value={form.apellido}
                onChange={(e) => setForm((f) => ({ ...f, apellido: e.target.value }))}
              />
            </FormField>
          </div>

          <FormField label="Documento de identidad" htmlFor="documento_identidad">
            <Input
              id="documento_identidad"
              required
              value={form.documento_identidad}
              onChange={(e) => setForm((f) => ({ ...f, documento_identidad: e.target.value }))}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Correo (opcional)" htmlFor="email">
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </FormField>
            <FormField label="Teléfono (opcional)" htmlFor="telefono">
              <Input
                id="telefono"
                value={form.telefono}
                onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
              />
            </FormField>
          </div>

          <FormField label="Especialidades">
            <div className="flex flex-wrap gap-2">
              {especialidades.map((esp) => {
                const seleccionada = form.especialidad_ids.includes(esp.id);
                return (
                  <button
                    type="button"
                    key={esp.id}
                    onClick={() => alternarEspecialidad(esp.id)}
                    className={`rounded-full border px-3 py-1 text-sm ${
                      seleccionada
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white text-slate-600"
                    }`}
                  >
                    {esp.nombre}
                  </button>
                );
              })}
            </div>
          </FormField>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
