import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { PageLoader } from "../components/ui";

/**
 * Protege un grupo de rutas anidadas. Si `rolRequerido` se especifica,
 * también valida que el usuario autenticado tenga ese rol (HU de paciente
 * vs. HU de administrador, Fase 1).
 */
export default function ProtectedRoute({ rolRequerido }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <PageLoader label="Verificando sesión..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (rolRequerido && user?.rol !== rolRequerido) return <Navigate to="/" replace />;

  return <Outlet />;
}
