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
 * Le basi del Dolce, precaricate — il canone della pasticceria.
 *
 * 🔑 DA DOVE VENGONO LE DOSI — riscritte il 9/8/2026, e questa è la seconda
 * versione. La prima l'aveva provata lui in cucina e non funzionava: aveva
 * ragione. Ogni riga è stata riverificata su almeno tre fonti indipendenti
 * (manuali e scuole: Massari, Montersino, Valrhona, Pianeta Dessert,
 * Tavolartegusto, Cucchiaio d'Argento). Restano numeri e temperature —
 * quelli sono chimica, non si possono proteggere — mentre i testi dei passi
 * sono NOSTRI: un ricettario altrui non si ricopia parola per parola.
 *
 * ⚠️ COSA ERA SBAGLIATO, per non rifarlo:
 * · Le dosi «magre» — pochi tuorli, poca panna, poco liquido — nascono dal
 *   copiare un rapporto senza il totale a cui si riferisce. La panna cotta
 *   aveva 8 g di gelatina: giusti su 650 ml, gommosi sui nostri 500.
 * · Il nome può mentire quanto il numero: la frolla era chiamata «3-2-1»,
 *   ma la 3-2-1 è la genovese SENZA UOVA. Con due tuorli dentro è un'altra
 *   pasta, e con quel burro si sbriciolava invece di stendersi.
 * · Le creme cotte senza una temperatura di uscita scritta non sono ricette:
 *   è quel numero, più delle dosi, che separa una crema da una stracciata.
 *
 * ⚠️ L'ultima parola resta DELLO CHEF: dove la bottega fa diverso si corregge
 * QUI — le basi vivono nel codice apposta, si aggiornano con l'app per tutti.
 */
export const BASI: readonly RicettaBase[] = [
  /* ———————————————————————————————— Le creme */
  {
    slug: "crema-pasticcera",
    nome: "Crema pasticcera",
    sotto: "La base di bignè, crostate e diplomatiche",
    dosi: "per mezzo litro — resa 750 g",
    famiglia: "Le creme",
    ingredienti: [
      "500 ml latte fresco intero",
      "6 tuorli",
      "140 g zucchero",
      "40 g amido di mais",
      "1 bacca di vaniglia",
      "1 pizzico di sale",
    ],
    passi: [
      "Scalda il latte con la vaniglia, senza farlo bollire.",
      "Monta tuorli e zucchero, poi incorpora l'amido.",
      "Versa il latte a filo, rimetti sul fuoco e gira finché scrive.",
      "Togli dal fuoco a 82°: oltre gli 85° il tuorlo si strappa.",
      "Copri con pellicola a contatto e raffredda in fretta. Dura 3 giorni.",
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
      "A caldo resta liquida ed è giusto così: è una salsa, addensa raffreddando.",
    ],
  },
  {
    slug: "crema-diplomatica",
    nome: "Crema diplomatica",
    sotto: "Due parti di pasticcera, una di panna",
    dosi: "per farcire una torta da 24 cm",
    famiglia: "Le creme",
    ingredienti: [
      "500 g crema pasticcera fredda",
      "250 g panna fresca da montare",
      "4 g gelatina in fogli",
    ],
    passi: [
      "Ammolla la gelatina in acqua fredda, poi scioglila in due cucchiai di pasticcera tiepida.",
      "Monta la panna lucida, non ferma: deve piegarsi, non spezzarsi.",
      "Ammorbidisci la pasticcera fredda con una frusta e unisci la gelatina.",
      "Incorpora la panna in due volte, dal basso verso l'alto.",
      "Senza gelatina non regge il taglio della torta: è lei che tiene su tutto.",
    ],
  },
  {
    slug: "zabaione",
    nome: "Zabaione",
    sotto: "Il torinese: tuorli, zucchero e marsala",
    dosi: "per 4 coppe",
    famiglia: "Le creme",
    ingredienti: ["6 tuorli", "120 g zucchero", "120 ml marsala secco"],
    passi: [
      "La regola è a tuorlo: 20 g di zucchero e 20 ml di marsala per ognuno.",
      "Sbatti tuorli e zucchero fino a farli chiari.",
      "Aggiungi il marsala e metti a bagnomaria, con l'acqua che freme e non bolle.",
      "Monta 8–10 minuti fino a 82°: deve triplicare e lasciare il solco.",
      "Servilo caldo, o freddalo girando ogni tanto.",
    ],
  },

  /* ———————————————————————————————— Gli impasti */
  {
    slug: "pasta-frolla",
    nome: "Pasta frolla",
    sotto: "Burro a metà della farina: si stende e non si spacca",
    dosi: "per una crostata da 24 cm, fondo e strisce",
    famiglia: "Gli impasti",
    ingredienti: [
      "300 g farina 00 debole",
      "150 g burro freddo",
      "120 g zucchero a velo",
      "1 uovo intero",
      "1 tuorlo",
      "3 g sale",
      "scorza di limone q.b.",
    ],
    passi: [
      "Il burro sta a metà della farina: più di così si sbriciola invece di stendersi.",
      "Sabbia burro freddo a pezzetti e farina con la punta delle dita.",
      "Aggiungi zucchero, uovo, tuorlo, sale e scorza: impasta il minimo.",
      "Schiaccia a disco, pellicola, frigo almeno due ore — meglio tutta la notte.",
      "Guscio da riempire: 175° per 20–25 minuti. Crostata già ripiena: 175° per 35–45.",
    ],
  },
  {
    slug: "pasta-choux",
    nome: "Pasta choux (bignè)",
    sotto: "L'impasto che si cuoce due volte",
    dosi: "per circa 40 bignè da 4 cm",
    famiglia: "Gli impasti",
    ingredienti: [
      "150 ml acqua",
      "100 ml latte intero",
      "100 g burro",
      "150 g farina 00 debole",
      "250 g uova intere",
      "3 g sale",
      "5 g zucchero",
    ],
    passi: [
      "Le uova si PESANO: 250 g sgusciate, che sono 5 medie. A occhio se ne mettono sempre poche, e il bignè resta pieno.",
      "Porta a bollore acqua, latte, burro, sale e zucchero.",
      "Butta la farina tutta insieme e asciuga sul fuoco finché si stacca dalle pareti.",
      "Fai intiepidire, poi le uova poco per volta: la successiva solo quando la prima è sparita.",
      "Ciuffi sulla teglia: 210° per 15 minuti a forno chiuso, poi 180° per altri 15.",
      "Ultimi 5 minuti col cucchiaio di legno nello sportello: se il vapore non esce, raffreddando si afflosciano.",
    ],
  },
  {
    slug: "pan-di-spagna",
    nome: "Pan di Spagna",
    sotto: "Un uovo ogni 30 di zucchero e 30 di farina",
    dosi: "tortiera da 22 cm",
    famiglia: "Gli impasti",
    ingredienti: [
      "5 uova intere",
      "150 g zucchero",
      "150 g farina 00",
      "1 pizzico di sale",
      "scorza di limone q.b.",
    ],
    passi: [
      "La regola porta la teglia: 4 uova per 20 cm, 5 per 22, 6 per 24. Con un uovo in meno viene basso e non si taglia in tre dischi.",
      "Monta uova e zucchero almeno 15 minuti: devono triplicare.",
      "Setaccia la farina e incorporala a mano, dal basso verso l'alto.",
      "Inforna a 170° per 35–40 minuti, e non aprire prima di 30.",
      "Prova con lo stecchino, poi raffredda capovolto.",
    ],
  },
  {
    slug: "meringa-francese",
    nome: "Meringa francese",
    sotto: "Uno di albumi, due di zucchero, e pazienza",
    dosi: "per una teglia",
    famiglia: "Gli impasti",
    ingredienti: [
      "100 g albumi a temperatura ambiente",
      "100 g zucchero semolato",
      "100 g zucchero a velo",
      "qualche goccia di limone",
    ],
    passi: [
      "Monta gli albumi col semolato, a pioggia, finché fanno le punte.",
      "Il velo si unisce alla fine e a mano: dà meringhe lisce che non spurgano.",
      "Ciuffi sulla teglia e in forno a 100° per 2 ore e mezza, sportello socchiuso.",
      "Non superare mai i 100°: sopra ingialliscono e si spaccano.",
      "Sono pronte quando si staccano da sole: devono asciugare, non cuocere.",
    ],
  },

  /* ———————————————————————————————— I dolci al cucchiaio */
  {
    slug: "mousse-al-cioccolato",
    nome: "Mousse al cioccolato",
    sotto: "Senza uova crude: prima la ganache, poi l'aria",
    dosi: "per 6 coppe da 120 g",
    famiglia: "I dolci al cucchiaio",
    ingredienti: [
      "250 g cioccolato fondente al 70%",
      "160 g panna fresca da scaldare",
      "320 g panna fresca fredda da semimontare",
    ],
    passi: [
      "La panna è divisa in due e non è un capriccio: una scalda, l'altra monta.",
      "Sciogli il cioccolato e uniscilo alla panna calda in tre volte: viene una ganache lucida.",
      "Portala a 45–50°. Se unisci il cioccolato fuso alla panna fredda montata, il burro di cacao cristallizza e la mousse esce granulosa.",
      "Semimonta la panna fredda — morbida, non ferma — e incorporala dal basso in due volte.",
      "In frigo una notte: 2 o 3 ore non bastano a farla rapprendere.",
      "Col fondente più amaro ne serve MENO, non di più: ha più burro di cacao e meno zucchero.",
    ],
  },
  {
    slug: "panna-cotta",
    nome: "Panna cotta",
    sotto: "La piemontese: trema ma si taglia",
    dosi: "per 6 stampini",
    famiglia: "I dolci al cucchiaio",
    ingredienti: [
      "400 ml panna fresca",
      "100 ml latte intero",
      "80 g zucchero",
      "6 g gelatina in fogli da 200 bloom",
      "1 bacca di vaniglia",
    ],
    passi: [
      "Ammolla la gelatina in acqua fredda per 10 minuti.",
      "Scalda panna, latte, zucchero e vaniglia fino a 80°, senza far bollire.",
      "Fuori dal fuoco, sotto i 60°, sciogli la gelatina ben strizzata: più caldo perde forza.",
      "Passa al colino, poi negli stampini e in frigo una notte.",
      "Sei grammi, non otto: a otto viene gommosa. Il numero che gira sui ricettari è giusto, ma su 650 ml di liquido, non su 500.",
      "Se i fogli non sono da 200 bloom la tenuta cambia: quelli del supermercato sono più forti, tienine 5.",
    ],
  },

  /* ———————————————————————————————— Le finiture */
  {
    slug: "ganache-al-cioccolato",
    nome: "Ganache al cioccolato",
    sotto: "Tre mestieri, tre dosi di panna",
    dosi: "per glassare una torta — 200 g di cioccolato",
    famiglia: "Le finiture",
    ingredienti: ["200 g cioccolato fondente tritato", "200 g panna fresca"],
    passi: [
      "Non è la stessa ganache per tutto: cambia la panna, non il cioccolato.",
      "Per GLASSARE 200 g di panna · per FARCIRE 100 g · per i TARTUFI 70 g.",
      "Scalda la panna a 85°, mai a bollore.",
      "Versala sul cioccolato tritato e aspetta un minuto, senza toccare.",
      "Emulsiona dal centro verso fuori, con movimenti piccoli, fino a 35–40°.",
      "Si cola a 30–35°. Col fondente sopra il 70% aggiungi un cucchiaio di panna: è più secco.",
    ],
  },
  {
    slug: "caramello-mou",
    nome: "Caramello mou",
    sotto: "Zucchero e coraggio: la salsa che veste tutto",
    dosi: "per un vasetto",
    famiglia: "Le finiture",
    ingredienti: [
      "200 g zucchero",
      "220 g panna fresca calda",
      "90 g burro freddo a cubetti",
      "4 g sale",
    ],
    passi: [
      "Sciogli lo zucchero a secco, a fuoco medio, senza mai girare: muovi solo il pentolino.",
      "Fermati a 170–175°: oltre diventa amaro.",
      "Spegni, unisci il burro, poi la panna CALDA a filo: ATTENZIONE, sbuffa.",
      "Gira finché è liscio, e non ricuocerlo: sopra i 118° diventano caramelle.",
      "Sono i grassi a tenerlo morbido da freddo: con poca panna e poco burro esce un mattone.",
      "In vasetto: in frigo dura due settimane.",
    ],
  },
  {
    slug: "bagna-per-torte",
    nome: "Bagna per torte",
    sotto: "Due di acqua, uno di zucchero",
    dosi: "per una torta da 24 cm, tre dischi",
    famiglia: "Le finiture",
    ingredienti: [
      "200 ml acqua",
      "100 g zucchero",
      "50 ml liquore, oppure caffè o succo d'arancia",
    ],
    passi: [
      "L'acqua è il doppio dello zucchero. A pari peso viene lo sciroppo di base, che è una scorta da diluire, non una bagna: la torta esce stucchevole.",
      "Sciogli lo zucchero nell'acqua calda senza far bollire, un minuto.",
      "Lascia freddare del tutto.",
      "Aggiungi il liquore solo da freddo: l'alcol scaldato se ne va.",
      "Se la bagna è al caffè, mettilo AL POSTO di parte dell'acqua, non in aggiunta.",
      "Bagna a cucchiaiate, mai a bicchierate: circa 90 ml a disco.",
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
      "50 g cioccolato bianco per impermeabilizzare",
      "30 g marmellata di albicocche per lucidare",
      "1 cucchiaio di acqua",
    ],
    passi: [
      "La cottura in bianco è in DUE tempi: 180° per 20 minuti con carta e pesi, poi togli tutto e altri 10.",
      "I pesi tengono su i bordi ma impediscono al fondo di asciugare: senza il secondo giro resta crudo sotto la crema.",
      "Lascia freddare DEL TUTTO, poi spennella il fondo di cioccolato bianco fuso: è la barriera che tiene il guscio croccante.",
      "Riempi con la pasticcera e disponi la frutta a cerchi, dal bordo.",
      "Scalda la marmellata con l'acqua, passala al colino e lucida col pennello da tiepida.",
      "In frigo un'ora prima di servire.",
    ],
  },
  {
    slug: "profiteroles",
    nome: "Profiteroles",
    sotto: "Bignè più ganache: la piramide",
    dosi: "per 6 persone",
    famiglia: "I classici",
    ingredienti: [
      "30 bignè da 4 cm",
      "350 ml panna fresca liquida da montare",
      "60 g zucchero a velo",
      "250 g cioccolato fondente",
      "300 g panna fresca per la glassa",
    ],
    passi: [
      "Cinque bignè a testa: sotto è un assaggio, non un dolce.",
      "Monta la panna liquida con lo zucchero a velo: senza zucchero la farcia sparisce sotto il cioccolato.",
      "Farcisci i bignè dal sotto, con la sacca.",
      "Fai la ganache con 250 di cioccolato e 300 di panna: più morbida di quella da farcire, perché deve colare.",
      "Tuffali uno a uno tenendola a 33–35°: più calda scivola via, più fredda si impasta.",
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
