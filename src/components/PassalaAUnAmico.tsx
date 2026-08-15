/**
 * «Passala a un amico» — il passaparola, ma che si può CONTARE.
 *
 * 🔑 Due strade, tutte e due targate (`lib/origine.ts`):
 *  - il LINK personale porta `?amico=PANE-42`: chi si iscrive da lì lascia il
 *    codice nell'iscrizione, e chi ha girato il link può farlo valere al banco;
 *  - il QR da inquadrare al volo porta `?da=passaparola`: non dice chi, ma
 *    dice come — e un canale che si conta è un canale che si può coltivare.
 *
 * ⚠️ Il QR è **un'immagine nostra, generata una volta sola** e servita da noi:
 * niente librerie nel programma e nessun servizio esterno a cui chiedere il
 * disegno. Si rigenera con `scripts/genera-qr.mjs` se cambia l'indirizzo.
 * ⚠️ Qui non si promette nessun premio: cosa vale un codice lo decide il
 * banco, e un premio scritto nell'app è una promessa che non si può ritirare.
 */
import { QrCode, Share2 } from "lucide-react";
import { useState } from "react";

import { codiceAmico, INDIRIZZO_APP } from "@/lib/origine";

import { Aiuto } from "./Aiuto";

export function PassalaAUnAmico() {
  const [aperto, setAperto] = useState(false);
  const [copiato, setCopiato] = useState(false);
  const codice = codiceAmico();

  /** L'indirizzo con la targa personale: chi arriva da qui porta il codice. */
  const link = `${INDIRIZZO_APP}/?amico=${codice}`;

  async function condividi() {
    const testo = `Ti regalo MonoConvivium: dici una spesa a voce e i conti si fanno da soli. Gratis, senza pubblicità: ${link}`;
    try {
      // Il foglio di condivisione del telefono: WhatsApp, SMS, quello che c'è.
      if (navigator.share) {
        await navigator.share({ text: testo });
        return;
      }
    } catch {
      // Annullato da lui: non è un errore, non serve dire niente.
      return;
    }
    try {
      await navigator.clipboard.writeText(testo);
      setCopiato(true);
      setTimeout(() => setCopiato(false), 2500);
    } catch {
      // Senza appunti non resta che il QR qui sotto: c'è già.
    }
  }

  return (
    <section className="scheda mt-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg">Passala a un amico</h2>
        <Aiuto testo="Manda il link o fai inquadrare il quadrato: l'app è gratis anche per lui. Nel link c'è il tuo codice: quando un amico si iscrive da lì, il codice resta scritto nella sua iscrizione — MONO lo vede e sa che è merito tuo." />
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        Il tuo codice è <strong className="text-foreground">{codice}</strong>: viaggia dentro il
        link, e ogni amico che si iscrive lo lascia scritto.
      </p>

      <button
        type="button"
        onClick={() => void condividi()}
        className="tocco mt-3 w-full gap-2 rounded-2xl bg-[var(--azione-scheda)] px-4 font-semibold text-[var(--azione-testo)]"
      >
        <Share2 className="h-5 w-5" />
        {copiato ? "Link copiato: incollalo dove vuoi" : "Invia il link"}
      </button>

      {aperto ? (
        <div className="mt-4 flex flex-col items-center">
          {/* Grande e su fondo chiaro: un QR piccolo o su fondo scuro non si
              legge, e chi sta dall'altra parte non riprova due volte. */}
          <img
            src={`${import.meta.env.BASE_URL}marchio/qr-passaparola.svg`}
            alt="Codice da inquadrare per scaricare MonoConvivium"
            className="w-full max-w-[15rem] rounded-2xl border border-border"
            width={240}
            height={240}
          />
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Faglielo inquadrare con la fotocamera. È un regalo di MONO: gratis anche per lui.
          </p>
          <button
            type="button"
            onClick={() => setAperto(false)}
            className="tocco mt-3 text-sm text-muted-foreground underline underline-offset-4"
          >
            Chiudi
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAperto(true)}
          className="tocco mt-2 w-full gap-2 rounded-2xl border border-border px-4 text-sm font-semibold"
        >
          <QrCode className="h-5 w-5" /> Oppure mostra il codice QR
        </button>
      )}
    </section>
  );
}
