import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as AuthContext from "../../context/AuthContext";
import LoginPage from "./LoginPage";

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/paciente/citas" element={<p>Mis citas del paciente</p>} />
        <Route path="/admin" element={<p>Dashboard administrador</p>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("LoginPage", () => {
  it("envía las credenciales y navega a /paciente/citas si el rol es paciente", async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue({ rol: "paciente" });
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({ login });
    renderLoginPage();

    await user.type(screen.getByLabelText("Correo electrónico"), "paciente@test.com");
    await user.type(screen.getByLabelText("Contraseña"), "Clave1234");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(login).toHaveBeenCalledWith("paciente@test.com", "Clave1234");
    expect(await screen.findByText("Mis citas del paciente")).toBeInTheDocument();
  });

  it("navega a /admin si el rol autenticado es administrador", async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue({ rol: "administrador" });
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({ login });
    renderLoginPage();

    await user.type(screen.getByLabelText("Correo electrónico"), "admin@test.com");
    await user.type(screen.getByLabelText("Contraseña"), "Admin1234");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findByText("Dashboard administrador")).toBeInTheDocument();
  });

  it("muestra el mensaje de error de la API cuando el login falla", async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockRejectedValue(new Error("Correo o contraseña incorrectos"));
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({ login });
    renderLoginPage();

    await user.type(screen.getByLabelText("Correo electrónico"), "paciente@test.com");
    await user.type(screen.getByLabelText("Contraseña"), "ClaveIncorrecta1");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findByText("Correo o contraseña incorrectos")).toBeInTheDocument();
  });
});
