# MONO MONEY

Il libretto delle spese da tasca. Dici **«quarantasei farmacia»** e la spesa è
scritta, messa in categoria, contata nel mese e nell'anno.

È un **regalo** che MONO — gastronomia, Torino — fa ai suoi clienti.

## Le due promesse che decidono tutto il resto

**1. I soldi restano nel telefono.** Importi, categorie e saldo non escono da
qui: nessun account, nessun server, nessuna chiamata di rete. Anche i caratteri
sono serviti da noi, perché chiamare Google significherebbe mandargli
l'indirizzo IP di ogni cliente a ogni apertura.

**2. Deve restare gratis per sempre.** Per questo non c'è nessun server da
tenere acceso: `npm run build` produce **solo file fermi**, che si mettono su un
hosting statico e restano lì. Niente da rinnovare, niente che scade.

## Comandi

```
npm install
npm run dev      # sviluppo
npm test         # le prove del parser
npm run build    # produce dist/ — solo file statici
```

## Le cose da non disfare

- **`src/lib/parse.ts` è un file puro**: niente React, niente rete. Riceve una
  frase e restituisce i movimenti. Le prove stanno accanto, in `parse.test.ts`.
- **La dettatura è «un tocco = una spesa»** (`continuous = false`). L'ascolto
  continuo è già stato provato e ha prodotto giorni di difetti: su Android il
  riconoscimento manda **lo stesso testo che cresce**, tutti i pezzi marcati
  «definitivi» dentro la stessa lista, e chi li attacca uno dietro l'altro
  scrive tre spese al posto di una. Dal computer non si riproduce: **la
  dettatura si prova dal telefono**.
- **Non trasformare mai un importo di nascosto e non salvare senza conferma.**
  L'italiano parlato scrive «quattro e sessanta» come `460`: l'app lo riconosce,
  lo dice e _propone_ la lettura in centesimi. Non la applica da sola.
- **Su iPhone il pulsante «Installa» non può esistere**: Apple non lo consente a
  nessun sito. Lì si mostrano le istruzioni, ed è il massimo possibile.
- **Quando si pubblica, cambiare `VERSIONE` in `public/sw.js`**, altrimenti i
  telefoni che hanno già l'app continuano a mostrare quella vecchia.
