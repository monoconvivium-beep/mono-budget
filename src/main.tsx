/**
 * Avvio dell'app — tutto nel browser.
 *
 * 🔑 Qui non c'è nessun server, ed è una scelta, non una scorciatoia:
 * MONO MONEY è un regalo che la bottega fa ai clienti e deve restare **gratis
 * per sempre**. Se ci fosse un pezzo da tenere acceso, qualcuno dovrebbe pagarlo
 * ogni mese e un giorno smetterebbe. Così invece l'app è un pugno di file fermi:
 * si mettono su un hosting statico qualunque e restano lì.
 */
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { getRouter } from "./router";
import "./styles.css";

const router = getRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

const radice = document.getElementById("root");
if (!radice) throw new Error("Manca il contenitore #root in index.html");

createRoot(radice).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

/**
 * Il guardiano che tiene l'app da parte, così si apre anche senza rete.
 * ⚠️ Solo in produzione: in sviluppo servirebbe pagine vecchie e si passerebbe
 * il tempo a chiedersi perché una correzione non si vede.
 */
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Dalla radice dell'app, non da "/": funziona anche in una sottocartella.
    void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
      scope: import.meta.env.BASE_URL,
    });
  });
}
