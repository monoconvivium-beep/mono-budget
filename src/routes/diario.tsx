import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Guscio } from "@/components/Guscio";
import { RigaMovimento } from "@/components/RigaMovimento";
import { LeTueCategorie } from "@/components/LeTueCategorie";
import { Aiuto } from "@/components/Aiuto";
import { euro } from "@/lib/parse";
import { azioni, dataBreve, useStato, type Movimento } from "@/lib/store";

export const Route = createFileRoute("/diario")({
  head: () => ({
    meta: [
      { title: "Diario — MonoConvivium" },
      {
        name: "description",
        content:
          "Tutti i movimenti in ordine, con ricerca su tutto, cestino per recuperare gli errori e cambio categoria dalla riga.",
      },
      { property: "og:title", content: "Diario — MonoConvivium" },
      {
        property: "og:description",
        content: "Cerca, correggi la categoria e recupera dal cestino ciò che hai cancellato.",
      },
    ],
  }),
  component: Diario,
});

function raggruppaPerGiorno(movimenti: Movimento[]) {
  const gruppi = new Map<string, Movimento[]>();
  for (const m of movimenti) {
    const k = new Date(m.data).toDateString();
    const lista = gruppi.get(k) ?? [];
    lista.push(m);
    gruppi.set(k, lista);
  }
  return [...gruppi.entries()];
}

function Diario() {
  const { movimenti } = useStato();
  const [cerca, setCerca] = useState("");
  const [vista, setVista] = useState<"tutti" | "cestino">("tutti");

  const filtrati = useMemo(() => {
    const q = cerca.trim().toLowerCase();
    return movimenti
      .filter((m) => (vista === "cestino" ? m.cestinato : !m.cestinato))
      .filter((m) =>
        !q
          ? true
          : [m.etichetta, m.categoria, m.testo, m.tipo, m.metodo ?? "", String(m.importo)]
              .join(" ")
              .toLowerCase()
              .includes(q),
      )
      .sort((a, b) => b.data.localeCompare(a.data));
  }, [movimenti, cerca, vista]);

  const totale = filtrati.filter((m) => m.tipo === "uscita").reduce((t, m) => t + m.importo, 0);

  return (
    <Guscio
      titolo="Diario"
      /* Il piatto con forchetta e cucchiaio: il Diario è il quaderno di quello
         che è passato per la tavola. Scelta sua del 9/8. */
      marchio="piatto"
      sottotitolo={`${filtrati.length} movimenti · ${euro(totale)} di uscite`}
      azione={
        <Aiuto testo="Qui c'è tutto lo storico. La ricerca guarda importi, categorie e parole dette. Nel cestino recuperi ciò che hai tolto per sbaglio." />
      }
    >
      <input
        value={cerca}
        onChange={(e) => setCerca(e.target.value)}
        placeholder="Cerca: farmacia, 4,80, bar…"
        className="tocco w-full rounded-2xl border border-input bg-card px-4 text-base"
      />

      <div className="mt-3 flex gap-2">
        {(["tutti", "cestino"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setVista(v)}
            className={`pillola tocco px-4 font-semibold ${
              vista === v
                ? "bg-accent text-accent-foreground"
                : "border border-border text-muted-foreground"
            }`}
          >
            {v === "tutti" ? "Movimenti" : "Cestino"}
          </button>
        ))}
        {vista === "cestino" && filtrati.length > 0 && (
          <button
            type="button"
            onClick={() => azioni.svuotaCestino()}
            className="pillola tocco ml-auto px-4 text-sm text-destructive"
          >
            Svuota
          </button>
        )}
      </div>

      {/* Nel cestino no: lì si recuperano le spese buttate, e le categorie non
          c'entrano niente. */}
      {vista === "tutti" && <LeTueCategorie />}

      {filtrati.length === 0 ? (
        <p className="scheda mt-4 p-6 text-center text-sm text-muted-foreground">
          {vista === "cestino" ? "Il cestino è vuoto." : "Nessun movimento trovato."}
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {raggruppaPerGiorno(filtrati).map(([giorno, lista]) => (
            <section key={giorno} className="scheda p-4">
              <p className="mb-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                {dataBreve(lista[0]!.data)}
              </p>
              <ul>
                {lista.map((m) => (
                  <RigaMovimento
                    key={m.id}
                    m={m}
                    conData
                    modificabile={vista === "tutti"}
                    cestino={vista === "cestino"}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Guscio>
  );
}
