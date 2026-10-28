"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  swatch?: string;
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
  onOpenChange?: (open: boolean) => void;
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
  onOpenChange,
}: SelectProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  const selected = options.find((option) => option.value === value);

  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-cocoa">
        {label}
      </label>
      <SelectPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        onOpenChange={onOpenChange}
        disabled={disabled}
        name={name}
      >
        <SelectPrimitive.Trigger
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "group flex w-full items-center justify-between gap-2 rounded-2xl border border-line bg-paper text-left text-ink transition-colors duration-200 outline-none",
            "cursor-pointer focus-visible:border-clay focus-visible:shadow-[0_0_0_4px_rgba(162,78,52,0.12)]",
            "data-[state=open]:border-clay data-[state=open]:shadow-[0_0_0_4px_rgba(162,78,52,0.12)]",
            "disabled:cursor-not-allowed disabled:opacity-60",
            density === "compact" ? "h-10 px-3 text-sm" : "h-12 px-4",
            error && "border-clay",
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selected?.swatch ? <Swatch color={selected.swatch} /> : null}
            <SelectPrimitive.Value />
          </span>
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="size-4 shrink-0 text-muted transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={6}
            collisionPadding={12}
            className={cn(
              "select-panel z-[80] max-h-60 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-line bg-paper p-1.5",
              "shadow-[0_18px_40px_-22px_rgba(74,51,44,0.55)]",
            )}
          >
            <SelectPrimitive.Viewport>
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-cocoa outline-none",
                    "data-[highlighted]:bg-sand data-[highlighted]:text-ink",
                    "data-[state=checked]:text-ink",
                    "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
                  )}
                >
                  {option.swatch ? <Swatch color={option.swatch} /> : null}
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="ml-auto text-clay">
                    <Check className="size-4" strokeWidth={2.25} />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
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

function Swatch({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="size-3.5 shrink-0 rounded-full border border-ink/10"
      style={{ backgroundColor: color }}
    />
  );
}
