import { Link } from "react-router-dom";

import { Button, Card, Reveal, SectionHeading } from "../../components/ui";
import { HeroIllustration } from "../../components/illustrations";
import { HISTORIA, MISION, VISION } from "../../constants/institucional";

const beneficios = [
  { icono: "📅", titulo: "Agenda en línea", texto: "Reserva tu cita en minutos, sin llamadas ni filas." },
  { icono: "🔍", titulo: "Consulta tus citas", texto: "Revisa tus próximas citas y tu historial cuando quieras." },
  { icono: "🩺", titulo: "Elige tu especialista", texto: "Filtra por especialidad y encuentra al médico adecuado." },
];

export default function LandingPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        {/* Blobs decorativos animados, puramente CSS (sin imágenes externas). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 animate-blob rounded-full bg-blue-200/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 top-20 h-80 w-80 animate-blob rounded-full bg-emerald-200/30 blur-3xl"
          style={{ animationDelay: "3s" }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-fade-in-up">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Portal Web de Gestión Hospitalaria
            </p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900 md:text-5xl">
              Gestiona tus citas médicas sin salir de casa
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Agenda, consulta y cancela tus citas en línea. Deja las filas del hospital para quienes
              realmente necesitan atención presencial.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/registro">
                <Button variant="primary" className="px-6 py-3 text-base">
                  Agendar mi primera cita
                </Button>
              </Link>
              <Link to="/especialidades">
                <Button variant="outline" className="px-6 py-3 text-base">
                  Ver especialidades
                </Button>
              </Link>
            </div>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <HeroIllustration className="mx-auto h-auto w-full max-w-md" />
          </div>
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-4 px-4 pb-16 sm:grid-cols-3">
          {beneficios.map((b, i) => (
            <Reveal key={b.titulo} delay={i * 100}>
              <Card hover className="group flex h-full items-start gap-4 p-5">
                <span className="text-3xl transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
                  {b.icono}
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{b.titulo}</p>
                  <p className="text-sm text-slate-500">{b.texto}</p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-dot-grid mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <SectionHeading eyebrow="Sobre nosotros" title="Nuestra historia" />
          <p className="mx-auto mt-6 max-w-3xl text-center text-slate-600">{HISTORIA}</p>
        </Reveal>

        <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
          <Reveal delay={0}>
            <Card hover className="h-full p-6">
              <h3 className="text-lg font-semibold text-blue-700">Misión</h3>
              <p className="mt-2 text-slate-600">{MISION}</p>
            </Card>
          </Reveal>
          <Reveal delay={100}>
            <Card hover className="h-full p-6">
              <h3 className="text-lg font-semibold text-blue-700">Visión</h3>
              <p className="mt-2 text-slate-600">{VISION}</p>
            </Card>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-blue-700">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 left-1/2 h-64 w-64 -translate-x-1/2 animate-blob rounded-full bg-blue-500/30 blur-3xl"
        />
        <Reveal className="relative mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center text-white">
          <h2 className="text-2xl font-bold">¿Listo para dejar de hacer fila?</h2>
          <p className="max-w-xl text-blue-100">
            Crea tu cuenta gratuita y agenda tu próxima cita médica en minutos.
          </p>
          <Link to="/registro">
            <Button variant="success" className="px-6 py-3 text-base">
              Crear mi cuenta
            </Button>
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
