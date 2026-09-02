/**
 * IL GRATTA E VINCI DI MONO — sette giorni di fila, e si gratta col dito.
 *
 * 🔑 IDEA SUA (9/8/2026): premiare **l'abitudine**, non la spesa. Conta usare
 * l'app in qualunque contesto — segnare una spesa, aggiungere alla lista,
 * aprire una ricetta — perché il regalo è l'app intera, non una sua parte.
 *
 * ⚠️ LE SUE QUATTRO REGOLE, dettate dopo il primo provino. Erano diverse
 * prima: se qualcuno le trova «strane», sono volute.
 * 1. **UNO SOLO PER PERSONA.** Non riparte ogni settimana: fatti i sette
 *    giorni, si gratta il proprio biglietto e finisce lì.
 * 2. **SI VINCE UN CAFFÈ AL BANCO.** Niente sconti, niente percentuali,
 *    niente codici da verificare: *«non ci andiamo a incasinare»*. Il caffè
 *    è lo specchietto per le allodole — uno entra per quello e compra il resto.
 * 3. **UN BIGLIETTO SU QUATTRO VINCE.** Gli altri no, e vanno detti bene.
 * 4. **VALE SEMPRE, TRANNE LA DOMENICA.**
 *
 * 🔑 PERCHÉ NIENTE CODICI: MonoConvivium non ha server, quindi un codice nato
 * qui dentro il banco non potrebbe comunque verificarlo. Meglio non fingere
 * una sicurezza che non c'è: si mostra la schermata alla cassa e il commesso
 * offre il caffè. Su un caffè, la fiducia costa meno di qualunque controllo.
 *
 * Tutto puro e con le sue prove: le date entrano come parametro, mai lette
 * dall'orologio qui dentro — se no le prove passerebbero solo certi giorni.
 */

/** Il giorno solare, senza ora: è l'unica cosa che conta per una striscia. */
export function giorno(d: Date): string {
  const a = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const g = String(d.getDate()).padStart(2, "0");
  return `${a}-${m}-${g}`;
}

/** Quanti giorni passano fra due date solari. Stesso giorno = 0. */
export function distanzaGiorni(da: string, a: string): number {
  const [a1, m1, g1] = da.split("-").map(Number);
  const [a2, m2, g2] = a.split("-").map(Number);
  const uno = Date.UTC(a1 ?? 0, (m1 ?? 1) - 1, g1 ?? 1);
  const due = Date.UTC(a2 ?? 0, (m2 ?? 1) - 1, g2 ?? 1);
  return Math.round((due - uno) / 86400000);
}

export const GIORNI_PER_VINCERE = 7;

export interface Striscia {
  /** Giorni di fila, oggi compreso. */
  fila: number;
  /** L'ultimo giorno in cui ha usato l'app. */
  ultimo: string;
}

/**
 * La striscia dopo un uso dell'app.
 *
 * 🔴 CORRETTO IL 23/8/2026, su sua segnalazione. Prima un giorno saltato era
 * «perdonato» e la striscia restava com'era. Sua regola, ridetta chiara:
 * **se un giorno non la usi, si riparte da zero.** «Di fila» vuol dire di fila.
 * ⚠️ Non contano gli ingressi: contano gli usi. Aprire l'app, guardarla e
 * chiuderla non è usarla — è la regola del 9/8, e non si tocca.
 */
export function registraUso(s: Striscia | null, oggi: string): Striscia {
  if (!s) return { fila: 1, ultimo: oggi };
  const salto = distanzaGiorni(s.ultimo, oggi);
  // Già contato oggi, o un orologio che va all'indietro: non si tocca niente.
  if (salto <= 0) return s;
  if (salto === 1) return { fila: s.fila + 1, ultimo: oggi };
  // Un giorno saltato e la fila è finita: si riparte da questo.
  return { fila: 1, ultimo: oggi };
}

/**
 * LA STRISCIA COM'È **OGGI**, non com'era l'ultima volta che l'hai usata.
 *
 * 🔴 IL DIFETTO CHE CURA (23/8/2026, trovato da lui): il numero dei giorni si
 * aggiornava **solo quando facevi qualcosa**. Chi usava l'app martedì,
 * mercoledì e giovedì e poi si limitava ad aprirla, continuava a vedere
 * **3 su 7 per sempre** — né avanti né azzerata: inchiodata. La schermata
 * raccontava una fila che non esisteva più, e la verità saltava fuori solo al
 * primo uso successivo, quando i pallini crollavano a uno senza spiegazione.
 *
 * 🔑 Qui la fila si giudica **contro la data di oggi**: vale se l'ultimo uso è
 * di oggi o di ieri, altrimenti è finita e si riparte. Così quello che si legge
 * sullo schermo è vero nel momento in cui lo si legge.
 * ⚠️ Non salva niente: è un modo di GUARDARE la striscia, non di cambiarla.
 * Quella scritta nel telefono la riscrive il prossimo uso, e va bene così.
 */
export function strisciaOggi(s: Striscia | null, oggi: string): Striscia | null {
  if (!s) return null;
  const salto = distanzaGiorni(s.ultimo, oggi);
  // Orologio spostato indietro: non si punisce nessuno per l'ora del telefono.
  if (salto < 0) return s;
  return salto <= 1 ? s : null;
}

/** I pallini da disegnare: quanti accesi su sette. */
export function pallini(s: Striscia | null): number {
  if (!s) return 0;
  return Math.min(s.fila, GIORNI_PER_VINCERE);
}

export function strisciaCompleta(s: Striscia | null): boolean {
  return !!s && s.fila >= GIORNI_PER_VINCERE;
}

/* ---------------------------------------------------------- il biglietto */

/**
 * Un biglietto su cinque vince — **20%**, sua correzione del 9/8 quando ha
 * deciso di trattarla come una promozione a tiratura: «500 gratta e vinci,
 * il 20% vincenti». Su 500 biglietti fanno **100 caffè**.
 *
 * ⚠️ I 500 NON SI CONTANO QUI E NON SI POSSONO CONTARE: senza server ogni
 * telefono è un'isola e non sa quanti biglietti esistono al mondo. Il tetto
 * è un fatto di BANCO — si conta là quanti caffè escono, e la promozione si
 * chiude quando arrivano a cento. Quello che l'app sa fare da sola è
 * smettere a una DATA, e quella è `FINE_PROMOZIONE`.
 */
export const QUOTA_VINCENTI = 0.2;

export interface Biglietto {
  esito: "vinto" | "niente";
  /** Finché è falso, la patina è ancora tutta lì. */
  grattato: boolean;
  emessoIl: string;
}

/**
 * Il biglietto nasce QUANDO SI COMPIONO I SETTE GIORNI, non quando si gratta:
 * l'esito è già dentro la busta, come in un gratta e vinci vero. Grattare
 * scopre una cosa già decisa, non la tira a sorte sotto il dito — e se
 * qualcuno chiude l'app a metà e riapre, ritrova lo stesso biglietto.
 */
export function nuovoBiglietto(oggi: string, caso: number): Biglietto {
  const sicuro = Number.isFinite(caso) ? Math.min(Math.max(caso, 0), 0.999999) : 0.999999;
  return {
    esito: sicuro < QUOTA_VINCENTI ? "vinto" : "niente",
    grattato: false,
    emessoIl: oggi,
  };
}

/**
 * Il biglietto si può emettere? Uno solo per persona: se ne è già stato
 * emesso uno — grattato o no, vinto o perso — non se ne fanno altri.
 */
export function puoEmettere(s: Striscia | null, b: Biglietto | null): boolean {
  return b === null && strisciaCompleta(s);
}

/**
 * Il caffè si prende tutti i giorni tranne la domenica (sua regola).
 * `getDay()`: 0 = domenica.
 */
export function domenica(d: Date): boolean {
  return d.getDay() === 0;
}

/** Il premio, scritto una volta sola e usato ovunque. */
export const PREMIO = "Un caffè al banco";
export const PREMIO_QUANDO = "Quando vuoi, tutti i giorni tranne la domenica";

/* ------------------------------------------------------------ la patina */

/**
 * Quanta patina è stata portata via, da 0 a 1.
 *
 * Legge SOLO il canale della trasparenza (uno ogni quattro numeri: rosso,
 * verde, blu, trasparenza) e conta i punti diventati trasparenti — cioè
 * quelli che il dito ha cancellato.
 *
 * `passo` salta dei punti per non contarli tutti a ogni passata: leggere un
 * milione di numeri mentre il dito si muove fa scattare il disegno.
 */
export function frazioneGrattata(dati: ArrayLike<number>, passo = 40): number {
  if (dati.length === 0) return 0;
  let vuoti = 0;
  let letti = 0;
  for (let i = 3; i < dati.length; i += 4 * passo) {
    if ((dati[i] ?? 255) < 40) vuoti++;
    letti++;
  }
  return letti === 0 ? 0 : vuoti / letti;
}

/**
 * Da qui in poi il velo si toglie da solo.
 * ⚠️ Un terzo, non tutto: aspettando che grattino l'ultimo angolo resta
 * sempre il bordo attaccato e la gente ci litiga. Quando ne ha tolto un
 * terzo ha già capito cosa c'è sotto.
 */
export const SOGLIA_SCOPERTA = 0.33;

export function abbastanzaGrattata(dati: ArrayLike<number>, passo = 40): boolean {
  return frazioneGrattata(dati, passo) > SOGLIA_SCOPERTA;
}
