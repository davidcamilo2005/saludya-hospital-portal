import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { authApi } from "../api/endpoints";
import { authStorage } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .perfilActual()
      .then(setUser)
      .catch(() => {
        authStorage.clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { access_token: token, rol } = await authApi.login({ email, password });
    authStorage.setSession(token, rol);
    const perfil = await authApi.perfilActual();
    setUser(perfil);
    return perfil;
  }, []);

  const registrar = useCallback((data) => authApi.registrar(data), []);

  const logout = useCallback(() => {
    authStorage.clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isPaciente: user?.rol === "paciente",
      isAdmin: user?.rol === "administrador",
      login,
      registrar,
      logout,
      setUser,
    }),
    [user, loading, login, registrar, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
