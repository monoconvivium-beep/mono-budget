/**
 * Avvio dell'app — tutto nel browser.
 *
 * 🔑 Qui non c'è nessun server, ed è una scelta, non una scorciatoia:
 * MonoConvivium è un regalo che la bottega fa ai clienti e deve restare **gratis
 * per sempre**. Se ci fosse un pezzo da tenere acceso, qualcuno dovrebbe pagarlo
 * ogni mese e un giorno smetterebbe. Così invece l'app è un pugno di file fermi:
 * si mettono su un hosting statico qualunque e restano lì.
 */
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ricordaProvenienza } from "./lib/origine";
import { getRouter } from "./router";
import "./styles.css";

/**
 * PRIMA del router: le targhe del passaparola (`?da=`, `?amico=`) vanno lette
 * dall'indirizzo com'è arrivato — il router poi lo riscrive pulito.
 */
ricordaProvenienza();

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
 * 🔐 «QUESTI DATI NON BUTTARLI» — chiesto al telefono all'avvio (15/8/2026).
 *
 * 🔴 Il rischio vero: i conti di quest'app vivono SOLO nel telefono, e la
 * memoria di un sito è roba che il telefono considera sacrificabile. Safari su
 * iPhone in particolare **cancella da sé** quel che un sito ha salvato dopo
 * **sette giorni** che non lo si apre — a meno che l'app non sia stata messa
 * in Home. Chi prova MonoConvivium in Safari, va in ferie e torna, rischia di
 * trovare i conti azzerati senza aver toccato niente.
 *
 * Questa riga chiede al telefono di trattare la memoria come duratura. Non è
 * una garanzia — Android la concede a chi usa l'app spesso o l'ha installata,
 * Safari decide per conto suo — ma è la sola richiesta che si può fare, costa
 * niente e non chiede nulla a chi usa l'app.
 * 🔑 La difesa che vale davvero resta **mettere l'app in Home** (vedi
 * `InstallaApp`) e l'esportazione dalla scheda MONO. Questa è la terza rete.
 */
if (typeof navigator !== "undefined") {
  void navigator.storage?.persist?.().catch(() => undefined);
}

/**
 * Il guardiano che tiene l'app da parte, così si apre anche senza rete.
 * ⚠️ Solo in produzione: in sviluppo servirebbe pagine vecchie e si passerebbe
 * il tempo a chiedersi perché una correzione non si vede.
 */
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Dalla radice dell'app, non da "/": funziona anche in una sottocartella.
    void navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, {
        scope: import.meta.env.BASE_URL,
        /**
         * 🔴 `updateViaCache: "none"` (21/8/2026): il file del guardiano si
         * chiede sempre al sito, mai alla tasca del telefono. È il file che
         * dice qual è la versione: se lo si legge dalla copia salvata, un
         * telefono può restare indietro senza accorgersene — ed è successo.
         */
        updateViaCache: "none",
      })
      /**
       * E a ogni apertura gli si chiede di guardare se c'è una versione nuova.
       * Registrare e basta non lo fa: senza questa riga il controllo lo fa il
       * telefono quando gli pare.
       */
      .then((guardiano) => guardiano.update())
      .catch(() => undefined);
  });
}
