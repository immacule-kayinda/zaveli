import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-start px-5 py-24">
      <p className="text-xs tracking-[0.2em] text-clay uppercase">Introuvable</p>
      <h1 className="font-display mt-4 text-4xl text-ink sm:text-5xl">Cette page n&apos;est pas dans la collection.</h1>
      <p className="mt-4 text-muted">Le lien a peut-être changé. La boutique, elle, est toujours là.</p>
      <Button href="/" className="mt-8">
        Retour à l&apos;accueil
      </Button>
    </div>
  );
}
