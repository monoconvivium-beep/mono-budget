/**
 * «Passala a un amico» — il QR dentro l'app di chi ce l'ha già.
 *
 * 🔑 È il modo in cui questa app si diffonde davvero. Chi ce l'ha la apre al
 * bar, mostra lo schermo, l'amico inquadra e in due secondi ce l'ha anche lui.
 * Nessun link da dettare, nessun nome da scrivere: il passaparola senza
 * l'attrito del passaparola.
 *
 * ⚠️ Il QR è **un'immagine nostra, generata una volta sola** e servita da noi:
 * niente librerie nel programma e nessun servizio esterno a cui chiedere il
 * disegno — che vorrebbe dire mandare a qualcuno la notizia che stai
 * condividendo l'app, e questa app non manda niente.
 * Si rigenera con `scripts/genera-qr.mjs` se cambia l'indirizzo.
 */
import { QrCode } from "lucide-react";
import { useState } from "react";

import { Aiuto } from "./Aiuto";

export function PassalaAUnAmico() {
  const [aperto, setAperto] = useState(false);

  return (
    <section className="scheda mt-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg">Passala a un amico</h2>
        <Aiuto testo="Mostragli questo quadrato: lo inquadra con la fotocamera e l'app è sua. È gratis anche per lui." />
      </div>

      {aperto ? (
        <div className="mt-4 flex flex-col items-center">
          {/* Grande e su fondo chiaro: un QR piccolo o su fondo scuro non si
              legge, e chi sta dall'altra parte non riprova due volte. */}
          <img
            src={`${import.meta.env.BASE_URL}marchio/qr-mono-money.svg`}
            alt="Codice da inquadrare per scaricare MONO MONEY"
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
        <>
          <p className="mt-1 text-sm text-muted-foreground">
            Mostragli il codice: lo inquadra e ce l'ha anche lui.
          </p>
          <button
            type="button"
            onClick={() => setAperto(true)}
            className="tocco mt-3 w-full gap-2 rounded-2xl bg-[var(--azione-scheda)] px-4 font-semibold text-[var(--azione-testo)]"
          >
            <QrCode className="h-5 w-5" /> Mostra il codice
          </button>
        </>
      )}
    </section>
  );
}
