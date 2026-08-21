/**
 * LE CATEGORIE SONO SUE — e nessuna spesa si perde per strada.
 *
 * 🔴 Da dove nasce (21/8/2026): «le categorie non sono personalizzabili». Erano
 * libere da due versioni, ma solo dentro la tendina di una riga: cioè, per chi
 * usa l'app, non lo erano. Adesso hanno una schermata; queste prove difendono
 * le tre cose che quella schermata NON deve mai fare.
 */
import { describe, expect, it } from "vitest";

import {
  categorieAttive,
  categorieSpente,
  perchéNo,
  RETE_DI_SICUREZZA,
  type StatoCategorie,
} from "./categorie";
import { CATEGORIE, COLORI_CATEGORIA, interpreta } from "./parse";

const vuoto: StatoCategorie = { categoriePersonali: [], nascoste: [] };

describe("l'elenco delle categorie", () => {
  it("all'apertura ci sono le undici di casa, e nessuna spenta", () => {
    expect(
      categorieAttive(vuoto)
        .map((c) => c.nome)
        .sort(),
    ).toEqual([...CATEGORIE].sort());
    expect(categorieSpente(vuoto)).toEqual([]);
  });

  it("«Altro» sta in fondo a tutto, anche dopo le sue", () => {
    // Non è una categoria come le altre: è la fine della lista.
    const s = { ...vuoto, categoriePersonali: [{ nome: "Benzina", colore: "#7A5C3E" }] };
    const nomi = categorieAttive(s).map((c) => c.nome);
    expect(nomi[nomi.length - 1]).toBe(RETE_DI_SICUREZZA);
    expect(nomi[nomi.length - 2]).toBe("Benzina");
  });

  it("le sue vengono dopo quelle di casa, col loro colore", () => {
    const s = { ...vuoto, categoriePersonali: [{ nome: "Benzina", colore: "#7A5C3E" }] };
    expect(categorieAttive(s)).toContainEqual({
      nome: "Benzina",
      colore: "#7A5C3E",
      diCasa: false,
    });
  });

  it("una spenta esce dall'elenco ma non sparisce: si può riaccendere", () => {
    const s = { ...vuoto, nascoste: ["Tabacchi"] };
    expect(categorieAttive(s).map((c) => c.nome)).not.toContain("Tabacchi");
    expect(categorieSpente(s).map((c) => c.nome)).toEqual(["Tabacchi"]);
    // ⚠️ E il colore resta quello di sempre: riaccendendola la torta non cambia faccia.
    expect(categorieSpente(s)[0]?.colore).toBe(COLORI_CATEGORIA.Tabacchi);
  });

  it("«Altro» è la rete di sicurezza e sta sempre nell'elenco", () => {
    expect(categorieAttive(vuoto).map((c) => c.nome)).toContain(RETE_DI_SICUREZZA);
  });
});

describe("un nome buono", () => {
  it("non è vuoto, non è lunghissimo, non è uno che c'è già", () => {
    expect(perchéNo("Benzina", ["Casa"])).toBeNull();
    expect(perchéNo("   ", ["Casa"])).toMatch(/vuoto/);
    expect(perchéNo("x".repeat(25), [])).toMatch(/24/);
    expect(perchéNo("Casa", ["Casa"])).toMatch(/c'è già/);
  });

  it("«benzina» e «Benzina» sono la stessa casella", () => {
    // Due fette con lo stesso nome nella torta si leggono come una sola.
    expect(perchéNo("benzina", ["Benzina"])).toMatch(/c'è già/);
  });
});

describe("la voce e le categorie spente", () => {
  it("una categoria spenta non viene più scelta dalla voce", () => {
    // 🔑 Chi ha spento «Tabacchi» perché non fuma non deve vedersi arrivare una
    // spesa lì dentro solo perché ha detto «tabaccheria».
    const acceso = interpreta("dodici euro tabaccheria")[0];
    expect(acceso?.categoria).toBe("Tabacchi");

    const spento = interpreta("dodici euro tabaccheria", [], ["Tabacchi"])[0];
    expect(spento?.categoria).toBe(RETE_DI_SICUREZZA);
    // ⚠️ La spesa NON si perde: cambia solo la casella.
    expect(spento?.importo).toBe(12);
  });

  it("nemmeno una regola imparata la resuscita", () => {
    const regole = [{ chiave: "sigarette", categoria: "Tabacchi" as const }];
    expect(interpreta("dieci euro sigarette", regole)[0]?.categoria).toBe("Tabacchi");
    expect(interpreta("dieci euro sigarette", regole, ["Tabacchi"])[0]?.categoria).toBe(
      RETE_DI_SICUREZZA,
    );
  });

  it("spegnerne una non tocca tutte le altre", () => {
    expect(interpreta("quattro e sessanta caffè", [], ["Tabacchi"])[0]?.categoria).toBe("Bar");
  });
});
