import { useState } from "react";

import { Reveal, SectionHeading } from "../../components/ui";
import { FAQS } from "../../constants/institucional";

function ItemFaq({ pregunta, respuesta }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors duration-200 hover:border-blue-200">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left font-medium text-slate-900"
        aria-expanded={abierto}
      >
        {pregunta}
        <span
          className={`ml-4 text-blue-600 transition-transform duration-300 ${abierto ? "rotate-45" : ""}`}
          aria-hidden="true"
        >
          +
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          abierto ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="px-5 pb-4 text-sm text-slate-600">{respuesta}</p>
        </div>
      </div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <SectionHeading
        eyebrow="Ayuda"
        title="Preguntas frecuentes"
        description="Resuelve tus dudas sobre el registro, las citas y la seguridad de tus datos."
      />

      <div className="mt-8 space-y-3">
        {FAQS.map((faq, i) => (
          <Reveal key={faq.pregunta} delay={i * 50}>
            <ItemFaq {...faq} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
