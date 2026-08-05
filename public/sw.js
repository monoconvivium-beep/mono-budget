/**
 * MONO MONEY — che funzioni anche senza rete.
 *
 * I movimenti stanno già tutti nel telefono: l'unica cosa che manca, senza
 * campo, sono i file dell'app. Questo li tiene da parte.
 *
 * ⚠️ QUANDO SI PUBBLICA UNA VERSIONE NUOVA, CAMBIARE `VERSIONE` QUI SOTTO.
 * Senza, i telefoni che hanno già l'app continuano a mostrare quella vecchia e
 * sembra che le correzioni non siano state fatte.
 */
const VERSIONE = "mono-money-v4";

/**
 * Tutto si calcola dalla RADICE dove il guardiano è registrato, mai da "/".
 * Così l'app funziona sia sul suo dominio, sia dentro una sottocartella
 * (le pagine di GitHub servono a `/nome-del-progetto/`), senza toccare niente.
 */
const RADICE = self.registration.scope;
const dove = (percorso) => new URL(percorso, RADICE).href;

/** Il minimo per aprire l'app da spenta. Il resto si aggiunge man mano che si usa. */
const OSSATURA = [
  dove("."),
  dove("index.html"),
  dove("manifest.webmanifest"),
  dove("font/caratteri.css"),
  dove("icona-192.png"),
  dove("icona-512.png"),
  dove("favicon.png"),
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    (async () => {
      const cache = await caches.open(VERSIONE);
      // Uno per uno: se un file non c'è, non deve far fallire tutta
      // l'installazione e lasciare il telefono senza niente da parte.
      await Promise.all(OSSATURA.map((u) => cache.add(u).catch(() => undefined)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    (async () => {
      const nomi = await caches.keys();
      await Promise.all(nomi.filter((n) => n !== VERSIONE).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (evento) => {
  const richiesta = evento.request;
  if (richiesta.method !== "GET") return;

  const indirizzo = new URL(richiesta.url);
  if (indirizzo.origin !== self.location.origin) return;

  /**
   * Aprire una pagina: prima la rete, la copia solo se non c'è campo.
   * 🔑 Non il contrario. Con la copia per prima, dopo una pubblicazione il
   * telefono continuerebbe a caricare la pagina vecchia — che punta a pezzi di
   * programma che non esistono più — e l'app si aprirebbe rotta.
   */
  if (richiesta.mode === "navigate") {
    evento.respondWith(
      (async () => {
        try {
          const dallaRete = await fetch(richiesta);
          const cache = await caches.open(VERSIONE);
          cache.put(dove("index.html"), dallaRete.clone());
          return dallaRete;
        } catch {
          const cache = await caches.open(VERSIONE);
          const salvata = (await cache.match(dove("index.html"))) ?? (await cache.match(dove(".")));
          return salvata ?? new Response("Sei senza rete e l'app non è ancora stata salvata.", {
            status: 503,
            headers: { "content-type": "text/plain; charset=utf-8" },
          });
        }
      })(),
    );
    return;
  }

  /**
   * Tutto il resto (programma, stili, caratteri, icone): prima la copia.
   * Quei file hanno il nome con l'impronta del contenuto: se cambia il
   * contenuto cambia il nome, quindi una copia salvata non è mai vecchia.
   */
  evento.respondWith(
    (async () => {
      const cache = await caches.open(VERSIONE);
      const salvata = await cache.match(richiesta);
      if (salvata) return salvata;
      const dallaRete = await fetch(richiesta);
      if (dallaRete.ok && dallaRete.type === "basic") cache.put(richiesta, dallaRete.clone());
      return dallaRete;
    })(),
  );
});
