import { Link, createFileRoute } from "@tanstack/react-router";

import { AggiungiEntrata } from "@/components/AggiungiEntrata";
import { Aiuto } from "@/components/Aiuto";
import { Dettatura } from "@/components/Dettatura";
import { DoveVannoISoldi } from "@/components/DoveVannoISoldi";
import { Guscio } from "@/components/Guscio";
import { InstallaApp } from "@/components/InstallaApp";
import { RigaMovimento } from "@/components/RigaMovimento";
import { SettimanaMono } from "@/components/SettimanaMono";
import { SpeseCheTornano } from "@/components/SpeseCheTornano";
import { useEffect, useState } from "react";

import { CalendarClock, Tags } from "lucide-react";

import { categorieAttive } from "@/lib/categorie";
import { type SpesaFissa } from "@/lib/fisse";
import { euro } from "@/lib/parse";
import { delMese } from "@/lib/statistiche";
import { attivi, azioni, MESI, somma, useStato, type Movimento } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

/**
 * «Ho segnato l'affitto di giugno, luglio e agosto» — non tre volte «Affitto
 * 700,00 €».
 * ⚠️ Difetto trovato provandolo: recuperando tre mesi arretrati la riga
 * ripeteva la stessa spesa tre volte senza dire di QUALI mesi, cioè diceva un
 * numero e nascondeva l'unica cosa che serviva sapere.
 */
function raccontaLeSegnate(nate: Movimento[]): string {
  const gruppi = new Map<string, { importo: number; mesi: string[] }>();
  for (const m of nate) {
    const g = gruppi.get(m.etichetta) ?? { importo: m.importo, mesi: [] };
    g.mesi.push(MESI[new Date(m.data).getMonth()]?.toLowerCase() ?? "");
    gruppi.set(m.etichetta, g);
  }
  return [...gruppi.entries()]
    .map(([nome, g]) => `${nome} ${euro(g.importo)} di ${elenco(g.mesi)}`)
    .join(" · ");
}

/** «giugno, luglio e agosto»: la e prima dell'ultimo, come si dice parlando. */
function elenco(voci: string[]): string {
  if (voci.length <= 1) return voci[0] ?? "";
  return `${voci.slice(0, -1).join(", ")} e ${voci[voci.length - 1]}`;
}

/**
 * LA HOME — ordine dettato da lui il 5/8/2026, parola per parola:
 *   0. il marchio GRANDE al centro   → «più grosso possibile»
 *   1. le ultime spese, subito sotto → cos'ho segnato
 *   2. il recap con la torta         → dov'è finito il mese
 *   3. entrate · da parte · oggi     → come sto messo
 *
 * ⚠️ Prima l'ordine era il contrario (torta, numeri, dettatura, spese): è
 * stato cambiato su sua richiesta, non per gusto. Non rimetterlo com'era.
 * ⚠️ Dal 17/8 la barra «Dì una spesa» sta **in cima**, non più in coda: il
 * microfono è uscito dalla barra di navigazione (al centro c'è il Convivium)
 * e ogni schermata si tiene il suo. L'ordine delle quattro cose qui sotto
 * resta quello che ha dettato lui.
 *
 * 🔑 Il verde bosco sta su **un blocco solo** per schermata, e da oggi
 * l'accento vero è il **terracotta**: il verde è l'eccezione, non la regola.
 */
function Home() {
  const stato = useStato();
  const movimenti = attivi(stato.movimenti);
  const ora = new Date();
  const delMeseCorrente = delMese(movimenti, ora.getFullYear(), ora.getMonth());

  const uscite = somma(delMeseCorrente, "uscita");
  const entrate = somma(delMeseCorrente, "entrata");
  const daParte = Math.max(0, entrate - uscite);
  const oggi = movimenti
    .filter((m) => new Date(m.data).toDateString() === ora.toDateString() && m.tipo === "uscita")
    .reduce((t, m) => t + m.importo, 0);

  /* I nomi veri che uno ha in mano, non una promessa generica: si capisce al
     volo che sono LE SUE categorie e che si toccano. */
  const attive = categorieAttive(stato);
  const anteprimaFisse: string =
    stato.fisse.length === 0
      ? "Affitto, luce e gas, abbonamenti: segnali una volta e tornano da soli"
      : `${stato.fisse
          .slice(0, 3)
          .map((f: SpesaFissa) => f.cosa)
          .join(
            ", ",
          )} · ${euro(stato.fisse.filter((f: SpesaFissa) => f.attiva).reduce((t: number, f: SpesaFissa) => t + f.importo, 0))} al mese`;

  const anteprimaCategorie = `${attive
    .slice(0, 3)
    .map((c) => c.nome)
    .join(", ")}… rinominale, aggiungi le tue`;

  /**
   * LE SPESE FISSE SI SEGNANO QUI, all'apertura della Home.
   *
   * 🔑 Non c'è nessun server che possa farlo di notte: l'unico momento in cui
   * l'app è viva è quando uno la apre. È ripetibile senza danni — un movimento
   * per fissa e per mese — quindi tornare in Home dieci volte non segna dieci
   * affitti.
   * ⚠️ Quello che ha segnato **si dice**, non compare di nascosto: nel quaderno
   * dei soldi di qualcuno non si scrivono righe in silenzio.
   */
  const [appenaSegnate, setAppenaSegnate] = useState<Movimento[]>([]);
  useEffect(() => {
    const nate = azioni.segnaLeFisse();
    if (nate.length) setAppenaSegnate(nate);
  }, []);

  const marchio = `${import.meta.env.BASE_URL}marchio/mono-orizzontale${
    stato.tema === "scuro" ? "-chiaro" : ""
  }.svg`;

  return (
    <Guscio
      titolo="Il borsellino"
      intestazione={
        /* 0. IL MARCHIO, GRANDE E AL CENTRO. «Più grosso possibile», parole
           sue. Largo il 76% della colonna: oltre tocca i bordi e non respira
           più. Il mese gli sta sotto, piccolo: è un dato, non un titolo. */
        <div className="w-full text-center">
          {/* Sul verde bosco il marchio siede sulla sua targa cashmere. */}
          <span className="targa mx-auto w-[82%] max-w-[300px]">
            <img src={marchio} alt="MONO — Bottega Gastronomica" className="w-full" />
          </span>
          <p className="mt-3 text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            {MESI[ora.getMonth()]} {ora.getFullYear()}
          </p>
        </div>
      }
    >
      {/**
       * LA SETTIMANA, QUI E BEN VISIBILE — sua richiesta del 9/8.
       * ⚠️ La striscia sì, il gratta e vinci NO: quello vive «solo ed
       * esclusivamente» nel Convivium, parole sue. Qui si vede che i giorni
       * si stanno accumulando; il premio si va a prendere di là.
       * 🔑 In cima e non in fondo: se sta sotto le spese non la vede
       * nessuno, ed è proprio la cosa che deve far tornare domani.
       */}
      <SettimanaMono rimandaAlConvivium />

      {/**
       * 🎙️ LA VOCE PER PRIMA — spostata quassù il 17/8/2026.
       *
       * 🔴 Perché è cambiato: fino a ieri il microfono era il cerchio in mezzo
       * alla barra, sempre sotto il pollice, e qui bastava tenerlo in coda.
       * Da oggi il centro della barra è il Convivium e **ogni schermata si
       * tiene il suo microfono**: lasciarlo in fondo avrebbe voluto dire
       * scorrere tutta la Home per segnare un caffè — cioè il gesto più
       * frequente dell'app diventato il più lontano.
       * 🔑 Adesso è come nella Spesa e in Da fare: si apre la pagina e la prima
       * cosa che si incontra è il modo di parlarci. Stessa regola ovunque.
       */}
      <div className="mt-4">
        <Dettatura forma="barra" />
      </div>

      {/* 1. Cos'ho segnato — subito sotto il marchio */}
      <section className="mt-4">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-lg">Ultime spese</h2>
          <Aiuto testo="Le × mettono il movimento nel cestino: lo recuperi dal Diario." />
        </div>

        {movimenti.length === 0 ? (
          <p className="scheda p-6 text-center text-sm text-muted-foreground">
            Ancora nessun movimento. Tocca «Dì una spesa» qui sopra e dì la prima.
          </p>
        ) : (
          <ul className="space-y-2">
            {movimenti.slice(0, 8).map((m, i) => (
              <RigaMovimento
                key={m.id}
                m={m}
                scheda
                /* A scaletta: entrano una dopo l'altra, non tutte insieme.
                   Si ferma alla quarta — oltre diventa un'attesa, non un
                   movimento, e chi apre l'app vuole leggere, non guardare. */
                ritardoMs={Math.min(i, 3) * 60}
              />
            ))}
          </ul>
        )}
      </section>

      {/* 2. Il recap con la torta */}
      <div className="mt-6">
        <DoveVannoISoldi movimenti={delMeseCorrente} compatta />
      </div>

      {/* 3. I tre numeri — l'unico blocco verde della schermata */}
      <section className="scheda-bosco mt-4 flex gap-2 p-4">
        {[
          { titolo: "Entrate", valore: entrate },
          { titolo: "Da parte", valore: daParte },
          { titolo: "Oggi", valore: oggi },
        ].map((r) => (
          <div key={r.titolo} className="flex-1 text-center">
            <p className="text-[10px] font-semibold tracking-widest uppercase opacity-65">
              {r.titolo}
            </p>
            <p className="numero mt-1 text-base leading-tight">{euro(r.valore)}</p>
          </div>
        ))}
      </section>

      {/* Le entrate: senza stipendio «da parte» è un numero finto. */}
      <AggiungiEntrata />

      {/* Le spese che tornano: compare da sola quando c'è qualcosa da dire. */}
      <SpeseCheTornano />

      {/**
       * 🔴 IL QUADERNO DI CUCINA NON STA PIÙ QUI — sua decisione del 15/8/2026.
       *
       * Il 9/8 era stato messo **anche** in questa schermata («ho paura che la
       * gente non lo veda»), identico a quello della Spesa. Ma erano la stessa
       * identica carta in due posti: non due porte, **un doppione** — e un
       * doppione su una pagina di conti è una cosa che c'entra poco, messa
       * dove l'occhio cerca i soldi.
       *
       * ⚠️ Non è stato tolto: è **cresciuto** dov'è casa sua (la Spesa), dove
       * adesso è un blocco intero invece di una strisciolina. Questa pagina
       * parla di soldi e basta.
       */}

      {/* Diario e Bilanci non sono più in fondo allo schermo: da oggi la
          barra ha quattro voci e questa è la pagina dei soldi, quindi si
          entra da qui. Sono due porte tenui: chi le cerca le trova, chi
          guarda le spese non ci inciampa. */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link
          to="/diario"
          className="scheda-tenue flex min-h-[64px] flex-col justify-center gap-0.5 p-3.5"
        >
          <span className="text-[15px] font-bold">Il diario</span>
          <span className="text-xs text-muted-foreground">
            Tutto lo storico, la ricerca e il cestino
          </span>
        </Link>
        <Link
          to="/anno"
          className="scheda-tenue flex min-h-[64px] flex-col justify-center gap-0.5 p-3.5"
        >
          <span className="text-[15px] font-bold">I bilanci</span>
          <span className="text-xs text-muted-foreground">Mese per mese, anno per anno</span>
        </Link>
      </div>

      {/**
       * IL BOTTONE DELLE CATEGORIE — chiesto da lui il 21/8/2026, con queste
       * parole: «lì serve proprio un bottone da scemo, sotto: personalizza le
       * tue categorie».
       *
       * 🔴 Le categorie erano già libere da due versioni, ma si cambiavano solo
       * dalla tendina dentro una riga di spesa: lui ha guardato l'app e ha
       * detto che non erano personalizzabili. Aveva ragione — una cosa che vive
       * dentro un menù a tendina non la trova nessuno.
       * ⚠️ Perciò questa NON è una porta tenue come il Diario e i Bilanci qui
       * sopra: è terracotta piena, larga quanto la schermata, e dice già i nomi
       * delle categorie che uno ha in mano.
       */}
      {appenaSegnate.length > 0 && (
        <section className="scheda mt-4 flex items-start gap-3 p-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--azione-scheda)] text-[var(--azione-testo)]">
            <CalendarClock className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">
              {appenaSegnate.length === 1
                ? "Ho segnato una spesa fissa"
                : `Ho segnato ${appenaSegnate.length} spese fisse`}
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {raccontaLeSegnate(appenaSegnate)}. Se una non va, cestinala come le altre.
            </span>
          </span>
        </section>
      )}

      <Link
        to="/categorie"
        className="mt-3 flex min-h-[64px] items-center gap-3 rounded-2xl bg-[var(--azione-scheda)] p-3.5 text-[var(--azione-testo)] shadow-rialzata"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgba(244,236,221,0.16)]">
          <Tags className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold">Personalizza le tue categorie</span>
          <span className="block truncate text-xs text-[var(--secondario-su-pieno)]">
            {anteprimaCategorie}
          </span>
        </span>
        <span aria-hidden className="text-[var(--secondario-su-pieno)]">
          ›
        </span>
      </Link>

      {/* La seconda porta della coppia: le categorie dicono COME si chiamano le
          tue spese, le fisse dicono QUALI tornano da sole ogni mese. */}
      <Link
        to="/fisse"
        className="mt-3 flex min-h-[64px] items-center gap-3 rounded-2xl bg-[var(--azione-scheda)] p-3.5 text-[var(--azione-testo)] shadow-rialzata"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgba(244,236,221,0.16)]">
          <CalendarClock className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold">Le spese fisse del mese</span>
          <span className="block truncate text-xs text-[var(--secondario-su-pieno)]">
            {anteprimaFisse}
          </span>
        </span>
        <span aria-hidden className="text-[var(--secondario-su-pieno)]">
          ›
        </span>
      </Link>

      {/* Sta qui perché è il momento in cui uno ha appena provato la voce:
          è allora che la vuole tenere. Sparisce da sola una volta installata. */}
      <InstallaApp />

      <p className="mt-5 px-2 text-center text-xs leading-relaxed text-muted-foreground">
        Importi, categorie e saldo restano su questo telefono: nessun account, nessun server, non
        escono da qui. Un regalo di MONO, gastronomia a Torino.
      </p>
    </Guscio>
  );
}
