import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Guscio } from "@/components/Guscio";
import { Aiuto } from "@/components/Aiuto";
import { DoveVannoISoldi } from "@/components/DoveVannoISoldi";
import { euro } from "@/lib/parse";
import { attivi, MESI, useStato } from "@/lib/store";
import { dellAnno, delMese } from "@/lib/statistiche";

export const Route = createFileRoute("/anno")({
  head: () => ({
    meta: [
      { title: "Anno — MONO MONEY" },
      {
        name: "description",
        content:
          "I bilanci mese per mese: entrate, uscite e differenza, con i mesi già chiusi messi in chiaro.",
      },
      { property: "og:title", content: "Anno — MONO MONEY" },
      {
        property: "og:description",
        content: "Dodici mesi di conti, entrate e uscite, in una schermata sola.",
      },
    ],
  }),
  component: Anno,
});

function Anno() {
  const { movimenti } = useStato();
  const attivo = attivi(movimenti);
  const anni = useMemo(() => {
    const set = new Set(attivo.map((m) => new Date(m.data).getFullYear()));
    set.add(new Date().getFullYear());
    return [...set].sort((a, b) => b - a);
  }, [attivo]);
  const [anno, setAnno] = useState(new Date().getFullYear());
  /**
   * Quale periodo guarda la torta. `null` = tutto l'anno.
   * Il mese in corso è quello che interessa quasi sempre, quindi parte da lì —
   * ma solo se l'anno mostrato è quello di adesso.
   */
  const [mesePerLaTorta, setMesePerLaTorta] = useState<number | null>(
    new Date().getMonth(),
  );
  const annoCorrente = anno === new Date().getFullYear();
  const mesePeriodo = annoCorrente ? mesePerLaTorta : null;
  const periodo =
    mesePeriodo === null ? dellAnno(attivo, anno) : delMese(attivo, anno, mesePeriodo);

  const mesi = MESI.map((nome, i) => {
    const lista = attivo.filter((m) => {
      const d = new Date(m.data);
      return d.getFullYear() === anno && d.getMonth() === i;
    });
    const uscite = lista.filter((m) => m.tipo === "uscita").reduce((t, m) => t + m.importo, 0);
    const entrate = lista.filter((m) => m.tipo === "entrata").reduce((t, m) => t + m.importo, 0);
    const ora = new Date();
    const chiuso = anno < ora.getFullYear() || (anno === ora.getFullYear() && i < ora.getMonth());
    return { nome, i, uscite, entrate, chiuso, vuoto: lista.length === 0 };
  });

  const usciteAnno = mesi.reduce((t, m) => t + m.uscite, 0);
  const entrateAnno = mesi.reduce((t, m) => t + m.entrate, 0);
  const max = Math.max(1, ...mesi.map((m) => Math.max(m.uscite, m.entrate)));

  return (
    <Guscio
      titolo="Anno"
      sottotitolo={`${euro(entrateAnno)} entrate · ${euro(usciteAnno)} uscite`}
      azione={
        <Aiuto testo="Ogni riga è un mese: la barra chiara sono le entrate, quella scura le uscite. «Chiuso» vuol dire mese finito." />
      }
    >
      {anni.length > 1 && (
        <div className="mb-4 flex gap-2 overflow-x-auto">
          {anni.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAnno(a)}
              className={`pillola tocco px-4 font-semibold ${
                a === anno
                  ? "bg-accent text-accent-foreground"
                  : "border border-border text-muted-foreground"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      )}

      {annoCorrente && (
        <div className="mb-3 flex gap-2">
          {(
            [
              [new Date().getMonth(), `${MESI[new Date().getMonth()]}`],
              [null, "Tutto l'anno"],
            ] as const
          ).map(([valore, etichetta]) => (
            <button
              key={String(valore)}
              type="button"
              onClick={() => setMesePerLaTorta(valore)}
              className={`pillola tocco flex-1 justify-center text-sm font-semibold capitalize ${
                mesePerLaTorta === valore
                  ? "bg-accent text-accent-foreground"
                  : "border border-border text-muted-foreground"
              }`}
            >
              {etichetta}
            </button>
          ))}
        </div>
      )}

      <DoveVannoISoldi movimenti={periodo} />

      <h2 className="mt-6 mb-3 px-1 text-lg">Mese per mese</h2>
      <div className="space-y-3">
        {mesi.map((m) => (
          <section key={m.i} className={m.vuoto ? "scheda-tenue p-4" : "scheda p-4"}>
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg capitalize">{m.nome}</h2>
              <span className="text-xs text-muted-foreground">
                {m.vuoto ? "nessun movimento" : m.chiuso ? "mese chiuso" : "in corso"}
              </span>
            </div>
            {!m.vuoto && (
              <>
                <div className="mt-2 space-y-1.5">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-salvia"
                      style={{ width: `${(m.entrate / max) * 100}%` }}
                    />
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${(m.uscite / max) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Entrate <span className="numero">{euro(m.entrate)}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Uscite <span className="numero">{euro(m.uscite)}</span>
                  </span>
                </div>
                <p className="numero mt-1 text-right text-lg">
                  {m.entrate - m.uscite >= 0 ? "+" : "−"}
                  {euro(Math.abs(m.entrate - m.uscite))}
                </p>
              </>
            )}
          </section>
        ))}
      </div>
    </Guscio>
  );
}
