/**
 * Validaciones de formularios, extraídas de RegistroPage.jsx para poder
 * probarlas de forma unitaria y aislada (ver docs/fases/05-testing.md).
 */

const REGEX_EMAIL = /^\S+@\S+\.\S+$/;

/**
 * Valida el formulario de registro de paciente (HU-05).
 * Devuelve un objeto `{ campo: mensaje }` con solo los campos inválidos;
 * un objeto vacío significa que el formulario es válido.
 */
export function validarRegistro(form) {
  const errores = {};

  if (!form.nombre?.trim()) errores.nombre = "El nombre es obligatorio";
  if (!form.apellido?.trim()) errores.apellido = "El apellido es obligatorio";
  if (!REGEX_EMAIL.test(form.email || "")) errores.email = "Ingresa un correo válido";
  if (!form.documento_identidad?.trim()) {
    errores.documento_identidad = "El documento es obligatorio";
  }

  const password = form.password || "";
  if (password.length < 8) {
    errores.password = "La contraseña debe tener al menos 8 caracteres";
  } else if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    errores.password = "La contraseña debe incluir al menos una letra y un número";
  }

  if (form.confirmarPassword !== form.password) {
    errores.confirmarPassword = "Las contraseñas no coinciden";
  }

  return errores;
}
