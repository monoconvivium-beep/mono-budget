/**
 * «Installa l'app» — un pulsante, non una caccia al tesoro.
 *
 * 🔑 Perché esiste: la strada normale per installare una web app è nascosta nel
 * menù dei tre puntini del browser, e chi non lo sa non la trova. Se l'app non
 * si installa resta una pagina fra le altre, e una pagina non la riapre nessuno.
 *
 * 🍏 **Su iPhone non si può fare in automatico, e non è un limite nostro**:
 * Apple non consente a nessun sito di far partire l'installazione. Non esiste
 * l'evento che su Android ce lo permette. L'unica cosa onesta è mostrare
 * **dove toccare**, con le parole esatte che si leggono sullo schermo.
 */
import { useEffect, useState } from "react";

/** L'evento che Chrome manda quando l'app è installabile. Non sta nei tipi standard. */
interface EventoInstallazione extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function giaInstallata(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  // Safari su iPhone usa una sua proprietà, fuori dallo standard.
  return (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function suIphone(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPod/.test(ua)) return true;
  // Dall'iPadOS 13 l'iPad si dichiara un Mac: si riconosce dal tocco.
  return /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
}

export function InstallaApp() {
  const [evento, setEvento] = useState<EventoInstallazione | null>(null);
  const [installata, setInstallata] = useState(false);
  const [iphone, setIphone] = useState(false);
  const [istruzioniAperte, setIstruzioniAperte] = useState(false);

  useEffect(() => {
    setInstallata(giaInstallata());
    setIphone(suIphone());

    const quandoInstallabile = (e: Event) => {
      // Senza questo, Chrome mostra la sua barretta in basso e la nostra scheda
      // diventa la seconda voce che dice la stessa cosa.
      e.preventDefault();
      setEvento(e as EventoInstallazione);
    };
    const quandoInstallata = () => {
      setInstallata(true);
      setEvento(null);
    };

    window.addEventListener("beforeinstallprompt", quandoInstallabile);
    window.addEventListener("appinstalled", quandoInstallata);
    return () => {
      window.removeEventListener("beforeinstallprompt", quandoInstallabile);
      window.removeEventListener("appinstalled", quandoInstallata);
    };
  }, []);

  // Già installata: qui non ci sta più niente da dire.
  if (installata) return null;

  async function installa() {
    if (!evento) return;
    await evento.prompt();
    const scelta = await evento.userChoice;
    // L'evento vale una volta sola: usato, non si ripropone.
    setEvento(null);
    if (scelta.outcome === "accepted") setInstallata(true);
  }

  /* ------------------------------------------------- Android e computer */
  if (evento) {
    return (
      <section className="scheda-azione mt-4 p-5">
        <h2 className="text-lg">Mettila sul telefono</h2>
        <p className="mt-1 text-sm opacity-85">
          Diventa un&apos;icona come le altre app: si apre con un tocco, anche senza rete.
        </p>
        <button
          type="button"
          onClick={() => void installa()}
          className="mt-4 flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-oro px-5 text-base font-semibold text-[#262321]"
        >
          Installa l&apos;app
        </button>
      </section>
    );
  }

  /* ------------------------------------------------------------ iPhone */
  if (iphone) {
    return (
      <section className="scheda-azione mt-4 p-5">
        <h2 className="text-lg">Mettila sul telefono</h2>
        <p className="mt-1 text-sm opacity-85">
          Su iPhone l&apos;installazione la deve avviare Safari: sono due tocchi.
        </p>

        {istruzioniAperte ? (
          <ol className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-oro text-sm font-bold text-[#262321]">
                1
              </span>
              <span>
                Tocca <strong>Condividi</strong> — il quadrato con la freccia che sale{" "}
                <span aria-hidden="true">⬆︎</span>, in fondo allo schermo.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-oro text-sm font-bold text-[#262321]">
                2
              </span>
              <span>
                Scorri l&apos;elenco e tocca <strong>Aggiungi a Home</strong>, poi{" "}
                <strong>Aggiungi</strong> in alto a destra.
              </span>
            </li>
          </ol>
        ) : null}

        <button
          type="button"
          onClick={() => setIstruzioniAperte((v) => !v)}
          className="mt-4 flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-oro px-5 text-base font-semibold text-[#262321]"
        >
          {istruzioniAperte ? "Ho capito, chiudi" : "Come si mette sul telefono"}
        </button>
      </section>
    );
  }

  /**
   * Nessuna delle due: o è un browser che non installa (Firefox su Android,
   * Safari sul Mac), oppure Chrome non l'ha ancora dichiarata installabile.
   * ⚠️ Qui NON si mostra un pulsante che non fa niente: un pulsante che non
   * risponde è peggio di un pulsante che non c'è.
   */
  return null;
}
