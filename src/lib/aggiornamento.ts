/**
 * «CE L'HO L'ULTIMA VERSIONE?» — la domanda a cui l'app deve saper rispondere.
 *
 * 🔴 DA DOVE NASCE (21/8/2026, aperta su Android): il lavoro sulle categorie era
 * pubblicato da un giorno, e sul suo telefono non c'era. Nessun guasto nel
 * programma: l'app era **quella di ieri**, e non c'era niente che glielo
 * dicesse né niente da toccare per avere quella nuova. Un'app che si aggiorna
 * quando le pare, senza dirlo, è un'app di cui non ti puoi fidare — e questa
 * tiene i conti di qualcuno.
 *
 * 🔑 Il numero di versione **lo tiene il guardiano** (`public/sw.js`) e ci
 * arriva dentro al momento della costruzione (`__VERSIONE__`, vedi
 * `vite.config.ts`): l'app sa quale versione È. Per sapere quale versione **c'è**
 * si va a leggere lo stesso file sul sito. Due numeri, un confronto, una
 * risposta chiara.
 *
 * ⚠️ Qui non passa NIENTE dei conti: si chiede al sito un file dell'app e si
 * guarda un numero. Gli importi non entrano in questa storia in nessun modo.
 */

/** La versione che questa copia dell'app È. Ci arriva da `public/sw.js`. */
export const VERSIONE_QUI: string = __VERSIONE__;

/** Il file del guardiano, l'unico posto dove il numero è scritto. */
const FILE_GUARDIANO = "sw.js";

/**
 * Pesca `v30` da dentro il testo del guardiano.
 * Torna `null` se non lo trova: meglio dire «non lo so» che inventare un numero.
 */
export function versioneDa(testo: string): string | null {
  return /const VERSIONE = "mono-money-(v\d+)"/.exec(testo)?.[1] ?? null;
}

export type Esito =
  | { stato: "aggiornata"; versione: string }
  | { stato: "vecchia"; versione: string }
  /**
   * ⚠️ «Non ho potuto guardare» NON è «sei aggiornato». Chi legge, davanti a un
   * silenzio, sceglie sempre la spiegazione peggiore: qui la differenza si dice.
   */
  | { stato: "senza-rete" };

/**
 * Va a vedere sul sito che versione c'è.
 *
 * `cache: "no-store"` è l'unica riga che conta: senza, il telefono risponde con
 * la copia che ha già in tasca — cioè proprio quella vecchia di cui stiamo
 * cercando di accorgerci.
 */
export async function guardaSeCèDiNuovo(radice: string = "/"): Promise<Esito> {
  try {
    const risposta = await fetch(`${radice}${FILE_GUARDIANO}`, { cache: "no-store" });
    if (!risposta.ok) return { stato: "senza-rete" };
    const la = versioneDa(await risposta.text());
    if (!la) return { stato: "senza-rete" };
    return la === VERSIONE_QUI
      ? { stato: "aggiornata", versione: la }
      : { stato: "vecchia", versione: la };
  } catch {
    return { stato: "senza-rete" };
  }
}

/**
 * PRENDE LA VERSIONE NUOVA E RIAPRE L'APP.
 *
 * 🔴 I conti NON si toccano: stanno in `localStorage`, e qui si buttano via
 * solo le **copie dei file** dell'app (`caches`). Sono due magazzini diversi
 * del telefono, e questo entra solo nel secondo.
 *
 * L'ordine conta:
 * 1. si sveglia il guardiano e gli si dice di non aspettare il suo turno
 *    (`skipWaiting`), se no la versione nuova resta in panchina fino a quando
 *    tutte le schermate dell'app sono chiuse — su un telefono, mai;
 * 2. si buttano le copie dei file, se no si riaprirebbe la stessa app di prima;
 * 3. si riapre.
 */
export async function prendiLaVersioneNuova(): Promise<void> {
  const guardiano = await navigator.serviceWorker?.getRegistration();
  if (guardiano) {
    await guardiano.update().catch(() => undefined);
    (guardiano.waiting ?? guardiano.installing)?.postMessage({ mono: "non-aspettare" });
  }
  const nomi = await caches.keys().catch(() => [] as string[]);
  await Promise.all(nomi.map((n) => caches.delete(n)));
  window.location.reload();
}
