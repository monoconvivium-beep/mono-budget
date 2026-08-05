/**
 * Il blocco MONO — il marchio, e le porte che riportano in bottega.
 *
 * 🔑 Perché sta dentro un'app dei conti: MONO MONEY **è pubblicità**, nel senso
 * buono. È un oggetto utile che la bottega regala, e che una persona apre ogni
 * giorno con in testa il nome di chi gliel'ha dato. Se il marchio non si vede e
 * non c'è una porta per tornare, il regalo resta un favore e basta.
 *
 * 🔒 Sono **collegamenti**, non contenuti caricati da fuori: finché non li tocchi
 * non parte nessuna richiesta e l'app resta muta come promesso. Per la stessa
 * ragione il logo è un file nostro, non l'immagine di un social.
 */
import { ExternalLink, Instagram, MapPin, ShoppingBag } from "lucide-react";

const PORTE = [
  {
    Icona: ShoppingBag,
    titolo: "Ordina, prenota, ritira",
    sotto: "L'app della bottega: menu del giorno, consegne e prenotazioni.",
    url: "https://app.monobottega.it",
  },
  {
    Icona: ExternalLink,
    titolo: "monobottega.it",
    sotto: "Chi siamo, cosa c'è oggi, gli eventi.",
    url: "https://monobottega.it",
  },
  {
    Icona: Instagram,
    titolo: "@mono.bottega",
    sotto: "Quello che esce dalla cucina, ogni giorno.",
    url: "https://www.instagram.com/mono.bottega/",
  },
  {
    Icona: MapPin,
    titolo: "Via Barletta 72/D, Torino",
    sotto: "Santa Rita. Ti aspettiamo.",
    url: "https://www.google.com/maps/search/?api=1&query=45.0479194,7.6432467",
  },
] as const;

export function MarchioMono() {
  return (
    <section className="scheda mt-4 overflow-hidden p-0">
      {/**
       * Fondo cashmere caldo e non più verde bosco: qui il marchio dev'essere
       * quello ORIGINALE (sua regola del 5/8), e l'originale è scuro — sul
       * verde spariva. Il filo terracotta in cima tiene il blocco staccato
       * dal resto senza spegnere il marchio.
       */}
      <div className="rounded-none border-t-4 border-t-[var(--azione-scheda)] bg-card-soft p-5 text-center">
        <img
          src={`${import.meta.env.BASE_URL}marchio/mono-orizzontale.svg`}
          alt="MONO — Bottega Gastronomica"
          className="mx-auto w-[62%] max-w-[220px]"
        />
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          MONO MONEY è un omaggio di <strong>MONO</strong>, bottega di gastronomia a Torino.
          Nessuno ti chiede niente in cambio: se ti trovi bene, passa a trovarci.
        </p>
      </div>

      <ul className="p-2">
        {PORTE.map(({ Icona, titolo, sotto, url }) => (
          <li key={url}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[56px] items-center gap-3 rounded-2xl px-3 py-2 active:bg-muted"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-oro text-oro-foreground">
                <Icona className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{titolo}</span>
                <span className="block truncate text-xs text-muted-foreground">{sotto}</span>
              </span>
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
