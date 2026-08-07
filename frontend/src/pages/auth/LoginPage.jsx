import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { Alert, Button, Card, FormField, Input } from "../../components/ui";
import { AuthIllustration } from "../../components/illustrations";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const actualizar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const perfil = await login(form.email, form.password);
      navigate(perfil.rol === "administrador" ? "/admin" : "/paciente/citas");
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
      <AuthIllustration className="mx-auto mb-6 h-28 w-28 animate-fade-in-up" />
      <Card className="animate-fade-in-up p-8" style={{ animationDelay: "100ms" }}>
        <h1 className="text-2xl font-bold text-slate-900">Inicia sesión</h1>
        <p className="mt-1 text-sm text-slate-500">Accede a tu cuenta de SaludYa.</p>

        <form onSubmit={enviar} className="mt-6 space-y-4">
          {location.state?.registroExitoso && (
            <Alert tone="success">Cuenta creada correctamente. Ahora inicia sesión.</Alert>
          )}
          {error && <Alert tone="danger">{error}</Alert>}

          <FormField label="Correo electrónico" htmlFor="email">
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={actualizar("email")}
              placeholder="tucorreo@ejemplo.com"
            />
          </FormField>

          <FormField label="Contraseña" htmlFor="password">
            <Input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={actualizar("password")}
              placeholder="••••••••"
            />
          </FormField>

          <Button type="submit" variant="primary" className="w-full" disabled={enviando}>
            {enviando ? "Ingresando..." : "Iniciar sesión"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Aún no tienes cuenta?{" "}
          <Link to="/registro" className="font-medium text-blue-600 hover:underline">
            Regístrate
          </Link>
        </p>
      </Card>
    </div>
  );
}
