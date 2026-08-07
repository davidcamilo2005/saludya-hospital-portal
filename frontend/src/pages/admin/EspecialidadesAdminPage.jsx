import { useEffect, useState } from "react";

import { especialidadesApi } from "../../api/endpoints";
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
  Textarea,
} from "../../components/ui";

const FORM_INICIAL = { nombre: "", descripcion: "" };

export default function EspecialidadesAdminPage() {
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
    especialidadesApi
      .listarTodasAdmin()
      .then(setEspecialidades)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm(FORM_INICIAL);
    setModalAbierto(true);
  };

  const abrirEditar = (especialidad) => {
    setEditando(especialidad);
    setForm({ nombre: especialidad.nombre, descripcion: especialidad.descripcion || "" });
    setModalAbierto(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      if (editando) {
        await especialidadesApi.actualizar(editando.id, form);
        setExito("Especialidad actualizada correctamente.");
      } else {
        await especialidadesApi.crear(form);
        setExito("Especialidad creada correctamente.");
      }
      setModalAbierto(false);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const desactivar = async (especialidad) => {
    setError("");
    try {
      await especialidadesApi.desactivar(especialidad.id);
      setExito(`Especialidad "${especialidad.nombre}" desactivada.`);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  if (cargando) return <PageLoader label="Cargando especialidades..." />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Especialidades</h1>
        <Button variant="primary" onClick={abrirCrear}>
          + Nueva especialidad
        </Button>
      </div>

      {exito && <div className="mt-4"><Alert tone="success">{exito}</Alert></div>}
      {error && <div className="mt-4"><Alert tone="danger">{error}</Alert></div>}

      <div className="mt-6">
        {especialidades.length === 0 ? (
          <EmptyState title="No hay especialidades registradas" />
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {especialidades.map((esp) => (
                  <tr key={esp.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{esp.nombre}</td>
                    <td className="px-4 py-3 text-slate-500">{esp.descripcion || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge tone={esp.is_active ? "success" : "slate"}>
                        {esp.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => abrirEditar(esp)}>
                          Editar
                        </Button>
                        {esp.is_active && (
                          <Button variant="danger" onClick={() => desactivar(esp)}>
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
        title={editando ? "Editar especialidad" : "Nueva especialidad"}
        onClose={() => setModalAbierto(false)}
      >
        <form onSubmit={guardar} className="space-y-4">
          <FormField label="Nombre" htmlFor="nombre">
            <Input
              id="nombre"
              required
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            />
          </FormField>
          <FormField label="Descripción" htmlFor="descripcion">
            <Textarea
              id="descripcion"
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
            />
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
