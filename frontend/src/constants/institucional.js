/**
 * Contenido institucional estático (HU-01, HU-04).
 *
 * Decisión de diseño: no existe en el backend una tabla ni endpoint para
 * "contenido institucional" porque ninguna historia de usuario de la Fase 1
 * pide que el administrador lo edite desde el panel; se gestiona como
 * contenido estático del frontend, igual que en la mayoría de sitios
 * institucionales. Si en el futuro se requiere edición desde el panel
 * admin, se puede extraer a una tabla `contenido_institucional`.
 */

export const HISTORIA =
  "SaludYa nació de la necesidad de modernizar la atención hospitalaria: durante años, " +
  "pacientes que solo necesitaban agendar o consultar una cita debían desplazarse hasta " +
  "el hospital y hacer fila junto a quienes requerían atención urgente. Este portal digitaliza " +
  "esos trámites administrativos para que el hospital concentre sus recursos en quienes " +
  "realmente necesitan atención presencial.";

export const MISION =
  "Facilitar el acceso de los pacientes a los servicios administrativos del hospital mediante " +
  "una plataforma digital simple, segura y disponible en cualquier momento.";

export const VISION =
  "Ser el modelo de referencia en gestión hospitalaria digital, reduciendo tiempos de espera " +
  "y mejorando la experiencia de pacientes y personal médico.";

export const CONTACTO = {
  direccion: "Av. Principal 123, Ciudad",
  telefono: "+1 (555) 123-4567",
  email: "contacto@saludya.com",
  horario: "Lunes a sábado, 7:00 a.m. – 5:00 p.m.",
};

export const FAQS = [
  {
    pregunta: "¿Necesito crear una cuenta para agendar una cita?",
    respuesta: "Sí. El registro es gratuito y solo toma un minuto; con tu cuenta puedes agendar, consultar y cancelar tus citas.",
  },
  {
    pregunta: "¿En qué horarios puedo agendar una cita?",
    respuesta: "De lunes a sábado, entre las 7:00 a.m. y las 5:00 p.m. No se agendan citas los domingos.",
  },
  {
    pregunta: "¿Puedo cancelar una cita ya agendada?",
    respuesta: "Sí, desde la sección \"Mis citas\" puedes cancelar cualquier cita pendiente; el horario queda disponible de inmediato para otro paciente.",
  },
  {
    pregunta: "¿Qué pasa si dos personas intentan agendar el mismo horario con el mismo médico?",
    respuesta: "El sistema no lo permite: solo la primera solicitud se confirma y a la segunda persona se le informa que el horario ya no está disponible.",
  },
  {
    pregunta: "¿Mis datos personales están protegidos?",
    respuesta: "Sí. Tu contraseña se almacena cifrada y el acceso a tu información se protege mediante autenticación segura (JWT).",
  },
  {
    pregunta: "¿Cómo elijo un médico?",
    respuesta: "En la sección \"Médicos\" puedes ver el listado completo filtrado por especialidad antes de agendar tu cita.",
  },
];
