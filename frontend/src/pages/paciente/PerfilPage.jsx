import { useEffect, useState } from "react";

import { pacientesApi } from "../../api/endpoints";
import { Alert, Button, Card, FormField, Input, PageLoader } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

export default function PerfilPage() {
  const { setUser } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    pacientesApi
      .obtenerMiPerfil()
      .then((data) => {
        setPerfil(data);
        setForm({
          nombre: data.usuario.nombre,
          apellido: data.usuario.apellido,
          telefono: data.telefono || "",
          direccion: data.direccion || "",
          fecha_nacimiento: data.fecha_nacimiento || "",
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  const actualizar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const guardar = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");
    setGuardando(true);
    try {
      const actualizado = await pacientesApi.actualizarMiPerfil({
        ...form,
        fecha_nacimiento: form.fecha_nacimiento || null,
      });
      setPerfil(actualizado);
      setUser((u) => ({ ...u, nombre: actualizado.usuario.nombre, apellido: actualizado.usuario.apellido }));
      setExito("Perfil actualizado correctamente.");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <PageLoader label="Cargando tu perfil..." />;
  if (!perfil) return <Alert tone="danger">{error || "No se pudo cargar el perfil."}</Alert>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Mi perfil</h1>
      <p className="mt-1 text-sm text-slate-500">Mantén tus datos de contacto actualizados.</p>

      <Card className="mt-6 p-6">
        <form onSubmit={guardar} className="space-y-4">
          {exito && <Alert tone="success">{exito}</Alert>}
          {error && <Alert tone="danger">{error}</Alert>}

          <FormField label="Correo electrónico">
            <Input value={perfil.usuario.email} disabled />
          </FormField>

          <FormField label="Documento de identidad">
            <Input value={perfil.documento_identidad} disabled />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nombre" htmlFor="nombre">
              <Input id="nombre" value={form.nombre} onChange={actualizar("nombre")} />
            </FormField>
            <FormField label="Apellido" htmlFor="apellido">
              <Input id="apellido" value={form.apellido} onChange={actualizar("apellido")} />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Teléfono" htmlFor="telefono">
              <Input id="telefono" value={form.telefono} onChange={actualizar("telefono")} />
            </FormField>
            <FormField label="Fecha de nacimiento" htmlFor="fecha_nacimiento">
              <Input
                id="fecha_nacimiento"
                type="date"
                value={form.fecha_nacimiento}
                onChange={actualizar("fecha_nacimiento")}
              />
            </FormField>
          </div>

          <FormField label="Dirección" htmlFor="direccion">
            <Input id="direccion" value={form.direccion} onChange={actualizar("direccion")} />
          </FormField>

          <Button type="submit" variant="primary" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
