import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Alert, Badge, Button, EstadoCitaBadge, FormField, Input } from "./ui";

describe("Button", () => {
  it("renderiza su contenido y responde a clics", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Guardar</Button>);

    const boton = screen.getByRole("button", { name: "Guardar" });
    await user.click(boton);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("se deshabilita cuando recibe disabled", () => {
    render(<Button disabled>Enviando...</Button>);
    expect(screen.getByRole("button", { name: "Enviando..." })).toBeDisabled();
  });

  it("aplica la clase del variant solicitado", () => {
    render(<Button variant="danger">Cancelar</Button>);
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveClass("bg-red-600");
  });
});

describe("Badge", () => {
  it("renderiza el texto recibido", () => {
    render(<Badge tone="success">Activo</Badge>);
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });
});

describe("EstadoCitaBadge", () => {
  it("muestra la etiqueta correcta para una cita pendiente", () => {
    render(<EstadoCitaBadge estado="pendiente" />);
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });

  it("muestra la etiqueta correcta para una cita completada", () => {
    render(<EstadoCitaBadge estado="completada" />);
    expect(screen.getByText("Completada")).toBeInTheDocument();
  });

  it("cae al valor crudo si el estado no está mapeado", () => {
    render(<EstadoCitaBadge estado="desconocido" />);
    expect(screen.getByText("desconocido")).toBeInTheDocument();
  });
});

describe("Alert", () => {
  it("renderiza el mensaje recibido", () => {
    render(<Alert tone="danger">Ocurrió un error</Alert>);
    expect(screen.getByText("Ocurrió un error")).toBeInTheDocument();
  });
});

describe("FormField", () => {
  it("asocia el label al input mediante htmlFor/id", () => {
    render(
      <FormField label="Correo electrónico" htmlFor="email">
        <Input id="email" />
      </FormField>
    );
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
  });

  it("muestra el mensaje de error cuando se provee", () => {
    render(
      <FormField label="Correo" htmlFor="email" error="Correo inválido">
        <Input id="email" />
      </FormField>
    );
    expect(screen.getByText("Correo inválido")).toBeInTheDocument();
  });
});
