/**
 * Rigenera le icone dell'app — quelle che finiscono sulla schermata Home del
 * telefono quando uno «installa» MONO MONEY.
 *
 * 🔑 LA REGOLA, decisa guardando il telefono il 5/8/2026:
 *   la M col sorriso **originale** (scura + oro) su **fondo cashmere**.
 *   La versione chiara del marchio sul verde era illeggibile da lontano e
 *   non è il marchio: è il marchio svuotato per stare sul buio.
 *
 * Non c'è nessuna libreria che disegna: si apre Chrome senza finestra, si
 * mette il marchio al centro di un quadrato e si fa una fotografia della
 * misura esatta. Zero pacchetti da installare, zero servizi esterni.
 *
 * Uso:  node scripts/genera-icone.mjs
 * (se Chrome sta in un posto insolito:  CHROME="C:\\...\\chrome.exe" node scripts/genera-icone.mjs)
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const CASHMERE = "#F4ECDD";

/** Le misure che servono davvero, e a cosa servono. */
const ICONE = [
  { file: "favicon.png", lato: 64, quota: 76, cosa: "la linguetta del browser" },
  { file: "icona-180.png", lato: 180, quota: 76, cosa: "iPhone, «Aggiungi a Home»" },
  { file: "icona-192.png", lato: 192, quota: 76, cosa: "Android, schermata Home" },
  { file: "icona-512.png", lato: 512, quota: 76, cosa: "Android, schermata d'avvio e store" },
  /**
   * ⚠️ La «maskable» Android la ritaglia come vuole — cerchio, goccia,
   * quadrato stondato — e tiene per buono solo l'80% centrale. Il marchio
   * qui dentro sta più piccolo apposta: se lo facessi grande come le altre,
   * su certi telefoni la forchetta e il cucchiaio verrebbero tagliati via.
   */
  { file: "icona-maskable-512.png", lato: 512, quota: 58, cosa: "Android, icona ritagliata" },
];

const chrome = trovaChrome();
const marchio = fileURLToPath(new URL("../public/marchio/mono-sorriso.svg", import.meta.url));
const dentro = `data:image/svg+xml;base64,${readFileSync(marchio).toString("base64")}`;
const cartella = mkdtempSync(join(tmpdir(), "mono-icone-"));

try {
  for (const { file, lato, quota, cosa } of ICONE) {
    const pagina = join(cartella, `${file}.html`);
    const uscita = fileURLToPath(new URL(`../public/${file}`, import.meta.url));

    writeFileSync(
      pagina,
      `<meta charset="utf-8"><style>
         html,body{margin:0;padding:0;width:${lato}px;height:${lato}px;overflow:hidden}
         body{background:${CASHMERE};display:flex;align-items:center;justify-content:center}
         img{width:${quota}%;height:auto;display:block}
       </style><img src="${dentro}" alt="">`,
      "utf8",
    );

    execFileSync(
      chrome,
      [
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        `--window-size=${lato},${lato}`,
        `--screenshot=${uscita}`,
        "--virtual-time-budget=3000",
        `file:///${pagina.replace(/\\/g, "/")}`,
      ],
      { stdio: "ignore" },
    );

    const { larghezza, altezza } = misuraPng(uscita);
    if (larghezza !== lato || altezza !== lato) {
      throw new Error(
        `${file} è venuta ${larghezza}×${altezza} invece di ${lato}×${lato}. ` +
          `Chrome ha imposto una misura sua: rifare questa icona a mano.`,
      );
    }
    console.log(`✓ ${file} — ${lato}×${lato} (${cosa})`);
  }

  console.log(
    "\n⚠️ Adesso cambia `VERSIONE` in public/sw.js, se no i telefoni che hanno\n" +
      "   già l'app tengono le icone vecchie e sembra che non hai fatto niente.",
  );
} finally {
  rmSync(cartella, { recursive: true, force: true });
}

/** Legge larghezza e altezza dall'intestazione IHDR del PNG. */
function misuraPng(percorso) {
  const b = readFileSync(percorso);
  return { larghezza: b.readUInt32BE(16), altezza: b.readUInt32BE(20) };
}

function trovaChrome() {
  const candidati = [
    process.env.CHROME,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].filter(Boolean);

  const trovato = candidati.find((c) => existsSync(c));
  if (!trovato) {
    throw new Error(
      `Chrome non trovato. Passalo a mano:  CHROME="percorso\\chrome.exe" node scripts/genera-icone.mjs`,
    );
  }
  return trovato;
}
