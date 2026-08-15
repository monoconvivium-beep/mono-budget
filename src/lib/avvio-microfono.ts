/**
 * QUESTO TELEFONO SA ACCENDERE IL MICROFONO DA SOLO?
 *
 * 🔴 IL PROBLEMA (trovato il 15/8/2026). La schermata «Dillo» promette
 * «si accende da solo: parla pure», e su Android è vero. Su iPhone quasi
 * certamente no: Safari accende il microfono **solo se l'ha chiesto un dito**,
 * e una partenza automatica viene rifiutata. Il risultato sarebbe la peggiore
 * delle schermate: una promessa scritta sopra un messaggio d'errore, ogni
 * volta che uno entra.
 *
 * 🔑 PERCHÉ NON SI GUARDA IL NOME DEL TELEFONO. Si poteva scrivere «se è un
 * iPhone non provare». Ma quella è una supposizione scritta nel programma:
 * il giorno che Apple cambia idea, l'iPhone resta zoppo per sempre e nessuno
 * se ne accorge. E se domani anche un Android si mettesse a rifiutare,
 * mostrerebbe l'errore lo stesso.
 *
 * Quindi l'app **prova e impara**: la prima volta ci prova davvero; se il
 * telefono rifiuta una partenza non chiesta da un dito, se lo segna e da lì
 * in poi mostra semplicemente «tocca il cerchio e parla» — che è vero, non è
 * un errore, e funziona.
 *
 * ⚠️ Vale per telefono, non per persona: sta accanto ai dati dell'app e non
 * esce di lì, come tutto il resto.
 */
const CHIAVE = "mono-avvio-microfono";

/** L'app può ancora provare ad accendere il microfono da sola? */
export function avvioAutomaticoPossibile(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(CHIAVE) !== "no";
  } catch {
    // Navigazione privata o memoria negata: si riprova, al massimo si tocca.
    return true;
  }
}

/**
 * Questo telefono ha rifiutato la partenza automatica: non riproporgliela.
 * Si chiama SOLO quando il rifiuto arriva da un avvio che nessuno ha toccato.
 */
export function ricordaCheServeUnTocco(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHIAVE, "no");
  } catch {
    /* senza memoria si riproverà: nessun danno */
  }
}
