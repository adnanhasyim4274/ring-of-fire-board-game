"use client";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "safe";

const variants: Record<Variant, string> = {
  primary: "bg-lava text-white hover:brightness-110 shadow-md",
  safe: "bg-safe text-white hover:brightness-110 shadow-md",
  secondary: "bg-white text-foreground border-2 border-zinc-300 hover:border-zinc-400",
  danger: "bg-red-600 text-white hover:brightness-110",
  ghost: "bg-transparent text-foreground hover:bg-zinc-900/5",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={cn(
        "min-h-11 rounded-xl px-4 py-2 font-bold transition-all active:scale-95",
        "disabled:opacity-40 disabled:pointer-events-none",
        variants[variant],
        className
      )}
    />
  );
}
