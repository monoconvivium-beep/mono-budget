/**
 * IL RICETTARIO — la pagina rossa dell'app (e l'unica: il resto è cashmere).
 *
 * Una rotta sola, tre viste, guidate dal parametro `apri` nell'indirizzo:
 *   /ricette                     → la copertina: Dolce (le basi) + Salato (le sue)
 *   /ricette?apri=crema-pasticcera → una base dello chef, da leggere
 *   /ricette?apri=<id>           → una ricetta sua, da rileggere o correggere
 *   /ricette?apri=nuova          → la ricetta nuova, a voce o a mano
 *
 * 🔑 Una rotta sola DI PROPOSITO: le rotte annidate del router hanno le loro
 * trappole (la pagina-genitore diventa un layout) e qui non servono — il
 * tasto indietro del telefono funziona lo stesso, perché ogni vista è un
 * indirizzo.
 */
import { Link, createFileRoute } from "@tanstack/react-router";
import { Cake, ChefHat, Croissant, Droplet, IceCream, Mic, Plus, Sparkles } from "lucide-react";

import { Aiuto } from "@/components/Aiuto";
import { EditorRicetta } from "@/components/EditorRicetta";
import { Guscio } from "@/components/Guscio";
import {
  basiPerFamiglia,
  MOTTO,
  trovaBase,
  type FamigliaBase,
  type RicettaBase,
} from "@/lib/cucina";
import { useStato, type Ricetta } from "@/lib/store";

export const Route = createFileRoute("/ricette")({
  validateSearch: (s: Record<string, unknown>): { apri?: string | undefined } => ({
    apri: typeof s["apri"] === "string" ? s["apri"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Ricette — MONO MONEY" },
      {
        name: "description",
        content:
          "Il quaderno di cucina di MONO: le basi di pasticceria dello chef, e le tue ricette dette a voce.",
      },
    ],
  }),
  component: Ricettario,
});

const OCCHIELLO = "text-[10px] font-bold tracking-[0.18em] text-[#EDD9AC] uppercase";

function Ricettario() {
  const { apri } = Route.useSearch();
  const { ricette } = useStato();
  const navigate = Route.useNavigate();

  const base = apri && apri !== "nuova" ? trovaBase(apri) : undefined;
  const mia = apri && apri !== "nuova" ? ricette.find((r) => r.id === apri) : undefined;

  const chiudi = () => void navigate({ search: {} });

  if (base) return <VistaBase base={base} />;
  if (apri === "nuova") {
    return (
      <Guscio
        fondo="rosso"
        titolo="La tua ricetta"
        sottotitolo="Salato · resta sul tuo telefono, come i conti"
      >
        <Indietro />
        <EditorRicetta onFine={chiudi} />
      </Guscio>
    );
  }
  if (mia) {
    return (
      <Guscio
        fondo="rosso"
        titolo={mia.nome}
        sottotitolo="La tua ricetta · ogni modifica va salvata"
      >
        <Indietro />
        <EditorRicetta esistente={mia} onFine={chiudi} />
      </Guscio>
    );
  }

  return <Copertina ricette={ricette} />;
}

/* ------------------------------------------------------------ la copertina */

/** Un'icona per famiglia, non per ricetta: con 15 basi sarebbe un mercato. */
const ICONE_FAMIGLIE: Record<FamigliaBase, typeof ChefHat> = {
  "Le creme": Droplet,
  "Gli impasti": Croissant,
  "I dolci al cucchiaio": IceCream,
  "Le finiture": Sparkles,
  "I classici": Cake,
};

function Copertina({ ricette }: { ricette: Ricetta[] }) {
  return (
    <Guscio
      fondo="rosso"
      titolo="Ricette"
      sottotitolo="Il quaderno di cucina di MONO"
      azione={
        <Aiuto
          suScuro
          testo="Sopra ci sono le basi dello chef, pronte da leggere, divise per famiglie. Sotto ci sono le tue: le detti a voce una riga per volta, o le scrivi, e restano solo sul tuo telefono."
        />
      }
    >
      <p className={OCCHIELLO}>Dolce · le basi dello chef</p>
      <p className="mt-0.5 font-serif text-[15px] text-[#F0DFB6] italic">«{MOTTO}»</p>

      {basiPerFamiglia().map(({ famiglia, basi }) => {
        const Icona = ICONE_FAMIGLIE[famiglia];
        return (
          <div key={famiglia}>
            <p className="mt-4 mb-1.5 flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] text-[rgba(244,236,221,0.85)] uppercase">
              <Icona className="h-3.5 w-3.5" aria-hidden />
              {famiglia}
            </p>
            <ul className="scheda overflow-hidden">
              {basi.map((b) => (
                <li key={b.slug} className="border-b border-[#F0E8D5] last:border-0">
                  <Link
                    to="/ricette"
                    search={{ apri: b.slug }}
                    className="flex min-h-[52px] items-center gap-3 px-3.5 py-2 active:bg-muted"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-bold">{b.nome}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {b.sotto}
                      </span>
                    </span>
                    <span aria-hidden className="text-[#B9AD93]">
                      ›
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <p className={`mt-6 ${OCCHIELLO}`}>Salato · le tue ricette</p>

      {ricette.length > 0 && (
        <ul className="scheda mt-2.5 overflow-hidden">
          {ricette.map((r) => (
            <li key={r.id} className="border-b border-[#F0E8D5] last:border-0">
              <Link
                to="/ricette"
                search={{ apri: r.id }}
                className="flex min-h-[56px] items-center gap-3 px-3.5 py-2.5 active:bg-muted"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F6E3D3]">
                  <ChefHat className="h-4.5 w-4.5 text-[var(--azione-scheda)]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-bold">{r.nome}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {r.ingredienti.length} ingredienti · {r.passi.length} passi
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        to="/ricette"
        search={{ apri: "nuova" }}
        className="mt-2.5 block rounded-2xl border-[1.6px] border-dashed border-[rgba(244,236,221,0.65)] p-4 text-center"
      >
        <span className="flex items-center justify-center gap-1.5 text-[15px] font-bold text-[var(--azione-testo)]">
          <Plus className="h-4.5 w-4.5" />
          {ricette.length ? "Un'altra ricetta" : "La tua prima ricetta"}
        </span>
        <span className="mt-0.5 block text-[11px] text-[rgba(244,236,221,0.75)]">
          A voce o a mano, una riga per volta. Resta sul tuo telefono.
        </span>
      </Link>
    </Guscio>
  );
}

/* ------------------------------------------------- una base dello chef */

function VistaBase({ base }: { base: RicettaBase }) {
  return (
    <Guscio
      fondo="rosso"
      titolo={base.nome}
      sottotitolo="«La pasticceria è chimica»: pesa, non stimare."
    >
      <Indietro />

      <p className={OCCHIELLO}>Ingredienti · {base.dosi}</p>
      <ul className="scheda mt-1.5">
        {base.ingredienti.map((r) => (
          <li
            key={r}
            className="flex items-center gap-2.5 border-b border-[#F0E8D5] px-3.5 py-2 text-sm last:border-0"
          >
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-oro" />
            {r}
          </li>
        ))}
      </ul>

      {/* Il ponte verso i conti: cucini, segni, i conti tornano. */}
      <Link
        to="/ascolto"
        search={{ categoria: "Spesa alimentare" }}
        className="tocco mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-oro px-4 font-bold text-oro-foreground shadow-rialzata"
      >
        <Mic className="h-5 w-5" /> Segna la spesa degli ingredienti
      </Link>
      <p className="mt-1.5 text-center text-[11px] text-[rgba(244,236,221,0.8)]">
        Si apre l'Ascolto con «Spesa alimentare» già scelta.
      </p>

      <p className={`mt-5 ${OCCHIELLO}`}>Procedimento</p>
      <ol className="scheda mt-1.5">
        {base.passi.map((p, i) => (
          <li
            key={p}
            className="flex gap-2.5 border-b border-[#F0E8D5] px-3.5 py-2.5 text-sm last:border-0"
          >
            <span className="numero shrink-0 font-bold text-[var(--azione-scheda)]">{i + 1}</span>
            <span className="leading-relaxed">{p}</span>
          </li>
        ))}
      </ol>

      <p className="mt-5 text-center text-sm text-[rgba(244,236,221,0.9)] italic">
        Oppure passa in bottega:{" "}
        <strong className="text-[#F0DFB6] not-italic">la facciamo noi</strong>.
      </p>
    </Guscio>
  );
}

/* --------------------------------------------------------------- briciole */

function Indietro() {
  return (
    <Link
      to="/ricette"
      search={{}}
      className="mb-2 inline-flex items-center gap-1 text-sm text-[rgba(244,236,221,0.85)]"
    >
      ‹ Ricette
    </Link>
  );
}
