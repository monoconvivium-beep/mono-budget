/**
 * LA DETTATURA PER RIGA — la voce del ricettario.
 *
 * 🔑 Un tocco = UNA riga (un ingrediente, un passo). Mai ascolto continuo:
 * è la trappola che sulle spese ci è costata giorni — su Android ogni
 * risultato «definitivo» era il precedente allungato. `continuous` resta
 * false, sempre.
 *
 * 🔑 Ma la trascrizione è VIVA (sua richiesta del 7/8: «che trascrive nel
 * frattempo»): `interimResults = true`, e le parole compaiono mentre le dici.
 * ⚠️ Il parziale serve SOLO agli occhi: quello che si salva è il risultato
 * finito, passato dall'interprete. Mai salvare il parlato a metà.
 *
 * ✍️ E ovunque c'è la voce c'è la mano (sua regola): sotto il microfono
 * c'è sempre il campo per scrivere, che passa dallo STESSO interprete —
 * «300g zucchero» scritto viene bello come detto.
 */
import { Mic } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Fase = "pronto" | "ascolto" | "errore";

interface RisultatoVoce {
  isFinal: boolean;
  0: { transcript: string };
}

interface Riconoscimento {
  start: () => void;
  stop: () => void;
  abort: () => void;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<RisultatoVoce> }) => void) | null;
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

export function DettaturaRiga({
  etichetta,
  esempio,
  segnaposto,
  interpreta,
  onRiga,
}: {
  /** Il bottone dorato: «Dì un ingrediente», «Dì un passo». */
  etichetta: string;
  /** L'esempio sotto il bottone: cosa dire perché venga bene. */
  esempio: string;
  /** Il segnaposto del campo scritto: «oppure scrivi: 2 carote». */
  segnaposto: string;
  /** L'interprete che sistema la riga (cucina.ts) — vale per voce E mano. */
  interpreta: (testo: string) => string;
  onRiga: (riga: string) => void;
}) {
  const [fase, setFase] = useState<Fase>("pronto");
  const [parziale, setParziale] = useState("");
  const [errore, setErrore] = useState("");
  const [scritto, setScritto] = useState("");
  const rif = useRef<Riconoscimento | null>(null);
  const consegnato = useRef(false);
  const supportato = typeof window !== "undefined" && creaRiconoscimento() !== null;

  useEffect(() => () => rif.current?.abort(), []);

  function consegna(testo: string) {
    /* ⚠️ Su certi Android il risultato finale arriva due volte (onresult e
       poi di nuovo prima di onend): senza questo chiavistello la stessa
       riga finirebbe in ricetta doppia. */
    if (consegnato.current) return;
    consegnato.current = true;
    const riga = interpreta(testo);
    if (riga) {
      navigator.vibrate?.(35);
      onRiga(riga);
    }
    setParziale("");
    setFase("pronto");
    rif.current?.stop();
  }

  function avvia() {
    const r = creaRiconoscimento();
    if (!r) {
      setFase("errore");
      setErrore("Questo telefono non supporta la dettatura: scrivi la riga qui sotto.");
      return;
    }
    rif.current = r;
    consegnato.current = false;
    r.lang = "it-IT";
    r.continuous = false;
    r.interimResults = true;
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      let vivo = "";
      let finito = "";
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        if (!res) continue;
        if (res.isFinal) finito += res[0].transcript;
        else vivo += res[0].transcript;
      }
      if (finito.trim()) consegna(finito);
      else setParziale(vivo);
    };
    r.onerror = (e) => {
      setFase("errore");
      setParziale("");
      setErrore(
        e.error === "not-allowed"
          ? "Il microfono è bloccato. Dai il permesso al sito e riprova."
          : e.error === "no-speech"
            ? "Non ho sentito nulla. Tocca e dì una riga sola."
            : "La dettatura si è interrotta. Riprova, o scrivi qui sotto.",
      );
    };
    r.onend = () => setFase((f) => (f === "ascolto" ? "pronto" : f));

    setErrore("");
    setParziale("");
    setFase("ascolto");
    try {
      r.start();
    } catch {
      setFase("errore");
      setErrore("Non sono riuscito ad accendere il microfono. Scrivi la riga qui sotto.");
    }
  }

  function aMano(e: React.FormEvent) {
    e.preventDefault();
    const riga = interpreta(scritto);
    if (!riga) return;
    onRiga(riga);
    setScritto("");
  }

  return (
    <div>
      {fase === "ascolto" ? (
        /* Il blocco oro ACCESO: le parole compaiono mentre le dici. */
        <button
          type="button"
          onClick={() => rif.current?.stop()}
          className="mt-2 w-full rounded-2xl bg-oro p-3 text-left shadow-[0_0_0_5px_rgba(203,167,90,0.35)]"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-oro-foreground">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--azione-scheda)]" />
            Sto ascoltando…
          </span>
          <span className="mt-1 block min-h-[1.4em] text-[15px] text-oro-foreground italic opacity-80">
            {parziale ? `«${parziale}»` : "dì una riga sola"}
          </span>
        </button>
      ) : (
        supportato && (
          <button
            type="button"
            onClick={avvia}
            className="tocco mt-2 w-full gap-2 rounded-2xl bg-oro px-4 font-bold text-oro-foreground shadow-rialzata"
          >
            <Mic className="h-5 w-5" /> {etichetta}
          </button>
        )
      )}

      {fase === "errore" && (
        <p className="mt-2 rounded-2xl bg-[rgba(244,236,221,0.14)] p-2.5 text-sm text-[var(--azione-testo)]">
          {errore}
        </p>
      )}

      {supportato && fase !== "errore" && (
        <p className="mt-1.5 text-center text-[11px] text-[rgba(244,236,221,0.8)]">{esempio}</p>
      )}

      <form onSubmit={aMano} className="mt-2 flex gap-2">
        <input
          value={scritto}
          onChange={(e) => setScritto(e.target.value)}
          placeholder={segnaposto}
          aria-label={segnaposto}
          /* 16 px: sotto questa misura Safari su iPhone ingrandisce la pagina
             appena si tocca il campo, e non torna più indietro da sola. */
          className="tocco w-full flex-1 rounded-2xl border border-[rgba(140,63,34,0.35)] bg-card-soft px-4 text-base"
        />
        <button
          type="submit"
          className="tocco rounded-2xl bg-[var(--cashmere)] px-4 text-sm font-bold"
        >
          Aggiungi
        </button>
      </form>
    </div>
  );
}
