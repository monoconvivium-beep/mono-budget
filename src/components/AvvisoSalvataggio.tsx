import { ShieldAlert } from "lucide-react";

import { useSalvataggioRotto } from "@/lib/store";

/**
 * «QUESTO TELEFONO NON MI LASCIA SALVARE» — l'avviso che mancava.
 *
 * 🔴 Da dove nasce (23/8/2026): il salvataggio falliva **in silenzio**. In
 * navigazione privata, o con i dati dei siti bloccati, l'app funzionava
 * benissimo finché restava aperta e perdeva tutto alla chiusura senza dire una
 * parola. Su un'app di conti è il difetto peggiore che ci sia: uno segna la
 * spesa, la vede scritta lì, si fida — e il giorno dopo non c'è più. Il danno
 * non è il difetto, è la fiducia.
 *
 * 🔑 Perché sta in CIMA e non si può chiudere: non è una notizia, è una
 * condizione. Finché dura, tutto quello che si scrive è provvisorio, e chi usa
 * l'app ha il diritto di saperlo **prima** di segnare il primo euro — non dopo
 * il centesimo.
 *
 * ⚠️ Non promette di aggiustare niente e non dà colpe: dice cosa sta
 * succedendo e le due cose che di solito lo risolvono. Se sono in navigazione
 * privata, non è un guasto dell'app: è il telefono che fa il suo mestiere.
 */
export function AvvisoSalvataggio() {
  const rotto = useSalvataggioRotto();
  if (!rotto) return null;

  return (
    <section
      /* `assertive`: chi usa il lettore di schermo lo deve sentire subito, non
         quando arriva a leggerlo scorrendo. */
      role="alert"
      aria-live="assertive"
      className="scheda mb-4 flex items-start gap-3 border-2 border-[var(--azione-scheda)] p-3"
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--azione-scheda)] text-[var(--azione-testo)]">
        <ShieldAlert className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">Questo telefono non mi lascia salvare</span>
        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
          Quello che segni resta finché l'app è aperta, poi <b>sparisce</b>. Di solito succede in{" "}
          <b>navigazione privata</b>: chiudi la finestra privata e riapri l'app normalmente. Se
          l'hai aperta da un link, <b>mettila in Home</b> e aprila da lì.
        </span>
      </span>
    </section>
  );
}
