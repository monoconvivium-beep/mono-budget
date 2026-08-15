/**
 * «Dove vanno i soldi» — la torta e l'elenco.
 *
 * 🔑 La torta da sola non basta e non è mai bastata: da un disegno non si legge
 * un numero. Sotto c'è sempre **l'elenco con gli euro e la percentuale**, e
 * quello è il pezzo che si guarda davvero. Il disegno serve a capire in un
 * secondo se c'è una fetta che si è mangiata il mese.
 */
import { useState } from "react";

import { euro, type Tipo } from "@/lib/parse";
import { perCategoria, riepilogo } from "@/lib/statistiche";
import type { Movimento } from "@/lib/store";

import { Aiuto } from "./Aiuto";

/**
 * Gli spicchi della ciambella, come li vuole `conic-gradient`: ogni colore con
 * il punto dove comincia e quello dove finisce, in percentuale.
 * Si tiene il conto di quanto si è già percorso, così non restano fessure
 * bianche fra una fetta e l'altra per via degli arrotondamenti.
 */
function spicchi(voci: readonly { quota: number; colore: string }[]): string {
  let percorso = 0;
  return voci
    .map((v, i) => {
      const da = percorso;
      // L'ultima chiude sempre a 100: gli arrotondamenti non devono lasciare
      // una fetta di niente in fondo al cerchio.
      const a = i === voci.length - 1 ? 100 : (percorso += v.quota * 100);
      return `${v.colore} ${da.toFixed(3)}% ${a.toFixed(3)}%`;
    })
    .join(", ");
}

export function DoveVannoISoldi({
  movimenti,
  /**
   * Versione della Home: torta e prime quattro categorie affiancate, senza
   * l'elenco lungo e senza il cambio entrate/uscite. Serve a rispondere in un
   * secondo alla domanda «dov'è finito il mese»; il resto sta nei Bilanci.
   */
  compatta = false,
}: {
  movimenti: readonly Movimento[];
  compatta?: boolean;
}) {
  const [tipo, setTipo] = useState<Tipo>("uscita");
  const voci = perCategoria(movimenti, tipo);
  const conti = riepilogo(movimenti);
  const totale = tipo === "uscita" ? conti.uscite : conti.entrate;

  if (compatta) {
    if (!voci.length) return null;
    return (
      <section className="scheda mt-4 flex items-center gap-4 p-4">
        <div className="relative h-24 w-24 shrink-0">
          <div
            className="disegna h-full w-full rounded-full"
            role="img"
            aria-label={`Uscite per categoria: ${voci
              .map((v) => `${v.categoria} ${Math.round(v.quota * 100)}%`)
              .join(", ")}`}
            style={{
              background: `conic-gradient(from -90deg, ${spicchi(voci)})`,
              WebkitMaskImage: "radial-gradient(circle, transparent 57%, #000 58%)",
              maskImage: "radial-gradient(circle, transparent 57%, #000 58%)",
            }}
          />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
              Uscite
            </span>
            <span className="numero text-sm leading-tight">{euro(conti.uscite)}</span>
          </div>
        </div>

        <ul className="min-w-0 flex-1">
          {voci.slice(0, 4).map((v) => (
            <li key={v.categoria} className="flex items-center gap-2 py-[3px] text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: v.colore }}
              />
              <span className="min-w-0 flex-1 truncate">{v.categoria}</span>
              <span className="text-xs text-muted-foreground">{Math.round(v.quota * 100)}%</span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="scheda mt-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg">Dove vanno i soldi</h2>
        <Aiuto testo="La torta divide il periodo per categoria. Sotto trovi gli euro esatti e quante volte: dal disegno un numero non si legge." />
      </div>

      <div className="mt-3 flex gap-2">
        {(
          [
            ["uscita", "Uscite"],
            ["entrata", "Entrate"],
          ] as const
        ).map(([valore, etichetta]) => (
          <button
            key={valore}
            type="button"
            onClick={() => setTipo(valore)}
            className={`pillola tocco flex-1 justify-center text-sm font-semibold ${
              tipo === valore
                ? "bg-accent text-accent-foreground"
                : "border border-border text-muted-foreground"
            }`}
          >
            {etichetta}
          </button>
        ))}
      </div>

      {voci.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Niente da mostrare per questo periodo.
        </p>
      ) : (
        <>
          <div className="relative mx-auto mt-4 aspect-square w-full max-w-[15rem]">
            {/*
              La ciambella è UN CERCHIO COLORATO A SPICCHI, disegnato dal foglio
              di stile. Niente libreria di grafici: quella pesava 361 kB — più di
              tutta l'app — per disegnare degli archi. Su un telefono con poco
              campo, in negozio, si sente.
              Il buco in mezzo è un ritaglio, così va bene su tutti e due i temi
              senza dover indovinare il colore della scheda sotto.
            */}
            <div
              className="h-full w-full rounded-full"
              role="img"
              aria-label={`Ripartizione per categoria: ${voci
                .map((v) => `${v.categoria} ${Math.round(v.quota * 100)}%`)
                .join(", ")}`}
              style={{
                background: `conic-gradient(from -90deg, ${spicchi(voci)})`,
                WebkitMaskImage: "radial-gradient(circle, transparent 58%, #000 58.5%)",
                maskImage: "radial-gradient(circle, transparent 58%, #000 58.5%)",
              }}
            />

            {/* Il totale sta nel buco in mezzo: è la prima cosa che si cerca. */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                {tipo === "uscita" ? "Uscite" : "Entrate"}
              </span>
              <span className="numero text-xl leading-tight">{euro(totale)}</span>
            </div>
          </div>

          <ul className="mt-4">
            {voci.map((v) => (
              <li
                key={v.categoria}
                className="flex items-center gap-3 border-b border-border py-2.5 last:border-0"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: v.colore }}
                />
                <span className="min-w-0 flex-1 truncate text-sm">
                  {v.categoria}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {v.quantiMovimenti} {v.quantiMovimenti === 1 ? "volta" : "volte"}
                  </span>
                </span>
                <span className="numero text-sm">{euro(v.totale)}</span>
                <span className="w-11 text-right text-xs text-muted-foreground">
                  {Math.round(v.quota * 100)}%
                </span>
              </li>
            ))}
          </ul>

          {tipo === "uscita" && conti.spesaMedia > 0 && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              In media <span className="numero">{euro(conti.spesaMedia)}</span> a spesa, su{" "}
              {conti.quantiMovimenti} movimenti.
            </p>
          )}
        </>
      )}
    </section>
  );
}
