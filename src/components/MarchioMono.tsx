/**
 * Il blocco MONO — il marchio, e le porte che riportano in bottega.
 *
 * 🔑 Perché sta dentro un'app dei conti: MonoConvivium **è pubblicità**, nel senso
 * buono. È un oggetto utile che la bottega regala, e che una persona apre ogni
 * giorno con in testa il nome di chi gliel'ha dato. Se il marchio non si vede e
 * non c'è una porta per tornare, il regalo resta un favore e basta.
 *
 * 🔑 RIDISEGNATO A QUADRETTI l'8/8 su sua richiesta — «come la pagina Altro
 * dell'app centrale: quadretti con le icone, più bello e più facile». E la
 * porta che conta è la PRIMA, larga e terracotta: **scaricare l'app di MONO**.
 * MONEY è il regalino; il lavoro vero lo fa l'app centrale, e da qui ci si
 * arriva con un tocco. Il collegamento porta `?da=mono-money`: oggi la
 * centrale non lo legge, ma il giorno che vorrà contare da dove arrivano gli
 * installi, la targa è già lì.
 *
 * 🔒 Sono **collegamenti**, non contenuti caricati da fuori: finché non li tocchi
 * non parte nessuna richiesta e l'app resta muta come promesso. Per la stessa
 * ragione il logo è un file nostro, non l'immagine di un social.
 */
import { ExternalLink, Instagram, Mail, MapPin, Store } from "lucide-react";

const QUADRETTI = [
  {
    Icona: ExternalLink,
    titolo: "Il sito",
    sotto: "monobottega.it",
    url: "https://monobottega.it",
  },
  {
    Icona: Instagram,
    titolo: "Instagram",
    sotto: "@mono.bottega",
    url: "https://www.instagram.com/mono.bottega/",
  },
  {
    Icona: MapPin,
    titolo: "Dove siamo",
    sotto: "Via Barletta 72/D",
    url: "https://www.google.com/maps/search/?api=1&query=45.0479194,7.6432467",
  },
  {
    Icona: Mail,
    titolo: "Scrivici",
    sotto: "monobottega@gmail.com",
    url: "mailto:monobottega@gmail.com",
  },
] as const;

export function MarchioMono() {
  return (
    <section className="scheda mt-4 overflow-hidden p-0">
      {/* Il marchio ORIGINALE su fondo cashmere caldo, col filo terracotta. */}
      <div className="rounded-none border-t-4 border-t-[var(--azione-scheda)] bg-card-soft p-5 text-center">
        <img
          src={`${import.meta.env.BASE_URL}marchio/mono-orizzontale.svg`}
          alt="MONO — Bottega Gastronomica"
          className="mx-auto w-[62%] max-w-[220px]"
        />
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          MonoConvivium è un omaggio di <strong>MONO</strong>, bottega di gastronomia a Torino.
          Nessuno ti chiede niente in cambio: se ti trovi bene, passa a trovarci.
        </p>
      </div>

      <div className="p-3">
        {/* LA porta: larga, terracotta, prima di tutte. L'app vera è di là. */}
        <a
          href="https://app.monobottega.it/?da=mono-money"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[64px] items-center gap-3 rounded-2xl bg-[var(--azione-scheda)] p-3.5 text-[var(--azione-testo)] shadow-morbida"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--cashmere)]">
            <Store className="h-5.5 w-5.5 text-[var(--azione-scheda)]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold">Scarica l'app di MONO</span>
            <span className="block truncate text-xs text-[rgba(244,236,221,0.8)]">
              Ordina, prenota, ritira: il menu del giorno in tasca
            </span>
          </span>
          <span aria-hidden className="text-[rgba(244,236,221,0.7)]">
            ›
          </span>
        </a>

        {/* I quadretti: quattro porte, icona in alto, come nell'app centrale. */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          {QUADRETTI.map(({ Icona, titolo, sotto, url }) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="scheda-tenue flex min-h-[92px] flex-col items-center justify-center gap-1.5 p-3 text-center active:bg-muted"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-oro text-oro-foreground">
                <Icona className="h-5 w-5" />
              </span>
              <span className="text-sm leading-tight font-bold">{titolo}</span>
              <span className="w-full truncate text-[11px] text-muted-foreground">{sotto}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
