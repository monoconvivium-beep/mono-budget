/**
 * DA DOVE ARRIVA UN ISCRITTO — le etichette del passaparola.
 *
 * 🔑 Il problema che risolve: il passaparola c'era già («Passala a un amico»),
 * ma non si poteva CONTARE. Un canale che non si conta non si può premiare:
 * né il negozio che tiene il cartoncino sul banco, né l'amico che ha girato
 * il link. Da qui in poi ogni strada porta la sua targa:
 *
 *   money.monobottega.it/?da=edicola      → il banco dell'edicola
 *   money.monobottega.it/?amico=PANE-42   → il link girato da un amico
 *
 * La targa si ricorda sul telefono e viaggia con l'iscrizione dentro la
 * colonna `notes` di `crm_contacts` — una colonna che c'è già: zero migrazioni.
 * L'esportazione poi conta per targa, e i premi si danno guardando i numeri.
 *
 * ⚠️ Non è un tracciamento: niente ID, niente impronte, niente terze parti.
 * È la parola scritta su un volantino — solo che il volantino è un indirizzo.
 * E non tocca la promessa di prima pagina: di soldi, qui, non passa niente.
 */

const CHIAVE_DA = "mono-money-da";
const CHIAVE_AMICO = "mono-money-amico";
const CHIAVE_CODICE = "mono-money-codice";

export interface Provenienza {
  /** Il canale: il banco o il posto da cui arriva il QR (`?da=`). */
  da?: string;
  /** Il codice personale di chi ha girato il link (`?amico=`). */
  amico?: string;
}

/**
 * Legge le targhe dall'indirizzo. Pura: si prova senza browser.
 * ⚠️ Ripulisce sul serio: quello che arriva da un indirizzo è testo di
 * chiunque, e finisce in una colonna che poi si apre in Excel.
 */
export function leggiProvenienza(search: string): Provenienza {
  const p = new URLSearchParams(search);
  const fuori: Provenienza = {};

  const da = ripulisci(p.get("da")?.toLowerCase(), "abcdefghijklmnopqrstuvwxyz0123456789-", 24);
  if (da) fuori.da = da;

  const amico = ripulisci(p.get("amico")?.toUpperCase(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-", 12);
  if (amico) fuori.amico = amico;

  return fuori;
}

function ripulisci(grezzo: string | null | undefined, ammessi: string, massimo: number): string {
  if (!grezzo) return "";
  let fuori = "";
  for (const c of grezzo) {
    if (ammessi.includes(c)) fuori += c;
    if (fuori.length >= massimo) break;
  }
  return fuori.replace(/^-+|-+$/g, "");
}

/**
 * Da chiamare all'avvio, PRIMA che il router riscriva l'indirizzo: se ci sono
 * targhe, le ricorda. Restano lì finché l'iscrizione non le consuma — chi
 * inquadra al banco e si iscrive la sera ha ancora la sua targa.
 */
export function ricordaProvenienza(): void {
  try {
    const p = leggiProvenienza(window.location.search);
    if (p.da) window.localStorage.setItem(CHIAVE_DA, p.da);
    if (p.amico) window.localStorage.setItem(CHIAVE_AMICO, p.amico);
  } catch {
    // Senza localStorage (navigazione anonima d'altri tempi) si vive lo stesso:
    // si perde solo l'etichetta, mai l'iscrizione.
  }
}

/** Le targhe ricordate, al momento dell'iscrizione. */
export function provenienzaSalvata(): Provenienza {
  try {
    const fuori: Provenienza = {};
    const da = window.localStorage.getItem(CHIAVE_DA);
    const amico = window.localStorage.getItem(CHIAVE_AMICO);
    if (da) fuori.da = da;
    if (amico) fuori.amico = amico;
    return fuori;
  } catch {
    return {};
  }
}

/**
 * La riga per la colonna `notes` della rubrica. Pura.
 * Formato fisso `da=… · amico=…`: lo rilegge l'esportazione, non cambiarlo
 * da solo — cambiarlo qui vuol dire azzerare i conteggi di là.
 */
export function notaProvenienza(p: Provenienza): string | null {
  const pezzi: string[] = [];
  if (p.da) pezzi.push(`da=${p.da}`);
  if (p.amico) pezzi.push(`amico=${p.amico}`);
  return pezzi.length ? `[mono-money] ${pezzi.join(" · ")}` : null;
}

/**
 * Le parole dei codici amico. Roba da bottega, corte e inconfondibili a voce:
 * il codice si DICE al banco («sono pane quarantadue»), non si compita.
 * ⚠️ Niente coppie che si somigliano: un codice capito male è un caffè dato
 * alla persona sbagliata.
 */
const PAROLE = [
  "PANE", "MELA", "PERA", "FICO", "NOCE", "MIELE", "SALE", "PEPE",
  "TIMO", "MENTA", "ANICE", "CACAO", "RISO", "ORZO", "FARRO", "MAIS",
  "KIWI", "PESCA", "PRUGNA", "SEDANO", "CAROTA", "PATATA", "FAVA", "CECI",
  "PINOLO", "SESAMO", "COCCO", "OLIVA", "SALVIA", "MIRTO", "LIMONE", "UVA",
] as const;

/** Un codice nuovo, tipo «PANE-42». Il caso si passa da fuori: così si prova. */
export function nuovoCodice(caso: () => number = Math.random): string {
  const parola = PAROLE[Math.floor(caso() * PAROLE.length)] ?? PAROLE[0];
  const numero = 10 + Math.floor(caso() * 90);
  return `${parola}-${numero}`;
}

/**
 * Il codice amico di QUESTO telefono: nasce la prima volta che serve e poi
 * non cambia più. Se cambiasse, i caffè maturati col codice vecchio non
 * tornerebbero più a nessuno.
 */
export function codiceAmico(): string {
  try {
    const salvato = window.localStorage.getItem(CHIAVE_CODICE);
    if (salvato) return salvato;
    const nuovo = nuovoCodice();
    window.localStorage.setItem(CHIAVE_CODICE, nuovo);
    return nuovo;
  } catch {
    return nuovoCodice();
  }
}
