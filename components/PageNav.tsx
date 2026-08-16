"use client";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { cn } from "@/lib/utils";

/**
 * Playtest note: "the How to Play part feels too long and there is no guide or
 * table of contents". This is that table of contents, built once so any long
 * page can take it.
 */
export interface PageNavItem {
  /** The `id` of the section this entry jumps to. */
  id: string;
  /**
   * A short label. Full section headings are too long for the phone rail, so
   * the caller passes a trimmed version.
   */
  label: string;
}

/**
 * The nav's own chrome strings. They live beside the only component that shows
 * them, the same way `lib/reference.ts` keeps the reference screens' labels: no
 * string is written inline in JSX.
 */
export const PAGE_NAV_LABELS = {
  heading: "On this page",
  navLabel: "Sections of this page",
} as const;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * A section can be a collapsed `<details>`, or can hold one. Jumping to it has
 * to open the drawer first, otherwise the nav scrolls to a closed lid and the
 * reader thinks the link is broken.
 */
function revealSection(section: HTMLElement) {
  let box = section.closest("details");
  while (box) {
    box.open = true;
    box = box.parentElement?.closest("details") ?? null;
  }
  section.querySelectorAll("details").forEach((inner) => {
    inner.open = true;
  });
}

/**
 * An in-page table of contents.
 *
 * Phone: one line of chips that scrolls sideways, pinned under the top edge.
 * A collapsed list would cost a tap before it says anything and would then
 * cover the text it is meant to lead you into; the rail is always readable,
 * always says where you are, and costs about 50px of height.
 *
 * Tablet and desktop: the same list turned into a sticky rail in the side
 * column, which is otherwise dead margin at that width.
 *
 * Every entry is a real `<a href="#id">`, so it works with the keyboard, with a
 * screen reader and with JavaScript off. The click handler only takes over to
 * honour `prefers-reduced-motion` and to open collapsed sections.
 *
 * `items` must be a stable reference (declare it at module scope): the
 * observer is torn down and rebuilt whenever it changes. Each target section
 * should carry `tabIndex={-1}` so focus can follow the jump.
 */
export function PageNav({
  items,
  className,
}: {
  items: PageNavItem[];
  className?: string;
}) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const railRef = useRef<HTMLUListElement>(null);

  // Which section is in view. setState happens inside the observer callback,
  // never in the effect body.
  useEffect(() => {
    const ids = items.map((item) => item.id);
    const onScreen = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onScreen.add(entry.target.id);
          else onScreen.delete(entry.target.id);
        }
        // The topmost section still in the band wins, so the highlight never
        // jumps backwards while you read downwards.
        const first = ids.find((id) => onScreen.has(id));
        if (first) setActiveId(first);
      },
      // A band just under the sticky rail, so a heading counts as "current"
      // when it reaches reading height rather than when it grazes the bottom.
      { rootMargin: "-96px 0px -60% 0px", threshold: 0 }
    );

    for (const id of ids) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, [items]);

  // Keep the active chip inside the phone rail. Scrolling the rail itself
  // rather than calling scrollIntoView means the page does not move with it.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    if (rail.scrollWidth <= rail.clientWidth) return;
    const chip = rail.querySelector<HTMLElement>(`[data-nav-id="${activeId}"]`);
    if (!chip) return;
    rail.scrollTo({
      left: chip.offsetLeft - (rail.clientWidth - chip.clientWidth) / 2,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [activeId]);

  // Landing on the page with a hash that points inside a collapsed section.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const section = document.getElementById(hash);
    if (!section) return;
    revealSection(section);
    section.scrollIntoView({ behavior: "auto", block: "start" });
  }, []);

  function jumpTo(event: MouseEvent<HTMLAnchorElement>, sectionId: string) {
    // Let the browser handle "open in a new tab" and friends.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const section = document.getElementById(sectionId);
    if (!section) return;
    event.preventDefault();
    revealSection(section);
    section.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
    // Keep the address bar honest, and move focus so a keyboard or screen
    // reader user carries on from the section, not from the top of the page.
    window.history.replaceState(null, "", `#${sectionId}`);
    section.focus({ preventScroll: true });
  }

  if (items.length === 0) return null;

  return (
    <nav
      aria-label={PAGE_NAV_LABELS.navLabel}
      className={cn(
        "sticky top-0 z-20 -mx-4 mb-4 border-b-2 border-zinc-200 bg-background/95 px-4 py-2 backdrop-blur",
        "lg:top-6 lg:mx-0 lg:mb-0 lg:border-b-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none",
        className
      )}
    >
      <h2 className="mb-2 hidden text-[11px] font-black uppercase tracking-widest text-zinc-400 lg:block">
        {PAGE_NAV_LABELS.heading}
      </h2>
      <ul
        ref={railRef}
        className={cn(
          "relative flex gap-1.5 overflow-x-auto pb-1",
          "lg:flex-col lg:gap-0 lg:overflow-visible lg:border-l-2 lg:border-zinc-200 lg:pb-0"
        )}
      >
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id} className="shrink-0 lg:-ml-0.5 lg:shrink">
              <a
                href={`#${item.id}`}
                data-nav-id={item.id}
                aria-current={active ? "location" : undefined}
                onClick={(event) => jumpTo(event, item.id)}
                className={cn(
                  "flex min-h-9 items-center whitespace-nowrap rounded-full border-2 px-3 text-[12px] font-bold transition",
                  "lg:min-h-0 lg:whitespace-normal lg:rounded-none lg:border-0 lg:border-l-2 lg:py-1.5 lg:text-[13px] lg:leading-snug",
                  "motion-reduce:transition-none",
                  active
                    ? "border-lava bg-lava text-white lg:bg-transparent lg:text-lava"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 lg:bg-transparent lg:text-zinc-500 lg:hover:text-zinc-900"
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
