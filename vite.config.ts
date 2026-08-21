/**
 * MONO MONEY — costruzione.
 *
 * 🔑 Vite semplice, niente framework con un server dietro. Quello che esce da
 * `npm run build` è **solo file fermi** (HTML, JS, CSS, immagini): si copiano su
 * un hosting statico qualunque e funzionano, senza niente da tenere acceso.
 * È la condizione perché l'app possa restare **gratis per sempre**.
 */
import { copyFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

/**
 * Su un hosting statico non c'è nessuno che risponde a `/diario`: esiste un solo
 * file, `index.html`. GitHub Pages, quando non trova un indirizzo, serve
 * `404.html` — se quel file È l'app, la pagina si apre lo stesso e il percorso
 * lo legge l'app.
 * ⚠️ Senza questo, aprire un collegamento diretto o ricaricare una pagina che
 * non sia la home darebbe «pagina non trovata». Sembra un dettaglio finché non
 * è a un cliente che succede.
 */
function ricadutaPerHostingStatico(): Plugin {
  return {
    name: "mono-ricaduta-404",
    apply: "build",
    closeBundle() {
      const dist = resolve(import.meta.dirname, "dist");
      copyFileSync(resolve(dist, "index.html"), resolve(dist, "404.html"));
    },
  };
}

/**
 * IL NUMERO DI VERSIONE, PRESO DAL GUARDIANO.
 *
 * 🔑 Un posto solo: `public/sw.js`. Scriverlo anche qui vorrebbe dire due
 * numeri che si somigliano — e il giorno che uno dei due resta indietro, l'app
 * dice «sei all'ultima» a chi l'ultima non ce l'ha. Meglio nessun numero che un
 * numero che mente.
 */
function versioneDelGuardiano(): string {
  const testo = readFileSync(resolve(import.meta.dirname, "public/sw.js"), "utf8");
  const trovata = /const VERSIONE = "mono-money-(v\d+)"/.exec(testo)?.[1];
  if (!trovata) throw new Error('In public/sw.js non trovo `const VERSIONE = "mono-money-vNN"`.');
  return trovata;
}

export default defineConfig({
  define: {
    __VERSIONE__: JSON.stringify(versioneDelGuardiano()),
  },
  plugins: [
    ricadutaPerHostingStatico(),
    // Deve stare PRIMA di react(): genera `routeTree.gen.ts` dai file in src/routes.
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsConfigPaths(),
  ],
  /**
   * Dove vive l'app. Sul suo dominio è la radice; sulle pagine di GitHub è una
   * sottocartella col nome del progetto. Si passa da fuori con `MONO_BASE`, così
   * lo stesso codice va bene in tutti e due i posti senza modifiche.
   */
  base: process.env["MONO_BASE"] ?? "/",
  build: {
    outDir: "dist",
    // Nessuna mappa dei sorgenti in produzione: pesa e qui non serve a nessuno.
    sourcemap: false,
  },
  server: {
    host: true,
    port: 8080,
  },
});
