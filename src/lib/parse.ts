/**
 * MonoConvivium — comprensione dell'italiano parlato.
 *
 * File PURO: nessun React, nessuna grafica, nessuna rete.
 * Riceve una frase e restituisce i movimenti riconosciuti.
 */

export const CATEGORIE = [
  "Casa",
  "Spesa alimentare",
  "Bar",
  "Ristoranti",
  "Tabacchi",
  "Trasporti",
  "Salute",
  "Abbonamenti",
  "Shopping",
  "Tempo libero",
  "Altro",
] as const;

/** Le undici di casa: quelle che ci sono già all'apertura. */
export type CategoriaBase = (typeof CATEGORIE)[number];

/**
 * Una categoria è **testo libero**, non un elenco chiuso.
 *
 * 🔴 Perché: «Trasporti» tiene dentro la benzina e il biglietto del pullman,
 * che sono due spese diverse per chi le guarda a fine mese. Un elenco deciso
 * da noi costringe a scegliere la casella meno sbagliata, e un bilancio fatto
 * di caselle meno sbagliate non serve a nessuno.
 *
 * Le undici di casa restano, e restano prime: sono il punto di partenza, non
 * il recinto.
 */
export type Categoria = string;

export const COLORI_CATEGORIA: Record<CategoriaBase, string> = {
  Casa: "#4E6B47",
  "Spesa alimentare": "#CBA75A",
  Bar: "#B5723F",
  Ristoranti: "#B85C38",
  Tabacchi: "#6E6A3C",
  Trasporti: "#262321",
  Salute: "#A83A28",
  Abbonamenti: "#E27A60",
  /**
   * ⚠️ Prugna, non oro. Prima Shopping e Spesa alimentare avevano lo stesso
   * `#CBA75A`: nella torta due fette con lo stesso colore non sono un dettaglio
   * estetico, sono un grafico che mente — chi guarda le legge come una sola.
   */
  Shopping: "#6E4B63",
  "Tempo libero": "#7E9247",
  Altro: "#8A8578",
};

/** Una categoria creata da chi usa l'app: un nome e un colore, niente altro. */
export interface CategoriaPersonale {
  nome: string;
  colore: string;
}

/**
 * I colori per le categorie nuove.
 *
 * Restano dentro la tavolozza MONO: una categoria inventata non deve sembrare
 * appiccicata da un'altra app. Sono tutti diversi da quelli delle undici di
 * casa, perché nella torta due fette dello stesso colore si leggono come una
 * sola — la lezione già pagata con Shopping e Spesa alimentare.
 */
export const COLORI_DISPONIBILI = [
  "#7A5C3E", // cuoio
  "#3F6B6B", // ottanio
  "#9A6A2F", // ambra scura
  "#5B5F7E", // ardesia
  "#8C5A70", // prugna chiara
  "#4F7355", // salvia scura
  "#A8763A", // rame
  "#6B4E7A", // viola scuro
  "#37585F", // petrolio
  "#8E5A48", // mattone chiaro
] as const;

/**
 * IL COLORE DI UNA CATEGORIA, di casa o inventata.
 *
 * Per le nuove il colore **si calcola dal nome**, non si sorteggia: la stessa
 * categoria deve avere sempre lo stesso colore, su questo telefono e sul
 * prossimo, altrimenti la torta cambia significato a ogni apertura.
 */
export function coloreCategoria(nome: Categoria, personali: CategoriaPersonale[] = []): string {
  const scelto = personali.find((c) => c.nome === nome)?.colore;
  if (scelto) return scelto;
  if (nome in COLORI_CATEGORIA) return COLORI_CATEGORIA[nome as CategoriaBase];
  return COLORI_DISPONIBILI[impronta(nome) % COLORI_DISPONIBILI.length] ?? COLORI_CATEGORIA.Altro;
}

/** Numero stabile ricavato da un nome: stesso nome, stesso numero, sempre. */
function impronta(testo: string): number {
  let somma = 0;
  for (const carattere of testo.toLocaleLowerCase("it")) {
    somma = (somma * 31 + carattere.charCodeAt(0)) % 100000;
  }
  return somma;
}

/**
 * Il colore da proporre a una categoria nuova: il primo della tavolozza che
 * non è già in uso, così due categorie create di fila non si somigliano.
 */
export function coloreLibero(giaUsati: string[]): string {
  return (
    COLORI_DISPONIBILI.find((c) => !giaUsati.includes(c)) ??
    COLORI_DISPONIBILI[giaUsati.length % COLORI_DISPONIBILI.length] ??
    COLORI_CATEGORIA.Altro
  );
}

/** I due soli inchiostri di casa: la carta e la seppia. Non se ne inventano altri. */
const CASHMERE = "#F4ECDD";
const SEPPIA = "#262321";

/**
 * QUALE DEI DUE INCHIOSTRI SI LEGGE SU QUESTO COLORE.
 *
 * 🔴 Perché esiste (misurato il 15/8/2026): le pillole delle categorie
 * scrivevano **sempre in cashmere**, su undici fondi diversi. Su sei di quegli
 * undici il risultato era sotto la soglia di leggibilità, e il caso peggiore
 * era proprio **Spesa alimentare** — l'oro, il colore più usato in un'app di
 * una bottega di gastronomia — con **1,94 contro il 4,5 richiesto**: giallo
 * chiaro su giallo chiaro. Anche Abbonamenti (2,49), Tempo libero (2,94),
 * Altro (3,13), Bar (3,29) e Ristoranti (3,87) erano da riguardare.
 *
 * 🔑 Non si cambia nessun colore di categoria — quelli sono il codice con cui
 * si legge la torta, e toccarli vorrebbe dire ridisegnare i grafici. Si cambia
 * **l'inchiostro sopra**: chiaro sui fondi scuri, scuro sui fondi chiari.
 * La scelta non è a occhio: si calcola, e vince quello che stacca di più.
 *
 * ⚠️ Il conto è quello ufficiale (WCAG), su luminanza relativa: sotto 4,5 una
 * scritta piccola non si legge alla luce del sole, che è dove uno guarda il
 * telefono quando è al banco.
 */
export function inchiostroSu(sfondoEsadecimale: string): string {
  const l = luminanza(sfondoEsadecimale);
  const conChiaro = (luminanza(CASHMERE) + 0.05) / (l + 0.05);
  const conScuro = (l + 0.05) / (luminanza(SEPPIA) + 0.05);
  return conScuro >= conChiaro ? SEPPIA : CASHMERE;
}

/** Luminanza relativa di un colore `#rrggbb`, come la definisce lo standard. */
export function luminanza(esadecimale: string): number {
  const pulito = esadecimale.replace("#", "");
  const canale = (da: number) => {
    const v = parseInt(pulito.slice(da, da + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * canale(0) + 0.7152 * canale(2) + 0.0722 * canale(4);
}

/** Quanto stacca un colore da un altro: 1 = identici, 21 = nero su bianco. */
export function contrasto(a: string, b: string): number {
  const la = luminanza(a);
  const lb = luminanza(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const SOGLIA_LEGGIBILE = 4.5;

/**
 * LA PILLOLA DI UNA CATEGORIA: che fondo e che inchiostro.
 *
 * 🔴 Due colori — **Ristoranti** (#B85C38) e **Altro** (#8A8578) — stanno
 * proprio in mezzo: né abbastanza scuri per il cashmere, né abbastanza chiari
 * per la seppia. Con l'inchiostro migliore arrivavano a 4,2 e 4,3, sotto la
 * soglia. Per quelli, e solo per quelli, il **fondo della pillola** si scurisce
 * di un soffio finché la scritta si legge.
 *
 * ⚠️ NON si tocca `COLORI_CATEGORIA`: quelli sono i colori con cui si legge la
 * torta dei bilanci, e cambiarli vorrebbe dire cambiare il significato dei
 * grafici. Qui si aggiusta **solo la pastiglia scritta**, e di pochissimo: chi
 * guarda vede lo stesso colore di prima, un filo più profondo.
 * 🔑 Vale anche per le categorie che verranno: si calcola, non si sceglie.
 */
export function pillolaDi(
  categoria: Categoria,
  personali: CategoriaPersonale[] = [],
): { fondo: string; inchiostro: string } {
  let fondo = coloreCategoria(categoria, personali);
  let inchiostro = inchiostroSu(fondo);

  // Al massimo venti passi da un decimo: oltre non è più lo stesso colore, e
  // un colore irriconoscibile è un difetto peggiore di quello che si cura.
  for (let passo = 0; passo < 20 && contrasto(inchiostro, fondo) < SOGLIA_LEGGIBILE; passo++) {
    fondo = scurisci(fondo, 0.06);
    inchiostro = inchiostroSu(fondo);
  }
  return { fondo, inchiostro };
}

/** Lo stesso colore, un po' più profondo. */
function scurisci(esadecimale: string, quanto: number): string {
  const pulito = esadecimale.replace("#", "");
  const canale = (da: number) => {
    const v = parseInt(pulito.slice(da, da + 2), 16);
    return Math.round(Math.max(0, v * (1 - quanto)));
  };
  const due = (n: number) => n.toString(16).padStart(2, "0");
  return `#${due(canale(0))}${due(canale(2))}${due(canale(4))}`;
}

/** Sinonimi riconosciuti per ogni categoria. */
export const SINONIMI: Record<Exclude<CategoriaBase, "Altro">, string[]> = {
  Casa: [
    "casa",
    "affitto",
    "bollette",
    "bolletta",
    "luce",
    "gas",
    "acqua",
    "condominio",
    "mutuo",
    "ferramenta",
    "pulizie",
    "detersivi",
  ],
  "Spesa alimentare": [
    "spesa",
    "supermercato",
    "market",
    "alimentari",
    "gastronomia",
    "mono",
    "panetteria",
    "panettiere",
    "forno",
    "macelleria",
    "macellaio",
    "pescheria",
    "fruttivendolo",
    "frutta",
    "verdura",
    "pane",
    "latte",
    "drogheria",
  ],
  Bar: [
    "bar",
    "caffè",
    "caffe",
    "cappuccino",
    "colazione",
    "brioche",
    "cornetto",
    "aperitivo",
    "spritz",
    "birra",
  ],
  Ristoranti: [
    "ristorante",
    "trattoria",
    "osteria",
    "pizzeria",
    "pizza",
    "pranzo",
    "cena",
    "sushi",
    "hamburger",
    "mensa",
    "asporto",
  ],
  Tabacchi: [
    "tabacchi",
    "tabaccaio",
    // Torinese come lui: al banco si dice così più spesso che «tabaccaio».
    "tabaccheria",
    "sigarette",
    "tabacco",
    "gratta e vinci",
    "lotto",
    "francobolli",
    "valori bollati",
  ],
  Trasporti: [
    "trasporti",
    "benzina",
    "gasolio",
    "diesel",
    "carburante",
    "biglietto",
    "biglietti",
    "autobus",
    "bus",
    "tram",
    "metro",
    "metropolitana",
    "treno",
    "taxi",
    "parcheggio",
    "pedaggio",
    "autostrada",
    "gtt",
    "abbonamento bus",
    "meccanico",
    "gomme",
    "bici",
  ],
  Salute: [
    "salute",
    "farmacia",
    "farmacie",
    "farmaco",
    "medicine",
    "medicina",
    "dottore",
    "medico",
    "dentista",
    "analisi",
    "ticket",
    "ospedale",
    "fisioterapia",
    "occhiali",
    "ottico",
    "veterinario",
  ],
  Abbonamenti: [
    "abbonamento",
    "abbonamenti",
    "netflix",
    "spotify",
    "telefono",
    "sim",
    "internet",
    "wifi",
    "cloud",
    "palestra abbonamento",
    "rinnovo",
    "canone",
  ],
  Shopping: [
    "shopping",
    "vestiti",
    "vestito",
    "scarpe",
    "maglietta",
    "pantaloni",
    "negozio",
    "amazon",
    "regalo",
    "regali",
    "profumeria",
    "libreria",
    "libro",
    "cartoleria",
    "elettronica",
  ],
  "Tempo libero": [
    "tempo libero",
    "cinema",
    "teatro",
    "concerto",
    "museo",
    "mostra",
    "palestra",
    "piscina",
    "calcetto",
    "gita",
    "viaggio",
    "hotel",
    "vacanza",
    "gioco",
    "videogioco",
  ],
};

const PAROLE_ENTRATA = [
  "entrata",
  "entrate",
  "incasso",
  "incassato",
  "stipendio",
  "ricevuto",
  "ricevuti",
  "guadagno",
  "guadagnato",
  "rimborso",
  "rimborsato",
  "regalo ricevuto",
  "paga",
  "bonifico ricevuto",
];

export type Metodo = "contanti" | "carta" | null;
export type Tipo = "uscita" | "entrata";

export interface MovimentoBozza {
  /** Importo in euro, positivo. */
  importo: number;
  categoria: Categoria;
  /** Etichetta leggibile (la cosa comprata). */
  etichetta: string;
  tipo: Tipo;
  metodo: Metodo;
  /** Frase originale da cui è nato il movimento. */
  testo: string;
  /** True quando l'importo sembra "collassato" (es. 460 invece di 4,60). */
  importoSospetto: boolean;
  /** Lettura alternativa in centesimi, da PROPORRE (mai applicare di nascosto). */
  importoAlternativo: number | null;
  /** True quando nessun sinonimo ha corrisposto: l'app lo dice, non indovina. */
  categoriaIncerta: boolean;
}

/* ------------------------------------------------------------------ numeri */

const UNITA: Record<string, number> = {
  zero: 0,
  uno: 1,
  una: 1,
  un: 1,
  due: 2,
  tre: 3,
  quattro: 4,
  cinque: 5,
  sei: 6,
  sette: 7,
  otto: 8,
  nove: 9,
  dieci: 10,
  undici: 11,
  dodici: 12,
  tredici: 13,
  quattordici: 14,
  quindici: 15,
  sedici: 16,
  diciassette: 17,
  diciotto: 18,
  diciannove: 19,
};

const DECINE: Record<string, number> = {
  venti: 20,
  trenta: 30,
  quaranta: 40,
  cinquanta: 50,
  sessanta: 60,
  settanta: 70,
  ottanta: 80,
  novanta: 90,
};

/** Converte una singola parola-numero italiana (anche composta) in numero. */
export function parolaANumero(parola: string): number | null {
  const p = parola.toLowerCase().replace(/[^a-zàèéìòù]/g, "");
  if (!p) return null;
  const u0 = UNITA[p];
  if (u0 !== undefined) return u0;
  const d0 = DECINE[p];
  if (d0 !== undefined) return d0;
  if (p === "cento") return 100;
  if (p === "mille") return 1000;

  // decine composte: ventuno, quarantasei, trentatre...
  for (const [dec, val] of Object.entries(DECINE)) {
    const radice = dec.slice(0, -1); // vent, trent, quarant...
    if (p.startsWith(radice) && p.length > radice.length) {
      const resto = p.slice(radice.length);
      if (resto === "uno" || resto === "otto") return val + (UNITA[resto] ?? 0);
      if (resto.startsWith("i") || resto.startsWith("a")) {
        const r2 = UNITA[resto.slice(1)];
        if (r2 !== undefined && r2 < 10) return val + r2;
      }
      const r3 = UNITA[resto];
      if (r3 !== undefined && r3 < 10) return val + r3;
      if (resto === "tré" || resto === "tre") return val + 3;
    }
  }

  // centoventi, duecento, trecentocinquanta, milleduecento
  const mMille = p.match(/^(.*)mille?(.*)$/);
  if (mMille) {
    const pre = mMille[1] ? parolaANumero(mMille[1]) : 1;
    const post = mMille[2] ? parolaANumero(mMille[2]) : 0;
    if (pre !== null && post !== null) return pre * 1000 + post;
  }
  const mCento = p.match(/^(.*)cento(.*)$/);
  if (mCento) {
    const pre = mCento[1] ? parolaANumero(mCento[1]) : 1;
    const post = mCento[2] ? parolaANumero(mCento[2]) : 0;
    if (pre !== null && post !== null) return pre * 100 + post;
  }
  return null;
}

interface Importo {
  valore: number;
  conEuro: boolean;
  conDecimali: boolean;
  centesimiEspliciti: boolean;
  /** indici dei token consumati */
  usati: Set<number>;
}

function normalizza(testo: string): string {
  return testo.toLowerCase().replace(/€/g, " euro ").replace(/\s+/g, " ").trim();
}

function tokenizza(testo: string): string[] {
  return normalizza(testo).split(" ").filter(Boolean);
}

const EURO = new Set(["euro", "eur", "euri"]);
const CENT = new Set(["centesimi", "centesimo", "cent", "centesim"]);

function estraiImporto(token: string[]): Importo | null {
  const usati = new Set<number>();
  let valore: number | null = null;
  let conDecimali = false;
  let centesimiEspliciti = false;

  for (let i = 0; i < token.length; i++) {
    const t = token[i] ?? "";
    const numDec = t.match(/^(\d+)[.,](\d{1,2})$/);
    if (numDec) {
      valore =
        parseInt(numDec[1] ?? "0", 10) + parseInt((numDec[2] ?? "0").padEnd(2, "0"), 10) / 100;
      conDecimali = true;
      usati.add(i);
      break;
    }
    if (/^\d+$/.test(t)) {
      valore = parseInt(t, 10);
      usati.add(i);
      break;
    }
    const n = parolaANumero(t);
    if (n !== null) {
      valore = n;
      usati.add(i);
      break;
    }
  }
  if (valore === null) return null;

  const primo = Math.min(...usati);
  const conEuro = token.some((t) => EURO.has(t));

  // "quattro euro e sessanta" / "quattro euro sessanta" -> 4,60
  if (!conDecimali) {
    for (let i = primo + 1; i < Math.min(token.length, primo + 5); i++) {
      const t = token[i] ?? "";
      if (EURO.has(t) || t === "e" || t === "con" || t === "virgola") continue;
      const n = /^\d+$/.test(t) ? parseInt(t, 10) : parolaANumero(t);
      if (n === null) break;
      const dopo = token[i + 1];
      const eCentesimi = dopo ? CENT.has(dopo) : false;
      const primaCeEuro = token.slice(primo, i).some((x) => EURO.has(x));
      const virgola = token[i - 1] === "virgola";
      /**
       * «Quattro e sessanta» sono 4,60, non quattro spese e sessanta spese.
       *
       * 🔑 Vale **solo se la prima cifra è sotto cento**: è così che si dice un
       * prezzo. «Cento e venti» invece non è 100,20 — nessuno legge un prezzo
       * così — e infatti lì non si unisce.
       * ⚠️ Conseguenza accettata: «dieci e dieci» diventa 10,10 e non due spese
       * da dieci. Va bene, perché adesso **un tocco = una spesa**: due spese si
       * dettano in due volte, e chi dice «dieci e dieci» in un colpo solo sta
       * quasi sempre leggendo un prezzo.
       */
      const prezzoConCentesimi = valore < 100;
      if (n < 100 && (eCentesimi || primaCeEuro || virgola || prezzoConCentesimi)) {
        valore = valore + n / 100;
        conDecimali = true;
        usati.add(i);
        if (eCentesimi) {
          centesimiEspliciti = true;
          usati.add(i + 1);
        }
      }
      break;
    }
  }

  // "ottanta centesimi" -> 0,80
  if (!conDecimali && valore < 100) {
    const idx = primo;
    const dopo = token[idx + 1];
    if (dopo && CENT.has(dopo)) {
      valore = valore / 100;
      centesimiEspliciti = true;
      conDecimali = true;
      usati.add(idx + 1);
    }
  }

  return { valore, conEuro, conDecimali, centesimiEspliciti, usati };
}

/* ------------------------------------------------------------- categorie */

export interface RegolaImparata {
  chiave: string;
  categoria: Categoria;
}

function trovaCategoria(
  testo: string,
  regole: RegolaImparata[],
  /**
   * Le categorie SPENTE da chi usa l'app: la voce non le sceglie più.
   * 🔑 Chi ha spento «Tabacchi» perché non fuma non vuole vedersi arrivare
   * una spesa lì dentro perché ha detto «tabaccheria»: finisce in «Altro»,
   * che è dove sta quello che l'app non sa dove mettere.
   */
  spente: string[] = [],
): { categoria: Categoria; incerta: boolean } {
  const t = " " + normalizza(testo) + " ";

  for (const r of regole) {
    const k = normalizza(r.chiave);
    if (k && t.includes(" " + k) && !spente.includes(r.categoria))
      return { categoria: r.categoria, incerta: false };
  }

  let migliore: { categoria: Categoria; lunghezza: number } | null = null;
  for (const [cat, parole] of Object.entries(SINONIMI)) {
    if (spente.includes(cat)) continue;
    for (const p of parole) {
      if (t.includes(" " + p)) {
        if (!migliore || p.length > migliore.lunghezza) {
          migliore = { categoria: cat as Categoria, lunghezza: p.length };
        }
      }
    }
  }
  if (migliore) return { categoria: migliore.categoria, incerta: false };
  return { categoria: "Altro", incerta: true };
}

/* ------------------------------------------------------------- movimenti */

const PAROLE_DA_TOGLIERE = new Set([
  "euro",
  "eur",
  "euri",
  "centesimi",
  "centesimo",
  "cent",
  "di",
  "per",
  "al",
  "in",
  "a",
  "da",
  "spesi",
  "speso",
  "pagato",
  "pagati",
  "ho",
  "con",
  "virgola",
  "e",
  "contanti",
  "carta",
  "bancomat",
  "pos",
]);

function etichettaDa(token: string[], usati: Set<number>): string {
  const parole = token
    .filter((_, i) => !usati.has(i))
    .filter((t) => !PAROLE_DA_TOGLIERE.has(t))
    .filter((t) => !/^\d+([.,]\d+)?$/.test(t));
  const s = parole.join(" ").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

function creaMovimento(
  frase: string,
  regole: RegolaImparata[],
  spente: string[] = [],
): MovimentoBozza | null {
  const token = tokenizza(frase);
  if (!token.length) return null;
  const imp = estraiImporto(token);
  if (!imp || imp.valore <= 0) return null;

  const testoNorm = " " + normalizza(frase) + " ";
  const tipo: Tipo = PAROLE_ENTRATA.some((p) => testoNorm.includes(" " + p)) ? "entrata" : "uscita";
  const metodo: Metodo = /\b(contanti|cash|liquidi)\b/.test(testoNorm)
    ? "contanti"
    : /\b(carta|bancomat|pos|credito)\b/.test(testoNorm)
      ? "carta"
      : null;

  const { categoria, incerta } = trovaCategoria(frase, regole, spente);

  // Trappola misurata: il riconoscimento scrive "quattro e sessanta" come 460.
  const sospetto =
    !imp.conEuro &&
    !imp.conDecimali &&
    !imp.centesimiEspliciti &&
    imp.valore >= 100 &&
    imp.valore < 10000 &&
    imp.valore % 100 !== 0;

  return {
    importo: Math.round(imp.valore * 100) / 100,
    categoria,
    etichetta: etichettaDa(token, imp.usati) || categoria,
    tipo,
    metodo,
    testo: normalizza(frase),
    importoSospetto: sospetto,
    importoAlternativo: sospetto ? Math.round(imp.valore) / 100 : null,
    categoriaIncerta: incerta,
  };
}

/** Un pezzo è "solo centesimi" della spesa precedente? ("quattro euro" + "sessanta") */
function soloCentesimi(pezzo: string): number | null {
  const token = tokenizza(pezzo);
  if (token.length !== 1) return null;
  const t0 = token[0] ?? "";
  const n = /^\d+$/.test(t0) ? parseInt(t0, 10) : parolaANumero(t0);
  if (n === null || n >= 100) return null;
  return n;
}

/** Il pezzo inizia con un numero minore di cento? ("sessanta caffè") */
function primoNumeroPiccolo(pezzo: string): number | null {
  const t0 = tokenizza(pezzo)[0] ?? "";
  const n = /^\d+$/.test(t0) ? parseInt(t0, 10) : parolaANumero(t0);
  if (n === null || n >= 100) return null;
  return n;
}

/**
 * Interpreta una frase dettata e restituisce i movimenti riconosciuti.
 * La parola "e" separa due spese, ma solo quando la seconda parte è una spesa.
 */
/** `spente` = le categorie che chi usa l'app ha spento: la voce non le sceglie più. */
export function interpreta(
  frase: string,
  regole: RegolaImparata[] = [],
  spente: string[] = [],
): MovimentoBozza[] {
  const testo = normalizza(frase);
  if (!testo) return [];

  const pezzi = testo.split(/\s+e\s+/);
  const gruppi: string[] = [];

  for (const pezzo of pezzi) {
    if (!gruppi.length) {
      gruppi.push(pezzo);
      continue;
    }
    const precedente = gruppi[gruppi.length - 1] ?? "";
    const tokenPrec = tokenizza(precedente);
    // "quattro euro" + "sessanta" -> centesimi, non una seconda spesa.
    const precFinisceConEuro = EURO.has(tokenPrec[tokenPrec.length - 1] ?? "");
    const cent = soloCentesimi(pezzo) ?? primoNumeroPiccolo(pezzo);
    const haImporto = estraiImporto(tokenizza(pezzo)) !== null;

    /**
     * «Quattro e sessanta» = 4,60, non due spese.
     *
     * 🔑 La domanda giusta si fa su quello che viene **PRIMA** della «e», non
     * dopo: «quattro», da solo, non è una spesa — è mezzo prezzo, e quello che
     * segue sono i suoi centesimi. Se invece prima c'è già una spesa intera
     * («dieci euro bar»), allora la «e» separa davvero.
     * ⚠️ Guardare il pezzo DOPO non funziona: in «quattro e sessanta al bar» il
     * pezzo dopo è «sessanta al bar», che sembra una spesa in tutto e per tutto.
     * ⚠️ «Cento e venti» resta fuori da solo: `soloCentesimi` scarta i numeri da
     * cento in su, e un prezzo con i centesimi comincia sempre sotto.
     */
    const precEMezzoPrezzo = soloCentesimi(precedente) !== null;
    const sonoCentesimi = precEMezzoPrezzo && primoNumeroPiccolo(pezzo) !== null;

    if (sonoCentesimi) {
      gruppi[gruppi.length - 1] = precedente + " e " + pezzo;
    } else if (cent !== null && precFinisceConEuro) {
      gruppi[gruppi.length - 1] = precedente + " e " + pezzo;
    } else if (!haImporto) {
      gruppi[gruppi.length - 1] = precedente + " e " + pezzo;
    } else {
      gruppi.push(pezzo);
    }
  }

  const risultati: MovimentoBozza[] = [];
  for (const g of gruppi) {
    const m = creaMovimento(g, regole, spente);
    if (m) risultati.push(m);
  }
  return risultati;
}

/**
 * Formatta un importo in euro, alla italiana.
 *
 * ⚠️ `useGrouping: true` non è un vezzo. Senza, l'italiano **non mette il
 * punto sotto le diecimila**: verrebbe «1500,00 €» invece di «1.500,00 €».
 * È la regola dei numeri, ma non è come si scrivono i soldi qui — su una busta
 * paga o uno scontrino il punto c'è sempre, e una cifra senza sembra un errore
 * di battitura proprio dove non ci si può permettere di sembrare approssimativi.
 */
export function euro(n: number): string {
  return (
    n.toLocaleString("it-IT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      // `true` vale "sempre": verificato nel browser, dà 1.500,00.
      useGrouping: true,
    }) + " €"
  );
}
