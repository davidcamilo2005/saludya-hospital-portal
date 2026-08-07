import { useEffect, useRef, useState } from "react";

/**
 * Hook de "scroll reveal": marca un elemento como visible la primera vez
 * que entra en el viewport, para animarlo con la clase CSS `.reveal`
 * (definida en index.css). Implementado con IntersectionObserver nativo
 * en vez de una librería de animación, para no añadir una dependencia
 * nueva solo para esto.
 *
 * Si el navegador no soporta IntersectionObserver (muy poco probable),
 * cae de vuelta a "siempre visible" en lugar de ocultar el contenido.
 */
export function useReveal({ threshold = 0.15 } = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(nodo);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}
