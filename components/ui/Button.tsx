import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-clay text-paper shadow-[inset_0_1px_0_rgba(255,251,247,0.28)] hover:bg-clay-deep active:bg-clay-deep",
  secondary: "bg-sand text-cocoa hover:bg-blush active:bg-blush",
  outline:
    "border border-cocoa/15 bg-paper text-cocoa hover:border-clay hover:text-clay-deep active:bg-sand",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3.5 py-1.5 text-sm",
  md: "min-h-11 px-5 py-2.5 text-[0.95rem]",
  lg: "min-h-12 px-6 py-3 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-center font-medium leading-snug tracking-wide transition duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay disabled:pointer-events-none disabled:opacity-45 active:translate-y-px touch-manipulation";

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonProps = Common &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type LinkProps = Common &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> & {
    href: string;
  };

function isLink(props: ButtonProps | LinkProps): props is LinkProps {
  return typeof props.href === "string";
}

export function Button(props: ButtonProps | LinkProps) {
  const variant = props.variant ?? "primary";
  const size = props.size ?? "md";
  const className = cn(base, variants[variant], sizes[size], props.className);

  if (isLink(props)) {
    return (
      <a className={className} {...withoutPresentation(props)}>
        {props.children}
      </a>
    );
  }

  const buttonProps = withoutPresentation(props);
  return (
    <button className={className} {...buttonProps} type={buttonProps.type ?? "button"}>
      {props.children}
    </button>
  );
}

function withoutPresentation<T extends Common>(props: T): Omit<T, keyof Common> {
  const rest = { ...props };
  delete rest.variant;
  delete rest.size;
  delete rest.className;
  delete rest.children;
  return rest;
}
