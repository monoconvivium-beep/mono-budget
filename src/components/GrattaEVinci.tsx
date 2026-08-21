import { useCallback, useEffect, useRef, useState } from "react";

import { abbastanzaGrattata, PREMIO, PREMIO_QUANDO } from "@/lib/gratta";
import { azioni, useStato } from "@/lib/store";

/**
 * LA PATINA CHE SI GRATTA COL DITO.
 *
 * 🔑 Come funziona: sopra il premio c'è un `<canvas>` dipinto d'argento. Il
 * dito non «scopre» un'immagine — la CANCELLA davvero, con
 * `destination-out`, che è il modo in cui una gomma toglie il colore invece
 * di aggiungerne altro. Ogni tanto si contano i pixel rimasti: quando è
 * consumata per un terzo, il resto se ne va da solo.
 *
 * ⚠️ QUEL TERZO NON È UN CAPRICCIO: se si aspetta che grattino tutto, resta
 * sempre l'angolino attaccato al bordo e la gente ci litiga. Meglio togliere
 * il velo quando è chiaro che l'ha capito.
 *
 * ⚠️ E C'È SEMPRE UNA VIA SENZA DITO: chi non può grattare — mano
 * ingessata, schermo rotto, difficoltà motorie — ha il suo bottone. Un
 * regalo che si prende solo se hai la mano ferma non è un regalo.
 */
/**
 * LA TAZZINA — disegnata, non l'emoji.
 * ⚠️ L'emoji ☕ la disegna il telefono: su Windows viene viola, su Android
 * marrone, su iPhone un'altra cosa ancora. Il premio di MONO deve avere la
 * faccia di MONO su qualunque schermo — e questi sono i colori di casa,
 * terracotta e oro, col vapore che sale.
 */
function TazzinaMono() {
  return (
    <svg
      viewBox="0 0 64 56"
      role="img"
      aria-label="Un caffè"
      className="h-[42px] w-auto"
      fill="none"
    >
      {/* il vapore */}
      <path
        d="M24 13c0-4 3-4 3-7.5S24 2 24 2M32 13c0-4 3-4 3-7.5S32 2 32 2M40 13c0-4 3-4 3-7.5S40 2 40 2"
        stroke="var(--oro)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* il piattino */}
      <path d="M12 48h40" stroke="var(--azione-scheda)" strokeWidth="3.4" strokeLinecap="round" />
      {/* la tazza */}
      <path
        d="M16 20h32v12c0 7-5.5 12.5-12.5 12.5h-7C21.5 44.5 16 39 16 32V20Z"
        fill="var(--azione-scheda)"
      />
      {/* il caffè dentro */}
      <path d="M20.5 24h23v7.5c0 5-4 9-9 9h-5c-5 0-9-4-9-9V24Z" fill="#3B2A20" opacity="0.55" />
      {/* il manico */}
      <path
        d="M48 24h4.5a5.5 5.5 0 0 1 0 11H48"
        stroke="var(--azione-scheda)"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GrattaEVinci() {
  const { biglietto } = useStato();
  const rif = useRef<HTMLCanvasElement | null>(null);
  const giu = useRef(false);
  const ultimo = useRef<{ x: number; y: number } | null>(null);
  const conta = useRef(0);
  const [finito, setFinito] = useState(false);

  const scopri = useCallback(() => {
    if (finito) return;
    setFinito(true);
    azioni.gratta();
  }, [finito]);

  /* La patina si dipinge una volta sola, quando il canvas entra in pagina. */
  useEffect(() => {
    const c = rif.current;
    if (!c || finito) return;
    const larghezza = c.clientWidth;
    const altezza = c.clientHeight;
    // Il doppio dei pixel: su un telefono la patina a misura piena si vede
    // sgranata, e una patina sgranata sembra un difetto.
    const scala = Math.min(window.devicePixelRatio || 1, 2);
    c.width = larghezza * scala;
    c.height = altezza * scala;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(scala, scala);

    const g = ctx.createLinearGradient(0, 0, larghezza, altezza);
    g.addColorStop(0, "#C9C4B8");
    g.addColorStop(0.22, "#EDE9E0");
    g.addColorStop(0.45, "#B8B2A4");
    g.addColorStop(0.68, "#E4DFD4");
    g.addColorStop(1, "#C2BCAE");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, larghezza, altezza);

    // Due righe di scritta al centro: dicono cosa fare senza spiegazioni.
    ctx.fillStyle = "rgba(90,84,74,0.8)";
    ctx.textAlign = "center";
    ctx.font = "700 13px 'Bricolage Grotesque', system-ui, sans-serif";
    ctx.fillText("GRATTA QUI COL DITO", larghezza / 2, altezza / 2 + 26);
    ctx.font = "26px serif";
    ctx.fillText("👆", larghezza / 2, altezza / 2 - 4);
  }, [finito]);

  /** Quanto è stata consumata: si conta ogni tanto, non a ogni movimento. */
  const misura = useCallback(() => {
    const c = rif.current;
    if (!c) return;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    // Il conteggio vive in `lib/gratta.ts` con le sue prove: qui resta solo
    // il pezzo che tocca il canvas, che le prove non possono raggiungere.
    if (abbastanzaGrattata(ctx.getImageData(0, 0, c.width, c.height).data)) scopri();
  }, [scopri]);

  const punto = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = rif.current;
    if (!c) return null;
    const r = c.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const gratta = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!giu.current || finito) return;
    const c = rif.current;
    const p = punto(e);
    if (!c || !p) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 34;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    const da = ultimo.current ?? p;
    ctx.moveTo(da.x, da.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ultimo.current = p;

    conta.current += 1;
    // Una vibrazione ogni tanto: sotto il dito sembra la carta che si consuma.
    if (conta.current % 8 === 0) navigator.vibrate?.(8);
    if (conta.current % 12 === 0) misura();
  };

  if (!biglietto) return null;

  const vinto = biglietto.esito === "vinto";
  const scoperto = biglietto.grattato || finito;

  return (
    <section className="mt-4 overflow-hidden rounded-3xl border-2 border-[var(--oro)] bg-[linear-gradient(160deg,#3E5A43,#2E4230)] p-4 text-center text-[var(--cashmere)] shadow-rialzata">
      <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--oro)] uppercase">
        {scoperto ? (vinto ? "Hai vinto" : "Il tuo biglietto") : "Sette giorni di fila"}
      </p>

      {!scoperto && (
        <>
          <h2 className="mt-1.5 text-[21px] text-[var(--cashmere)]">Il gratta e vinci di MONO</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--secondario-su-pieno)]">
            Te lo sei guadagnato. Gratta col dito e vedi cosa c'è sotto.
          </p>
        </>
      )}

      {/* Il premio sta sotto: il canvas gli sta sopra e lo nasconde. */}
      <div className="relative mt-3 h-[132px] overflow-hidden rounded-2xl bg-[var(--carta,#F8F2E5)]">
        {/* ⚠️ `--card-foreground` e non `--foreground`: questo riquadro è
            cashmere ma sta dentro la carta verde, e il testo di fuori è
            chiaro. Col colore ereditato la scritta del biglietto perdente
            spariva — chiaro su chiaro, visto in prova. */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F8F2E5] px-3 text-[var(--card-foreground)]">
          {vinto ? (
            <>
              <TazzinaMono />
              <p className="mt-1.5 font-display text-[19px] leading-tight font-semibold text-[var(--azione-scheda)]">
                {PREMIO}
              </p>
            </>
          ) : (
            <>
              <img
                src={`${import.meta.env.BASE_URL}marchio/mono-sorriso.svg`}
                alt=""
                aria-hidden="true"
                className="h-9 w-auto opacity-45"
              />
              <p className="mt-2 text-[15px] leading-tight font-semibold">
                Non è andata, per un pelo.
              </p>
            </>
          )}
        </div>

        {!scoperto && (
          <canvas
            ref={rif}
            className="absolute inset-0 h-full w-full touch-none"
            onPointerDown={(e) => {
              giu.current = true;
              ultimo.current = punto(e);
              /* Tenersi il dito anche se esce dal riquadro. ⚠️ In try: con un
                 pointerId che il browser non riconosce questa riga tira
                 un'eccezione, e senza rete di protezione il gratta e vinci
                 morirebbe al primo tocco invece di grattarsi. */
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {
                /* pazienza: si gratta lo stesso, solo senza cattura */
              }
              gratta(e);
            }}
            onPointerMove={gratta}
            onPointerUp={() => {
              giu.current = false;
              ultimo.current = null;
              misura();
            }}
            onPointerLeave={() => {
              giu.current = false;
              ultimo.current = null;
            }}
          />
        )}
      </div>

      {scoperto ? (
        vinto ? (
          <>
            <p className="mt-3 text-[13px] leading-relaxed">
              Fai vedere questa schermata alla cassa: il caffè te lo offriamo noi.
            </p>
            <p className="mt-1.5 text-[11px] text-[var(--secondario-su-pieno)]">{PREMIO_QUANDO}</p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=45.0479194,7.6432467"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex min-h-[52px] items-center justify-center rounded-2xl bg-[var(--azione-scheda)] px-4 text-[15px] font-bold text-[var(--azione-testo)]"
            >
              Dove siamo — Via Barletta 72/D
            </a>
          </>
        ) : (
          <p className="mt-3 text-[13px] leading-relaxed text-[var(--secondario-su-pieno)]">
            Un biglietto su quattro vince il caffè, e stavolta non era il tuo. Il resto dell'app
            resta tutto tuo — e in bottega ti aspettiamo lo stesso.
          </p>
        )
      ) : (
        <button
          type="button"
          onClick={scopri}
          className="mt-3 text-[11px] text-[var(--secondario-su-pieno)] underline underline-offset-2"
        >
          Non riesco a grattare, scoprilo tu
        </button>
      )}
    </section>
  );
}
