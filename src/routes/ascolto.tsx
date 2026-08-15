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

  return (
    <Guscio titolo="Ascolto" sottotitolo="Si accende da solo: parla pure" marchioGrande>
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
            className="h-7 w-7 shrink-0 rounded-full border border-border text-xs font-semibold text-muted-foreground"
          >
            {comeAperto ? "×" : "?"}
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
