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
import { ExternalLink, Instagram, Mail, MapPin, MessageCircle, Phone, Store } from "lucide-react";

/**
 * ☎️ IL TELEFONO — `+39 379 398 0937`, dettato da lui due volte a giorni di
 * distanza e identico tutte e due le volte: per questo si può pubblicare.
 * ⚠️ Un numero pubblico sbagliato è un cliente perso e resta in giro per
 * mesi: se un domani cambia, va cambiato ANCHE nel sito e su Google, non
 * solo qui.
 */
const TELEFONO = "+393793980937";
const TELEFONO_SCRITTO = "379 398 0937";

const QUADRETTI = [
  {
    Icona: Phone,
    titolo: "Chiamaci",
    sotto: TELEFONO_SCRITTO,
    url: `tel:${TELEFONO}`,
  },
  {
    Icona: MessageCircle,
    titolo: "WhatsApp",
    sotto: "Scrivici un messaggio",
    url: `https://wa.me/${TELEFONO.replace("+", "")}`,
  },
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
            <span className="block truncate text-xs text-[var(--secondario-su-pieno)]">
              Ordina, prenota, ritira: il menu del giorno in tasca
            </span>
          </span>
          <span aria-hidden className="text-[var(--secondario-su-pieno)]">
            ›
          </span>
        </a>

        {/* I CONTATTI — sei porte, icona in alto, come nell'app centrale.
            Dal 9/8 le prime due sono il telefono e WhatsApp: prima l'unico
            modo di parlare con la bottega era una email, che nessuno scrive
            per chiedere se c'è ancora la focaccia. */}
        <p className="mt-4 mb-2 px-1 text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
          Contatti
        </p>
        <div className="grid grid-cols-2 gap-3">
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
