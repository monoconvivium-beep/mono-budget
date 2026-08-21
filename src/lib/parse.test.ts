import { describe, expect, it } from "vitest";
import { interpreta, parolaANumero, type RegolaImparata } from "./parse";

describe("numeri detti a parole", () => {
  it("converte le parole singole", () => {
    expect(parolaANumero("quarantasei")).toBe(46);
    expect(parolaANumero("ventuno")).toBe(21);
    expect(parolaANumero("trentotto")).toBe(38);
    expect(parolaANumero("cento")).toBe(100);
    expect(parolaANumero("duecentocinquanta")).toBe(250);
    expect(parolaANumero("mille")).toBe(1000);
    expect(parolaANumero("farmacia")).toBeNull();
  });

  it("«quarantasei farmacia» diventa 46 in Salute", () => {
    const [m] = interpreta("quarantasei farmacia");
    expect(m?.importo).toBe(46);
    expect(m?.categoria).toBe("Salute");
    expect(m?.tipo).toBe("uscita");
  });
});

describe("decimali italiani", () => {
  it("4,80 resta 4,80 e non diventa 480", () => {
    const [m] = interpreta("4,80 bar");
    expect(m?.importo).toBe(4.8);
    expect(m?.importoSospetto).toBe(false);
  });

  it("«quattro euro e sessanta» fa 4,60", () => {
    const [m] = interpreta("quattro euro e sessanta caffè");
    expect(m?.importo).toBe(4.6);
    expect(m?.categoria).toBe("Bar e ristoranti");
    expect(m?.importoSospetto).toBe(false);
  });

  it("«ottanta centesimi» fa 0,80", () => {
    const [m] = interpreta("ottanta centesimi pane");
    expect(m?.importo).toBe(0.8);
  });

  it("«tre euro e cinquanta centesimi» fa 3,50", () => {
    const [m] = interpreta("tre euro e cinquanta centesimi cappuccino");
    expect(m?.importo).toBe(3.5);
  });
});

describe("importo collassato dal riconoscimento", () => {
  it("propone la lettura in centesimi senza cambiare l'importo", () => {
    const [m] = interpreta("460 pizzeria");
    expect(m?.importo).toBe(460);
    expect(m?.importoSospetto).toBe(true);
    expect(m?.importoAlternativo).toBe(4.6);
  });

  it("non sospetta gli importi tondi né quelli con euro", () => {
    expect(interpreta("mille affitto")[0]?.importoSospetto).toBe(false);
    expect(interpreta("450 euro affitto")[0]?.importoSospetto).toBe(false);
  });
});

describe("due spese in una frase", () => {
  it("«e» separa due spese", () => {
    const m = interpreta("dodici supermercato e tre bar");
    expect(m).toHaveLength(2);
    expect(m[0]?.importo).toBe(12);
    expect(m[0]?.categoria).toBe("Spesa alimentare");
    expect(m[1]?.importo).toBe(3);
    expect(m[1]?.categoria).toBe("Bar e ristoranti");
  });

  it("«e» dentro un importo non spezza la spesa", () => {
    const m = interpreta("quattro euro e sessanta");
    expect(m).toHaveLength(1);
    expect(m[0]?.importo).toBe(4.6);
  });

  it("«e» seguito da testo senza importo non spezza", () => {
    const m = interpreta("venti gratta e vinci");
    expect(m).toHaveLength(1);
    expect(m[0]?.categoria).toBe("Tabacchi");
  });
});

describe("categorie e sinonimi", () => {
  const casi: [string, string][] = [
    ["dieci tabaccaio", "Tabacchi"],
    ["trenta supermercato", "Spesa alimentare"],
    ["ottocento euro affitto", "Affitto"],
    ["sessanta euro bollette", "Luce e gas"],
    ["cinquanta benzina", "Benzina"],
    ["due biglietto autobus", "Trasporti"],
    ["dodici farmacia", "Salute"],
    ["nove netflix", "Abbonamenti"],
    ["quaranta scarpe", "Shopping"],
    ["quindici cinema", "Tempo libero"],
    ["venticinque trattoria", "Bar e ristoranti"],
  ];
  it.each(casi)("%s → %s", (frase, categoria) => {
    expect(interpreta(frase)[0]?.categoria).toBe(categoria);
  });

  it("se non riconosce nulla la categoria è Altro e lo dichiara", () => {
    const [m] = interpreta("sette pinco pallino");
    expect(m?.categoria).toBe("Altro");
    expect(m?.categoriaIncerta).toBe(true);
  });
});

describe("regole imparate", () => {
  it("applica la regola imparata prima dei sinonimi", () => {
    const regole: RegolaImparata[] = [{ chiave: "pinco", categoria: "Bar e ristoranti" }];
    const [m] = interpreta("sette pinco", regole);
    expect(m?.categoria).toBe("Bar e ristoranti");
    expect(m?.categoriaIncerta).toBe(false);
  });
});

describe("entrate, contanti e carta", () => {
  it("riconosce un'entrata", () => {
    const [m] = interpreta("millecinquecento euro stipendio");
    expect(m?.tipo).toBe("entrata");
    expect(m?.importo).toBe(1500);
  });

  it("riconosce contanti e carta", () => {
    expect(interpreta("dieci bar contanti")[0]?.metodo).toBe("contanti");
    expect(interpreta("dieci bar carta")[0]?.metodo).toBe("carta");
    expect(interpreta("dieci bar")[0]?.metodo).toBeNull();
  });
});

describe("frasi vuote", () => {
  it("senza importo non crea movimenti", () => {
    expect(interpreta("farmacia")).toHaveLength(0);
    expect(interpreta("   ")).toHaveLength(0);
  });
});
