# Manual de usuario — SaludYa

Guía de uso del Portal Web de Gestión Hospitalaria SaludYa, pensada
para cualquier persona que use el sistema, sin necesidad de
conocimientos técnicos.

## Índice

- [Para pacientes](#para-pacientes)
  - [Crear una cuenta](#1-crear-una-cuenta)
  - [Iniciar sesión](#2-iniciar-sesión)
  - [Agendar una cita](#3-agendar-una-cita)
  - [Consultar mis citas](#4-consultar-mis-citas)
  - [Cancelar una cita](#5-cancelar-una-cita)
  - [Editar mi perfil](#6-editar-mi-perfil)
- [Para administradores](#para-administradores)
  - [Dashboard](#1-dashboard)
  - [Gestionar médicos](#2-gestionar-médicos)
  - [Gestionar especialidades](#3-gestionar-especialidades)
  - [Gestionar citas](#4-gestionar-citas)
  - [Gestionar pacientes](#5-gestionar-pacientes)
- [Preguntas frecuentes](#preguntas-frecuentes)

---

## Para pacientes

### 1. Crear una cuenta

1. En la página de inicio, haz clic en **"Registrarme"** (esquina
   superior derecha, o el botón principal de la portada).
2. Completa el formulario: nombre, apellido, correo electrónico,
   documento de identidad, contraseña (mínimo 8 caracteres, con al
   menos una letra y un número) y confírmala. Teléfono, dirección y
   fecha de nacimiento son opcionales.
3. Haz clic en **"Crear cuenta"**. Si el correo o el documento ya están
   registrados, el sistema te lo indicará para que corrijas el dato.
4. Serás redirigido a la página de inicio de sesión con un mensaje de
   confirmación.

[INSERTAR IMAGEN: Landing]

### 2. Iniciar sesión

1. Ve a **"Iniciar sesión"**.
2. Ingresa tu correo y contraseña.
3. Si tus datos son correctos, entrarás automáticamente a **"Mis
   citas"**. Si te equivocas de contraseña, el sistema te lo indicará
   sin revelar cuál de los dos datos es incorrecto (medida de
   seguridad estándar).

[INSERTAR IMAGEN: Login]

### 3. Agendar una cita

1. Desde el menú, entra a **"Agendar cita"**.
2. Elige primero la **especialidad** que necesitas.
3. El sistema mostrará solo los médicos que atienden esa especialidad;
   elige uno.
4. Elige la **fecha** (no se permiten domingos) y la **hora** (de 7:00
   a. m. a 5:00 p. m., en franjas de 30 minutos).
5. Haz clic en **"Confirmar cita"**. Si el horario elegido ya fue
   tomado por otro paciente mientras completabas el formulario, el
   sistema te avisará para que elijas otro.

### 4. Consultar mis citas

En **"Mis citas"** verás dos secciones:

- **Próximas / pendientes**: citas agendadas que aún no ocurren.
- **Historial**: citas completadas o canceladas, con el motivo de
  cancelación si aplica.

### 5. Cancelar una cita

1. En **"Mis citas"**, localiza la cita pendiente que quieres cancelar
   y haz clic en **"Cancelar"**.
2. (Opcional) escribe el motivo de la cancelación.
3. Confirma. El horario queda disponible de inmediato para que otro
   paciente lo tome.

### 6. Editar mi perfil

En **"Mi perfil"** puedes actualizar tu nombre, apellido, teléfono,
dirección y fecha de nacimiento. El correo y el documento de identidad
no se pueden cambiar desde aquí (son tu identificador único en el
sistema); si necesitas corregirlos, contacta al hospital.

---

## Para administradores

Inicia sesión con una cuenta de rol **administrador** (ver credenciales
de demostración en el `README.md` del repositorio). Serás dirigido
automáticamente al panel administrativo.

[INSERTAR IMAGEN: Dashboard]

### 1. Dashboard

Resumen operativo: citas de hoy, citas pendientes, médicos activos,
pacientes registrados, y un gráfico de barras de citas activas por
especialidad.

### 2. Gestionar médicos

En **"Médicos"** puedes:

- Ver el listado completo (activos e inactivos) con sus especialidades.
- **Crear** un médico nuevo: nombre, apellido, documento de identidad,
  correo y teléfono (opcionales), y al menos una especialidad.
- **Editar** cualquier dato, incluyendo las especialidades asignadas.
- **Desactivar** un médico (no se elimina: su historial de citas se
  conserva). Un médico desactivado deja de aparecer en el listado
  público y no puede recibir nuevas citas.

### 3. Gestionar especialidades

En **"Especialidades"** puedes crear, editar y desactivar
especialidades. No se puede desactivar una especialidad si todavía
tiene médicos activos asociados a ella — primero hay que reasignar o
desactivar esos médicos.

### 4. Gestionar citas

En **"Citas"** puedes ver todas las citas del hospital, filtrar por
estado y fecha, y cancelar cualquier cita pendiente (por ejemplo, si el
médico no puede atender ese día), indicando el motivo.

### 5. Gestionar pacientes

En **"Pacientes"** puedes ver el listado completo de cuentas
registradas y desactivar una cuenta si es necesario (por ejemplo, a
solicitud del paciente). Una cuenta desactivada no puede iniciar
sesión, pero su historial de citas se conserva.

---

## Preguntas frecuentes

Ver la sección de FAQ pública del portal (`/faq`), que cubre: creación
de cuenta, horarios disponibles, cancelación de citas, qué pasa si dos
personas intentan el mismo horario, protección de datos personales y
cómo elegir un médico.
