/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Paleta del sector salud (Fase 1, sección "Diseño"): azules como
      // color primario, verde reservado solo para éxito. `slate` y
      // `emerald` ya cubren "grises suaves" y "verde éxito" sin extender
      // el tema; se documenta aquí para que la decisión sea explícita.
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
