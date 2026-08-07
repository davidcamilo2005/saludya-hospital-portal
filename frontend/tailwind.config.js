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
      // Animaciones reutilizables en todo el sitio (botones, cards, hero,
      // entradas de página). Se combinan con el hook `useReveal` para
      // animar al hacer scroll y con `prefers-reduced-motion` en index.css
      // para respetar accesibilidad (Fase 1, sección "Diseño": "Accesible").
      keyframes: {
        "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
        "fade-in-up": {
          from: { opacity: 0, transform: "translateY(16px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: 0, transform: "scale(0.95)" },
          to: { opacity: 1, transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(20px, -30px) scale(1.1)" },
          "66%": { transform: "translate(-15px, 15px) scale(0.95)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out both",
        "fade-in-up": "fade-in-up 0.6s ease-out both",
        "scale-in": "scale-in 0.2s ease-out both",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        blob: "blob 12s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};
