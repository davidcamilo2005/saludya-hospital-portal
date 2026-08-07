import apiClient from "./client";

export const authApi = {
  registrar: (data) => apiClient.post("/auth/register", data).then((r) => r.data),
  login: (data) => apiClient.post("/auth/login", data).then((r) => r.data),
  perfilActual: () => apiClient.get("/auth/me").then((r) => r.data),
};

export const especialidadesApi = {
  listarPublicas: () => apiClient.get("/especialidades").then((r) => r.data),
  listarTodasAdmin: () => apiClient.get("/especialidades/admin/todas").then((r) => r.data),
  obtener: (id) => apiClient.get(`/especialidades/${id}`).then((r) => r.data),
  crear: (data) => apiClient.post("/especialidades", data).then((r) => r.data),
  actualizar: (id, data) => apiClient.put(`/especialidades/${id}`, data).then((r) => r.data),
  desactivar: (id) => apiClient.delete(`/especialidades/${id}`).then((r) => r.data),
};

export const medicosApi = {
  listarPublicos: () => apiClient.get("/medicos").then((r) => r.data),
  listarTodosAdmin: () => apiClient.get("/medicos/admin/todos").then((r) => r.data),
  obtener: (id) => apiClient.get(`/medicos/${id}`).then((r) => r.data),
  crear: (data) => apiClient.post("/medicos", data).then((r) => r.data),
  actualizar: (id, data) => apiClient.put(`/medicos/${id}`, data).then((r) => r.data),
  desactivar: (id) => apiClient.delete(`/medicos/${id}`).then((r) => r.data),
};

export const pacientesApi = {
  obtenerMiPerfil: () => apiClient.get("/pacientes/me").then((r) => r.data),
  actualizarMiPerfil: (data) => apiClient.put("/pacientes/me", data).then((r) => r.data),
  listarAdmin: (params) => apiClient.get("/pacientes", { params }).then((r) => r.data),
  obtenerAdmin: (id) => apiClient.get(`/pacientes/${id}`).then((r) => r.data),
  desactivarAdmin: (id) => apiClient.patch(`/pacientes/${id}/desactivar`).then((r) => r.data),
};

export const citasApi = {
  agendar: (data) => apiClient.post("/citas", data).then((r) => r.data),
  misCitas: () => apiClient.get("/citas/me").then((r) => r.data),
  cancelar: (id, motivo_cancelacion) =>
    apiClient.patch(`/citas/${id}/cancelar`, { motivo_cancelacion }).then((r) => r.data),
  listarAdmin: (params) => apiClient.get("/citas", { params }).then((r) => r.data),
  cancelarAdmin: (id, motivo_cancelacion) =>
    apiClient.patch(`/citas/${id}/cancelar/admin`, { motivo_cancelacion }).then((r) => r.data),
};

export const dashboardApi = {
  stats: () => apiClient.get("/dashboard/stats").then((r) => r.data),
};
