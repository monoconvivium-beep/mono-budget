import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Guscio } from "@/components/Guscio";
import { Dettatura } from "@/components/Dettatura";
import { CATEGORIE, type Categoria } from "@/lib/parse";

export const Route = createFileRoute("/ascolto")({
  /**
   * `?categoria=Spesa alimentare` — ci arriva il ponte dal ricettario:
   * la spesa degli ingredienti parte già nella categoria giusta.
   */
  validateSearch: (s: Record<string, unknown>): { categoria?: Categoria | undefined } => ({
    categoria: CATEGORIE.includes(s["categoria"] as Categoria)
      ? (s["categoria"] as Categoria)
      : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Ascolto — MonoConvivium" },
      {
        name: "description",
        content:
          "Un tocco, una spesa: dì l'importo e il posto, MonoConvivium ti mostra cosa ha capito e tu confermi.",
      },
      { property: "og:title", content: "Ascolto — MonoConvivium" },
      {
        property: "og:description",
        content: "Dettatura a tutto schermo: un tocco = una spesa, sempre con conferma.",
      },
    ],
  }),
  component: Ascolto,
});

function Ascolto() {
  /**
   * «Come dirlo bene» nasce CHIUSA, dietro un «?» — sua richiesta del 5/8.
   * Le istruzioni servono la prima volta e poi diventano un muro di parole
   * sotto il microfono: chi torna qui vuole parlare, non rileggere.
   */
  const [comeAperto, setComeAperto] = useState(false);
  const { categoria } = Route.useSearch();

  /**
   * ⚠️ IL SOTTOTITOLO NON PROMETTE PIÙ «si accende da solo» (15/8/2026).
   * Su Android è vero e continua a succedere; su iPhone Safari accende il
   * microfono solo se glielo chiede un dito, e la vecchia frase sarebbe stata
   * una bugia scritta sopra un cerchio spento. Quella di adesso è vera in
   * tutti e due i casi — e la riga sotto il cerchio dice cosa fare ora.
   */
  return (
    <Guscio titolo="Ascolto" sottotitolo="Dì una spesa: la scrivo io" marchioGrande>
      {categoria && (
        <p className="mb-2 rounded-2xl bg-card-soft px-4 py-2.5 text-center text-sm">
          Spesa della ricetta: va in <strong>{categoria}</strong>.
        </p>
      )}
      {/* Si arriva qui col microfono verde in fondo: quel tocco È la richiesta
          di parlare. Chiedere un secondo tocco sul cerchio dorato era chiedere
          due volte la stessa cosa. */}
      <Dettatura grande avvioAutomatico categoriaPreferita={categoria} />

      <section className="scheda mt-4 p-4 text-sm leading-relaxed">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg">Come dirlo bene</h2>
          <button
            type="button"
            aria-expanded={comeAperto}
            aria-label={comeAperto ? "Nascondi le istruzioni" : "Mostra le istruzioni"}
            onClick={() => setComeAperto((v) => !v)}
            /* Stessa regola del «?» di `Aiuto`: si tocca 44, si vede 28.
               Questo era rimasto indietro perché è scritto a mano qui e non
               passa dal componente — misurato il 15/8/2026. */
            className="-m-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
          >
            <span
              aria-hidden
              className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-xs font-semibold text-muted-foreground"
            >
              {comeAperto ? "×" : "?"}
            </span>
          </button>
        </div>
        <ul className={`space-y-2 text-muted-foreground ${comeAperto ? "mt-3" : "hidden"}`}>
          <li>
            «<strong>quarantasei farmacia</strong>» → 46,00 € in Salute.
          </li>
          <li>
            Per i centesimi dì sempre la parola euro: «
            <strong>quattro euro e sessanta caffè</strong>» → 4,60 € al Bar.
          </li>
          <li>
            Due spese insieme: «<strong>dodici supermercato e tre bar</strong>».
          </li>
          <li>Puoi aggiungere «contanti» o «carta», e dire «stipendio» per un'entrata.</li>
          <li>Il microfono funziona solo su telefono, con connessione sicura (https).</li>
        </ul>
      </section>
    </Guscio>
  );
}
