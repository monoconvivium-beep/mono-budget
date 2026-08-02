import { createFileRoute } from "@tanstack/react-router";
import { Guscio } from "@/components/Guscio";
import { Dettatura } from "@/components/Dettatura";

export const Route = createFileRoute("/ascolto")({
  head: () => ({
    meta: [
      { title: "Ascolto — MONO MONEY" },
      {
        name: "description",
        content:
          "Un tocco, una spesa: dì l'importo e il posto, MONO MONEY ti mostra cosa ha capito e tu confermi.",
      },
      { property: "og:title", content: "Ascolto — MONO MONEY" },
      {
        property: "og:description",
        content: "Dettatura a tutto schermo: un tocco = una spesa, sempre con conferma.",
      },
    ],
  }),
  component: Ascolto,
});

function Ascolto() {
  return (
    <Guscio titolo="Ascolto" sottotitolo="Un tocco = una spesa">
      <Dettatura grande />

      <section className="scheda mt-4 p-4 text-sm leading-relaxed">
        <h2 className="mb-2 text-lg">Come dirlo bene</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li>
            «<strong>quarantasei farmacia</strong>» → 46,00 € in Salute.
          </li>
          <li>
            Per i centesimi dì sempre la parola euro: «
            <strong>quattro euro e sessanta caffè</strong>» → 4,60 € al Bar.
          </li>
          <li>
            Due spese insieme: «<strong>dodici supermercato e tre bar</strong>».
          </li>
          <li>Puoi aggiungere «contanti» o «carta», e dire «stipendio» per un'entrata.</li>
          <li>Il microfono funziona solo su telefono, con connessione sicura (https).</li>
        </ul>
      </section>
    </Guscio>
  );
}
