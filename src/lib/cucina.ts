/**
 * L'INTERPRETE DI CUCINA — il cervello dietro la dettatura delle ricette.
 *
 * 🔑 L'orecchio è quello del telefono (gratis); questo è il pezzo NOSTRO:
 * trasforma l'italiano parlato in righe da ricettario, come `parse.ts` fa
 * con le spese. «trecento grammi di fagioli» → «300 g fagioli»,
 * «un litro e mezzo di brodo» → «1,5 l brodo», «sale quanto basta» → «sale q.b.»
 *
 * ⚠️ La regola di tutta l'app vale anche qui: si trasforma SOLO quello che si
 * capisce. Se una frase non torna, esce pulita ma intera — mai buttare via
 * le parole di qualcuno per farle stare in uno schema.
 */

import { parolaANumero } from "./parse";

/* ------------------------------------------------------------------ misure */

/**
 * Le misure che diventano simbolo. Tutto il resto — bacche, rametti, tuorli,
 * cucchiai — resta parola: «4 tuorli» non ha bisogno di aiuto.
 * `fattore`/`diventa`: gli etti si dicono ma non si scrivono — 2 etti = 200 g.
 */
const MISURE: Record<string, { simbolo: string; fattore?: number; diventa?: string }> = {
  grammi: { simbolo: "g" },
  grammo: { simbolo: "g" },
  gr: { simbolo: "g" },
  g: { simbolo: "g" },
  chilogrammi: { simbolo: "kg" },
  chilogrammo: { simbolo: "kg" },
  chili: { simbolo: "kg" },
  chilo: { simbolo: "kg" },
  kg: { simbolo: "kg" },
  etti: { simbolo: "g", fattore: 100 },
  etto: { simbolo: "g", fattore: 100 },
  millilitri: { simbolo: "ml" },
  millilitro: { simbolo: "ml" },
  ml: { simbolo: "ml" },
  centilitri: { simbolo: "cl" },
  centilitro: { simbolo: "cl" },
  cl: { simbolo: "cl" },
  decilitri: { simbolo: "dl" },
  decilitro: { simbolo: "dl" },
  dl: { simbolo: "dl" },
  litri: { simbolo: "l" },
  litro: { simbolo: "l" },
  l: { simbolo: "l" },
};

/* ------------------------------------------------------------- gli attrezzi */

function pulisci(testo: string): string {
  return testo.replace(/\s+/g, " ").trim();
}

/** «300g» detto o scritto attaccato → «300 g», per non perdere la misura. */
function staccaMisure(testo: string): string {
  return testo.replace(/(\d)(g|gr|kg|ml|cl|dl|l)\b/gi, "$1 $2");
}

function eNumero(token: string): number | null {
  if (/^\d+(?:[.,]\d+)?$/.test(token)) return Number(token.replace(",", "."));
  return parolaANumero(token);
}

/** 1,5 → «1,5» · 2 → «2» — i numeri si scrivono all'italiana. */
function numeroInItaliano(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return String(Math.round(n * 100) / 100).replace(".", ",");
}

/* ---------------------------------------------------------- gli ingredienti */

/**
 * Una riga d'ingrediente, da parlato (o scritto) a ricettario.
 * Vive anche dietro il campo «oppure scrivi»: stessa strada, stessa resa.
 */
export function interpretaIngrediente(grezzo: string): string {
  const testo = pulisci(staccaMisure(grezzo)).toLowerCase();
  if (!testo) return "";

  // «quanto basta di sale» / «sale quanto basta» → «sale q.b.»
  const qbDavanti = testo.match(/^quanto basta d[i']\s*(.+)$/);
  if (qbDavanti?.[1]) return `${pulisci(qbDavanti[1])} q.b.`;
  const qbDietro = testo.match(/^(.+?)\s+quanto basta$/);
  if (qbDietro?.[1]) return `${pulisci(qbDietro[1])} q.b.`;
  if (/\bq\.?b\.?\b/.test(testo)) return pulisci(testo.replace(/\bq\.?b\.?\b/, "")) + " q.b.";

  const token = testo.split(" ");
  let i = 0;
  let quantita: number | null = null;

  // ——— la quantità in testa: «300», «trecento», «mezzo», «un paio di»
  const t0 = token[i] ?? "";
  if (t0 === "mezzo" || t0 === "mezza") {
    quantita = 0.5;
    i += 1;
  } else if (t0 === "un" || t0 === "uno" || t0 === "una") {
    if (token[i + 1] === "paio" && token[i + 2] === "di") {
      quantita = 2;
      i += 3;
    } else {
      quantita = 1;
      i += 1;
    }
  } else {
    const n = eNumero(t0);
    if (n !== null) {
      quantita = n;
      i += 1;
    }
  }

  // Nessuna quantità: la riga esce com'è, solo ripulita.
  if (quantita === null) return pulisci(grezzo);

  // «tre e mezzo» prima della misura
  if (token[i] === "e" && (token[i + 1] === "mezzo" || token[i + 1] === "mezza")) {
    quantita += 0.5;
    i += 2;
  }

  // ——— la misura, se c'è
  let simbolo = "";
  const misura = MISURE[token[i] ?? ""];
  if (misura) {
    simbolo = misura.simbolo;
    i += 1;

    // «un litro e mezzo», «un chilo e mezzo»: il mezzo arriva DOPO la misura
    if (token[i] === "e" && (token[i + 1] === "mezzo" || token[i + 1] === "mezza")) {
      quantita += 0.5;
      i += 2;
    }

    if (misura.fattore) quantita *= misura.fattore; // 2 etti → 200 g

    // «300 g DI fagioli» → il «di» dopo la misura non si scrive
    if (token[i] === "di" || token[i] === "d'") i += 1;
    else if (token[i]?.startsWith("d'")) token[i] = token[i]!.slice(2);
  }

  const resto = pulisci(token.slice(i).join(" "));
  const pezzi = [numeroInItaliano(quantita), simbolo, resto].filter(Boolean);
  return pezzi.join(" ");
}

/* --------------------------------------------------------------- i passi */

/** Un passo del procedimento: maiuscola in testa, punto in fondo, e basta. */
export function interpretaPasso(grezzo: string): string {
  const testo = pulisci(grezzo);
  if (!testo) return "";
  const conMaiuscola = testo.charAt(0).toUpperCase() + testo.slice(1);
  return /[.!?…]$/.test(conMaiuscola) ? conMaiuscola : `${conMaiuscola}.`;
}

/* ----------------------------------------------------- le basi dello chef */

export const MOTTO = "La cucina è amore, la pasticceria è chimica.";

export interface RicettaBase {
  slug: string;
  nome: string;
  sotto: string;
  dosi: string;
  ingredienti: string[];
  passi: string[];
}

/**
 * Le basi del Dolce, precaricate. Scelte da lui il 7/8/2026: pasticcera,
 * inglese, pan di Spagna.
 * ⚠️ Le dosi qui sono QUELLE STANDARD, messe come segnaposto: le dosi della
 * bottega le detta lui, e quando le detta si cambiano QUI, non nel telefono
 * dei clienti — le basi vivono nel codice apposta.
 */
export const BASI: readonly RicettaBase[] = [
  {
    slug: "crema-pasticcera",
    nome: "Crema pasticcera",
    sotto: "La base di bignè, crostate e diplomatiche",
    dosi: "per mezzo litro",
    ingredienti: [
      "500 ml latte fresco intero",
      "4 tuorli",
      "100 g zucchero",
      "40 g amido di mais",
      "1 bacca di vaniglia",
    ],
    passi: [
      "Scalda il latte con la vaniglia, senza farlo bollire.",
      "Monta tuorli e zucchero, poi incorpora l'amido.",
      "Versa il latte a filo, rimetti sul fuoco e gira finché scrive.",
      "Copri con pellicola a contatto e raffredda in fretta.",
    ],
  },
  {
    slug: "crema-inglese",
    nome: "Crema inglese",
    sotto: "La sorella liquida: bavaresi e zabaioni",
    dosi: "per mezzo litro",
    ingredienti: ["500 ml latte fresco intero", "5 tuorli", "90 g zucchero", "1 bacca di vaniglia"],
    passi: [
      "Scalda il latte con la vaniglia.",
      "Sbatti tuorli e zucchero senza montarli.",
      "Unisci e cuoci piano fino a 82–84°: deve velare il cucchiaio, mai bollire.",
      "Passa al colino e raffredda subito.",
    ],
  },
  {
    slug: "pan-di-spagna",
    nome: "Pan di Spagna",
    sotto: "Tre ingredienti, zero scorciatoie",
    dosi: "tortiera da 22 cm",
    ingredienti: [
      "4 uova intere",
      "120 g zucchero",
      "120 g farina 00",
      "1 pizzico di sale",
      "scorza di limone q.b.",
    ],
    passi: [
      "Monta uova e zucchero almeno 10 minuti: devono triplicare.",
      "Setaccia la farina e incorporala a mano, dal basso verso l'alto.",
      "Inforna a 170° per 35 minuti senza mai aprire il forno.",
      "Prova con lo stecchino, poi raffredda capovolto.",
    ],
  },
];

export function trovaBase(slug: string): RicettaBase | undefined {
  return BASI.find((b) => b.slug === slug);
}
