/**
 * IL MODULO D'ISCRIZIONE — obbligatorio, e viene DOPO la presentazione.
 *
 * 🔑 L'ordine non è un dettaglio: prima si spiega cos'è e che è gratis, poi si
 * chiedono i dati. Chiedere prima di aver dato qualcosa fa chiudere l'app a
 * un sacco di gente, e i dati non li raccogli lo stesso.
 *
 * ⚠️ Il consenso al marketing è una **scelta vera**: la casella nasce spenta e
 * si può andare avanti senza spuntarla. Una casella già segnata non è un
 * consenso, e un consenso estorto non vale niente il giorno che qualcuno chiede
 * conto — vale meno di non averlo.
 */
import { useState } from "react";

import { controlla, iscrivi, type Campo, type Iscritto } from "@/lib/iscrizione";
import { notaProvenienza, provenienzaSalvata } from "@/lib/origine";
import { azioni } from "@/lib/store";

const CAMPI: { campo: Campo; etichetta: string; tipo: string; auto: string }[] = [
  { campo: "nome", etichetta: "Nome", tipo: "text", auto: "given-name" },
  { campo: "cognome", etichetta: "Cognome", tipo: "text", auto: "family-name" },
  { campo: "email", etichetta: "Email", tipo: "email", auto: "email" },
  { campo: "telefono", etichetta: "Telefono", tipo: "tel", auto: "tel" },
];

export function Iscrizione() {
  const [dati, setDati] = useState<Iscritto>({
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
    consensoMarketing: false,
  });
  const [problemi, setProblemi] = useState<Partial<Record<Campo, string>>>({});
  const [errore, setErrore] = useState("");
  const [invio, setInvio] = useState(false);

  async function manda(e: React.FormEvent) {
    e.preventDefault();
    setErrore("");

    const trovati = controlla(dati);
    setProblemi(trovati);
    if (Object.keys(trovati).length) return;

    setInvio(true);
    // La targa del passaparola, se c'è: da quale banco o amico è arrivato qui.
    const esito = await iscrivi(dati, notaProvenienza(provenienzaSalvata()));
    setInvio(false);

    if (esito.ok) azioni.iscritto(dati.nome.trim());
    else setErrore(esito.messaggio);
  }

  return (
    <main className="min-h-dvh respiro-alto-largo bg-background px-5 pb-12">
      <form onSubmit={(e) => void manda(e)} className="mx-auto w-full max-w-md">
        <span className="targa mx-auto block w-fit">
          <img
            src={`${import.meta.env.BASE_URL}marchio/mono-orizzontale.svg`}
            alt="MONO — Bottega Gastronomica"
            className="h-14 w-auto"
            width={224}
            height={56}
          />
        </span>

        <h1 className="mt-7 text-center text-3xl leading-tight">Ci presentiamo</h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
          MonoConvivium è un regalo, e ci piace sapere a chi lo stiamo facendo.
        </p>

        <div className="mt-6 space-y-3">
          {CAMPI.map(({ campo, etichetta, tipo, auto }) => (
            <label key={campo} className="block">
              <span className="mb-1 block text-sm font-medium">{etichetta}</span>
              <input
                type={tipo}
                autoComplete={auto}
                inputMode={tipo === "tel" ? "tel" : undefined}
                value={dati[campo]}
                onChange={(e) => setDati((d) => ({ ...d, [campo]: e.target.value }))}
                aria-invalid={Boolean(problemi[campo])}
                className={`w-full rounded-2xl border bg-card px-4 py-3 text-base ${
                  problemi[campo] ? "border-destructive" : "border-input"
                }`}
              />
              {/* L'errore accanto al suo campo, non una riga rossa in fondo che
                  non dice quale: se no si rilegge tutto da capo. */}
              {problemi[campo] && (
                <span className="mt-1 block text-sm text-destructive">{problemi[campo]}</span>
              )}
            </label>
          ))}
        </div>

        <label className="scheda mt-4 flex cursor-pointer items-start gap-3 p-4">
          <input
            type="checkbox"
            checked={dati.consensoMarketing}
            onChange={(e) => setDati((d) => ({ ...d, consensoMarketing: e.target.checked }))}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--azione-scheda)]"
          />
          <span className="text-sm leading-relaxed">
            Voglio ricevere da MONO le novità, il menu del giorno e i vantaggi riservati.
            <span className="mt-1 block text-xs text-muted-foreground">
              Puoi cambiare idea quando vuoi. Se non spunti, ti iscrivi lo stesso.
            </span>
          </span>
        </label>

        <section className="scheda-bosco mt-4 p-4">
          <p className="text-[10px] font-semibold tracking-widest uppercase opacity-70">
            La promessa MonoConvivium
          </p>
          <p className="mt-2 text-sm leading-relaxed opacity-95">
            MONO riceve <strong>nome, cognome, email, telefono e consensi</strong>. Non riceve mai
            cifre, categorie, saldo o metodo di pagamento: i tuoi conti restano su questo telefono.
          </p>
        </section>

        {errore && (
          <p className="mt-4 rounded-2xl border border-destructive p-3 text-sm text-destructive">
            {errore}
          </p>
        )}

        <button
          type="submit"
          disabled={invio}
          className="mt-5 flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-[var(--azione-scheda)] px-5 text-lg font-semibold text-[var(--azione-testo)] disabled:opacity-60"
        >
          {invio ? "Un momento…" : "Entra"}
        </button>

        <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
          Un regalo di <strong>MONO</strong> — bottega di gastronomia, Torino.
        </p>
      </form>
    </main>
  );
}
