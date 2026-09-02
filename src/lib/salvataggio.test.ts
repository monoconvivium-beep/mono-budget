/**
 * QUANDO IL TELEFONO NON CI LASCIA SALVARE, L'APP LO DEVE DIRE.
 *
 * 🔴 Da dove nasce (23/8/2026): il salvataggio stava dentro un `try` con il ramo
 * d'errore vuoto. In navigazione privata l'app funzionava benissimo finché
 * restava aperta e **perdeva tutto alla chiusura, senza un fiato**. Su un'app di
 * conti è il difetto peggiore: uno segna la spesa, la vede scritta, si fida, e
 * il giorno dopo non c'è più.
 *
 * 🔑 Queste prove difendono due cose insieme, e servono entrambe:
 * · la spia si accende (se no non lo sa nessuno);
 * · l'app **continua a funzionare** (se no per dire «non posso salvare» le
 *   avremmo tolto anche l'ultima cosa che sapeva fare).
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

/** Un telefono finto: si può decidere se lascia scrivere o no. */
function telefono({ lasciaScrivere }: { lasciaScrivere: boolean }) {
  const dentro = new Map<string, string>();
  return {
    getItem: (k: string) => dentro.get(k) ?? null,
    setItem: (k: string, v: string) => {
      // È l'errore vero di Safari in navigazione privata.
      if (!lasciaScrivere) throw new DOMException("quota", "QuotaExceededError");
      dentro.set(k, v);
    },
    removeItem: (k: string) => dentro.delete(k),
    quanteRighe: () => dentro.size,
  };
}

async function apriApp(memoria: ReturnType<typeof telefono>) {
  vi.resetModules();
  vi.stubGlobal("window", { localStorage: memoria });
  const store = await import("./store");
  // La lettura è pigra: `esporta` la fa scattare, come farebbe la prima schermata.
  store.azioni.esporta();
  return store;
}

beforeEach(() => vi.unstubAllGlobals());

describe("un telefono che non lascia salvare", () => {
  it("accende la spia già all'apertura, prima che uno scriva un euro", async () => {
    // 🔑 Il momento giusto per dirlo è PRIMA della prima spesa, non dopo la centesima.
    const { salvataggioNonRiuscito } = await apriApp(telefono({ lasciaScrivere: false }));
    expect(salvataggioNonRiuscito()).toBe(true);
  });

  it("l'app continua a funzionare: quello che segni c'è, finché è aperta", async () => {
    const { azioni, salvataggioNonRiuscito } = await apriApp(telefono({ lasciaScrivere: false }));
    azioni.spesaAggiungi("pane");
    expect(azioni.esporta()).toContain("pane");
    expect(salvataggioNonRiuscito()).toBe(true);
  });

  it("la prova non tocca MAI i conti veri", async () => {
    // Una prova che scrivesse sulla chiave vera potrebbe cancellare le spese di
    // qualcuno: si scrive su una chiave finta e la si toglie subito.
    const memoria = telefono({ lasciaScrivere: true });
    await apriApp(memoria);
    expect(memoria.getItem("mono-money-prova")).toBeNull();
  });
});

describe("un telefono normale", () => {
  it("la spia resta spenta", async () => {
    const { salvataggioNonRiuscito } = await apriApp(telefono({ lasciaScrivere: true }));
    expect(salvataggioNonRiuscito()).toBe(false);
  });

  it("e quello che segni finisce davvero nel telefono", async () => {
    const memoria = telefono({ lasciaScrivere: true });
    const { azioni, salvataggioNonRiuscito } = await apriApp(memoria);
    azioni.spesaAggiungi("pane");
    expect(memoria.getItem("mono-money-v1")).toContain("pane");
    expect(salvataggioNonRiuscito()).toBe(false);
  });
});
