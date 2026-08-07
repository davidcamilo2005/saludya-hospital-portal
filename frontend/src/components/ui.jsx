/**
 * Kit de componentes UI reutilizables.
 *
 * Paleta (Fase 1, sección "Diseño"): azules como color primario, blancos y
 * grises suaves como base, verde reservado únicamente para acciones/estados
 * exitosos. El rojo se usa solo para peligro/errores (adición razonable no
 * prohibida por el alcance).
 *
 * Todas las interacciones (hover, foco, clic) tienen una transición corta
 * (150-200ms) para que la interfaz se sienta viva sin distraer; se
 * respetan automáticamente si el usuario tiene activado
 * `prefers-reduced-motion` (ver index.css).
 */

import { useReveal } from "../hooks/useReveal";
import { EmptyStateIllustration } from "./illustrations";

export function Button({ variant = "primary", className = "", children, ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium " +
    "transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 " +
    "focus-visible:outline-none active:scale-95 disabled:active:scale-100";

  const variants = {
    primary: "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5",
    outline: "border border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50 hover:-translate-y-0.5",
    success: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-md hover:-translate-y-0.5",
    danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md hover:-translate-y-0.5",
    ghost: "text-slate-600 hover:bg-slate-100",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Card({ className = "", hover = false, children, ...props }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 ease-out ${
        hover ? "hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({ tone = "slate", children }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-100 text-blue-700",
    success: "bg-emerald-100 text-emerald-700",
    danger: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex animate-scale-in items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-transform duration-150 hover:scale-105 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function EstadoCitaBadge({ estado }) {
  const map = {
    pendiente: { tone: "blue", label: "Pendiente" },
    completada: { tone: "success", label: "Completada" },
    cancelada: { tone: "slate", label: "Cancelada" },
  };
  const { tone, label } = map[estado] || { tone: "slate", label: estado };
  return <Badge tone={tone}>{label}</Badge>;
}

export function Alert({ tone = "blue", children }) {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    danger: "border-red-200 bg-red-50 text-red-800",
  };
  return (
    <div className={`animate-fade-in-up rounded-lg border px-4 py-3 text-sm ${tones[tone]}`} role="status">
      {children}
    </div>
  );
}

export function Spinner({ className = "h-6 w-6" }) {
  return (
    <svg
      className={`animate-spin text-blue-600 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label="Cargando"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export function PageLoader({ label = "Cargando información..." }) {
  return (
    <div className="flex animate-fade-in flex-col items-center justify-center gap-3 py-24 text-slate-500">
      <Spinner className="h-8 w-8" />
      <p>{label}</p>
    </div>
  );
}

/** Placeholder animado ("skeleton") para contenido que aún está cargando. */
export function Skeleton({ className = "" }) {
  return <div className={`animate-shimmer bg-shimmer rounded-md ${className}`} aria-hidden="true" />;
}

export function EmptyState({ title, description }) {
  return (
    <div className="animate-fade-in-up rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <EmptyStateIllustration className="mx-auto h-28 w-auto" />
      <p className="mt-4 font-medium text-slate-700">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
  );
}

export function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

const inputBase =
  "block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 transition-shadow duration-150 " +
  "placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 " +
  "disabled:bg-slate-100 disabled:text-slate-500";

export function Input({ className = "", ...props }) {
  return <input className={`${inputBase} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }) {
  return <textarea className={`${inputBase} ${className}`} rows={3} {...props} />;
}

export function Select({ className = "", children, ...props }) {
  return (
    <select className={`${inputBase} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function FormField({ label, htmlFor, error, children }) {
  return (
    <div>
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {error && <p className="mt-1 animate-fade-in-up text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-slate-900/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-scale-in rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-1 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">{eyebrow}</p>
      )}
      <h2 className="mt-1 text-3xl font-bold text-slate-900">{title}</h2>
      {description && <p className="mt-3 text-slate-600">{description}</p>}
    </div>
  );
}

/**
 * Envuelve a `children` y los anima con un fade-in-up la primera vez que
 * entran en el viewport (scroll reveal). `delay` acepta un múltiplo de
 * 75ms para escalonar varias tarjetas en cascada (ver LandingPage).
 */
export function Reveal({ children, delay = 0, className = "" }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
