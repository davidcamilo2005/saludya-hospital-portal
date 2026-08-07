import { Card, SectionHeading } from "../../components/ui";
import { CONTACTO } from "../../constants/institucional";

const items = [
  { icono: "📍", label: "Dirección", valor: CONTACTO.direccion },
  { icono: "📞", label: "Teléfono", valor: CONTACTO.telefono },
  { icono: "✉️", label: "Correo", valor: CONTACTO.email },
  { icono: "🕒", label: "Horario de atención", valor: CONTACTO.horario },
];

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <SectionHeading
        eyebrow="Estamos para ayudarte"
        title="Contacto"
        description="¿Tienes dudas que no encontraste en nuestras preguntas frecuentes? Escríbenos."
      />

      <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <Card key={item.label} className="flex items-start gap-3 p-5">
            <span className="text-2xl" aria-hidden="true">{item.icono}</span>
            <div>
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <p className="font-semibold text-slate-900">{item.valor}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
