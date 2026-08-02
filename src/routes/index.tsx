import { createFileRoute } from "@tanstack/react-router";
import { Guscio } from "@/components/Guscio";
import { Dettatura } from "@/components/Dettatura";
import { RigaMovimento } from "@/components/RigaMovimento";
import { Aiuto } from "@/components/Aiuto";
import { euro } from "@/lib/parse";
import { attivi, MESI, somma, stessoMese, useStato } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MONO MONEY — il libretto delle spese da tasca" },
      {
        name: "description",
        content:
          "Dì «quarantasei farmacia» e la spesa è scritta, in categoria, con i conti del mese. Tutto resta sul tuo telefono. Un regalo di MONO, Torino.",
      },
      { property: "og:title", content: "MONO MONEY — il libretto delle spese da tasca" },
      {
        property: "og:description",
        content:
          "Spese dettate a voce, categorie automatiche, conti del mese e dell'anno. I tuoi dati non lasciano il telefono.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const stato = useStato();
  const movimenti = attivi(stato.movimenti);
  const ora = new Date();
  const delMese = movimenti.filter((m) => stessoMese(m.data, ora.getFullYear(), ora.getMonth()));
  const uscite = somma(delMese, "uscita");
  const entrate = somma(delMese, "entrata");
  const oggi = movimenti
    .filter((m) => new Date(m.data).toDateString() === ora.toDateString() && m.tipo === "uscita")
    .reduce((t, m) => t + m.importo, 0);
  const risparmio = Math.max(0, entrate - uscite);
  const avanzamento =
    stato.obiettivo > 0 ? Math.min(100, Math.round((risparmio / stato.obiettivo) * 100)) : 0;

  return (
    <Guscio titolo="MONO MONEY" sottotitolo={`${MESI[ora.getMonth()]} ${ora.getFullYear()}`}>
      <section className="scheda-bosco p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-widest uppercase opacity-80">
            Obiettivo di risparmio
          </p>
          <Aiuto testo="Quanto vorresti mettere da parte questo mese: entrate meno uscite. Lo cambi nella scheda MONO." />
        </div>
        <p className="numero mt-2 text-4xl">{euro(risparmio)}</p>
        <p className="mt-1 text-sm opacity-80">
          su {euro(stato.obiettivo)} · {avanzamento}%
        </p>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-oro transition-all"
            style={{ width: `${avanzamento}%` }}
          />
        </div>
      </section>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { titolo: "USCITE", valore: uscite },
          { titolo: "ENTRATE", valore: entrate },
          { titolo: "OGGI", valore: oggi },
        ].map((r) => (
          <div key={r.titolo} className="scheda p-3 text-center">
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground">
              {r.titolo}
            </p>
            <p className="numero mt-1 text-lg leading-tight">{euro(r.valore)}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Dettatura />
      </div>

      <section className="scheda mt-4 p-4">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg">Ultime spese</h2>
          <Aiuto testo="Le × mettono il movimento nel cestino: lo recuperi dal Diario." />
        </div>
        {movimenti.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Ancora nessun movimento. Tocca il microfono e dì la prima spesa.
          </p>
        ) : (
          <ul>
            {movimenti.slice(0, 8).map((m) => (
              <RigaMovimento key={m.id} m={m} />
            ))}
          </ul>
        )}
      </section>

      <p className="mt-4 px-2 text-center text-xs leading-relaxed text-muted-foreground">
        Importi, categorie e saldo restano su questo telefono: nessun account, nessun server,
        nessuna chiamata di rete. Un regalo di MONO, gastronomia a Torino.
      </p>
    </Guscio>
  );
}
