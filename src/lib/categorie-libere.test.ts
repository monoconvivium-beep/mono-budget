/**
 * LE CATEGORIE INVENTATE VALGONO QUANTO QUELLE DI CASA.
 *
 * 🔴 Da dove nasce: «Trasporti» teneva dentro la benzina e il biglietto del
 * pullman. Chi vuole distinguerli deve poterlo fare — ma una categoria
 * inventata che si legge male, o che nella torta ha il colore di un'altra, è
 * peggio della casella sbagliata di partenza.
 */
import { describe, expect, it } from "vitest";
import {
  CATEGORIE,
  COLORI_CATEGORIA,
  COLORI_DISPONIBILI,
  coloreCategoria,
  coloreLibero,
  contrasto,
  pillolaDi,
} from "./parse";

const SOGLIA = 4.5;

describe("categorie inventate", () => {
  it("una categoria di casa tiene il suo colore di sempre", () => {
    expect(coloreCategoria("Bar e ristoranti")).toBe(COLORI_CATEGORIA["Bar e ristoranti"]);
    expect(coloreCategoria("Trasporti")).toBe(COLORI_CATEGORIA.Trasporti);
  });

  it("una categoria inventata ha sempre lo stesso colore", () => {
    // Se cambiasse a ogni apertura, la torta cambierebbe significato.
    expect(coloreCategoria("Benzina")).toBe(coloreCategoria("Benzina"));
    expect(coloreCategoria("Benzina")).not.toBe(coloreCategoria("Pullman"));
  });

  it("il colore scelto dall'utente vince su quello calcolato", () => {
    const mie = [{ nome: "Benzina", colore: "#3F6B6B" }];
    expect(coloreCategoria("Benzina", mie)).toBe("#3F6B6B");
  });

  it("nessuna categoria inventata prende il colore di una di casa", () => {
    // Due fette dello stesso colore nella torta si leggono come una sola.
    const diCasa = Object.values(COLORI_CATEGORIA);
    for (const c of COLORI_DISPONIBILI) expect(diCasa).not.toContain(c);
  });

  it("due categorie create di fila non si somigliano", () => {
    const primo = coloreLibero([]);
    const secondo = coloreLibero([primo]);
    const terzo = coloreLibero([primo, secondo]);
    expect(new Set([primo, secondo, terzo]).size).toBe(3);
  });

  it("le pillole delle categorie inventate si leggono", () => {
    const nomi = ["Benzina", "Pullman", "Palestra", "Bollette", "Regali", "Cane", "Idraulico"];
    const bocciate = nomi.filter((n) => {
      const { fondo, inchiostro } = pillolaDi(n);
      return contrasto(inchiostro, fondo) < SOGLIA;
    });
    expect(bocciate).toEqual([]);
  });

  it("anche tutta la tavolozza si legge, non solo i nomi che ho provato", () => {
    const bocciati = COLORI_DISPONIBILI.filter((c) => {
      const { fondo, inchiostro } = pillolaDi("x", [{ nome: "x", colore: c }]);
      return contrasto(inchiostro, fondo) < SOGLIA;
    });
    expect(bocciati).toEqual([]);
  });

  it("un nome sconosciuto non manda in errore il colore", () => {
    expect(coloreCategoria("")).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(coloreCategoria("categoria mai vista")).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it("le caselle di casa sono tredici, e ognuna ha il suo colore", () => {
    /* 🔴 Erano undici. Il 21/8/2026 «Affitto», «Luce e gas» e «Benzina» sono
       uscite da dove stavano nascoste, e «Bar» e «Ristoranti» sono diventate
       una sola. Il numero qui non è un capriccio: se qualcuno ne aggiunge una
       senza darle un colore suo, nella torta due fette si leggono come una. */
    expect(CATEGORIE).toHaveLength(13);
    expect(new Set(Object.values(COLORI_CATEGORIA)).size).toBe(13);
  });
});
