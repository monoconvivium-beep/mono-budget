/**
 * MonoConvivium — che funzioni anche senza rete.
 *
 * I movimenti stanno già tutti nel telefono: l'unica cosa che manca, senza
 * campo, sono i file dell'app. Questo li tiene da parte.
 *
 * ⚠️ QUANDO SI PUBBLICA UNA VERSIONE NUOVA, CAMBIARE `VERSIONE` QUI SOTTO.
 * Senza, i telefoni che hanno già l'app continuano a mostrare quella vecchia e
 * sembra che le correzioni non siano state fatte.
 */
const VERSIONE = "mono-money-v36";

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

/**
 * «NON ASPETTARE IL TUO TURNO.»
 *
 * Un guardiano nuovo, appena installato, resta in panchina finché tutte le
 * schermate dell'app non sono chiuse — su un telefono può voler dire mai.
 * Quando si tocca «Aggiorna», l'app gli manda questo e lui entra subito.
 */
self.addEventListener("message", (evento) => {
  if (evento.data && evento.data.mono === "non-aspettare") void self.skipWaiting();
});

self.addEventListener("fetch", (evento) => {
  const richiesta = evento.request;
  if (richiesta.method !== "GET") return;

  const indirizzo = new URL(richiesta.url);
  if (indirizzo.origin !== self.location.origin) return;

  /**
   * 🔴 IL GUARDIANO NON SERVE SÉ STESSO DALLA COPIA (21/8/2026).
   * Questo file è l'unico posto dove è scritto il numero di versione, ed è
   * quello che l'app va a leggere per sapere se c'è qualcosa di nuovo. Se lo
   * servisse la copia salvata, la domanda «sono aggiornato?» finirebbe per
   * essere fatta proprio a chi è rimasto indietro, e la risposta sarebbe
   * sempre «sì». Trovato provandolo: il numero nuovo era sul sito e l'app
   * continuava a leggere il vecchio.
   */
  if (indirizzo.pathname.endsWith("/sw.js")) return;

  /**
   * Aprire una pagina: prima la rete, la copia solo se non c'è campo.
   * 🔑 Non il contrario. Con la copia per prima, dopo una pubblicazione il
   * telefono continuerebbe a caricare la pagina vecchia — che punta a pezzi di
   * programma che non esistono più — e l'app si aprirebbe rotta.
   */
  if (richiesta.mode === "navigate") {
    evento.respondWith(
      (async () => {
        const cache = await caches.open(VERSIONE);
        const daParte = async () =>
          (await cache.match(dove("index.html"))) ?? (await cache.match(dove(".")));

        try {
          /**
           * ⏱️ TRE SECONDI E NON DI PIÙ (aggiunto il 15/8/2026).
           * 🔴 Prima si aspettava la rete senza limite. Con una tacca di campo
           * — il parcheggio del supermercato, l'ascensore — una richiesta può
           * restare appesa mezzo minuto prima di arrendersi: in quel mezzo
           * minuto l'app è una schermata bianca, e chi la apre pensa che sia
           * rotta e la chiude. La copia da parte è già nel telefono e si apre
           * subito: passati tre secondi si usa quella. Nessuno aspetta
           * mezzo minuto per segnare un caffè.
           */
          /**
           * 🔴 `cache: "no-cache"` (21/8/2026). Senza, la pagina la può tirare
           * fuori il telefono dalla sua tasca — fino a dieci minuti vecchia per
           * le regole del sito, ma soprattutto SENZA MAI CHIEDERE se è cambiata.
           * È la pagina che dice quali pezzi di programma caricare: se resta
           * indietro lei, resta indietro tutta l'app, e uno può girare per un
           * giorno con la versione di ieri senza che niente glielo dica.
           * Costa una domanda al sito su un file di sei righe — e se la
           * risposta è «non è cambiata» non si scarica niente.
           */
          const dallaRete = await Promise.race([
            fetch(richiesta, { cache: "no-cache" }),
            new Promise((_, no) => setTimeout(() => no(new Error("troppo lenta")), 3000)),
          ]);

          /**
           * 🔴 SI SALVA SOLO SE LA RISPOSTA È BUONA.
           * Prima si metteva da parte QUALUNQUE cosa tornasse — anche la
           * pagina d'errore di GitHub durante una pubblicazione, o quella di
           * un dominio non ancora agganciato (successo davvero il 15/8). Da
           * quel momento il telefono avrebbe aperto quella pagina d'errore al
           * posto dell'app, anche a pubblicazione finita, fino alla versione
           * dopo. Un errore di un minuto diventava un guasto di giorni.
           * ⚠️ Le pagine interne (`/spesa`) su GitHub tornano **404 con dentro
           * l'app**: giustamente non si salvano, tanto ci pensa `index.html`
           * preso dalla radice, che torna 200.
           */
          if (dallaRete.ok) cache.put(dove("index.html"), dallaRete.clone());
          return dallaRete;
        } catch {
          const salvata = await daParte();
          return (
            salvata ??
            new Response("Sei senza rete e l'app non è ancora stata salvata.", {
              status: 503,
              headers: { "content-type": "text/plain; charset=utf-8" },
            })
          );
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
