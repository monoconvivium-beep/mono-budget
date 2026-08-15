import { Link, createFileRoute } from "@tanstack/react-router";
import { HandHeart, Settings } from "lucide-react";

import { GrattaEVinci } from "@/components/GrattaEVinci";
import { Guscio } from "@/components/Guscio";
import { MarchioMono } from "@/components/MarchioMono";
import { PassalaAUnAmico } from "@/components/PassalaAUnAmico";
import { SettimanaMono } from "@/components/SettimanaMono";

export const Route = createFileRoute("/convivium")({
  head: () => ({
    meta: [
      { title: "MonoConvivium — il cuore sociale di MONO" },
      {
        name: "description",
        content:
          "Formazione, lavoro vero e comunità dentro una bottega reale. Questa app è un pezzo di quel progetto.",
      },
    ],
  }),
  component: Convivium,
});

/**
 * CONVIVIUM — la pagina che dà il nome all'app.
 *
 * 🔑 SUA DECISIONE DEL 9/8/2026: l'app non si chiama più «MONO Money». La bottega
 * vende, il convivio no — e questa app è fatta per la gente, quindi porta il
 * nome del **progetto sociale**: formazione, lavoro vero, comunità dentro una
 * bottega reale.
 *
 * ⚠️ L'ORDINE DI QUESTA PAGINA È UNA SUA REGOLA, non un gusto: **prima il
 * perché, poi le porte**. Sue parole: *«ti porta lì, ma se ci vuoi andare»*.
 * Il commercio vive in una pagina su quattro, e in fondo a quella. Chi
 * rimettesse le porte della bottega in cima avrebbe cambiato il senso
 * dell'app senza accorgersene.
 */
function Convivium() {
  return (
    <Guscio titolo="MonoConvivium" sottotitolo="Il cuore sociale di MONO" marchio="convivium">
      {/* 1. IL PERCHÉ. Le parole vengono dal sito, non le ho inventate qui:
             se un giorno cambiano là, vanno cambiate anche qui. */}
      <section className="scheda p-5 text-center">
        {/* Il marchio INTERO — cuore di posate più il nome scritto — che ha
            mandato lui il 9/8. In testa alla pagina resta il solo cuore: qui
            dentro invece c'è spazio per leggerlo, ed è il punto in cui si
            spiega di cosa si tratta. */}
        <img
          src={`${import.meta.env.BASE_URL}marchio/mono-convivium-intero.svg`}
          alt="MonoConvivium"
          className="mx-auto h-[104px] w-auto"
        />
        <h2 className="mt-3 text-xl">La tavola come spazio condiviso</h2>
        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
          MonoConvivium è il cuore sociale di MONO: formazione, lavoro vero e comunità dentro una
          bottega reale. Non ospitare fragilità — trasformare il potenziale in dignità.
        </p>
        <p className="mt-3 text-sm leading-relaxed font-semibold">
          Questa app è un pezzo di quel progetto: è gratis perché il convivio non si vende.
        </p>
      </section>

      <a
        href="https://monobottega.it/mono-convivium/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex min-h-[64px] items-center gap-3 rounded-2xl bg-[var(--azione-scheda)] p-3.5 text-[var(--azione-testo)] shadow-morbida"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--cashmere)]">
          <HandHeart className="h-5.5 w-5.5 text-[var(--azione-scheda)]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold">Vieni a lavorare con noi</span>
          <span className="block truncate text-xs text-[rgba(244,236,221,0.8)]">
            Percorsi veri: cucina, banco, pasticceria, sala
          </span>
        </span>
        <span aria-hidden className="text-[rgba(244,236,221,0.7)]">
          ›
        </span>
      </a>

      {/* 2. IL GRATTA E VINCI — qui e non in cima alla Home: da premio
             personale diventa una cosa della comunità. */}
      <GrattaEVinci />
      <SettimanaMono />

      {/* 3. LE PORTE, in fondo: chi ci vuole andare le trova. */}
      <MarchioMono />

      <PassalaAUnAmico />

      <Link to="/mono" className="scheda-tenue mt-4 flex min-h-[56px] items-center gap-3 p-3.5">
        <Settings className="h-5 w-5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 text-[15px] font-semibold">
          Impostazioni e copia di sicurezza
        </span>
        <span aria-hidden className="text-muted-foreground">
          ›
        </span>
      </Link>
    </Guscio>
  );
}
