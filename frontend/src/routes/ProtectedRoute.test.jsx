import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import * as AuthContext from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

function renderConRuta({ initialEntries = ["/privado"] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<p>Página de login</p>} />
        <Route path="/" element={<p>Página de inicio</p>} />
        <Route element={<ProtectedRoute rolRequerido="paciente" />}>
          <Route path="/privado" element={<p>Contenido protegido</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("muestra un loader mientras se verifica la sesión", () => {
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({ isAuthenticated: false, user: null, loading: true });
    renderConRuta();
    expect(screen.getByText("Verificando sesión...")).toBeInTheDocument();
  });

  it("redirige a /login si no hay sesión activa", () => {
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({ isAuthenticated: false, user: null, loading: false });
    renderConRuta();
    expect(screen.getByText("Página de login")).toBeInTheDocument();
  });

  it("redirige a / si el rol del usuario no coincide con el requerido", () => {
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({
      isAuthenticated: true,
      user: { rol: "administrador" },
      loading: false,
    });
    renderConRuta();
    expect(screen.getByText("Página de inicio")).toBeInTheDocument();
  });

  it("renderiza el contenido protegido si el usuario tiene el rol correcto", () => {
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({
      isAuthenticated: true,
      user: { rol: "paciente" },
      loading: false,
    });
    renderConRuta();
    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
  });

  it("permite el acceso sin restricción de rol cuando rolRequerido no se especifica", () => {
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({
      isAuthenticated: true,
      user: { rol: "administrador" },
      loading: false,
    });
    render(
      <MemoryRouter initialEntries={["/cualquiera"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/cualquiera" element={<p>Contenido para cualquier rol</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Contenido para cualquier rol")).toBeInTheDocument();
  });
});
