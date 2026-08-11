import { useSyncExternalStore } from "react";
import type { Categoria, Metodo, Tipo } from "./parse";

export interface Movimento {
  id: string;
  /** ISO datetime */
  data: string;
  importo: number;
  categoria: Categoria;
  etichetta: string;
  tipo: Tipo;
  metodo: Metodo;
  testo: string;
  /** nel cestino */
  cestinato?: boolean | undefined;
  cestinatoIl?: string | undefined;
}

export interface Regola {
  chiave: string;
  categoria: Categoria;
}

/**
 * Una ricetta SCRITTA DA CHI USA L'APP (la parte Salato del ricettario).
 * Le basi del Dolce non stanno qui: vivono nel codice (`lib/cucina.ts`),
 * così si aggiornano con l'app e nessuno le cancella per sbaglio.
 * Le righe sono già belle e pronte: le ha sistemate l'interprete di cucina
 * prima del salvataggio.
 */
export interface Ricetta {
  id: string;
  nome: string;
  ingredienti: string[];
  passi: string[];
  creataIl: string;
}

/**
 * Una riga della lista della spesa. È libera: nessuna categoria, nessun
 * prezzo, nessun prodotto «consigliato» — sua scelta del 9/8, e ha ragione:
 * una lista della spesa che ti suggerisce cosa comprare non è più la TUA
 * lista. `cosa` esce già bella dall'interprete di cucina.
 */
export interface VoceSpesa {
  id: string;
  cosa: string;
  presa: boolean;
  creataIl: string;
}

export interface Stato {
  versione: 1;
  tema: "chiaro" | "scuro";
  obiettivo: number;
  movimenti: Movimento[];
  regole: Regola[];
  /** La schermata d'ingresso si vede una volta sola, poi mai più. */
  benvenutoVisto: boolean;
  /**
   * Il nome di chi si è iscritto. Vuoto = non ancora iscritto, e l'app non si
   * apre. ⚠️ Qui resta solo il nome, per salutare: gli altri dati sono andati
   * in rubrica e non serve tenerne una copia sul telefono.
   */
  iscrittoCome: string;
  /** Il ricettario, parte Salato: le ricette dettate o scritte da chi usa l'app. */
  ricette: Ricetta[];
  /** La lista della spesa: quello che manca, detto a voce. */
  spesa: VoceSpesa[];
}

const CHIAVE = "mono-money-v1";

const iniziale: Stato = {
  versione: 1,
  /**
   * Cashmere di partenza — scelta sua del 4/8.
   * 🔑 Il verde bosco non sparisce: diventa **l'accento**, e sta su un blocco
   * solo per schermata (quello che deve saltare all'occhio). Un fondo scuro
   * dappertutto schiacciava tutto sullo stesso piano, e il logo ufficiale —
   * che è scuro — non ci stava.
   */
  tema: "chiaro",
  obiettivo: 300,
  movimenti: [],
  regole: [],
  benvenutoVisto: false,
  iscrittoCome: "",
  ricette: [],
  spesa: [],
};

let stato: Stato = iniziale;
let caricato = false;
const ascoltatori = new Set<() => void>();

function leggi(): Stato {
  if (typeof window === "undefined") return iniziale;
  try {
    const raw = window.localStorage.getItem(CHIAVE);
    if (!raw) return iniziale;
    const dati = JSON.parse(raw) as Partial<Stato>;
    return {
      ...iniziale,
      ...dati,
      movimenti: Array.isArray(dati.movimenti) ? dati.movimenti : [],
      regole: Array.isArray(dati.regole) ? dati.regole : [],
      // Salvataggi nati prima del ricettario: la chiave non c'è, e va bene così.
      ricette: Array.isArray(dati.ricette) ? dati.ricette : [],
      spesa: Array.isArray(dati.spesa) ? dati.spesa : [],
    };
  } catch {
    return iniziale;
  }
}

function salva() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHIAVE, JSON.stringify(stato));
  } catch {
    /* spazio esaurito: i dati restano in memoria */
  }
}

function notifica() {
  ascoltatori.forEach((f) => f());
}

function iscrivi(f: () => void) {
  if (!caricato) {
    caricato = true;
    stato = leggi();
  }
  ascoltatori.add(f);
  return () => ascoltatori.delete(f);
}

function istantanea(): Stato {
  if (!caricato && typeof window !== "undefined") {
    caricato = true;
    stato = leggi();
  }
  return stato;
}

function aggiorna(f: (s: Stato) => Stato) {
  stato = f(stato);
  salva();
  notifica();
}

export function useStato(): Stato {
  return useSyncExternalStore(iscrivi, istantanea, () => iniziale);
}

function nuovoId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const azioni = {
  aggiungi(m: Omit<Movimento, "id" | "data"> & { data?: string }) {
    const mov: Movimento = { id: nuovoId(), data: m.data ?? new Date().toISOString(), ...m };
    aggiorna((s) => ({ ...s, movimenti: [mov, ...s.movimenti] }));
    return mov;
  },
  cestina(id: string) {
    aggiorna((s) => ({
      ...s,
      movimenti: s.movimenti.map((m) =>
        m.id === id ? { ...m, cestinato: true, cestinatoIl: new Date().toISOString() } : m,
      ),
    }));
  },
  ripristina(id: string) {
    aggiorna((s) => ({
      ...s,
      movimenti: s.movimenti.map((m) =>
        m.id === id ? { ...m, cestinato: false, cestinatoIl: undefined } : m,
      ),
    }));
  },
  eliminaPerSempre(id: string) {
    aggiorna((s) => ({ ...s, movimenti: s.movimenti.filter((m) => m.id !== id) }));
  },
  svuotaCestino() {
    aggiorna((s) => ({ ...s, movimenti: s.movimenti.filter((m) => !m.cestinato) }));
  },
  cambiaCategoria(id: string, categoria: Categoria, imparaDa?: string) {
    aggiorna((s) => {
      const regole = [...s.regole];
      const chiave = (imparaDa ?? "").trim().toLowerCase();
      if (chiave && chiave.length > 2) {
        const i = regole.findIndex((r) => r.chiave === chiave);
        if (i >= 0) regole[i] = { chiave, categoria };
        else regole.push({ chiave, categoria });
      }
      return {
        ...s,
        regole,
        movimenti: s.movimenti.map((m) => (m.id === id ? { ...m, categoria } : m)),
      };
    });
  },
  togliRegola(chiave: string) {
    aggiorna((s) => ({ ...s, regole: s.regole.filter((r) => r.chiave !== chiave) }));
  },
  impostaTema(tema: Stato["tema"]) {
    aggiorna((s) => ({ ...s, tema }));
  },
  chiudiBenvenuto() {
    aggiorna((s) => ({ ...s, benvenutoVisto: true }));
  },
  /** Iscrizione riuscita: da qui in poi l'app si apre e non la richiede più. */
  iscritto(nome: string) {
    aggiorna((s) => ({ ...s, iscrittoCome: nome || "cliente" }));
  },
  /** Per rileggere la presentazione dalla scheda MONO, quando si vuole. */
  riapriBenvenuto() {
    aggiorna((s) => ({ ...s, benvenutoVisto: false }));
  },
  impostaObiettivo(obiettivo: number) {
    aggiorna((s) => ({ ...s, obiettivo }));
  },
  /* ------------------------------------------------------- il ricettario */
  ricettaNuova(dati: { nome: string; ingredienti: string[]; passi: string[] }): Ricetta {
    const r: Ricetta = {
      id: nuovoId(),
      nome: dati.nome.trim(),
      ingredienti: dati.ingredienti,
      passi: dati.passi,
      creataIl: new Date().toISOString(),
    };
    aggiorna((s) => ({ ...s, ricette: [r, ...s.ricette] }));
    return r;
  },
  ricettaAggiorna(id: string, patch: Partial<Omit<Ricetta, "id" | "creataIl">>) {
    aggiorna((s) => ({
      ...s,
      ricette: s.ricette.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  },
  ricettaElimina(id: string) {
    aggiorna((s) => ({ ...s, ricette: s.ricette.filter((r) => r.id !== id) }));
  },
  /* ------------------------------------------------- la lista della spesa */
  spesaAggiungi(cosa: string): void {
    const pulito = cosa.trim();
    if (!pulito) return;
    const v: VoceSpesa = {
      id: nuovoId(),
      cosa: pulito,
      presa: false,
      creataIl: new Date().toISOString(),
    };
    // In cima: l'ultima cosa che ti è venuta in mente è quella che rischi
    // di dimenticare, e deve stare dove cade l'occhio.
    aggiorna((s) => ({ ...s, spesa: [v, ...s.spesa] }));
  },
  spesaSpunta(id: string) {
    aggiorna((s) => ({
      ...s,
      spesa: s.spesa.map((v) => (v.id === id ? { ...v, presa: !v.presa } : v)),
    }));
  },
  spesaTogli(id: string) {
    aggiorna((s) => ({ ...s, spesa: s.spesa.filter((v) => v.id !== id) }));
  },
  /** Via le spuntate: quello che resta è quello che manca ancora. */
  spesaPulisci() {
    aggiorna((s) => ({ ...s, spesa: s.spesa.filter((v) => !v.presa) }));
  },
  /** Backup completo: TUTTI gli anni, non solo quello corrente. */
  esporta(): string {
    return JSON.stringify({ ...istantanea(), esportatoIl: new Date().toISOString() }, null, 2);
  },
  importa(testo: string): { ok: boolean; messaggio: string } {
    try {
      const dati = JSON.parse(testo) as Partial<Stato>;
      if (!Array.isArray(dati.movimenti)) return { ok: false, messaggio: "File non valido." };
      aggiorna((s) => ({
        ...s,
        tema: dati.tema ?? s.tema,
        obiettivo: typeof dati.obiettivo === "number" ? dati.obiettivo : s.obiettivo,
        movimenti: dati.movimenti as Movimento[],
        regole: Array.isArray(dati.regole) ? (dati.regole as Regola[]) : s.regole,
        // ⚠️ Senza questa riga il ripristino di un backup BUTTEREBBE le ricette:
        // importa() ricostruisce lo stato campo per campo, non con lo spread.
        ricette: Array.isArray(dati.ricette) ? (dati.ricette as Ricetta[]) : s.ricette,
        // Stessa ragione delle ricette: senza questa riga il ripristino di un
        // backup vecchio cancellerebbe la lista della spesa.
        spesa: Array.isArray(dati.spesa) ? (dati.spesa as VoceSpesa[]) : s.spesa,
      }));
      return {
        ok: true,
        messaggio: `Ripristinati ${(dati.movimenti as Movimento[]).length} movimenti.`,
      };
    } catch {
      return { ok: false, messaggio: "Non riesco a leggere questo file." };
    }
  },
};

/* --------------------------------------------------------------- utilità */

export const MESI = [
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
];

export function attivi(movimenti: Movimento[]) {
  return movimenti.filter((m) => !m.cestinato);
}

export function somma(movimenti: Movimento[], tipo: Tipo) {
  return movimenti.filter((m) => m.tipo === tipo).reduce((t, m) => t + m.importo, 0);
}

export function stessoMese(iso: string, anno: number, mese: number) {
  const d = new Date(iso);
  return d.getFullYear() === anno && d.getMonth() === mese;
}

export function oraBreve(iso: string) {
  return new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}

export function dataBreve(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MESI[d.getMonth()]?.slice(0, 3)}`;
}
