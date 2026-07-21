"use client";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { en } from "@/lib/i18n/en";

export function APCounter({ ap, className }: { ap: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-sm font-extrabold text-amber-800",
        className
      )}
      aria-label={`${ap} ${en.hud.ap}`}
    >
      <Zap className="h-4 w-4 fill-amber-500 text-amber-600" />
      {ap} {en.hud.ap}
    </span>
  );
}
