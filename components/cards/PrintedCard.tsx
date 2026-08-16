"use client";
import type { ReactNode } from "react";
import { useState } from "react";

/**
 * The illustrator's printed artwork, wired up so a missing file can never take
 * a screen down with it.
 *
 * Every call site asks `usePrintedArt` for the file and gets `null` back in the
 * two cases that matter: there is no artwork for this card at all (News and
 * Evidence are largely unprinted on purpose, see `lib/newsArt.ts`), and the
 * file failed to load in the browser. Both answers are the same to the caller,
 * so each one keeps exactly one branch that renders the complete text version.
 *
 * Failure is remembered by src rather than as a boolean, so a panel that later
 * swaps to a different card gets a fresh attempt instead of staying on text
 * forever. Nothing here writes state during render or inside an effect: the
 * only setter runs from the image's own error event.
 */
export type PrintedArt = { src: string; onError: () => void };

export function usePrintedArt(src: string | undefined): PrintedArt | null {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || src === failedSrc) return null;
  return { src, onError: () => setFailedSrc(src) };
}

/**
 * Raw `img`, not `next/image`: the cards, tiles and tokens each have their own
 * aspect ratio and are already optimised webp, and `onError` is the whole point
 * of this component. Matches how the board and the turn splash draw the print.
 */
export function PrintedImage({
  art,
  className,
  alt = "",
}: {
  art: PrintedArt;
  className?: string;
  /** Leave empty when the same words are already printed next to the image. */
  alt?: string;
}) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={art.src}
      alt={alt}
      className={className}
      draggable={false}
      onError={art.onError}
    />
  );
}

/**
 * The one-liner form, for places where the fallback is a single node (an emoji,
 * an icon, or nothing at all) rather than a whole text layout.
 */
export function PrintedImageOr({
  src,
  className,
  alt = "",
  fallback = null,
}: {
  src: string | undefined;
  className?: string;
  alt?: string;
  fallback?: ReactNode;
}) {
  const art = usePrintedArt(src);
  if (!art) return <>{fallback}</>;
  return <PrintedImage art={art} className={className} alt={alt} />;
}
