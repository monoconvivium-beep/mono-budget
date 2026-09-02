import { describe, expect, it } from "vitest";

import {
  GIORNI_PER_VINCERE,
  QUOTA_VINCENTI,
  abbastanzaGrattata,
  distanzaGiorni,
  frazioneGrattata,
  domenica,
  giorno,
  nuovoBiglietto,
  pallini,
  puoEmettere,
  registraUso,
  strisciaCompleta,
  strisciaOggi,
  type Striscia,
} from "./gratta";

describe("i giorni", () => {
  it("tiene il giorno solare, non l'ora", () => {
    expect(giorno(new Date(2026, 7, 9, 23, 59))).toBe("2026-08-09");
    expect(giorno(new Date(2026, 7, 9, 0, 1))).toBe("2026-08-09");
  });

  it("conta la distanza anche a cavallo del mese e dell'anno", () => {
    expect(distanzaGiorni("2026-08-09", "2026-08-10")).toBe(1);
    expect(distanzaGiorni("2026-08-31", "2026-09-01")).toBe(1);
    expect(distanzaGiorni("2026-12-31", "2027-01-01")).toBe(1);
    expect(distanzaGiorni("2026-08-09", "2026-08-09")).toBe(0);
  });

  /* ⚠️ L'ora legale sposta le lancette di 60 minuti nella notte fra sabato e
     domenica: contando in millisecondi «un giorno» diventerebbe 23 ore e la
     striscia salterebbe da sola. Qui si contano date, non durate. */
  it("il cambio dell'ora non rompe la striscia", () => {
    expect(distanzaGiorni("2026-03-28", "2026-03-29")).toBe(1); // avanti
    expect(distanzaGiorni("2026-10-24", "2026-10-25")).toBe(1); // indietro
  });
});

describe("la striscia", () => {
  it("il primo giorno vale uno", () => {
    expect(registraUso(null, "2026-08-09")).toEqual({ fila: 1, ultimo: "2026-08-09" });
  });

  it("sette giorni di fila la completano", () => {
    let s = registraUso(null, "2026-08-01");
    for (let g = 2; g <= 7; g++) s = registraUso(s, `2026-08-0${g}`);
    expect(s.fila).toBe(7);
    expect(strisciaCompleta(s)).toBe(true);
  });

  it("due usi nello stesso giorno contano uno", () => {
    const s = registraUso(null, "2026-08-09");
    expect(registraUso(s, "2026-08-09")).toEqual(s);
  });

  /* La regola gentile: un giorno saltato è perdonato. */
  it("saltare un giorno riparte da capo", () => {
    /* 🔴 Cambiato il 23/8/2026: prima un giorno saltato era «perdonato» e la
       fila restava. Sua regola, ridetta: «di fila» vuol dire di fila. */
    let s = registraUso(null, "2026-08-01");
    s = registraUso(s, "2026-08-02");
    s = registraUso(s, "2026-08-03");
    expect(registraUso(s, "2026-08-05").fila).toBe(1);
  });

  it("saltarne due o dieci è uguale: si riparte", () => {
    let s = registraUso(null, "2026-08-01");
    s = registraUso(s, "2026-08-02");
    s = registraUso(s, "2026-08-03");
    expect(registraUso(s, "2026-08-06").fila).toBe(1);
    expect(registraUso(s, "2026-09-30").fila).toBe(1);
  });

  describe("la fila com'è OGGI, non com'era l'ultima volta", () => {
    /**
     * 🔴 IL DIFETTO TROVATO DA LUI IL 23/8/2026: i giorni si aggiornavano solo
     * quando facevi qualcosa. Chi usava l'app martedì, mercoledì e giovedì e poi
     * si limitava ad aprirla vedeva **3 su 7 per sempre**: né avanti né
     * azzerata, inchiodata. Queste quattro prove sono quel difetto.
     */
    const treGiorni = { fila: 3, ultimo: "2026-08-06" };

    it("usata oggi: la fila è quella", () => {
      expect(strisciaOggi(treGiorni, "2026-08-06")?.fila).toBe(3);
    });

    it("usata ieri: la fila è ancora viva", () => {
      expect(strisciaOggi(treGiorni, "2026-08-07")?.fila).toBe(3);
    });

    it("saltato un giorno: la fila è FINITA, e si vede subito", () => {
      // Prima qui si continuava a leggere 3 su 7, anche a settembre.
      expect(strisciaOggi(treGiorni, "2026-08-08")).toBeNull();
      expect(strisciaOggi(treGiorni, "2026-09-30")).toBeNull();
      expect(pallini(strisciaOggi(treGiorni, "2026-08-08"))).toBe(0);
    });

    it("un orologio spostato indietro non punisce nessuno", () => {
      expect(strisciaOggi(treGiorni, "2026-08-04")?.fila).toBe(3);
    });

    it("chi non ha mai usato l'app non ha nessuna fila", () => {
      expect(strisciaOggi(null, "2026-08-06")).toBeNull();
    });
  });

  /* Un telefono con la data spostata indietro non deve regalare niente. */
  it("un orologio che torna indietro non fa danni", () => {
    const s = registraUso(null, "2026-08-09");
    expect(registraUso(s, "2026-08-01")).toEqual(s);
  });

  it("i pallini non passano mai sette", () => {
    expect(pallini(null)).toBe(0);
    expect(pallini({ fila: 3, ultimo: "x" })).toBe(3);
    expect(pallini({ fila: 12, ultimo: "x" })).toBe(GIORNI_PER_VINCERE);
  });
});

describe("il biglietto — uno solo per persona", () => {
  const piena: Striscia = { fila: 7, ultimo: "2026-08-09" };

  it("non si emette prima dei sette giorni", () => {
    expect(puoEmettere({ fila: 6, ultimo: "2026-08-09" }, null)).toBe(false);
    expect(puoEmettere(null, null)).toBe(false);
  });

  it("si emette al settimo giorno", () => {
    expect(puoEmettere(piena, null)).toBe(true);
  });

  /* ⚠️ LA REGOLA CHE CONTA: uno solo, per sempre. Né dopo averlo grattato,
     né se ha perso, né continuando a usare l'app. */
  it("non se ne emette un secondo, in nessun caso", () => {
    const vinto = { esito: "vinto" as const, grattato: true, emessoIl: "2026-08-09" };
    const perso = { esito: "niente" as const, grattato: true, emessoIl: "2026-08-09" };
    const daGrattare = { esito: "vinto" as const, grattato: false, emessoIl: "2026-08-09" };
    expect(puoEmettere(piena, vinto)).toBe(false);
    expect(puoEmettere(piena, perso)).toBe(false);
    expect(puoEmettere(piena, daGrattare)).toBe(false);
    expect(puoEmettere({ fila: 30, ultimo: "2026-09-09" }, perso)).toBe(false);
  });

  it("nasce già deciso e da grattare", () => {
    const b = nuovoBiglietto("2026-08-09", 0.1);
    expect(b.grattato).toBe(false);
    expect(b.esito).toBe("vinto");
    expect(nuovoBiglietto("2026-08-09", 0.9).esito).toBe("niente");
  });

  it("vince circa uno su quattro", () => {
    let vinti = 0;
    const giri = 10000;
    for (let i = 0; i < giri; i++) if (nuovoBiglietto("x", i / giri).esito === "vinto") vinti++;
    expect(vinti / giri).toBeCloseTo(QUOTA_VINCENTI, 2);
  });

  /* Un numero storto non deve regalare caffè a tutti. */
  it("coi numeri storti NON fa vincere", () => {
    for (const n of [NaN, Infinity, -Infinity]) {
      expect(nuovoBiglietto("x", n).esito).toBe("niente");
    }
    expect(nuovoBiglietto("x", 2).esito).toBe("niente");
    // Un numero negativo viene riportato a 0, ed è dentro la quota: vince.
    expect(nuovoBiglietto("x", -1).esito).toBe("vinto");
  });
});

describe("la patina", () => {
  /** Una finta immagine: `vuoti` punti cancellati su `totale`. */
  function patina(totale: number, vuoti: number): number[] {
    const d: number[] = [];
    for (let i = 0; i < totale; i++) {
      d.push(200, 200, 200, i < vuoti ? 0 : 255);
    }
    return d;
  }

  it("intatta vale zero", () => {
    expect(frazioneGrattata(patina(4000, 0), 1)).toBe(0);
  });

  it("tutta via vale uno", () => {
    expect(frazioneGrattata(patina(4000, 4000), 1)).toBe(1);
  });

  it("conta più o meno la metà quando è mezza", () => {
    expect(frazioneGrattata(patina(4000, 2000), 1)).toBeCloseTo(0.5, 2);
  });

  /* Saltare dei punti serve a non far scattare il dito: il risultato deve
     restare vicino a quello vero, se no la soglia scatterebbe a caso. */
  it("saltando punti il conto resta onesto", () => {
    const d = patina(8000, 2000);
    expect(frazioneGrattata(d, 40)).toBeCloseTo(frazioneGrattata(d, 1), 1);
  });

  it("si scopre da sola oltre un terzo, non prima", () => {
    expect(abbastanzaGrattata(patina(4000, 1200), 1)).toBe(false); // 30%
    expect(abbastanzaGrattata(patina(4000, 1600), 1)).toBe(true); // 40%
  });

  it("un'immagine vuota non fa scoprire niente", () => {
    expect(frazioneGrattata([], 1)).toBe(0);
    expect(abbastanzaGrattata([], 1)).toBe(false);
  });
});

describe("la domenica", () => {
  it("riconosce la domenica", () => {
    expect(domenica(new Date(2026, 7, 9))).toBe(true); // 9 agosto 2026 è domenica
    expect(domenica(new Date(2026, 7, 10))).toBe(false);
    expect(domenica(new Date(2026, 7, 15))).toBe(false);
  });
});
