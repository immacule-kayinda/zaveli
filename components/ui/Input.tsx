import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type InputProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id">;

export function Input({ id, label, hint, error, className, ...rest }: InputProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-cocoa">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-12 w-full rounded-2xl border border-line bg-paper px-4 text-ink transition-colors duration-200 outline-none",
          "placeholder:text-muted/80 focus:border-clay focus:shadow-[0_0_0_4px_rgba(162,78,52,0.12)]",
          error && "border-clay",
          className,
        )}
        {...rest}
      />
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-clay">
          {error}
        </p>
      ) : null}
    </div>
  );
}
