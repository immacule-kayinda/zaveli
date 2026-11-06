import { Truck } from "lucide-react";

export function AnnouncementBar({ text }: { text: string }) {
  return (
    <div className="fixed inset-x-0 top-0 z-40 h-[var(--banner-h)] bg-cocoa text-paper">
      <p className="mx-auto flex h-full max-w-6xl items-center justify-center gap-2 px-4 text-[0.78rem] tracking-wide sm:gap-3 sm:text-sm">
        <Truck aria-hidden className="size-3.5 shrink-0 text-blush sm:size-4" />
        <span className="truncate">{text}</span>
      </p>
    </div>
  );
}
