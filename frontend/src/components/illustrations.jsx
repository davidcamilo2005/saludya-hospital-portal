/**
 * Ilustraciones SVG propias del sistema de diseño.
 *
 * Se generan como SVG inline (no como archivos de imagen externos) a
 * propósito: no dependen de una red externa para cargar (funcionan
 * igual dentro de Docker, sin conexión a un CDN de imágenes), pesan
 * casi nada en el bundle, heredan la paleta de Tailwind vía
 * `currentColor`/clases, y no rompen si algún host de imágenes cambia
 * o desaparece. Estilo plano ("flat illustration"), consistente con la
 * paleta de Fase 1 (azul primario, verde solo para éxito).
 */

/** Ilustración principal del hero de la landing: agenda + videollamada. */
export function HeroIllustration({ className = "" }) {
  return (
    <svg viewBox="0 0 420 360" fill="none" className={className} role="img" aria-labelledby="hero-ilustracion-titulo">
      <title id="hero-ilustracion-titulo">Ilustración de una persona agendando una cita médica en línea</title>

      {/* Blobs decorativos de fondo */}
      <circle cx="210" cy="180" r="150" className="fill-blue-50" />
      <circle cx="330" cy="70" r="34" className="fill-emerald-100" />
      <circle cx="55" cy="290" r="26" className="fill-blue-100" />

      {/* Tarjeta / pantalla del portal */}
      <rect x="70" y="70" width="280" height="200" rx="16" className="fill-white" stroke="currentColor" strokeOpacity="0.08" />
      <rect x="70" y="70" width="280" height="40" rx="16" className="fill-blue-600" />
      <circle cx="92" cy="90" r="5" className="fill-white/70" />
      <circle cx="110" cy="90" r="5" className="fill-white/70" />
      <circle cx="128" cy="90" r="5" className="fill-white/70" />

      {/* Calendario dentro de la tarjeta */}
      <rect x="96" y="130" width="228" height="118" rx="10" className="fill-blue-50" />
      {Array.from({ length: 4 }).map((_, fila) =>
        Array.from({ length: 6 }).map((_, col) => (
          <rect
            key={`${fila}-${col}`}
            x={112 + col * 34}
            y={146 + fila * 24}
            width="24"
            height="16"
            rx="4"
            className={fila === 1 && col === 3 ? "fill-blue-600" : "fill-white"}
          />
        ))
      )}

      {/* Check de confirmación flotando */}
      <g className="animate-float">
        <circle cx="345" cy="245" r="28" className="fill-emerald-500" />
        <path d="M333 245l8 8 16-16" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Persona (silueta plana, sin rasgos específicos) */}
      <g className="animate-float-slow">
        <circle cx="115" cy="300" r="22" className="fill-blue-700" />
        <path d="M75 350c0-24 18-38 40-38s40 14 40 38" className="fill-blue-700" />
      </g>

      {/* Cruz médica flotando */}
      <g className="animate-float" style={{ animationDelay: "1.5s" }}>
        <rect x="18" y="150" width="34" height="34" rx="8" className="fill-white" stroke="currentColor" strokeOpacity="0.08" />
        <path d="M35 158v18M26 167h18" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Ilustración usada en estados vacíos (sin citas, sin resultados, etc.). */
export function EmptyStateIllustration({ className = "" }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className} role="img" aria-labelledby="empty-ilustracion-titulo">
      <title id="empty-ilustracion-titulo">Ilustración de una carpeta vacía</title>
      <ellipse cx="100" cy="140" rx="70" ry="10" className="fill-slate-100" />
      <rect x="40" y="46" width="120" height="80" rx="12" className="fill-blue-50" />
      <rect x="40" y="46" width="120" height="26" rx="12" className="fill-blue-100" />
      <circle cx="100" cy="96" r="26" className="fill-white" stroke="currentColor" strokeOpacity="0.1" />
      <path d="M88 96h24M100 84v24" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** Ilustración de acompañamiento para Login / Registro: seguridad + salud. */
export function AuthIllustration({ className = "" }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className} role="img" aria-labelledby="auth-ilustracion-titulo">
      <title id="auth-ilustracion-titulo">Ilustración de un escudo con una cruz médica, representando acceso seguro</title>
      <circle cx="100" cy="100" r="92" className="fill-blue-50" />
      <g className="animate-float">
        <path
          d="M100 40l52 20v36c0 40-24 66-52 76-28-10-52-36-52-76V60l52-20z"
          className="fill-blue-600"
        />
        <path
          d="M100 52l40 15.5v28.5c0 31-18.5 51.5-40 59.5-21.5-8-40-28.5-40-59.5V67.5L100 52z"
          className="fill-white"
        />
        <path d="M100 78v40M80 98h40" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
      </g>
      <circle cx="164" cy="52" r="10" className="fill-emerald-400" />
      <circle cx="34" cy="150" r="7" className="fill-emerald-300" />
    </svg>
  );
}

/** Ilustración de la página 404. */
export function NotFoundIllustration({ className = "" }) {
  return (
    <svg viewBox="0 0 240 200" fill="none" className={className} role="img" aria-labelledby="404-ilustracion-titulo">
      <title id="404-ilustracion-titulo">Ilustración de una lupa buscando sobre un documento, sin resultados</title>
      <ellipse cx="120" cy="176" rx="90" ry="10" className="fill-slate-100" />
      <rect x="60" y="30" width="90" height="120" rx="10" className="fill-white" stroke="currentColor" strokeOpacity="0.1" />
      <rect x="76" y="50" width="58" height="8" rx="4" className="fill-blue-100" />
      <rect x="76" y="68" width="58" height="8" rx="4" className="fill-slate-100" />
      <rect x="76" y="86" width="36" height="8" rx="4" className="fill-slate-100" />
      <g className="animate-float">
        <circle cx="150" cy="120" r="30" className="fill-blue-50" stroke="#2563eb" strokeWidth="6" />
        <line x1="172" y1="142" x2="196" y2="166" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Colores de fondo estables para avatares, elegidos dentro de la paleta del sistema. */
const PALETA_AVATAR = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-slate-600",
  "bg-blue-500",
  "bg-emerald-500",
];

function indiceEstable(texto) {
  let hash = 0;
  for (let i = 0; i < texto.length; i += 1) {
    hash = (hash * 31 + texto.charCodeAt(i)) >>> 0;
  }
  return hash % PALETA_AVATAR.length;
}

/**
 * Avatar circular con las iniciales de una persona (médico, paciente),
 * color estable según su nombre (la misma persona siempre recibe el
 * mismo color). Reemplaza el emoji plano 🩺 por algo más vivo sin
 * depender de fotos externas.
 */
export function InitialsAvatar({ nombre = "", apellido = "", size = "md", className = "" }) {
  const iniciales = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase() || "🩺";
  const color = PALETA_AVATAR[indiceEstable(nombre + apellido)];
  const tamanos = {
    sm: "h-9 w-9 text-xs",
    md: "h-12 w-12 text-base",
    lg: "h-16 w-16 text-xl",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-sm transition-transform duration-200 ease-out hover:scale-105 ${color} ${tamanos[size]} ${className}`}
      aria-hidden="true"
    >
      {iniciales}
    </span>
  );
}
