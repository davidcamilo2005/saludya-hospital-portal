import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { Alert, Button, Card, FormField, Input } from "../../components/ui";
import { AuthIllustration } from "../../components/illustrations";
import { validarRegistro } from "../../utils/validadores";

const FORM_INICIAL = {
  nombre: "",
  apellido: "",
  email: "",
  documento_identidad: "",
  telefono: "",
  direccion: "",
  fecha_nacimiento: "",
  password: "",
  confirmarPassword: "",
};

export default function RegistroPage() {
  const { registrar } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(FORM_INICIAL);
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState("");
  const [enviando, setEnviando] = useState(false);

  const actualizar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    setErrorApi("");
    const erroresValidacion = validarRegistro(form);
    setErrores(erroresValidacion);
    if (Object.keys(erroresValidacion).length > 0) return;

    setEnviando(true);
    try {
      const datos = {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        documento_identidad: form.documento_identidad,
        telefono: form.telefono || null,
        direccion: form.direccion || null,
        fecha_nacimiento: form.fecha_nacimiento || null,
        password: form.password,
      };
      await registrar(datos);
      navigate("/login", { state: { registroExitoso: true } });
    } catch (err) {
      setErrorApi(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col justify-center px-4 py-16">
      <AuthIllustration className="mx-auto mb-6 h-28 w-28 animate-fade-in-up" />
      <Card className="animate-fade-in-up p-8" style={{ animationDelay: "100ms" }}>
        <h1 className="text-2xl font-bold text-slate-900">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-slate-500">
          Regístrate para agendar y gestionar tus citas médicas en línea.
        </p>

        <form onSubmit={enviar} className="mt-6 space-y-4" noValidate>
          {errorApi && <Alert tone="danger">{errorApi}</Alert>}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nombre" htmlFor="nombre" error={errores.nombre}>
              <Input id="nombre" value={form.nombre} onChange={actualizar("nombre")} />
            </FormField>
            <FormField label="Apellido" htmlFor="apellido" error={errores.apellido}>
              <Input id="apellido" value={form.apellido} onChange={actualizar("apellido")} />
            </FormField>
          </div>

          <FormField label="Correo electrónico" htmlFor="email" error={errores.email}>
            <Input id="email" type="email" value={form.email} onChange={actualizar("email")} />
          </FormField>

          <FormField
            label="Documento de identidad"
            htmlFor="documento_identidad"
            error={errores.documento_identidad}
          >
            <Input
              id="documento_identidad"
              value={form.documento_identidad}
              onChange={actualizar("documento_identidad")}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Teléfono (opcional)" htmlFor="telefono">
              <Input id="telefono" value={form.telefono} onChange={actualizar("telefono")} />
            </FormField>
            <FormField label="Fecha de nacimiento (opcional)" htmlFor="fecha_nacimiento">
              <Input
                id="fecha_nacimiento"
                type="date"
                value={form.fecha_nacimiento}
                onChange={actualizar("fecha_nacimiento")}
              />
            </FormField>
          </div>

          <FormField label="Dirección (opcional)" htmlFor="direccion">
            <Input id="direccion" value={form.direccion} onChange={actualizar("direccion")} />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Contraseña" htmlFor="password" error={errores.password}>
              <Input id="password" type="password" value={form.password} onChange={actualizar("password")} />
            </FormField>
            <FormField
              label="Confirmar contraseña"
              htmlFor="confirmarPassword"
              error={errores.confirmarPassword}
            >
              <Input
                id="confirmarPassword"
                type="password"
                value={form.confirmarPassword}
                onChange={actualizar("confirmarPassword")}
              />
            </FormField>
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={enviando}>
            {enviando ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}
