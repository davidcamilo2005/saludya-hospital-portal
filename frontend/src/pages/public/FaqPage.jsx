import { useState } from "react";

import { SectionHeading } from "../../components/ui";
import { FAQS } from "../../constants/institucional";

function ItemFaq({ pregunta, respuesta }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left font-medium text-slate-900"
        aria-expanded={abierto}
      >
        {pregunta}
        <span className="ml-4 text-blue-600">{abierto ? "−" : "+"}</span>
      </button>
      {abierto && <p className="px-5 pb-4 text-sm text-slate-600">{respuesta}</p>}
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
        {FAQS.map((faq) => (
          <ItemFaq key={faq.pregunta} {...faq} />
        ))}
      </div>
    </div>
  );
}
