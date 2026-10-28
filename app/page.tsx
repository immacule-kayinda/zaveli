import { CategoryEntries } from "@/components/home/CategoryEntries";
import { Hero } from "@/components/home/Hero";
import { NouveautesPreview } from "@/components/home/NouveautesPreview";
import { Reassurance } from "@/components/home/Reassurance";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Reassurance />
      <CategoryEntries />
      <NouveautesPreview />
    </>
  );
}
