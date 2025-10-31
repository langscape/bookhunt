"use client";

import React from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
  full?: boolean;
};

export default function Button({
  className,
  children,
  variant = "primary",
  full,
  ...rest
}: Props) {
  const base = "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-violet-400/60";
  const variants = {
    primary: "bg-violet-600 text-white hover:bg-violet-500",
    outline:
      "border border-violet-400/70 text-violet-100 hover:border-violet-300 hover:text-white",
    ghost: "text-violet-200 hover:text-white hover:bg-white/5",
  } as const;
  return (
    <button className={cx(base, variants[variant], full && "w-full", className)} {...rest}>
      {children}
    </button>
  );
}
