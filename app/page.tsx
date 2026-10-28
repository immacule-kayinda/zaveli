import { Catalog } from "@/components/home/Catalog";
import { Hero } from "@/components/home/Hero";
import { Reassurance } from "@/components/home/Reassurance";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Reassurance />
      <Catalog />
    </>
  );
}
