/**
 * LE SPESE CHE TORNANO UGUALI OGNI MESE — e che l'app segna da sola.
 *
 * 🔴 Chiesto da lui il 21/8/2026: «affitto, luce e gas, gli abbonamenti — la
 * spesa è sempre la stessa, si può impostare così ogni mese, non bisogna
 * ridirlo». Ha ragione: un'app a cui devi ripetere ogni mese le stesse quattro
 * cifre ti sta facendo fare il lavoro che dovrebbe fare lei.
 *
 * 🔑 COME FUNZIONA, e perché non può essere diverso: qui non c'è nessun server
 * acceso che alle 8 del mattino segna l'affitto. C'è l'app sul telefono. Quindi
 * le spese fisse si segnano **quando apri l'app**, recuperando i mesi passati
 * che non erano ancora stati segnati. Se stai via due mesi, alla riapertura te
 * li trova tutti e due — e te lo dice, invece di farli comparire di nascosto.
 *
 * ⚠️ Regole che non si toccano:
 * · una spesa fissa **non si segna mai due volte** per lo stesso mese (ogni
 *   movimento nato così porta scritto da quale fissa e per quale mese);
 * · **non si torna indietro nel tempo**: niente viene segnato prima del mese in
 *   cui la fissa è stata creata, se no comparirebbero spese mai fatte;
 * · il giorno si ferma a **28**: il 31 di febbraio non esiste, e una spesa che
 *   salta i mesi corti sarebbe un difetto che si vede una volta l'anno — cioè
 *   quando nessuno si ricorda perché;
 * · i movimenti nati così sono movimenti **normali**: si correggono, si
 *   cestinano, si cambiano di categoria. Non sono intoccabili.
 */

export type SpesaFissa = {
  id: string;
  /** Come si chiama: «Affitto», «Netflix», «Luce e gas». */
  cosa: string;
  /** In EURO, non centesimi (`700` = 700,00 €). Lezione pagata cara. */
  importo: number;
  categoria: string;
  /** Il giorno del mese in cui si segna, da 1 a 28. */
  giorno: number;
  /** Il mese da cui è in vigore, `2026-08`. Prima di questo non si segna niente. */
  daQuando: string;
  /** Spenta = resta scritta ma non segna più niente. */
  attiva: boolean;
};

/** Il mese di una data, come `2026-08`. */
export function meseDi(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Il giorno buono: mai sotto 1, mai sopra 28 (vedi la regola dei mesi corti). */
export function giornoBuono(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(28, Math.max(1, Math.round(n)));
}

/** Il momento esatto in cui segnare: le 9 del mattino, non la mezzanotte. */
export function quandoSegnare(mese: string, giorno: number): string {
  const [anno, m] = mese.split("-").map(Number);
  return new Date(anno ?? 2026, (m ?? 1) - 1, giornoBuono(giorno), 9, 0, 0).toISOString();
}

/** Un mese più avanti: `2026-12` → `2027-01`. */
function meseDopo(mese: string): string {
  const [anno, m] = mese.split("-").map(Number);
  const a = anno ?? 2026;
  const n = (m ?? 1) + 1;
  return n > 12 ? `${a + 1}-01` : `${a}-${String(n).padStart(2, "0")}`;
}

/**
 * I mesi che questa spesa fissa deve ancora segnare.
 *
 * `giaSegnati` sono i mesi per cui il movimento c'è già: è quello che rende
 * l'operazione ripetibile senza danni, e aprire l'app dieci volte in un giorno
 * non segna dieci affitti.
 *
 * ⚠️ `massimo` è una rete, non una regola: se un telefono resta chiuso due anni
 * non gli si riempie il bilancio di trenta movimenti tutti insieme.
 */
export function mesiDaSegnare(
  f: SpesaFissa,
  oggi: Date,
  giaSegnati: string[],
  massimo = 12,
): string[] {
  if (!f.attiva) return [];

  const meseOggi = meseDi(oggi);
  const fatti = new Set(giaSegnati);
  const mesi: string[] = [];

  let m = f.daQuando;
  // Se la fissa nasce nel futuro non c'è niente da segnare, e il giro finisce subito.
  for (let passi = 0; passi < 400 && m <= meseOggi; passi++) {
    /* Il mese in corso si segna solo dal giorno impostato in poi: segnare
       l'affitto il 3 quando si paga il 5 vuol dire mettere nel bilancio una
       spesa che ancora non è uscita. */
    const arrivato = m < meseOggi || oggi.getDate() >= giornoBuono(f.giorno);
    if (arrivato && !fatti.has(m)) mesi.push(m);
    m = meseDopo(m);
  }

  return mesi.slice(-massimo);
}

/** Quanto pesa all'anno: è il numero che fa capire, più dell'importo del mese. */
export function pesoAnnuale(fisse: SpesaFissa[]): number {
  return fisse.filter((f) => f.attiva).reduce((t, f) => t + f.importo * 12, 0);
}
