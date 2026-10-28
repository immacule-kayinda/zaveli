import { MessageCircle, Shirt, Truck } from "lucide-react";

const points = [
  {
    icon: MessageCircle,
    title: "Un message, et c'est parti",
    text: "Pas de compte à créer. La commande se rédige toute seule et s'envoie sur WhatsApp.",
  },
  {
    icon: Shirt,
    title: "Taille et couleur choisies",
    text: "Chaque pièce part avec la variante que vous avez indiquée, rien n'est laissé au hasard.",
  },
  {
    icon: Truck,
    title: "Livraison confirmée",
    text: "On vérifie la disponibilité et l'on vous dit comment la pièce vous rejoint.",
  },
];

export function Reassurance() {
  return (
    <section aria-label="Pourquoi commander ici" className="border-y border-line/80 bg-paper/70">
      <ul className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-3">
        {points.map((point) => {
          const Icon = point.icon;
          return (
          <li key={point.title} className="flex gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blush/70 text-clay">
              <Icon aria-hidden className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-xl text-ink">{point.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">{point.text}</p>
            </div>
          </li>
          );
        })}
      </ul>
    </section>
  );
}
