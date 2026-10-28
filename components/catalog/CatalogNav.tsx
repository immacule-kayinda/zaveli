import Link from "next/link";

import { cn } from "@/lib/cn";
import { filters, type FilterId } from "@/lib/products";
import { filterHref } from "@/lib/routes";

export function CatalogNav({ active }: { active: FilterId }) {
  return (
    <nav className="mt-8 flex gap-2 overflow-x-auto pb-1" aria-label="Rayons">
      {filters.map((item) => {
        const selected = item.id === active;
        return (
          <Link
            key={item.id}
            href={filterHref(item.id)}
            aria-current={selected ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay",
              selected ? "bg-cocoa text-paper" : "bg-paper text-cocoa ring-1 ring-line hover:ring-clay",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
