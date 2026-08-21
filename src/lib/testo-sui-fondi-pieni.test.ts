/**
 * IL TESTO CHIARO SUI FONDI PIENI NON SI SBIADISCE.
 *
 * 🔴 Da dove nasce (21/8/2026): sul terracotta pieno — il vestito del
 * ricettario e delle carte da toccare — il cashmere sbiadito **non arriva mai**
 * alla soglia. Misurato sull'app costruita: 0,70 → 3,21 · 0,80 → 3,71 ·
 * 0,85 → 3,98 · 0,90 → 4,26. Il primo valore che passa è 0,95 (4,55).
 * Erano 24 scritte in giro per l'app, tutte «delicate» a vederle e tutte sotto
 * la soglia a misurarle.
 *
 * 🔑 Perché è una PROVA e non solo una correzione: `text-[rgba(244,236,221,…)]`
 * è comodissimo da riscrivere, e il prossimo che vuole «abbassare un po' la
 * voce» di una scritta lo rimette con lo 0,7 senza sapere niente di questa
 * storia. Qui la costruzione si ferma e glielo dice.
 *
 * ⚠️ Vale per il TESTO. Bordi e fondi trasparenti restano liberi: lì non c'è
 * niente da leggere.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const RADICE = new URL("../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

function tuttiIFile(cartella: string): string[] {
  return readdirSync(cartella, { withFileTypes: true }).flatMap((voce) => {
    const strada = join(cartella, voce.name);
    if (voce.isDirectory()) return tuttiIFile(strada);
    return /\.tsx?$/.test(voce.name) ? [strada] : [];
  });
}

/** Il cashmere scritto a mano dentro una classe del testo, con la sua trasparenza. */
const TESTO_SBIADITO = /text-\[rgba\(244,\s*236,\s*221,\s*(0?\.\d+)\)\]/g;

describe("testo chiaro sui fondi pieni", () => {
  it("nessuna scritta usa il cashmere sotto lo 0,95", () => {
    const colpevoli: string[] = [];

    for (const file of tuttiIFile(RADICE)) {
      if (file.includes(".test.")) continue;
      const testo = readFileSync(file, "utf8");
      for (const trovato of testo.matchAll(TESTO_SBIADITO)) {
        const alfa = Number(trovato[1]);
        if (alfa < 0.95) colpevoli.push(`${file.split(/[\\/]/).pop()}: ${trovato[0]} (${alfa})`);
      }
    }

    // Se questa prova si ferma qui: usa `text-[var(--secondario-su-pieno)]`.
    // Se serve una voce ancora più bassa, si abbassa con la MISURA o il PESO,
    // non con la trasparenza — vedi il commento del token in `styles.css`.
    expect(colpevoli).toEqual([]);
  });

  it("il token esiste, ed è quello misurato", () => {
    const stili = readFileSync(join(RADICE, "styles.css"), "utf8");
    expect(stili).toContain("--secondario-su-pieno: rgba(244, 236, 221, 0.95)");
  });
});
