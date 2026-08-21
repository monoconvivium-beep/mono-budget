import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Wallet, ShoppingBasket, ChefHat, CheckSquare } from "lucide-react";
import { AvvisoVersione, RigaVersione } from "@/components/Aggiornamento";
import { useStato } from "@/lib/store";

/**
 * LA BARRA — rifatta il 17/8/2026, e l'idea del centro è sua.
 *
 * 🔴 Il problema: gli strumenti sono QUATTRO (soldi, spesa, ricettario, cose da
 * fare) ma i bottoni ne mostravano tre. Il **ricettario non aveva il suo** e si
 * raggiungeva solo passando dalla Spesa: una stanza che bisogna sapere che
 * esiste. Il quinto posto se lo prendeva il microfono.
 *
 * 🔑 LA SOLUZIONE, sua: **il microfono esce dalla barra e il centro diventa il
 * Convivium**. Regge per due motivi, e nessuno dei due è estetico.
 * · Il microfono **non serve nella barra**: ogni schermata ha già il suo, lì
 *   dove si detta — la spesa nella Spesa, la faccenda in Da fare, la ricetta
 *   nel ricettario. Un bottone che ti porta *altrove* per parlare era un giro
 *   in più rispetto a parlare dove sei.
 * · Il **posto centrale è il più importante della barra**, ed è giusto che ci
 *   stia chi siamo e non uno strumento. Prima il Convivium era l'ultima voce a
 *   destra, in fila con la lista della spesa: adesso è il cuore, al centro.
 *
 * ⚠️ La schermata `/ascolto` NON è stata tolta: ci arriva ancora il ponte del
 * ricettario («segna la spesa degli ingredienti», con la categoria già scelta).
 * È uscita dalla barra, non dall'app.
 */
/**
 * ⚠️ Due forme diverse, e il tipo lo dichiara invece di far finta.
 * Le voci normali hanno un'icona disegnata; quella di mezzo no, perché ci va
 * il **marchio vero** del Convivium. Scrivere un'icona finta solo per far
 * contento il controllo dei tipi avrebbe lasciato in giro un campo che non
 * serve a nessuno e che il prossimo crede di dover usare.
 */
type Voce =
  | { to: string; etichetta: string; Icona: typeof Wallet; centro?: false }
  | { to: string; etichetta: string; centro: true };

const voci: Voce[] = [
  { to: "/", etichetta: "Soldi", Icona: Wallet },
  { to: "/spesa", etichetta: "Spesa", Icona: ShoppingBasket },
  { to: "/convivium", etichetta: "Convivium", centro: true },
  { to: "/ricette", etichetta: "Ricette", Icona: ChefHat },
  { to: "/dafare", etichetta: "Da fare", Icona: CheckSquare },
];

export function Guscio({
  titolo,
  sottotitolo,
  children,
  azione,
  /** Sostituisce il titolo grande: sulla Home ci va il marchio, non una scritta. */
  intestazione,
  /**
   * Il marchio grande come sulla Home invece della fascia alta 56 px.
   * Chiesto per l'Ascolto il 5/8: è la schermata dove uno arriva per parlare,
   * e il marchio deve pesare quanto il gesto.
   */
  marchioGrande = false,
  /**
   * «rosso» = il vestito del RICETTARIO, e solo suo (scelto da lui l'8/8:
   * «il rosso in palette con l'app, coi bottoni dorati»). Terracotta pieno
   * come fondo di pagina — la mossa delle pagine food dell'app grande —
   * schede chiare sopra, e il marchio originale sulla sua targa cashmere,
   * perché sul rosso sparirebbe e la versione svuotata non si usa.
   */
  fondo = "cashmere",
  /**
   * QUALE DEI TRE MARCHI va in testa a questa schermata (scelta sua, 9/8):
   * · «intero» = MONO Bottega Gastronomica — dice CHI SIAMO
   * · «piatto» = forchetta e cucchiaio — dice CUCINA (il Diario)
   * · «sorriso» = la M che sorride — dice TI STO PARLANDO (i Bilanci)
   * Non è decorazione: sono tre marchi veri, e ognuno ha il suo mestiere.
   */
  marchio = "intero",
  /**
   * Toglie del tutto la fascia in cima (marchio + titolo + sottotitolo).
   * Serve alla scheda MONO, dove sotto c'è già il marchio grande nella sua
   * carta: due marchi uno sull'altro erano solo un doppione.
   */
  senzaIntestazione = false,
}: {
  titolo: string;
  sottotitolo?: string;
  children: ReactNode;
  azione?: ReactNode;
  intestazione?: ReactNode;
  marchioGrande?: boolean;
  fondo?: "cashmere" | "rosso";
  marchio?: "intero" | "piatto" | "sorriso" | "convivium";
  senzaIntestazione?: boolean;
}) {
  const percorso = useRouterState({ select: (s) => s.location.pathname });

  /**
   * TEMA UNICO — deciso il 4/8. Cashmere di fondo, verde bosco come accento.
   *
   * 🔑 L'interruttore chiaro/scuro è stato tolto di proposito: un marchio non
   * chiede a chi lo usa di scegliersi il vestito. Due temi volevano dire due
   * app da curare, e nessuna delle due curata fino in fondo.
   * ⚠️ Il campo `tema` resta nel salvataggio per non rompere i backup già fatti.
   */
  const tema = "chiaro" as const;

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const rosso = fondo === "rosso";

  /* Il file e l'altezza del marchio di questa schermata. Il piatto è quadrato
     e il sorriso quasi: alla stessa altezza del marchio intero peserebbero
     troppo, quindi stanno più bassi — è la stessa presenza, non la stessa
     misura. */
  const marchi = {
    intero: { file: "mono-orizzontale", alto: "h-[68px]" },
    piatto: { file: "mono-monogramma", alto: "h-[54px]" },
    sorriso: { file: "mono-sorriso", alto: "h-[52px]" },
    /* Il cuore di posate del progetto sociale. È largo e basso: alla misura
       degli altri diventerebbe un puntino, per questo sta più alto. */
    convivium: { file: "mono-convivium", alto: "h-[58px]" },
  } as const;
  const scelto = marchi[marchio];

  return (
    <div
      /* `min-h-dvh` e non `min-h-screen`: su iPhone `100vh` conta anche la
         striscia degli strumenti di Safari, che compare e sparisce mentre si
         scorre — la pagina risultava sempre un dito più alta dello schermo e
         ballava. `dvh` è l'altezza vera, quella che si vede adesso. */
      className="min-h-dvh"
      style={{ backgroundColor: rosso ? "var(--azione-scheda)" : "var(--color-background)" }}
    >
      <div className="respiro-alto mx-auto w-full max-w-md respiro-basso px-4">
        <header className={senzaIntestazione ? "" : "mb-5"}>
          {senzaIntestazione ? null : intestazione ? (
            <div className="flex items-start justify-between gap-3">
              {intestazione}
              {azione}
            </div>
          ) : (
            <>
              {/**
               * IL MARCHIO INTERO, BEN IN VISTA — chiesto il 5/8/2026.
               *
               * Prima qui c'era solo la M col sorriso alta 36 px accanto al
               * titolo: il marchio c'era ma le parole «Bottega Gastronomica»
               * no, e a quella misura non si sarebbero lette comunque.
               * 🔑 Alto 56 px la scritta si legge davvero: sotto questa misura
               * il marchio non è discreto, è illeggibile — e un marchio che
               * non si legge non sta dicendo niente a nessuno.
               * Il sorriso non si ripete qui sotto: è già dentro questo.
               */}
              <div
                className={`mb-4 flex justify-center ${
                  rosso ? "border-b border-[rgba(244,236,221,0.28)]" : "border-b border-border"
                } ${marchioGrande ? "pb-5" : "pb-4"}`}
              >
                {/* Il marchio è SEMPRE l'originale e sta SEMPRE sulla sua targa
                    cashmere: dal 9/8 il fondo è verde bosco, e prima era il
                    solo ricettario rosso ad averne bisogno. Misura: 68 px
                    (era 56, allargato su sua richiesta — sotto quella misura
                    «Bottega Gastronomica» non si legge). */}
                <span className={`targa ${marchioGrande ? "w-[82%] max-w-[300px]" : ""}`}>
                  <img
                    src={`${import.meta.env.BASE_URL}marchio/${scelto.file}.svg`}
                    alt="MONO — Bottega Gastronomica"
                    className={marchioGrande ? "w-full" : `${scelto.alto} w-auto`}
                  />
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1
                    className={`truncate text-3xl leading-none ${rosso ? "text-[var(--azione-testo)]" : ""}`}
                  >
                    {titolo}
                  </h1>
                  {sottotitolo && (
                    <p
                      className={`mt-1.5 truncate text-sm ${
                        rosso ? "text-[var(--secondario-su-pieno)]" : "text-muted-foreground"
                      }`}
                    >
                      {sottotitolo}
                    </p>
                  )}
                </div>
                {azione}
              </div>
            </>
          )}
        </header>

        {/* ⚠️ In CIMA, sopra tutto il resto: un avviso in fondo alla pagina è un
            avviso che nessuno legge. C'è solo quando c'è davvero una versione
            nuova da prendere. */}
        <AvvisoVersione />

        {children}

        {/* La firma, in fondo a OGNI schermata. Discreta, ma sempre lì: è così
            che un marchio si posa addosso a chi usa una cosa tutti i giorni.
            Sul rosso il monogramma scuro non si vede: resta la sola scritta.
            ⚠️ 8/8: era alto 16 px e al 70% di opacità — cioè un marchio
            sbiadito grande come una virgola, che è come non metterlo. Ora è
            alto 26 px e pieno: si riconosce senza avvicinare il telefono. */}
        <p
          className={`mt-8 flex items-center justify-center gap-2 text-[11px] tracking-wide ${
            rosso ? "text-[var(--secondario-su-pieno)]" : "text-muted-foreground"
          }`}
        >
          {!rosso && (
            <img
              src={`${import.meta.env.BASE_URL}marchio/mono-monogramma.svg`}
              alt=""
              aria-hidden="true"
              className="h-[26px] w-auto"
            />
          )}
          MONO · Bottega Gastronomica · Torino
        </p>

        {/* Sotto la firma, su ogni schermata: che versione hai in mano e il
            tocco per controllare. È la risposta alla domanda «ma ce l'ho
            l'ultima?», che prima non aveva nessun posto dove essere fatta. */}
        <RigaVersione chiara={rosso} />
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <ul className="mx-auto flex max-w-md items-end justify-between px-3 py-1.5">
          {voci.map((voce) => {
            const { to, etichetta } = voce;
            /* ⚠️ Il ricettario NON accende più la Spesa: dal 17/8 ha la sua
               linguetta. Restano appoggiate a «Soldi» solo Diario e Bilanci,
               che vivono davvero dentro quella pagina — se no uno ci entra e
               la barra non gli dice più dov'è. */
            const attivo =
              percorso === to ||
              (to === "/ricette" && percorso.startsWith("/ricette")) ||
              (to === "/" && (percorso === "/diario" || percorso === "/anno"));
            if (voce.centro) {
              return (
                <li key={to} className="-mt-7">
                  <Link
                    to={to}
                    aria-label="Convivium"
                    /**
                     * IL CUORE AL CENTRO — il posto più importante della barra.
                     * Terracotta pieno, come tutte le cose che si toccano.
                     * ⚠️ Dentro non c'è un'icona qualunque ma il **marchio
                     * vero** del progetto (il cuore di posate), e sta sul suo
                     * dischetto cashmere: sul terracotta, da solo, sparirebbe —
                     * e la versione svuotata del marchio non si usa. È la
                     * stessa regola della M col sorriso sul bottone del
                     * microfono.
                     */
                    className="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-full bg-[var(--azione-scheda)] text-[var(--azione-testo)] shadow-rialzata"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--cashmere)]">
                      <img
                        src={`${import.meta.env.BASE_URL}marchio/mono-convivium.svg`}
                        alt=""
                        aria-hidden="true"
                        className="h-6 w-auto"
                      />
                    </span>
                    <span className="text-[8px] font-bold tracking-[0.08em]">
                      {etichetta.toUpperCase()}
                    </span>
                  </Link>
                </li>
              );
            }
            return (
              <li key={to}>
                <Link
                  to={to}
                  /**
                   * ⚠️ TERRACOTTA FISSO, ORO QUANDO SEI LÌ — sua correzione del
                   * 9/8, ed era un difetto vero: prima le voci spente usavano
                   * `text-muted-foreground`, che col vestito verde è diventato
                   * CHIARO. Ma questa barra è cashmere, non verde: chiaro su
                   * chiaro, e i nomi delle schermate erano spariti.
                   * 🔑 L'ORO STA NEL FONDO, NON NEL TESTO. Provato prima come
                   * testo: sul cashmere l'oro chiaro dà 2,08:1 (invisibile) e
                   * l'unico oro leggibile è così profondo da virare al bronzo,
                   * che accanto al terracotta delle altre voci non si distingue
                   * — cioè non si capiva più dove sei. Come pillola piena
                   * l'oro è quello vero, e il testo scuro sopra si legge.
                   */
                  className={`tocco flex-col gap-1 rounded-2xl px-2 text-[11px] ${
                    attivo
                      ? "bg-[var(--oro)] font-semibold text-[var(--oro-foreground)]"
                      : "text-[var(--azione-scheda)]"
                  }`}
                >
                  <voce.Icona className="h-5 w-5" />
                  {etichetta}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
