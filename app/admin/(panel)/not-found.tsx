import { Button } from "@/components/ui/Button";

export default function AdminNotFound() {
  return (
    <section className="max-w-lg">
      <p className="text-xs tracking-[0.2em] text-clay uppercase">Introuvable</p>
      <h1 className="font-display mt-3 text-4xl text-ink">Cette pièce n&apos;est plus dans la collection.</h1>
      <Button href="/admin" className="mt-8">
        Retour à la liste
      </Button>
    </section>
  );
}
