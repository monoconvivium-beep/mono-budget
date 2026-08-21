/**
 * «METTI GLI INGREDIENTI NELLA SPESA» — il ponte che mancava.
 *
 * 🔑 Il problema che risolve (chiesto da lui il 17/8/2026): il ricettario e la
 * lista della spesa stavano nella stessa app e non si parlavano. Chi decideva
 * di fare la crema pasticcera doveva **rileggersi gli ingredienti e ridirli uno
 * per uno** — cioè copiare a mano da una pagina all'altra dello stesso
 * telefono. Adesso è un tocco.
 *
 * 🔑 NON RIMETTE QUELLO CHE C'È GIÀ. Se «uova» è in lista non la riscrive: una
 * lista con tre volte la stessa riga è una lista che si smette di usare, e
 * l'errore lo avrebbe fatto l'app, non la persona.
 *
 * ⚠️ Aggiunge la riga **com'è scritta nella ricetta**, dosi comprese
 * («200 g zucchero»): al banco serve sapere quanto, non solo cosa. Chi vuole
 * cambiarla la cancella e la ridice — è la sua lista.
 * ⚠️ Non tocca i soldi. Segnare la spesa degli ingredienti è un altro gesto e
 * ha il suo bottone: mescolarli vorrebbe dire far comparire un movimento a chi
 * voleva solo ricordarsi di comprare le uova.
 */
import { useState } from "react";
import { ShoppingBasket } from "lucide-react";

import { azioni, useStato } from "@/lib/store";

/** Due righe sono la stessa cosa se, a parte maiuscole e spazi, si leggono uguale. */
function chiave(riga: string): string {
  return riga.trim().toLowerCase().replace(/\s+/g, " ");
}

export function IngredientiNellaSpesa({ ingredienti }: { ingredienti: readonly string[] }) {
  const stato = useStato();
  const [esito, setEsito] = useState<{ messi: number; cerano: number } | null>(null);

  function metti() {
    const giaInLista = new Set(stato.spesa.map((v) => chiave(v.cosa)));
    let messi = 0;
    let cerano = 0;

    for (const riga of ingredienti) {
      const pulita = riga.trim();
      if (!pulita) continue;
      if (giaInLista.has(chiave(pulita))) {
        cerano += 1;
        continue;
      }
      /* Si segna subito come già vista: se la stessa ricetta ripete un
         ingrediente in due righe, in lista ci va una volta sola. */
      giaInLista.add(chiave(pulita));
      azioni.spesaAggiungi(pulita);
      messi += 1;
    }

    // Una vibrazione corta: la conferma che il gesto è andato, senza guardare.
    if (messi) navigator.vibrate?.(35);
    setEsito({ messi, cerano });
  }

  return (
    <>
      <button
        type="button"
        onClick={metti}
        className="tocco mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--cashmere)] px-4 font-bold text-[#262321] shadow-rialzata"
      >
        <ShoppingBasket aria-hidden className="h-5 w-5" /> Metti gli ingredienti nella spesa
      </button>

      {esito && (
        <p
          role="status"
          className="mt-1.5 text-center text-[11px] text-[var(--secondario-su-pieno)]"
        >
          {esito.messi === 0
            ? "Li avevi già tutti in lista."
            : esito.messi === 1
              ? "Aggiunta 1 cosa alla lista della spesa."
              : `Aggiunte ${esito.messi} cose alla lista della spesa.`}
          {esito.cerano > 0 && esito.messi > 0
            ? ` ${esito.cerano === 1 ? "Una" : esito.cerano} l${esito.cerano === 1 ? "'avevi" : "e avevi"} già.`
            : ""}
        </p>
      )}
    </>
  );
}
