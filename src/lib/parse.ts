/**
 * MONO MONEY — comprensione dell'italiano parlato.
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

export type Categoria = (typeof CATEGORIE)[number];

export const COLORI_CATEGORIA: Record<Categoria, string> = {
  Casa: "#4E6B47",
  "Spesa alimentare": "#CBA75A",
  Bar: "#B5723F",
  Ristoranti: "#B85C38",
  Tabacchi: "#6E6A3C",
  Trasporti: "#262321",
  Salute: "#A83A28",
  Abbonamenti: "#E27A60",
  Shopping: "#CBA75A",
  "Tempo libero": "#7E9247",
  Altro: "#8A8578",
};

/** Sinonimi riconosciuti per ogni categoria. */
export const SINONIMI: Record<Exclude<Categoria, "Altro">, string[]> = {
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
  if (p in UNITA) return UNITA[p];
  if (p in DECINE) return DECINE[p];
  if (p === "cento") return 100;
  if (p === "mille") return 1000;

  // decine composte: ventuno, quarantasei, trentatre...
  for (const [dec, val] of Object.entries(DECINE)) {
    const radice = dec.slice(0, -1); // vent, trent, quarant...
    if (p.startsWith(radice) && p.length > radice.length) {
      const resto = p.slice(radice.length);
      if (resto === "uno" || resto === "otto") return val + UNITA[resto];
      if (resto.startsWith("i") || resto.startsWith("a")) {
        const r2 = resto.slice(1);
        if (r2 in UNITA && UNITA[r2] < 10) return val + UNITA[r2];
      }
      if (resto in UNITA && UNITA[resto] < 10) return val + UNITA[resto];
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
  return testo
    .toLowerCase()
    .replace(/€/g, " euro ")
    .replace(/\s+/g, " ")
    .trim();
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
    const t = token[i];
    const numDec = t.match(/^(\d+)[.,](\d{1,2})$/);
    if (numDec) {
      valore = parseInt(numDec[1], 10) + parseInt(numDec[2].padEnd(2, "0"), 10) / 100;
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
      const t = token[i];
      if (EURO.has(t) || t === "e" || t === "con" || t === "virgola") continue;
      const n = /^\d+$/.test(t) ? parseInt(t, 10) : parolaANumero(t);
      if (n === null) break;
      const dopo = token[i + 1];
      const eCentesimi = dopo ? CENT.has(dopo) : false;
      const primaCeEuro = token.slice(primo, i).some((x) => EURO.has(x));
      const virgola = token[i - 1] === "virgola";
      if (n < 100 && (eCentesimi || primaCeEuro || virgola)) {
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
): { categoria: Categoria; incerta: boolean } {
  const t = " " + normalizza(testo) + " ";

  for (const r of regole) {
    const k = normalizza(r.chiave);
    if (k && t.includes(" " + k)) return { categoria: r.categoria, incerta: false };
  }

  let migliore: { categoria: Categoria; lunghezza: number } | null = null;
  for (const [cat, parole] of Object.entries(SINONIMI)) {
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

function creaMovimento(frase: string, regole: RegolaImparata[]): MovimentoBozza | null {
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

  const { categoria, incerta } = trovaCategoria(frase, regole);

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
  const n = /^\d+$/.test(token[0]) ? parseInt(token[0], 10) : parolaANumero(token[0]);
  if (n === null || n >= 100) return null;
  return n;
}

/**
 * Interpreta una frase dettata e restituisce i movimenti riconosciuti.
 * La parola "e" separa due spese, ma solo quando la seconda parte è una spesa.
 */
export function interpreta(frase: string, regole: RegolaImparata[] = []): MovimentoBozza[] {
  const testo = normalizza(frase);
  if (!testo) return [];

  const pezzi = testo.split(/\s+e\s+/);
  const gruppi: string[] = [];

  for (const pezzo of pezzi) {
    if (!gruppi.length) {
      gruppi.push(pezzo);
      continue;
    }
    const precedente = gruppi[gruppi.length - 1];
    const cent = soloCentesimi(pezzo);
    const precHaEuro = tokenizza(precedente).some((t) => EURO.has(t));
    const haImporto = estraiImporto(tokenizza(pezzo)) !== null;

    if (cent !== null && precHaEuro) {
      gruppi[gruppi.length - 1] = precedente + " e " + pezzo;
    } else if (!haImporto) {
      gruppi[gruppi.length - 1] = precedente + " e " + pezzo;
    } else {
      gruppi.push(pezzo);
    }
  }

  const risultati: MovimentoBozza[] = [];
  for (const g of gruppi) {
    const m = creaMovimento(g, regole);
    if (m) risultati.push(m);
  }
  return risultati;
}

/** Formatta un importo in euro, alla italiana. */
export function euro(n: number): string {
  return (
    n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"
  );
}
