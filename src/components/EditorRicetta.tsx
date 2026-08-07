/**
 * L'EDITOR DELLA RICETTA — dove il Salato si scrive da solo.
 *
 * Nome, ingredienti, passi. Ogni sezione ha la voce (una riga per volta,
 * trascrizione viva) e la mano (il campo «oppure scrivi»). Ogni riga ha la
 * sua ×: si sbaglia una riga, non si riparte da capo.
 *
 * ⚠️ Niente si salva finché non tocchi «Salva la ricetta»: la regola
 * dell'app — mai salvare senza conferma — vale anche in cucina.
 */
import { Check, X } from "lucide-react";
import { useState } from "react";

import { interpretaIngrediente, interpretaPasso } from "@/lib/cucina";
import { azioni, type Ricetta } from "@/lib/store";

import { DettaturaRiga } from "./DettaturaRiga";

const ETICH = "text-[10px] font-bold tracking-[0.14em] text-[#EDD9AC] uppercase";

export function EditorRicetta({ esistente, onFine }: { esistente?: Ricetta; onFine: () => void }) {
  const [nome, setNome] = useState(esistente?.nome ?? "");
  const [ingredienti, setIngredienti] = useState<string[]>(esistente?.ingredienti ?? []);
  const [passi, setPassi] = useState<string[]>(esistente?.passi ?? []);
  const [eliminaArmato, setEliminaArmato] = useState(false);

  const pronta = nome.trim().length >= 2 && (ingredienti.length > 0 || passi.length > 0);

  function salva() {
    if (!pronta) return;
    navigator.vibrate?.(35);
    if (esistente) {
      azioni.ricettaAggiorna(esistente.id, { nome: nome.trim(), ingredienti, passi });
    } else {
      azioni.ricettaNuova({ nome: nome.trim(), ingredienti, passi });
    }
    onFine();
  }

  return (
    <div>
      <p className={`mt-1 ${ETICH}`}>Nome</p>
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Pasta e fagioli della nonna"
        aria-label="Nome della ricetta"
        className="tocco mt-1 w-full rounded-2xl border border-[rgba(140,63,34,0.35)] bg-card-soft px-4 text-base font-semibold"
      />

      <p className={`mt-4 ${ETICH}`}>Ingredienti</p>
      {ingredienti.length > 0 && (
        <ul className="scheda-tenue mt-1.5">
          {ingredienti.map((r, i) => (
            <li
              key={`${i}-${r}`}
              className="flex items-center gap-2.5 border-b border-[#F0E8D5] px-3.5 py-2 text-sm last:border-0"
            >
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-oro" />
              <span className="min-w-0 flex-1">{r}</span>
              <button
                type="button"
                aria-label={`Togli ${r}`}
                onClick={() => setIngredienti((l) => l.filter((_, k) => k !== i))}
                className="tocco -my-2 rounded-full text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <DettaturaRiga
        etichetta="Dì un ingrediente"
        esempio="Tocchi e dici «trecento grammi di fagioli» → la riga si scrive da sola."
        segnaposto="oppure scrivi: 2 carote"
        interpreta={interpretaIngrediente}
        onRiga={(r) => setIngredienti((l) => [...l, r])}
      />

      <p className={`mt-5 ${ETICH}`}>Procedimento</p>
      {passi.length > 0 && (
        <ol className="scheda-tenue mt-1.5">
          {passi.map((p, i) => (
            <li
              key={`${i}-${p}`}
              className="flex gap-2.5 border-b border-[#F0E8D5] px-3.5 py-2 text-sm last:border-0"
            >
              <span className="numero shrink-0 font-bold text-[var(--azione-scheda)]">{i + 1}</span>
              <span className="min-w-0 flex-1 leading-relaxed">{p}</span>
              <button
                type="button"
                aria-label={`Togli il passo ${i + 1}`}
                onClick={() => setPassi((l) => l.filter((_, k) => k !== i))}
                className="tocco -my-2 self-center rounded-full text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ol>
      )}
      <DettaturaRiga
        etichetta="Dì un passo"
        esempio="Un passo per volta: «metti a bagno i fagioli la sera prima»."
        segnaposto="oppure scrivi il passo"
        interpreta={interpretaPasso}
        onRiga={(p) => setPassi((l) => [...l, p])}
      />

      <button
        type="button"
        onClick={salva}
        disabled={!pronta}
        className="tocco mt-6 w-full gap-2 rounded-2xl bg-oro px-4 text-base font-bold text-oro-foreground shadow-rialzata disabled:opacity-50"
      >
        <Check className="h-5 w-5" /> Salva la ricetta
      </button>
      {!pronta && (
        <p className="mt-1.5 text-center text-[11px] text-[rgba(244,236,221,0.8)]">
          Serve il nome, e almeno un ingrediente o un passo.
        </p>
      )}

      {esistente && (
        /* Eliminare è un gesto raro: due tocchi, col secondo che dice chiaro
           cosa sta per succedere. Niente finestre che saltano addosso. */
        <button
          type="button"
          onClick={() => {
            if (!eliminaArmato) {
              setEliminaArmato(true);
              return;
            }
            azioni.ricettaElimina(esistente.id);
            onFine();
          }}
          className={`tocco mt-3 w-full rounded-2xl border px-4 text-sm font-semibold ${
            eliminaArmato
              ? "border-[rgba(244,236,221,0.9)] bg-[rgba(244,236,221,0.14)] text-[var(--azione-testo)]"
              : "border-[rgba(244,236,221,0.4)] text-[rgba(244,236,221,0.85)]"
          }`}
        >
          {eliminaArmato ? "Sicuro? Tocca ancora e la elimino" : "Elimina questa ricetta"}
        </button>
      )}
    </div>
  );
}
