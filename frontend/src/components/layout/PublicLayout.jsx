import { Outlet, useLocation } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PublicLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {/* La `key` en la ruta hace que React remonte este <main> en cada
          cambio de página, disparando la animación de entrada de nuevo
          (pequeña transición de página, sin librerías extra). */}
      <main className="flex-1 animate-fade-in" key={location.pathname}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
