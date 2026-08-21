import { Link, createFileRoute } from "@tanstack/react-router";
import { Store, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { DettaturaRiga } from "@/components/DettaturaRiga";
import { Guscio } from "@/components/Guscio";
import { BASI, interpretaIngrediente } from "@/lib/cucina";
import { fraseSpesa } from "@/lib/spesa";
import { azioni, useStato } from "@/lib/store";

export const Route = createFileRoute("/spesa")({ component: Spesa });

/**
 * LA LISTA DELLA SPESA — quello che manca, detto a voce.
 *
 * 🔑 È LIBERA, e non è una svista: niente categorie, niente prezzi, niente
 * prodotti segnati come «da noi». Il primo provino li aveva, e lui li ha
 * tolti il 9/8 — *«la lasciamo libera»*. Aveva ragione: una lista della spesa
 * che ti suggerisce dove comprare non è più la tua lista, e chi se ne accorge
 * smette di fidarsi anche del resto dell'app.
 *
 * 🔑 IL MARKETING STA IN FONDO, FERMO. Una carta con la M col sorriso e una
 * frase che non vende il pane ma il pomeriggio libero (vedi `lib/spesa.ts`).
 * Sta sotto la lista, non salta fuori da nessuna parte: chi la legge la trova
 * perché stava già guardando lì.
 *
 * ⚠️ Un tocco = una cosa. Stessa regola delle spese e del ricettario, stesso
 * interprete: «due etti di prosciutto» diventa «200 g prosciutto» da solo.
 */
function Spesa() {
  const stato = useStato();
  const voci = stato.spesa;
  const daPrendere = voci.filter((v) => !v.presa);
  const prese = voci.filter((v) => v.presa);
  /* Quante ricette ha dettato lui: serve a far dire al quaderno una cosa
     vera invece di una promessa generica. */
  const mie = stato.ricette.length;

  /* La frase cambia a ogni apertura della schermata, non a ogni tocco:
     se cambiasse mentre spunti la spesa sembrerebbe un'insegna lampeggiante. */
  const [giro] = useState(() => Math.floor(Date.now() / 1000));
  const frase = useMemo(() => fraseSpesa(giro), [giro]);

  const sottotitolo =
    voci.length === 0
      ? "Dilla a voce, una cosa per volta"
      : `${daPrendere.length} da prendere${prese.length ? ` · ${prese.length} nel carrello` : ""}`;

  return (
    <Guscio titolo="La spesa" sottotitolo={sottotitolo} marchio="piatto">
      {/* La voce per prima: si apre la lista per aggiungere, non per leggere. */}
      <DettaturaRiga
        etichetta="Dì cosa ti serve"
        esempio="«pane» · «due etti di prosciutto» · «un chilo di pomodori»"
        segnaposto="oppure scrivi: pane"
        interpreta={interpretaIngrediente}
        onRiga={(riga) => azioni.spesaAggiungi(riga)}
      />

      {voci.length === 0 ? (
        <p className="scheda mt-4 p-6 text-center text-sm text-muted-foreground">
          La lista è vuota. Tocca il bottone qui sopra e dì la prima cosa che ti manca.
        </p>
      ) : (
        <ul className="scheda mt-4 overflow-hidden">
          {[...daPrendere, ...prese].map((v) => (
            <li
              key={v.id}
              className="flex items-center gap-3 border-b border-border px-3 last:border-0"
            >
              {/* Tutta la riga è il bersaglio: al banco si tocca con una mano
                  sola e senza guardare bene. La ✕ resta staccata, se no si
                  cancella una cosa mentre si voleva spuntarla. */}
              <button
                type="button"
                onClick={() => azioni.spesaSpunta(v.id)}
                className="flex min-h-[52px] flex-1 items-center gap-3 py-2 text-left"
                aria-label={
                  v.presa ? `Rimetti ${v.cosa} nella lista` : `Segna ${v.cosa} come preso`
                }
              >
                <span
                  aria-hidden
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-sm ${
                    v.presa
                      ? "border-[var(--oliva)] bg-[var(--oliva)] text-[var(--cashmere)]"
                      : "border-[#C3B69A]"
                  }`}
                >
                  {v.presa ? "✓" : ""}
                </span>
                <span
                  className={`min-w-0 flex-1 text-[15px] ${
                    v.presa ? "text-muted-foreground line-through" : ""
                  }`}
                >
                  {v.cosa}
                </span>
              </button>
              <button
                type="button"
                onClick={() => azioni.spesaTogli(v.id)}
                className="tocco shrink-0 text-muted-foreground"
                aria-label={`Togli ${v.cosa} dalla lista`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {prese.length > 0 && (
        <button
          type="button"
          onClick={() => azioni.spesaPulisci()}
          className="tocco mt-3 w-full rounded-2xl border border-border text-sm font-semibold text-muted-foreground"
        >
          Togli le {prese.length} cose già prese
        </button>
      )}

      {/**
       * IL QUADERNO DI CUCINA — rifatto il 15/8/2026, sua richiesta.
       *
       * 🔴 Fino a ieri era una **strisciolina identica** a quella che stava in
       * Home: la stessa carta in due posti. Lui ha tolto quella dei Soldi —
       * lì parlava di cucina in mezzo ai conti — e ha chiesto che qui fosse
       * **fatta in un'altra maniera**. Giusto: adesso questa è l'unica porta
       * del ricettario, e una porta sola deve avere la misura di una porta.
       *
       * 🔑 La domanda al posto dell'etichetta. Non dice più «Il quaderno di
       * cucina» (che è un nome, e un nome non chiama nessuno): dice **«E
       * adesso che ci faccio?»**, che è esattamente il pensiero di chi ha
       * appena finito di scrivere la lista della spesa. Il nome resta sopra,
       * piccolo, per chi lo cerca.
       * 🔑 I numeri sono **contati, non scritti a mano**: le basi si contano da
       * `BASI` (oggi 15, e il giorno che ne aggiungiamo una questa riga si
       * aggiorna da sola), le tue da quelle davvero dettate. Un numero fisso in
       * una frase invecchia in silenzio, e nessuno se ne accorge finché un
       * cliente non lo conta.
       */}
      <Link
        to="/ricette"
        className="mt-5 block rounded-3xl border border-[#8C3F22] bg-[var(--azione-scheda)] p-5 text-[var(--azione-testo)] shadow-rialzata"
      >
        <span className="flex items-start gap-3.5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F4E7C8]">
            <img
              src={`${import.meta.env.BASE_URL}marchio/mono-monogramma.svg`}
              alt=""
              aria-hidden="true"
              className="h-10 w-10"
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold tracking-[0.18em] text-[var(--secondario-su-pieno)] uppercase">
              Il quaderno di cucina
            </span>
            <span className="mt-1 block font-[var(--font-display)] text-2xl leading-tight font-semibold">
              E adesso che ci faccio?
            </span>
          </span>
        </span>

        <span className="mt-3.5 block text-sm leading-relaxed text-[var(--secondario-su-pieno)]">
          {BASI.length} basi dello chef, spiegate passo per passo.
          {mie === 0
            ? " E le tue, quando vorrai dettarle."
            : mie === 1
              ? " E la tua, detta a voce."
              : ` E le tue ${mie} ricette, dette a voce.`}
        </span>

        <span className="mt-4 flex items-center justify-between gap-3">
          <span className="pillola bg-[var(--cashmere)] text-sm font-bold text-[#262321]">
            Apri il quaderno
          </span>
          <span aria-hidden className="text-xl text-[var(--secondario-su-pieno)]">
            ›
          </span>
        </span>
      </Link>

      {/**
       * IL MESSAGGIO DI MONO — la terza faccia del marchio.
       * La M col sorriso e non il piatto: qui non si parla di cucina, è MONO
       * che ti parla, ed è l'unico dei tre marchi che sorride.
       */}
      <section className="scheda-tenue mt-6 p-4 text-center">
        <img
          src={`${import.meta.env.BASE_URL}marchio/mono-sorriso.svg`}
          alt=""
          aria-hidden="true"
          className="mx-auto h-12 w-auto"
        />
        <p className="mt-3 text-[15px] leading-relaxed font-semibold">{frase}</p>
        <a
          href="https://app.monobottega.it/?da=mono-money"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex min-h-[56px] items-center justify-center gap-2.5 rounded-2xl bg-[var(--azione-scheda)] px-4 text-[var(--azione-testo)] shadow-morbida"
        >
          <Store className="h-5 w-5" />
          <span className="text-[15px] font-bold">Ordina da MONO</span>
        </a>
        {/* E qui il terzo: il marchio intero firma il messaggio. In questa
            sola carta ci sono tutti e tre — il sorriso che parla, il marchio
            che dice chi è, e il piatto in cima alla schermata. */}
        <img
          src={`${import.meta.env.BASE_URL}marchio/mono-orizzontale.svg`}
          alt="MONO — Bottega Gastronomica"
          /* 52 e non 36: sotto i 50 px «Bottega Gastronomica» non si legge, e
             un marchio che non si legge non sta dicendo niente a nessuno. */
          className="mx-auto mt-4 h-[52px] w-auto"
        />
        <p className="mt-2 text-xs text-muted-foreground">Via Barletta 72/D, Torino</p>
      </section>
    </Guscio>
  );
}
