import { createFileRoute } from "@tanstack/react-router";

import { DettaturaRiga } from "@/components/DettaturaRiga";
import { Guscio } from "@/components/Guscio";
import { ListaSpuntabile } from "@/components/ListaSpuntabile";
import { interpretaPasso } from "@/lib/cucina";
import { azioni, useStato } from "@/lib/store";

export const Route = createFileRoute("/dafare")({ component: DaFare });

/**
 * LE COSE DA FARE — la terza lista, e l'ultima cosa che mancava per non
 * essere più un'app di soldi.
 *
 * 🔑 Usa `interpretaPasso` e non `interpretaIngrediente`: una faccenda non ha
 * quantità né misure — «chiamare l'idraulico» non diventa «1 idraulico».
 * Serve solo la maiuscola in testa e il punto in fondo, che è esattamente
 * quello che quel pezzo fa già per i passi delle ricette.
 *
 * ⚠️ Niente date e niente promemoria: l'app non ha server e non può mandare
 * notifiche. Una scadenza che non avvisa nessuno è una promessa che non
 * possiamo mantenere — e chi ci conta se ne accorge il giorno che serve.
 */
function DaFare() {
  const { dafare } = useStato();
  const aperte = dafare.filter((v) => !v.fatta);
  const fatte = dafare.filter((v) => v.fatta);

  const sottotitolo =
    dafare.length === 0
      ? "Dille a voce, una per volta"
      : `${aperte.length} da fare${fatte.length ? ` · ${fatte.length} fatte` : ""}`;

  return (
    <Guscio titolo="Le cose da fare" sottotitolo={sottotitolo} marchio="sorriso">
      <DettaturaRiga
        etichetta="Dì cosa devi fare"
        esempio="«chiamare l'idraulico» · «pagare la bolletta» · «portare fuori il vetro»"
        segnaposto="oppure scrivi: prenotare il dentista"
        interpreta={interpretaPasso}
        onRiga={(riga) => azioni.dafareAggiungi(riga)}
      />

      {dafare.length === 0 ? (
        <p className="scheda mt-4 p-6 text-center text-sm text-muted-foreground">
          Non c'è niente da fare. Tocca il bottone qui sopra e dì la prima cosa che ti viene in
          mente prima di dimenticarla.
        </p>
      ) : (
        <ListaSpuntabile
          voci={dafare.map((v) => ({ id: v.id, cosa: v.cosa, fatta: v.fatta }))}
          onSpunta={(id) => azioni.dafareSpunta(id)}
          onTogli={(id) => azioni.dafareTogli(id)}
          vocePresa={(cosa) => `Rimetti ${cosa} fra le cose da fare`}
          voceDaFare={(cosa) => `Segna ${cosa} come fatta`}
        />
      )}

      {fatte.length > 0 && (
        <button
          type="button"
          onClick={() => azioni.dafarePulisci()}
          className="tocco mt-3 w-full rounded-2xl border border-border text-sm font-semibold text-muted-foreground"
        >
          Togli le {fatte.length} cose già fatte
        </button>
      )}
    </Guscio>
  );
}
