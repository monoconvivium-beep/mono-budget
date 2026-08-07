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
  // «q.b.» già scritto, in qualunque punto: si toglie TUTTO — punto finale
  // compreso, se no resta un «.» orfano in mezzo alla riga — e si rimette
  // in coda, nella forma canonica.
  if (/\bq\.?\s?b\b\.?/.test(testo)) {
    return pulisci(testo.replace(/\s*\bq\.?\s?b\b\.?\s*/g, " ")) + " q.b.";
  }

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

export const FAMIGLIE_BASI = [
  "Le creme",
  "Gli impasti",
  "I dolci al cucchiaio",
  "Le finiture",
  "I classici",
] as const;

export type FamigliaBase = (typeof FAMIGLIE_BASI)[number];

export interface RicettaBase {
  slug: string;
  nome: string;
  sotto: string;
  dosi: string;
  famiglia: FamigliaBase;
  ingredienti: string[];
  passi: string[];
}

/**
 * Le basi del Dolce, precaricate — il canone della pasticceria, allargato
 * su sua richiesta dell'8/8: «10-15 ricette già presenti, ci mettiamo la
 * faccia, devono venire bene».
 *
 * 🔑 DA DOVE VENGONO LE DOSI: sono le PROPORZIONI CLASSICHE della
 * pasticceria professionale — la frolla 3-2-1, la ganache metà e metà, la
 * meringa uno-a-due, l'inglese a 82-84° — le stesse identiche che stanno
 * nei manuali e nel Cucchiaio d'Argento, perché le basi sono chimica, non
 * opinioni. I testi dei passi sono NOSTRI (un ricettario altrui non si
 * ricopia parola per parola: è protetto), corti e con le temperature e i
 * tempi che contano.
 * ⚠️ L'ultima parola è DELLO CHEF: prima dell'apertura le rilegge lui, e
 * dove la bottega fa diverso si corregge QUI — le basi vivono nel codice
 * apposta, si aggiornano con l'app per tutti.
 */
export const BASI: readonly RicettaBase[] = [
  /* ———————————————————————————————— Le creme */
  {
    slug: "crema-pasticcera",
    nome: "Crema pasticcera",
    sotto: "La base di bignè, crostate e diplomatiche",
    dosi: "per mezzo litro",
    famiglia: "Le creme",
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
    famiglia: "Le creme",
    ingredienti: ["500 ml latte fresco intero", "5 tuorli", "90 g zucchero", "1 bacca di vaniglia"],
    passi: [
      "Scalda il latte con la vaniglia.",
      "Sbatti tuorli e zucchero senza montarli.",
      "Unisci e cuoci piano fino a 82–84°: deve velare il cucchiaio, mai bollire.",
      "Passa al colino e raffredda subito.",
    ],
  },
  {
    slug: "crema-diplomatica",
    nome: "Crema diplomatica",
    sotto: "Pasticcera più panna: la crema delle feste",
    dosi: "per farcire una torta",
    famiglia: "Le creme",
    ingredienti: ["250 g crema pasticcera fredda", "250 ml panna fresca da montare"],
    passi: [
      "Monta la panna ferma, ma non sabbiosa.",
      "Ammorbidisci la pasticcera con una frusta.",
      "Incorpora la panna in due volte, dal basso verso l'alto.",
      "Usala subito, o tienila in frigo al massimo un giorno.",
    ],
  },
  {
    slug: "zabaione",
    nome: "Zabaione",
    sotto: "Il torinese: tuorli, zucchero e marsala",
    dosi: "per 4 coppe",
    famiglia: "Le creme",
    ingredienti: ["4 tuorli", "80 g zucchero", "120 ml marsala"],
    passi: [
      "Sbatti tuorli e zucchero fino a farli chiari.",
      "Aggiungi il marsala e metti a bagnomaria dolce.",
      "Monta con la frusta 8–10 minuti: deve scrivere. Mai bollire.",
      "Servilo caldo, o freddalo girando ogni tanto.",
    ],
  },

  /* ———————————————————————————————— Gli impasti */
  {
    slug: "pasta-frolla",
    nome: "Pasta frolla",
    sotto: "La 3-2-1: regge crostate e biscotti",
    dosi: "per una crostata da 24 cm",
    famiglia: "Gli impasti",
    ingredienti: [
      "300 g farina 00",
      "200 g burro freddo",
      "100 g zucchero a velo",
      "2 tuorli",
      "1 pizzico di sale",
      "scorza di limone q.b.",
    ],
    passi: [
      "Sabbia burro freddo a pezzetti e farina con la punta delle dita.",
      "Aggiungi zucchero, tuorli, sale e scorza: impasta il minimo.",
      "Schiaccia a disco, pellicola, frigo almeno un'ora.",
      "Cuoci a 175° per 20–25 minuti: deve appena dorare.",
    ],
  },
  {
    slug: "pasta-choux",
    nome: "Pasta choux (bignè)",
    sotto: "L'impasto che si cuoce due volte",
    dosi: "per circa 30 bignè",
    famiglia: "Gli impasti",
    ingredienti: [
      "250 ml acqua",
      "100 g burro",
      "150 g farina 00",
      "4 uova intere",
      "1 pizzico di sale",
    ],
    passi: [
      "Porta a bollore acqua, burro e sale.",
      "Butta la farina tutta insieme e asciuga sul fuoco finché si stacca dalle pareti.",
      "Fai intiepidire, poi le uova UNA alla volta: la successiva solo quando la prima è sparita.",
      "Ciuffi sulla teglia, 200° per 25 minuti senza mai aprire il forno.",
    ],
  },
  {
    slug: "pan-di-spagna",
    nome: "Pan di Spagna",
    sotto: "Tre ingredienti, zero scorciatoie",
    dosi: "tortiera da 22 cm",
    famiglia: "Gli impasti",
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
  {
    slug: "meringa-francese",
    nome: "Meringa francese",
    sotto: "Uno di albumi, due di zucchero, e pazienza",
    dosi: "per una teglia",
    famiglia: "Gli impasti",
    ingredienti: ["100 g albumi a temperatura ambiente", "200 g zucchero semolato"],
    passi: [
      "Monta gli albumi con metà zucchero finché fanno le punte.",
      "Aggiungi l'altra metà a pioggia, poco alla volta, sempre montando.",
      "Ciuffi sulla teglia e in forno a 100° per 2 ore, sportello socchiuso.",
      "Sono pronte quando si staccano da sole: devono asciugare, non cuocere.",
    ],
  },

  /* ———————————————————————————————— I dolci al cucchiaio */
  {
    slug: "mousse-al-cioccolato",
    nome: "Mousse al cioccolato",
    sotto: "Due ingredienti e l'aria giusta",
    dosi: "per 6 coppe",
    famiglia: "I dolci al cucchiaio",
    ingredienti: [
      "200 g cioccolato fondente al 70%",
      "300 ml panna fresca da montare",
      "30 g zucchero a velo",
    ],
    passi: [
      "Sciogli il cioccolato a bagnomaria e lascialo intiepidire: al dito deve essere appena caldo.",
      "Monta la panna con lo zucchero a metà: morbida, non ferma.",
      "Incorpora la panna al cioccolato in due volte, dal basso, senza fretta.",
      "In frigo almeno 3 ore prima di servire.",
    ],
  },
  {
    slug: "panna-cotta",
    nome: "Panna cotta",
    sotto: "La piemontese: trema ma si taglia",
    dosi: "per 6 stampini",
    famiglia: "I dolci al cucchiaio",
    ingredienti: [
      "500 ml panna fresca",
      "80 g zucchero",
      "8 g gelatina in fogli",
      "1 bacca di vaniglia",
    ],
    passi: [
      "Ammolla la gelatina in acqua fredda per 10 minuti.",
      "Scalda panna, zucchero e vaniglia senza far bollire.",
      "Fuori dal fuoco sciogli la gelatina ben strizzata.",
      "Negli stampini e in frigo almeno 5 ore: deve tremare, non ballare.",
    ],
  },

  /* ———————————————————————————————— Le finiture */
  {
    slug: "ganache-al-cioccolato",
    nome: "Ganache al cioccolato",
    sotto: "Metà e metà: farcisce, glassa, tartufa",
    dosi: "per farcire o glassare una torta",
    famiglia: "Le finiture",
    ingredienti: ["200 g cioccolato fondente tritato", "200 ml panna fresca"],
    passi: [
      "Porta la panna appena a bollore.",
      "Versala sul cioccolato tritato e aspetta un minuto, senza toccare.",
      "Emulsiona dal centro verso fuori, con movimenti piccoli.",
      "Calda è una glassa, a temperatura ambiente una farcia, fredda si tartufa.",
    ],
  },
  {
    slug: "caramello-mou",
    nome: "Caramello mou",
    sotto: "Zucchero e coraggio: la salsa che veste tutto",
    dosi: "per un vasetto",
    famiglia: "Le finiture",
    ingredienti: ["200 g zucchero", "100 ml panna fresca calda", "40 g burro", "1 pizzico di sale"],
    passi: [
      "Sciogli lo zucchero a secco, a fuoco medio, senza mai girare: muovi solo il pentolino.",
      "Quando è ambrato, spegni e versa la panna calda a filo: ATTENZIONE, sbuffa.",
      "Aggiungi burro e sale, gira finché è liscio.",
      "In vasetto: in frigo dura due settimane.",
    ],
  },
  {
    slug: "bagna-per-torte",
    nome: "Bagna per torte",
    sotto: "Il segreto delle torte che non sanno di asciutto",
    dosi: "per una torta",
    famiglia: "Le finiture",
    ingredienti: [
      "100 ml acqua",
      "100 g zucchero",
      "50 ml liquore, oppure caffè o succo d'arancia",
    ],
    passi: [
      "Porta a bollore acqua e zucchero per un minuto.",
      "Lascia freddare del tutto.",
      "Aggiungi il liquore solo da freddo: l'alcol scaldato se ne va.",
      "Bagna il pan di Spagna a cucchiaiate, mai a bicchierate.",
    ],
  },

  /* ———————————————————————————————— I classici */
  {
    slug: "crostata-alla-frutta",
    nome: "Crostata alla frutta",
    sotto: "Frolla più pasticcera: le basi diventano vetrina",
    dosi: "per una crostata da 24 cm",
    famiglia: "I classici",
    ingredienti: [
      "1 dose di pasta frolla",
      "1 dose di crema pasticcera",
      "frutta fresca di stagione q.b.",
      "3 cucchiai di marmellata di albicocche per lucidare",
    ],
    passi: [
      "Cuoci la frolla in bianco: carta forno, pesi sopra, 175° per 25 minuti.",
      "Lasciala freddare DEL TUTTO prima di toccarla.",
      "Riempi con la pasticcera e disponi la frutta a cerchi, dal bordo.",
      "Scalda la marmellata con un cucchiaio d'acqua e lucida col pennello.",
    ],
  },
  {
    slug: "profiteroles",
    nome: "Profiteroles",
    sotto: "Bignè più ganache: la piramide",
    dosi: "per 6 persone",
    famiglia: "I classici",
    ingredienti: [
      "1 dose di bignè già cotti",
      "1 dose di ganache al cioccolato fluida",
      "300 ml panna fresca montata",
    ],
    passi: [
      "Farcisci i bignè di panna montata, dal sotto.",
      "Tuffali uno a uno nella ganache ancora fluida.",
      "Montali a piramide in un piatto fondo.",
      "In frigo un'ora: si serve freddo, e si litiga per l'ultimo.",
    ],
  },
];

export function trovaBase(slug: string): RicettaBase | undefined {
  return BASI.find((b) => b.slug === slug);
}

/** Le basi raggruppate per famiglia, nell'ordine delle famiglie. */
export function basiPerFamiglia(): { famiglia: FamigliaBase; basi: RicettaBase[] }[] {
  return FAMIGLIE_BASI.map((famiglia) => ({
    famiglia,
    basi: BASI.filter((b) => b.famiglia === famiglia),
  })).filter((g) => g.basi.length > 0);
}
