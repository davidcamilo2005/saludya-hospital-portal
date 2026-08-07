import { describe, expect, it } from "vitest";

import { validarRegistro } from "./validadores";

const FORM_VALIDO = {
  nombre: "Ana",
  apellido: "Pérez",
  email: "ana@ejemplo.com",
  documento_identidad: "123456789",
  password: "Clave1234",
  confirmarPassword: "Clave1234",
};

describe("validarRegistro", () => {
  it("no devuelve errores para un formulario válido", () => {
    expect(validarRegistro(FORM_VALIDO)).toEqual({});
  });

  it("exige el nombre", () => {
    const errores = validarRegistro({ ...FORM_VALIDO, nombre: "  " });
    expect(errores.nombre).toBeDefined();
  });

  it("exige el apellido", () => {
    const errores = validarRegistro({ ...FORM_VALIDO, apellido: "" });
    expect(errores.apellido).toBeDefined();
  });

  it("rechaza un correo con formato inválido", () => {
    const errores = validarRegistro({ ...FORM_VALIDO, email: "no-es-un-correo" });
    expect(errores.email).toBeDefined();
  });

  it("exige el documento de identidad", () => {
    const errores = validarRegistro({ ...FORM_VALIDO, documento_identidad: "" });
    expect(errores.documento_identidad).toBeDefined();
  });

  it("rechaza una contraseña de menos de 8 caracteres", () => {
    const errores = validarRegistro({ ...FORM_VALIDO, password: "Abc123", confirmarPassword: "Abc123" });
    expect(errores.password).toMatch(/8 caracteres/);
  });

  it("rechaza una contraseña sin número", () => {
    const errores = validarRegistro({
      ...FORM_VALIDO,
      password: "SoloLetras",
      confirmarPassword: "SoloLetras",
    });
    expect(errores.password).toMatch(/letra y un número/);
  });

  it("rechaza una contraseña sin letra", () => {
    const errores = validarRegistro({ ...FORM_VALIDO, password: "12345678", confirmarPassword: "12345678" });
    expect(errores.password).toMatch(/letra y un número/);
  });

  it("rechaza contraseñas que no coinciden", () => {
    const errores = validarRegistro({ ...FORM_VALIDO, confirmarPassword: "OtraClave1" });
    expect(errores.confirmarPassword).toBeDefined();
  });

  it("acumula varios errores a la vez", () => {
    const errores = validarRegistro({
      nombre: "",
      apellido: "",
      email: "invalido",
      documento_identidad: "",
      password: "123",
      confirmarPassword: "456",
    });
    expect(Object.keys(errores)).toEqual(
      expect.arrayContaining(["nombre", "apellido", "email", "documento_identidad", "password", "confirmarPassword"])
    );
  });
});
