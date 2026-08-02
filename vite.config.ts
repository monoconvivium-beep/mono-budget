/**
 * MONO MONEY — costruzione.
 *
 * 🔑 Vite semplice, niente framework con un server dietro. Quello che esce da
 * `npm run build` è **solo file fermi** (HTML, JS, CSS, immagini): si copiano su
 * un hosting statico qualunque e funzionano, senza niente da tenere acceso.
 * È la condizione perché l'app possa restare **gratis per sempre**.
 */
import { copyFileSync } from "node:fs";
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

export default defineConfig({
  plugins: [
    ricadutaPerHostingStatico(),
    // Deve stare PRIMA di react(): genera `routeTree.gen.ts` dai file in src/routes.
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsConfigPaths(),
  ],
  // Il dominio sarà tutto nostro (money.monobottega.it), quindi la radice è "/".
  base: "/",
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
