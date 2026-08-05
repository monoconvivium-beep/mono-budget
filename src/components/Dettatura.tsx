import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Check, X, Wand2 } from "lucide-react";
import { CATEGORIE, COLORI_CATEGORIA, euro, interpreta, type Categoria, type MovimentoBozza } from "@/lib/parse";
import { azioni, useStato } from "@/lib/store";
import { Aiuto } from "./Aiuto";

type Fase = "pronto" | "ascolto" | "conferma" | "errore";

interface Riconoscimento {
  start: () => void;
  stop: () => void;
  abort: () => void;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function creaRiconoscimento(): Riconoscimento | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => Riconoscimento;
    webkitSpeechRecognition?: new () => Riconoscimento;
  };
  const C = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return C ? new C() : null;
}

/**
 * UN TOCCO = UNA SPESA.
 * continuous = false, un solo risultato definitivo, poi conferma a mano.
 * Non si trasforma mai un importo di nascosto e non si salva senza conferma.
 */
export function Dettatura({
  grande = false,
  /**
   * «barra» = il pulsante largo della Home: più facile da centrare col pollice
   * di un cerchio, e non ruba mezzo schermo. «cerchio» resta per la schermata
   * Ascolto, dove il microfono È la pagina.
   */
  forma = "cerchio",
}: {
  grande?: boolean;
  forma?: "cerchio" | "barra";
}) {
  const { regole } = useStato();
  const [fase, setFase] = useState<Fase>("pronto");
  const [errore, setErrore] = useState("");
  const [ascoltato, setAscoltato] = useState("");
  const [bozze, setBozze] = useState<MovimentoBozza[]>([]);
  const [scritto, setScritto] = useState("");
  const [salvate, setSalvate] = useState(0);
  const rif = useRef<Riconoscimento | null>(null);
  const supportato = typeof window !== "undefined" && creaRiconoscimento() !== null;

  useEffect(() => () => rif.current?.abort(), []);

  const analizza = useCallback(
    (testo: string) => {
      const risultati = interpreta(testo, regole);
      setAscoltato(testo);
      if (!risultati.length) {
        setFase("errore");
        setErrore(
          "Non ho trovato un importo. Prova così: «quattro euro e sessanta caffè».",
        );
        return;
      }
      setBozze(risultati);
      setFase("conferma");
    },
    [regole],
  );

  const avvia = useCallback(() => {
    const r = creaRiconoscimento();
    if (!r) {
      setFase("errore");
      setErrore("Questo telefono non supporta la dettatura. Scrivi la spesa qui sotto.");
      return;
    }
    rif.current = r;
    r.lang = "it-IT";
    r.continuous = false;
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      const testo = e.results[0][0].transcript ?? "";
      analizza(testo);
    };
    r.onerror = (e) => {
      setFase("errore");
      setErrore(
        e.error === "not-allowed"
          ? "Il microfono è bloccato. Dai il permesso al sito e riprova."
          : e.error === "no-speech"
            ? "Non ho sentito nulla. Tocca e dì una spesa sola."
            : "La dettatura si è interrotta. Riprova.",
      );
    };
    r.onend = () => setFase((f) => (f === "ascolto" ? "pronto" : f));
    setBozze([]);
    setErrore("");
    setAscoltato("");
    setFase("ascolto");
    r.start();
  }, [analizza]);

  function conferma(i: number) {
    const b = bozze[i];
    if (!b) return;
    azioni.aggiungi({
      importo: b.importo,
      categoria: b.categoria,
      etichetta: b.etichetta,
      tipo: b.tipo,
      metodo: b.metodo,
      testo: b.testo,
    });
    if (b.categoriaIncerta === false && b.etichetta) {
      // niente: la regola si impara solo con una correzione a mano
    }
    setSalvate((n) => n + 1);
    const resto = bozze.filter((_, k) => k !== i);
    setBozze(resto);
    if (!resto.length) setFase("pronto");
  }

  function modifica(i: number, patch: Partial<MovimentoBozza>) {
    setBozze((b) => b.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  }

  return (
    <section className={forma === "barra" ? "" : grande ? "scheda p-5" : "scheda p-4"}>
      {forma !== "barra" && (
        <div className="mb-3 flex items-center justify-between">
          <h2 className={grande ? "text-2xl" : "text-lg"}>Dì una spesa</h2>
          <Aiuto testo="Un tocco = una spesa. Tocca, dì una spesa sola, poi confermi. Per i centesimi dì «quattro euro e sessanta»." />
        </div>
      )}

      {forma === "barra" ? (
        <button
          type="button"
          onClick={fase === "ascolto" ? () => rif.current?.stop() : avvia}
          className={`relative flex min-h-[64px] w-full items-center justify-center gap-3 rounded-2xl text-lg font-semibold shadow-rialzata transition-transform active:scale-[0.98] ${
            fase === "ascolto"
              ? "bg-accent text-accent-foreground"
              : "bg-[var(--scuro-scheda)] text-[var(--scuro-testo)]"
          }`}
        >
          {fase === "ascolto" && (
            <span className="absolute inset-0 rounded-2xl bg-accent onda-microfono" />
          )}
          {/* La M col sorriso al posto dell'icona del microfono: il gesto
              principale dell'app porta il marchio, e lo si tocca ogni giorno. */}
          <img
            src={`${import.meta.env.BASE_URL}marchio/mono-sorriso-chiaro.svg`}
            alt=""
            aria-hidden="true"
            className="relative h-7 w-auto"
          />
          <span className="relative">
            {fase === "ascolto" ? "Sto ascoltando…" : "Dì una spesa"}
          </span>
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="relative">
            {fase === "ascolto" && (
              <span className="absolute inset-0 rounded-full bg-accent onda-microfono" />
            )}
            <button
              type="button"
              onClick={fase === "ascolto" ? () => rif.current?.stop() : avvia}
              aria-label={fase === "ascolto" ? "Sto ascoltando" : "Tocca e dì una spesa"}
              className={`relative flex items-center justify-center rounded-full shadow-rialzata transition-transform active:scale-95 ${
                grande ? "h-40 w-40" : "h-28 w-28"
              } ${fase === "ascolto" ? "bg-accent text-accent-foreground" : "bg-oro text-oro-foreground"}`}
            >
              <Mic className={grande ? "h-16 w-16" : "h-11 w-11"} />
            </button>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {fase === "ascolto"
              ? "Sto ascoltando… dì una spesa sola."
              : supportato
                ? "Tocca il microfono e dì una spesa."
                : "Dettatura non disponibile: scrivi qui sotto."}
          </p>
          {ascoltato && (
            <p className="text-center text-sm">
              Ho sentito: <span className="italic">«{ascoltato}»</span>
            </p>
          )}
        </div>
      )}

      {forma === "barra" && ascoltato && (
        <p className="mt-3 text-center text-sm">
          Ho sentito: <span className="italic">«{ascoltato}»</span>
        </p>
      )}

      {fase === "errore" && (
        <p className="mt-2 rounded-2xl border border-border bg-card-soft p-3 text-sm">{errore}</p>
      )}

      {bozze.length > 0 && (
        <ul className="mt-4 space-y-3">
          {bozze.map((b, i) => (
            <li key={i} className="scheda-tenue p-4">
              <div className="flex items-baseline justify-between gap-2">
                <span className="numero text-3xl">{euro(b.importo)}</span>
                <span
                  className="pillola text-xs font-semibold"
                  style={{ backgroundColor: COLORI_CATEGORIA[b.categoria], color: "#F4ECDD" }}
                >
                  {b.categoria}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {b.etichetta} · {b.tipo === "entrata" ? "entrata" : "uscita"}
                {b.metodo ? ` · ${b.metodo}` : ""}
              </p>

              {b.importoSospetto && b.importoAlternativo !== null && (
                <div className="mt-3 rounded-2xl border border-border p-3 text-sm">
                  <p>
                    Questo numero sembra letto tutto attaccato. Volevi dire{" "}
                    <strong>{euro(b.importoAlternativo)}</strong>?
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      modifica(i, {
                        importo: b.importoAlternativo!,
                        importoSospetto: false,
                        importoAlternativo: null,
                      })
                    }
                    className="tocco mt-2 gap-2 rounded-full bg-secondary px-4 text-sm font-semibold text-secondary-foreground"
                  >
                    <Wand2 className="h-4 w-4" /> Usa {euro(b.importoAlternativo)}
                  </button>
                </div>
              )}

              {b.categoriaIncerta && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Non ho riconosciuto la categoria: resta <strong>Altro</strong>. Scegline una e
                  la imparo.
                </p>
              )}

              <label className="mt-3 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Categoria
              </label>
              <select
                value={b.categoria}
                onChange={(e) => modifica(i, { categoria: e.target.value as Categoria })}
                className="tocco mt-1 w-full rounded-2xl border border-input bg-card px-3 text-sm"
              >
                {CATEGORIE.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => conferma(i)}
                  className="tocco flex-1 gap-2 rounded-full bg-accent px-4 font-semibold text-accent-foreground"
                >
                  <Check className="h-5 w-5" /> Conferma
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const resto = bozze.filter((_, k) => k !== i);
                    setBozze(resto);
                    if (!resto.length) setFase("pronto");
                  }}
                  aria-label="Scarta"
                  className="tocco rounded-full border border-border px-4"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!scritto.trim()) return;
          analizza(scritto);
          setScritto("");
        }}
      >
        <input
          value={scritto}
          onChange={(e) => setScritto(e.target.value)}
          placeholder="oppure scrivi: 4,80 bar"
          className="tocco w-full flex-1 rounded-2xl border border-input bg-card px-4 text-base"
        />
        <button
          type="submit"
          className="tocco rounded-2xl bg-oro px-4 font-semibold text-oro-foreground"
        >
          Leggi
        </button>
      </form>

      {salvate > 0 && (
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Salvate {salvate} spese in questa sessione. Tocca di nuovo per la prossima.
        </p>
      )}
    </section>
  );
}
