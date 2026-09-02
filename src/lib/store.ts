import { useSyncExternalStore } from "react";
import { CATEGORIE, coloreCategoria, coloreLibero } from "./parse";
import { RETE_DI_SICUREZZA } from "./categorie";
import { giornoBuono, meseDi, mesiDaSegnare, quandoSegnare, type SpesaFissa } from "./fisse";
import type { Categoria, CategoriaPersonale, Metodo, Tipo } from "./parse";
import {
  giorno,
  nuovoBiglietto,
  puoEmettere,
  registraUso,
  type Biglietto,
  type Striscia,
} from "./gratta";

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
  /**
   * Da quale spesa fissa è nato, e per quale mese (`2026-08`).
   * 🔑 Sono queste due righe a impedire che l'affitto venga segnato due volte:
   * prima di segnarne uno si guarda se per quel mese c'è già.
   */
  fissa?: string | undefined;
  fissaMese?: string | undefined;
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

/**
 * Una cosa da fare. Stessa forma della voce di spesa, e non è pigrizia: sono
 * lo stesso gesto — la dici, la vedi, la spunti quando è fatta. Due strutture
 * diverse per due liste identiche avrebbero solo raddoppiato i difetti.
 * ⚠️ Niente date, per ora: non erano state chieste, e una scadenza che non
 * può mandare nessuna notifica (l'app non ha server) prometterebbe più di
 * quello che sa fare.
 */
export interface VoceDaFare {
  id: string;
  cosa: string;
  fatta: boolean;
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
  /** Le cose da fare: le faccende di casa, dette a voce. */
  dafare: VoceDaFare[];
  /** I giorni di fila in cui ha usato l'app. Null = non ha ancora cominciato. */
  striscia: Striscia | null;
  /** Il gratta e vinci: UNO per persona, e quando c'è resta lì per sempre. */
  biglietto: Biglietto | null;
  /**
   * Le categorie inventate da chi usa l'app.
   *
   * 🔴 Perché esistono: «Trasporti» tiene dentro la benzina e il biglietto del
   * pullman, che a fine mese sono due cose diverse. Le undici di casa restano
   * come punto di partenza, ma non sono più un recinto.
   */
  categoriePersonali: CategoriaPersonale[];
  /**
   * Le categorie SPENTE: restano nel programma ma non si vedono più, né nella
   * tendina né fra quelle che la voce può scegliere. I «Tabacchi» di chi non
   * fuma. ⚠️ Spegnere non è cancellare: si riaccendono, e nessuna spesa si
   * perde per strada.
   */
  nascoste: string[];
  /**
   * LE RINOMINATE: «Trasporti» → «Benzina», e vale solo per le undici di casa.
   *
   * 🔑 Serve alla VOCE, non a quello che si vede. Le spese già scritte vengono
   * riscritte subito col nome nuovo; ma chi detta «pullman» fa scattare i
   * sinonimi di «Trasporti», e senza questa mappa la spesa finirebbe in una
   * casella che sullo schermo non esiste più.
   */
  rinomine: Record<string, string>;
  /**
   * LE SPESE CHE TORNANO UGUALI OGNI MESE: affitto, luce e gas, abbonamenti.
   * Le segna l'app da sola all'apertura — vedi `lib/fisse.ts`.
   */
  fisse: SpesaFissa[];
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
  dafare: [],
  striscia: null,
  biglietto: null,
  categoriePersonali: [],
  nascoste: [],
  rinomine: {},
  fisse: [],
};

let stato: Stato = iniziale;
let caricato = false;
const ascoltatori = new Set<() => void>();

/**
 * LE CASELLE CAMBIATE IL 21/8/2026, e cosa ne è stato di quello che c'era dentro.
 *
 * 🔴 «Bar» e «Ristoranti» sono diventate una casella sola. Chi aveva già delle
 * spese lì dentro **non le deve perdere né vedere sparire dalla torta**: si
 * riscrivono al nome nuovo appena l'app si apre, una volta sola, in silenzio.
 * ⚠️ Non è un capriccio di nomi: una spesa che punta a una casella che non
 * esiste più è una spesa che nel bilancio non si vede.
 */
const CASELLE_UNITE: Record<string, string> = {
  Bar: "Bar e ristoranti",
  Ristoranti: "Bar e ristoranti",
};

const nomeNuovo = (n: string) => CASELLE_UNITE[n] ?? n;

function conCaselleNuove(s: Stato): Stato {
  const diCasa = new Set<string>(CATEGORIE);
  return {
    ...s,
    movimenti: s.movimenti.map((m) =>
      CASELLE_UNITE[m.categoria] ? { ...m, categoria: nomeNuovo(m.categoria) as Categoria } : m,
    ),
    regole: s.regole.map((r) =>
      CASELLE_UNITE[r.categoria] ? { ...r, categoria: nomeNuovo(r.categoria) as Categoria } : r,
    ),
    nascoste: [...new Set(s.nascoste.map(nomeNuovo))],
    rinomine: Object.fromEntries(
      Object.entries(s.rinomine).map(([da, a]) => [nomeNuovo(da), nomeNuovo(a)]),
    ),
    /* Una sua categoria che adesso è diventata di casa — «Benzina» — non deve
       restare in doppio: due voci con lo stesso nome nella tendina sono un
       elenco che sembra rotto. Le spese non si toccano: il nome è lo stesso. */
    categoriePersonali: s.categoriePersonali.filter(
      (c) => !diCasa.has(c.nome) && !CASELLE_UNITE[c.nome],
    ),
  };
}

/**
 * ⚠️ IL TELEFONO CI LASCIA SCRIVERE?
 *
 * 🔴 Da dove nasce (23/8/2026): il salvataggio stava dentro un `try` con il
 * ramo d'errore **vuoto**. In navigazione privata — o con i dati dei siti
 * bloccati — l'app funzionava benissimo finché era aperta e **perdeva tutto
 * alla chiusura, senza dire niente**. Su un'app di conti è il difetto peggiore
 * che ci sia: uno segna la spesa, la vede scritta, si fida, e il giorno dopo non
 * c'è più. Meglio dirlo prima di scrivere il primo euro che dopo il centesimo.
 */
let salvataggioRotto = false;

/** La spia: `true` = quello che segni non sopravvive alla chiusura. */
export function salvataggioNonRiuscito(): boolean {
  return salvataggioRotto;
}

const CHIAVE_PROVA = "mono-money-prova";

/**
 * Si prova a scrivere DUE righe finte prima ancora di leggere i conti: così la
 * spia è già accesa alla prima schermata, non dopo che uno ha segnato qualcosa.
 * ⚠️ Mai con la chiave vera: una prova non deve poter toccare i conti di nessuno.
 */
function controllaSePuoiSalvare() {
  try {
    window.localStorage.setItem(CHIAVE_PROVA, "1");
    window.localStorage.removeItem(CHIAVE_PROVA);
    salvataggioRotto = false;
  } catch {
    salvataggioRotto = true;
  }
}

function leggi(): Stato {
  if (typeof window === "undefined") return iniziale;
  controllaSePuoiSalvare();
  try {
    const raw = window.localStorage.getItem(CHIAVE);
    if (!raw) return iniziale;
    const dati = JSON.parse(raw) as Partial<Stato>;
    return conCaselleNuove({
      ...iniziale,
      ...dati,
      movimenti: Array.isArray(dati.movimenti) ? dati.movimenti : [],
      regole: Array.isArray(dati.regole) ? dati.regole : [],
      // Salvataggi nati prima del ricettario: la chiave non c'è, e va bene così.
      ricette: Array.isArray(dati.ricette) ? dati.ricette : [],
      spesa: Array.isArray(dati.spesa) ? dati.spesa : [],
      dafare: Array.isArray(dati.dafare) ? dati.dafare : [],
      striscia: dati.striscia ?? null,
      biglietto: dati.biglietto ?? null,
      // Salvataggi nati prima delle categorie libere: la chiave non c'è.
      categoriePersonali: Array.isArray(dati.categoriePersonali) ? dati.categoriePersonali : [],
      // Salvataggi nati prima della schermata delle categorie: le chiavi non ci sono.
      nascoste: Array.isArray(dati.nascoste) ? dati.nascoste : [],
      rinomine: dati.rinomine && typeof dati.rinomine === "object" ? dati.rinomine : {},
      fisse: Array.isArray(dati.fisse) ? dati.fisse : [],
    });
  } catch {
    return iniziale;
  }
}

function salva() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHIAVE, JSON.stringify(stato));
    salvataggioRotto = false;
  } catch {
    /**
     * 🔴 NON PIÙ IN SILENZIO (23/8/2026). Qui prima non succedeva niente: i
     * dati restavano in memoria e sparivano alla chiusura senza un fiato.
     * Adesso si accende la spia e l'app lo dice in cima a ogni schermata.
     * ⚠️ Non si butta via niente: quello che c'è resta in memoria e continua a
     * funzionare finché l'app è aperta. Si dice soltanto la verità.
     */
    salvataggioRotto = true;
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

/** La spia del salvataggio, per la schermata. Si aggiorna a ogni cambiamento. */
export function useSalvataggioRotto(): boolean {
  return useSyncExternalStore(
    iscrivi,
    () => salvataggioRotto,
    () => false,
  );
}

function nuovoId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * «Oggi ho usato MonoConvivium», appiccicato a un cambiamento di stato.
 *
 * 🔑 Lo chiamano le azioni VERE — segnare un movimento, toccare la lista,
 * salvare una ricetta — non l'apertura dell'app: aprire e chiudere per sette
 * giorni non è usarla, e il premio è per chi se ne serve davvero.
 * Se i sette giorni si compiono qui, il biglietto nasce SUBITO e già deciso:
 * grattarlo scoprirà una cosa scritta, non la tirerà a sorte sotto il dito.
 */
function conUso(s: Stato): Stato {
  const oggi = giorno(new Date());
  const striscia = registraUso(s.striscia, oggi);
  if (striscia === s.striscia) return s; // già contato oggi
  const biglietto = puoEmettere(striscia, s.biglietto)
    ? nuovoBiglietto(oggi, Math.random())
    : s.biglietto;
  return { ...s, striscia, biglietto };
}

export const azioni = {
  aggiungi(m: Omit<Movimento, "id" | "data"> & { data?: string }) {
    let mov: Movimento = { id: nuovoId(), data: m.data ?? new Date().toISOString(), ...m };
    aggiorna((s) => {
      /* 🔑 Se «Trasporti» è stata rinominata «Benzina», quello che riconosce la
         voce va portato lì: se no la spesa finirebbe in una casella che sullo
         schermo non esiste più. */
      const categoria = (s.rinomine[mov.categoria] ?? mov.categoria) as Categoria;
      mov = { ...mov, categoria };
      return conUso({ ...s, movimenti: [mov, ...s.movimenti] });
    });
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
  /**
   * CREA UNA CATEGORIA NUOVA.
   *
   * Il colore non lo sceglie l'utente: lo propone l'app dalla tavolozza MONO,
   * prendendo il primo non ancora usato. Chiedere anche il colore vorrebbe
   * dire due decisioni per una cosa sola, e la seconda non interessa a nessuno.
   *
   * Un nome già esistente non crea un doppione: si torna quello che c'è.
   */
  creaCategoria(nome: string): string {
    const pulito = nome.trim().slice(0, 24);
    if (!pulito) return "";
    let risultato = pulito;
    aggiorna((s) => {
      const gia = [...CATEGORIE, ...s.categoriePersonali.map((c) => c.nome)].find(
        (n) => n.toLocaleLowerCase("it") === pulito.toLocaleLowerCase("it"),
      );
      if (gia) {
        risultato = gia;
        return s;
      }
      const usati = s.categoriePersonali.map((c) => c.colore);
      return {
        ...s,
        categoriePersonali: [
          ...s.categoriePersonali,
          { nome: pulito, colore: coloreLibero(usati) },
        ],
      };
    });
    return risultato;
  },
  /**
   * TOGLIE UNA CATEGORIA INVENTATA.
   *
   * ⚠️ I movimenti che ci stavano dentro **non si cancellano**: tornano in
   * «Altro». Cancellare le spese di qualcuno perché ha cambiato idea sul nome
   * di una casella sarebbe un danno, non una pulizia.
   */
  /**
   * RINOMINA UNA CATEGORIA — anche una delle undici di casa.
   *
   * 🔴 Le spese di prima **si riscrivono**: se «Trasporti» diventa «Benzina» e
   * le spese vecchie restassero «Trasporti», il bilancio di luglio parlerebbe
   * una lingua e quello di agosto un'altra, con due fette nella torta per la
   * stessa cosa. Rinominare non è creare una casella nuova.
   *
   * 🔑 Se era una di casa: la vecchia si **spegne** (sparisce dalla tendina), la
   * nuova nasce come categoria tua **con lo stesso colore di prima** (la torta
   * non cambia faccia da un giorno all'altro), e la mappa `rinomine` porta lì
   * anche quello che riconoscerà la voce.
   *
   * Torna il nome buono, o "" se il nome non andava bene.
   */
  rinominaCategoria(vecchio: string, nuovo: string): string {
    const pulito = nuovo.trim().slice(0, 24);
    if (!pulito || pulito === vecchio) return "";
    if (vecchio === RETE_DI_SICUREZZA) return "";

    let risultato = "";
    aggiorna((s) => {
      const uguale = (a: string, b: string) =>
        a.toLocaleLowerCase("it") === b.toLocaleLowerCase("it");
      const tutte = [...CATEGORIE, ...s.categoriePersonali.map((c) => c.nome)];
      // Un nome già in uso non fa un doppione: le spese finiscono in quello che c'è.
      const gia = tutte.find((n) => uguale(n, pulito));
      const finale = gia ?? pulito;
      risultato = finale;

      const diCasa = (CATEGORIE as readonly string[]).includes(vecchio);
      const colore = coloreCategoria(vecchio as Categoria, s.categoriePersonali);

      const personali = diCasa
        ? // Nasce come sua, ma col colore che aveva prima.
          s.categoriePersonali.some((c) => uguale(c.nome, finale))
          ? s.categoriePersonali
          : [...s.categoriePersonali, { nome: finale, colore }]
        : s.categoriePersonali.map((c) => (c.nome === vecchio ? { nome: finale, colore } : c));

      return {
        ...s,
        categoriePersonali: personali,
        // La vecchia di casa esce di scena, ma resta riaccendibile.
        nascoste: diCasa ? [...new Set([...s.nascoste, vecchio])] : s.nascoste,
        rinomine: diCasa ? { ...s.rinomine, [vecchio]: finale } : s.rinomine,
        movimenti: s.movimenti.map((m) =>
          m.categoria === vecchio ? { ...m, categoria: finale } : m,
        ),
        regole: s.regole.map((r) => (r.categoria === vecchio ? { ...r, categoria: finale } : r)),
      };
    });
    return risultato;
  },
  /**
   * SPEGNE UNA CATEGORIA: sparisce dalla tendina e la voce non la sceglie più.
   * ⚠️ Non è cancellare: le spese che ci stanno dentro **restano dov'erano**, e
   * riaccendendola torna tutto come prima. «Altro» non si spegne mai: è dove
   * finisce quello che l'app non ha capito.
   */
  spegniCategoria(nome: string) {
    if (nome === RETE_DI_SICUREZZA) return;
    aggiorna((s) => ({ ...s, nascoste: [...new Set([...s.nascoste, nome])] }));
  },
  riaccendiCategoria(nome: string) {
    aggiorna((s) => {
      const rinomine = { ...s.rinomine };
      // Se era stata rinominata, riaccenderla vuol dire anche smettere di
      // portare altrove quello che riconosce la voce.
      delete rinomine[nome];
      return { ...s, rinomine, nascoste: s.nascoste.filter((n) => n !== nome) };
    });
  },
  togliCategoria(nome: string) {
    aggiorna((s) => ({
      ...s,
      categoriePersonali: s.categoriePersonali.filter((c) => c.nome !== nome),
      movimenti: s.movimenti.map((m) => (m.categoria === nome ? { ...m, categoria: "Altro" } : m)),
      regole: s.regole.filter((r) => r.categoria !== nome),
    }));
  },
  /* ------------------------------------------------ le spese fisse del mese */
  /**
   * Una spesa che torna uguale ogni mese. Nasce **da questo mese**: quello che
   * è stato pagato prima l'app non se lo inventa.
   */
  fissaAggiungi(d: { cosa: string; importo: number; categoria: string; giorno: number }) {
    const fissa: SpesaFissa = {
      id: nuovoId(),
      cosa: d.cosa.trim().slice(0, 32),
      importo: d.importo,
      categoria: d.categoria,
      giorno: giornoBuono(d.giorno),
      daQuando: meseDi(new Date()),
      attiva: true,
    };
    aggiorna((s) => ({ ...s, fisse: [...s.fisse, fissa] }));
    return fissa;
  },
  /**
   * ⚠️ Togliere una spesa fissa NON cancella i movimenti già segnati: quelli
   * sono spese vere, uscite davvero. Smette solo di segnarne di nuove.
   */
  fissaTogli(id: string) {
    aggiorna((s) => ({ ...s, fisse: s.fisse.filter((f) => f.id !== id) }));
  },
  fissaAccendiOSpegni(id: string) {
    aggiorna((s) => ({
      ...s,
      fisse: s.fisse.map((f) => (f.id === id ? { ...f, attiva: !f.attiva } : f)),
    }));
  },
  /**
   * SEGNA LE FISSE ARRIVATE A SCADENZA, e torna quelle che ha segnato adesso.
   *
   * 🔑 Si chiama all'apertura dell'app: qui non c'è nessun server che lo faccia
   * di notte. È ripetibile senza danni — un movimento per fissa e per mese, mai
   * due — quindi aprire e chiudere l'app dieci volte non segna dieci affitti.
   */
  segnaLeFisse(oggi: Date = new Date()): Movimento[] {
    const nati: Movimento[] = [];
    aggiorna((s) => {
      if (s.fisse.length === 0) return s;
      const nuovi: Movimento[] = [];

      for (const f of s.fisse) {
        const giaSegnati = s.movimenti
          .filter((m) => m.fissa === f.id && m.fissaMese)
          .map((m) => m.fissaMese as string);

        for (const mese of mesiDaSegnare(f, oggi, giaSegnati)) {
          nuovi.push({
            id: nuovoId(),
            data: quandoSegnare(mese, f.giorno),
            importo: f.importo,
            categoria: (s.rinomine[f.categoria] ?? f.categoria) as Categoria,
            etichetta: f.cosa,
            tipo: "uscita",
            metodo: null,
            /* Si vede nel Diario e nella ricerca: chi la trova capisce da dove
               è arrivata senza dover chiedere niente a nessuno. */
            testo: `${f.cosa} — spesa fissa segnata da MonoConvivium`,
            fissa: f.id,
            fissaMese: mese,
          });
        }
      }

      if (nuovi.length === 0) return s;
      nati.push(...nuovi);
      return { ...s, movimenti: [...nuovi, ...s.movimenti] };
    });
    return nati;
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
    aggiorna((s) => conUso({ ...s, ricette: [r, ...s.ricette] }));
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
    aggiorna((s) => conUso({ ...s, spesa: [v, ...s.spesa] }));
  },
  spesaSpunta(id: string) {
    aggiorna((s) =>
      conUso({
        ...s,
        spesa: s.spesa.map((v) => (v.id === id ? { ...v, presa: !v.presa } : v)),
      }),
    );
  },
  spesaTogli(id: string) {
    aggiorna((s) => ({ ...s, spesa: s.spesa.filter((v) => v.id !== id) }));
  },
  /** Via le spuntate: quello che resta è quello che manca ancora. */
  spesaPulisci() {
    aggiorna((s) => ({ ...s, spesa: s.spesa.filter((v) => !v.presa) }));
  },
  /* ---------------------------------------------- le cose da fare */
  dafareAggiungi(cosa: string): void {
    const pulito = cosa.trim();
    if (!pulito) return;
    const v: VoceDaFare = {
      id: nuovoId(),
      cosa: pulito,
      fatta: false,
      creataIl: new Date().toISOString(),
    };
    aggiorna((s) => conUso({ ...s, dafare: [v, ...s.dafare] }));
  },
  dafareSpunta(id: string) {
    aggiorna((s) =>
      conUso({
        ...s,
        dafare: s.dafare.map((v) => (v.id === id ? { ...v, fatta: !v.fatta } : v)),
      }),
    );
  },
  dafareTogli(id: string) {
    aggiorna((s) => ({ ...s, dafare: s.dafare.filter((v) => v.id !== id) }));
  },
  dafarePulisci() {
    aggiorna((s) => ({ ...s, dafare: s.dafare.filter((v) => !v.fatta) }));
  },
  /* ------------------------------------------------- il gratta e vinci */
  /**
   * «Oggi ho usato MonoConvivium». La chiamano le azioni vere — segnare un
   * movimento, toccare la lista, salvare una ricetta — non l'apertura
   * dell'app: aprire e chiudere per sette giorni non è usarla, e il premio
   * è per chi se ne serve davvero.
   *
   * Se i sette giorni si compiono qui, il biglietto nasce SUBITO e già
   * deciso: grattarlo scoprirà una cosa scritta, non la tirerà a sorte.
   */
  segnaUso() {
    aggiorna(conUso);
  },
  gratta() {
    aggiorna((s) =>
      s.biglietto && !s.biglietto.grattato
        ? { ...s, biglietto: { ...s.biglietto, grattato: true } }
        : s,
    );
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
        dafare: Array.isArray(dati.dafare) ? (dati.dafare as VoceDaFare[]) : s.dafare,
        striscia: (dati.striscia as Striscia | undefined) ?? s.striscia,
        /**
         * ⚠️ IL BIGLIETTO NON SI RIPRISTINA SE GIÀ CE N'È UNO.
         * È l'unico campo che si difende dal proprio backup: il gratta e
         * vinci è uno per persona, e senza questa riga basterebbe salvare
         * il file prima di grattare e ricaricarlo dopo aver perso per
         * rigiocare all'infinito. Quello che c'è già vince sempre.
         */
        biglietto: s.biglietto ?? (dati.biglietto as Biglietto | undefined) ?? null,
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
