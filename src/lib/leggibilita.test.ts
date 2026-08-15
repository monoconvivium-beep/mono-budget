/**
 * LE PILLOLE DELLE CATEGORIE SI DEVONO LEGGERE — tutte, non quasi tutte.
 *
 * 🔴 Da dove nasce questa prova: il 15/8/2026, misurando l'app pubblicata, sei
 * pillole su undici scrivevano in cashmere su un fondo troppo chiaro. La
 * peggiore era «Spesa alimentare» a **1,94** contro il 4,5 richiesto — cioè
 * oro chiaro su oro chiaro. Non si era visto prima perché a occhio, su uno
 * schermo acceso al buio, una scritta storta sembra solo «delicata».
 *
 * 🔑 Perché è una PROVA e non una correzione e basta: le categorie cambiano
 * (ne è già stata aggiunta una), e il giorno che se ne aggiunge un'altra con
 * un colore chiaro nessuno rifà i conti a mano. Questa prova li rifà da sola,
 * e la costruzione si ferma prima di pubblicare qualcosa che non si legge.
 */
import { describe, expect, it } from "vitest";

import {
  CATEGORIE,
  COLORI_CATEGORIA,
  contrasto,
  inchiostroSu,
  luminanza,
  pillolaDi,
} from "./parse";

/** La soglia dello standard per il testo piccolo. Non si abbassa. */
const SOGLIA = 4.5;

describe("leggibilità delle pillole di categoria", () => {
  it("ogni categoria, nessuna esclusa, si legge sopra la soglia", () => {
    const bocciate = CATEGORIE.filter((c) => {
      const { fondo, inchiostro } = pillolaDi(c);
      return contrasto(inchiostro, fondo) < SOGLIA;
    });
    expect(bocciate).toEqual([]);
  });

  it("il fondo si tocca solo dove serve: gli altri restano il colore di casa", () => {
    // Undici categorie, e solo le tre a mezza via vanno scurite.
    const toccate = CATEGORIE.filter((c) => pillolaDi(c).fondo !== COLORI_CATEGORIA[c]);
    expect(toccate).toEqual(["Bar", "Ristoranti", "Altro"]);
  });

  it("il colore scurito resta riconoscibile: non diventa un altro colore", () => {
    for (const c of CATEGORIE) {
      const { fondo } = pillolaDi(c);
      // Non più di un terzo di scostamento su nessun canale.
      expect(contrasto(fondo, COLORI_CATEGORIA[c])).toBeLessThan(2);
    }
  });

  it("sul fondo più chiaro sceglie la seppia, sul più scuro il cashmere", () => {
    // Oro di «Spesa alimentare»: era il caso peggiore, 1,94 in cashmere.
    expect(inchiostroSu("#CBA75A")).toBe("#262321");
    // Quasi nero di «Trasporti»: lì il cashmere è giusto e lo resta.
    expect(inchiostroSu("#262321")).toBe("#F4ECDD");
  });

  it("il conto del contrasto è quello ufficiale", () => {
    // Nero su bianco è 21:1, il massimo possibile: se questo torna, la
    // formula è quella giusta e tutto il resto si può credere.
    expect(contrasto("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
    expect(contrasto("#777777", "#777777")).toBeCloseTo(1, 5);
    expect(luminanza("#FFFFFF")).toBeCloseTo(1, 5);
    expect(luminanza("#000000")).toBeCloseTo(0, 5);
  });
});
