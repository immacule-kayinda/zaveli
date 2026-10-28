import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  hint?: string;
  error?: string;
  name?: string;
  disabled?: boolean;
  density?: "comfortable" | "compact";
  className?: string;
};

export function Select({
  id,
  label,
  value,
  onValueChange,
  options,
  hint,
  error,
  name,
  disabled,
  density = "comfortable",
  className,
}: SelectProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-cocoa">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => onValueChange(event.target.value)}
          className={cn(
            "w-full appearance-none rounded-2xl border border-line bg-paper pr-10 pl-4 text-ink transition-colors duration-200 outline-none",
            "focus:border-clay focus:shadow-[0_0_0_4px_rgba(162,78,52,0.12)]",
            "disabled:cursor-not-allowed disabled:opacity-60",
            density === "compact" ? "h-10 text-sm" : "h-12",
            error && "border-clay",
          )}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
        />
      </div>
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
