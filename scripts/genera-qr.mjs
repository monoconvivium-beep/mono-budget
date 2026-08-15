/**
 * Rigenera il QR che si mostra dentro l'app («Passala a un amico»).
 *
 * ⚠️ Da rilanciare **quando cambia l'indirizzo dell'app** — per esempio il
 * giorno in cui si passa da monoconvivium-beep.github.io/mono-budget/ al
 * dominio vero. Un QR che porta a un indirizzo morto è peggio di nessun QR:
 * chi lo inquadra pensa che l'app non esista.
 *
 * Il disegno si fa QUI, una volta sola, e finisce in un file nostro: nel
 * programma non entra nessuna libreria, e non si chiede il QR a un servizio
 * esterno — che vorrebbe dire dirgli che qualcuno sta condividendo l'app.
 *
 * Uso:  node scripts/genera-qr.mjs [indirizzo] [nome-file]
 *   node scripts/genera-qr.mjs                         → qr-mono-money.svg (pulito)
 *   node scripts/genera-qr.mjs "https://convivium.monobottega.it/?da=passaparola" qr-passaparola.svg
 *
 * 🔑 I QR sono DUE e non vanno confusi:
 *  - `qr-mono-money.svg`  → l'indirizzo pulito. È quello STAMPATO sul
 *    cavaliere del banco: se un giorno si ristampa, meglio rigenerarlo con
 *    `?da=banco` così anche il banco si conta.
 *  - `qr-passaparola.svg` → porta `?da=passaparola`, è quello DENTRO l'app
 *    («Passala a un amico»): chi si iscrive da lì risulta portato dal
 *    passaparola anche senza codice personale.
 *
 * ⚠️ Serve il pacchetto `qrcode` (è nei devDependencies, non entra nell'app).
 */
import { writeFileSync } from "node:fs";

import QRCode from "qrcode";

const INDIRIZZO = process.argv[2] ?? "https://convivium.monobottega.it/";
const USCITA = new URL(
  `../public/marchio/${process.argv[3] ?? "qr-mono-money.svg"}`,
  import.meta.url,
);

const svg = await QRCode.toString(INDIRIZZO, {
  type: "svg",
  // Il massimo di correzione: un QR mostrato su uno schermo viene inquadrato
  // storto, con i riflessi e con le dita davanti. Deve reggere lo stesso.
  errorCorrectionLevel: "H",
  margin: 1,
  width: 512,
  color: { dark: "#262321", light: "#F4ECDD" },
});

writeFileSync(USCITA, svg, "utf8");
console.log(`QR rigenerato per ${INDIRIZZO}`);
