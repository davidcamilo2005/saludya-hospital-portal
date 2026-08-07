import axios from "axios";

const TOKEN_KEY = "saludya_token";
const ROL_KEY = "saludya_rol";

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getRol: () => localStorage.getItem(ROL_KEY),
  setSession: (token, rol) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROL_KEY, rol);
  },
  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROL_KEY);
  },
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Interceptor de request: adjunta el JWT si existe (manejo centralizado, Fase 1 §13).
apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de response: normaliza el mensaje de error y limpia la sesión en 401.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const mensaje =
      error.response?.data?.detail ||
      "Ocurrió un error inesperado. Intenta nuevamente.";

    if (error.response?.status === 401) {
      authStorage.clearSession();
    }

    return Promise.reject(new Error(mensaje));
  }
);

export default apiClient;
