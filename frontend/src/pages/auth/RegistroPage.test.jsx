import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as AuthContext from "../../context/AuthContext";
import RegistroPage from "./RegistroPage";

function renderRegistroPage() {
  return render(
    <MemoryRouter initialEntries={["/registro"]}>
      <Routes>
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="/login" element={<p>Página de login</p>} />
      </Routes>
    </MemoryRouter>
  );
}

async function llenarFormularioValido(user) {
  await user.type(screen.getByLabelText("Nombre"), "Ana");
  await user.type(screen.getByLabelText("Apellido"), "Pérez");
  await user.type(screen.getByLabelText("Correo electrónico"), "ana@test.com");
  await user.type(screen.getByLabelText("Documento de identidad"), "123456789");
  await user.type(screen.getByLabelText("Contraseña"), "Clave1234");
  await user.type(screen.getByLabelText("Confirmar contraseña"), "Clave1234");
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("RegistroPage", () => {
  it("no llama a la API si el formulario tiene errores de validación", async () => {
    const user = userEvent.setup();
    const registrar = vi.fn();
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({ registrar });
    renderRegistroPage();

    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(registrar).not.toHaveBeenCalled();
    expect(await screen.findByText("El nombre es obligatorio")).toBeInTheDocument();
  });

  it("muestra un error si las contraseñas no coinciden", async () => {
    const user = userEvent.setup();
    const registrar = vi.fn();
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({ registrar });
    renderRegistroPage();

    await llenarFormularioValido(user);
    await user.clear(screen.getByLabelText("Confirmar contraseña"));
    await user.type(screen.getByLabelText("Confirmar contraseña"), "OtraClave1");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(registrar).not.toHaveBeenCalled();
    expect(await screen.findByText("Las contraseñas no coinciden")).toBeInTheDocument();
  });

  it("registra al paciente y navega a /login cuando el formulario es válido", async () => {
    const user = userEvent.setup();
    const registrar = vi.fn().mockResolvedValue({ id: 1 });
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({ registrar });
    renderRegistroPage();

    await llenarFormularioValido(user);
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(registrar).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ana@test.com", documento_identidad: "123456789" })
    );
    expect(await screen.findByText("Página de login")).toBeInTheDocument();
  });

  it("muestra el error de la API si el registro falla (p. ej. correo duplicado)", async () => {
    const user = userEvent.setup();
    const registrar = vi.fn().mockRejectedValue(new Error("Ya existe una cuenta registrada con este correo"));
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({ registrar });
    renderRegistroPage();

    await llenarFormularioValido(user);
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByText("Ya existe una cuenta registrada con este correo")).toBeInTheDocument();
  });
});
