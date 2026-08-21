/**
 * «CE L'HO L'ULTIMA VERSIONE?»
 *
 * 🔴 Da dove nasce: il 21/8/2026 l'app sul suo Android era quella del giorno
 * prima, e non c'era niente che glielo dicesse. Quello che queste prove
 * difendono non è il numero: è la **differenza fra le tre risposte**. «Sei
 * all'ultima», «ce n'è una nuova» e «non ho potuto guardare» sono tre cose
 * diverse, e confonderle è il modo di far girare qualcuno con la versione di
 * ieri credendo di avere la nuova.
 */
import { describe, expect, it, vi, afterEach } from "vitest";

import { guardaSeCèDiNuovo, VERSIONE_QUI, versioneDa } from "./aggiornamento";

const guardiano = (versione: string) => `
/** MonoConvivium */
const VERSIONE = "mono-money-${versione}";
const RADICE = self.registration.scope;
`;

function rispondi(corpo: string | null, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      if (corpo === null) throw new Error("niente campo");
      return { ok, text: async () => corpo } as Response;
    }),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("il numero di versione", () => {
  it("si pesca dal file del guardiano", () => {
    expect(versioneDa(guardiano("v31"))).toBe("v31");
    expect(versioneDa(guardiano("v7"))).toBe("v7");
    expect(versioneDa(guardiano("v128"))).toBe("v128");
  });

  it("se non c'è, si dice che non c'è invece di inventarlo", () => {
    expect(versioneDa("const VERSIONE = 'qualcosa-altro';")).toBeNull();
    expect(versioneDa("")).toBeNull();
    // Una pagina d'errore del sito non è un numero di versione.
    expect(versioneDa("<!doctype html><title>404</title>")).toBeNull();
  });

  it("l'app sa che versione è, e non è una stringa vuota", () => {
    // Ci arriva da `vite.config.ts`, che lo legge da `public/sw.js`: un posto solo.
    expect(VERSIONE_QUI).toMatch(/^v\d+$/);
  });
});

describe("il controllo", () => {
  it("stessa versione: sei all'ultima", async () => {
    rispondi(guardiano(VERSIONE_QUI));
    expect(await guardaSeCèDiNuovo("/")).toEqual({ stato: "aggiornata", versione: VERSIONE_QUI });
  });

  it("versione diversa sul sito: ce n'è una nuova, e dice quale", async () => {
    rispondi(guardiano("v999"));
    expect(await guardaSeCèDiNuovo("/")).toEqual({ stato: "vecchia", versione: "v999" });
  });

  it("senza rete NON risponde «sei all'ultima»", async () => {
    // 🔑 È la prova che conta: davanti a un silenzio, dire «va tutto bene» è
    // esattamente il difetto che stiamo curando.
    rispondi(null);
    expect(await guardaSeCèDiNuovo("/")).toEqual({ stato: "senza-rete" });
  });

  it("una risposta che non è il guardiano non vale come risposta", async () => {
    // La pagina d'errore del sito durante una pubblicazione torna con un 200
    // pieno di HTML: non è «sei all'ultima», è «non lo so».
    rispondi("<!doctype html><title>Pagina non trovata</title>");
    expect(await guardaSeCèDiNuovo("/")).toEqual({ stato: "senza-rete" });
  });

  it("un errore del sito non vale come risposta", async () => {
    rispondi(guardiano("v999"), false);
    expect(await guardaSeCèDiNuovo("/")).toEqual({ stato: "senza-rete" });
  });

  it("chiede il file SENZA passare dalla tasca del telefono", async () => {
    // Senza `no-store` si rileggerebbe la copia vecchia: cioè si chiederebbe
    // «sono aggiornato?» proprio a chi è rimasto indietro.
    rispondi(guardiano(VERSIONE_QUI));
    await guardaSeCèDiNuovo("/");
    expect(fetch).toHaveBeenCalledWith("/sw.js", { cache: "no-store" });
  });

  it("parte dalla radice dell'app, non da «/»", async () => {
    // Sulle pagine di GitHub l'app vive in una sottocartella.
    rispondi(guardiano(VERSIONE_QUI));
    await guardaSeCèDiNuovo("/mono-budget/");
    expect(fetch).toHaveBeenCalledWith("/mono-budget/sw.js", { cache: "no-store" });
  });
});
