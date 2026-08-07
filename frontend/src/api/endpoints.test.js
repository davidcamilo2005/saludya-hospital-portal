import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient from "./client";
import { authApi, citasApi, especialidadesApi, medicosApi, pacientesApi } from "./endpoints";

vi.mock("./client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const respuestaOk = (data) => Promise.resolve({ data });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("authApi", () => {
  it("registrar hace POST a /auth/register con el payload exacto", async () => {
    apiClient.post.mockReturnValueOnce(respuestaOk({ id: 1 }));
    const datos = { email: "a@a.com", password: "Clave1234" };

    const resultado = await authApi.registrar(datos);

    expect(apiClient.post).toHaveBeenCalledWith("/auth/register", datos);
    expect(resultado).toEqual({ id: 1 });
  });

  it("login hace POST a /auth/login", async () => {
    apiClient.post.mockReturnValueOnce(respuestaOk({ access_token: "abc", rol: "paciente" }));
    await authApi.login({ email: "a@a.com", password: "Clave1234" });
    expect(apiClient.post).toHaveBeenCalledWith("/auth/login", { email: "a@a.com", password: "Clave1234" });
  });

  it("perfilActual hace GET a /auth/me", async () => {
    apiClient.get.mockReturnValueOnce(respuestaOk({ id: 1 }));
    await authApi.perfilActual();
    expect(apiClient.get).toHaveBeenCalledWith("/auth/me");
  });
});

describe("especialidadesApi", () => {
  it("listarPublicas hace GET a /especialidades", async () => {
    apiClient.get.mockReturnValueOnce(respuestaOk([]));
    await especialidadesApi.listarPublicas();
    expect(apiClient.get).toHaveBeenCalledWith("/especialidades");
  });

  it("desactivar hace DELETE a /especialidades/:id", async () => {
    apiClient.delete.mockReturnValueOnce(respuestaOk({ id: 3 }));
    await especialidadesApi.desactivar(3);
    expect(apiClient.delete).toHaveBeenCalledWith("/especialidades/3");
  });
});

describe("medicosApi", () => {
  it("crear hace POST a /medicos con el payload", async () => {
    apiClient.post.mockReturnValueOnce(respuestaOk({ id: 5 }));
    const payload = { nombre: "Ana", especialidad_ids: [1] };
    await medicosApi.crear(payload);
    expect(apiClient.post).toHaveBeenCalledWith("/medicos", payload);
  });
});

describe("citasApi", () => {
  it("agendar hace POST a /citas", async () => {
    apiClient.post.mockReturnValueOnce(respuestaOk({ id: 10 }));
    const payload = { medico_id: 1, especialidad_id: 2, fecha: "2026-01-05", hora: "09:00:00" };
    await citasApi.agendar(payload);
    expect(apiClient.post).toHaveBeenCalledWith("/citas", payload);
  });

  it("cancelar hace PATCH a /citas/:id/cancelar con el motivo", async () => {
    apiClient.patch.mockReturnValueOnce(respuestaOk({ id: 10, estado: "cancelada" }));
    await citasApi.cancelar(10, "Ya no puedo asistir");
    expect(apiClient.patch).toHaveBeenCalledWith("/citas/10/cancelar", {
      motivo_cancelacion: "Ya no puedo asistir",
    });
  });
});

describe("pacientesApi", () => {
  it("actualizarMiPerfil hace PUT a /pacientes/me", async () => {
    apiClient.put.mockReturnValueOnce(respuestaOk({ id: 1 }));
    const payload = { telefono: "+1 555 0000" };
    await pacientesApi.actualizarMiPerfil(payload);
    expect(apiClient.put).toHaveBeenCalledWith("/pacientes/me", payload);
  });
});
