"use client";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { ART } from "@/data/artManifest";
import { Modal } from "@/components/ui/Modal";
import { PrintedImageOr } from "@/components/cards/PrintedCard";
import { en as id } from "@/lib/i18n/en";
import {
  COMPONENTS,
  REFERENCE_LABELS,
  TERMS,
  type ComponentGroup,
  type TermGroup,
} from "@/lib/reference";
import { cn } from "@/lib/utils";

/**
 * Playtesters asked for "a list explaining all the cards and items in the game"
 * and said the technical terms needed plainer explanations. The How to Play
 * page carries the same content, but nobody leaves the board mid-round to go
 * and read it — so it is also a modal that opens over the game.
 *
 * Open/close only, deliberately: unlike the tutorial there is nothing to
 * remember between sessions, so the shape mirrors `useTutorial` without the
 * "seen" storage.
 */
export function useReference() {
  const [open, setOpen] = useState(false);
  const dismiss = () => setOpen(false);
  return { open, setOpen, dismiss };
}

function matches(haystack: string[], needle: string): boolean {
  if (!needle) return true;
  const hay = haystack.join(" ").toLowerCase();
  return needle
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => hay.includes(word));
}

function filterComponents(query: string): ComponentGroup[] {
  return COMPONENTS.map((group) => ({
    ...group,
    items: group.items.filter((c) => matches([c.name, c.count, c.what, c.use], query)),
  })).filter((group) => group.items.length > 0);
}

function filterTerms(query: string): TermGroup[] {
  return TERMS.map((group) => ({
    ...group,
    terms: group.terms.filter((t) => matches([t.term, t.definition], query)),
  })).filter((group) => group.terms.length > 0);
}

const GROUP_HEADING = "text-sm font-black uppercase tracking-wide";

/**
 * The printed piece for each component in the list, so "Verdict tokens" is
 * answered by the token the player is looking for in the box rather than by a
 * paragraph about it. Keyed by `ReferenceComponent.id` from `lib/reference.ts`.
 *
 * Only pieces whose artwork is unambiguous are here. Missing on purpose:
 *   - News cards. Thirteen of the fourteen printed fronts belong to no card in
 *     data/, and the one that does maps (`news_vis_02`) prints a pre-v3 target
 *     sector, so using it as the picture of "a News card" would teach a rule
 *     that is no longer true. See lib/newsArt.ts.
 *   - Evidence, Chaos and Reward cards, Guardian pawns, Villager tokens and the
 *     Crisis Token. The illustrator has not drawn these yet.
 * Every entry is decorative: the name, the count and both paragraphs are the
 * content, and they render unchanged when there is no art or it fails to load.
 */
const COMPONENT_ART: Record<string, { srcs: string[]; thumbClass: string }> = {
  hex_tiles: { srcs: [ART.boardMap], thumbClass: "h-14 w-auto rounded-md" },
  terrain_tiles: {
    srcs: [ART.tile.island.normal, ART.tile.snow.normal, ART.tile.volcano.normal],
    thumbClass: "h-7 w-auto",
  },
  sea_lane_tiles: { srcs: [ART.tile.sea.normal], thumbClass: "h-10 w-auto" },
  damage_markers: { srcs: [ART.tile.volcano.destroyed], thumbClass: "h-10 w-auto" },
  role_cards: {
    srcs: [ART.roleCard.sumatran_tiger, ART.roleCard.back],
    thumbClass: "h-11 w-auto rounded-[3px] shadow-sm",
  },
  disaster_cards: {
    srcs: [ART.disasterCard.dis_vol_01, ART.disasterCard.back],
    thumbClass: "h-11 w-auto rounded-[3px] shadow-sm",
  },
  ap_tokens: { srcs: [ART.token.action_point], thumbClass: "h-9 w-auto" },
  verdict_tokens: {
    srcs: [ART.token.verdict_fact, ART.token.verdict_hoax, ART.token.verdict_abstain],
    thumbClass: "h-7 w-auto",
  },
  panic_meter: { srcs: [ART.panicMeter], thumbClass: "h-16 w-auto" },
  reputation_track: { srcs: [ART.token.reputation_point], thumbClass: "h-9 w-auto" },
};

/**
 * The group title sits under the modal's own h2 in one place and under the How
 * to Play page's section h2 in the other, so the caller says which level keeps
 * the outline unbroken.
 */
function GroupTitle({
  level,
  className,
  children,
}: {
  level: 3 | 4;
  className: string;
  children: string;
}) {
  return level === 4 ? (
    <h4 className={className}>{children}</h4>
  ) : (
    <h3 className={className}>{children}</h3>
  );
}

/** One component group. Exported so the How to Play page shows the same list. */
export function ComponentGroupBlock({
  group,
  headingClass = "text-lava",
  level = 3,
}: {
  group: ComponentGroup;
  headingClass?: string;
  level?: 3 | 4;
}) {
  return (
    <section>
      <GroupTitle level={level} className={cn(GROUP_HEADING, headingClass)}>
        {group.title}
      </GroupTitle>
      <ul className="mt-1.5 space-y-2">
        {group.items.map((c) => {
          const art = COMPONENT_ART[c.id];
          return (
            <li
              key={c.id}
              className="flex gap-2.5 rounded-xl border-2 border-zinc-200 bg-white p-2.5"
            >
              {art && (
                /* A narrow fixed column, so the text keeps a readable measure
                   next to it at 375px and the pieces stay recognisable rather
                   than filling the row. */
                <div className="flex w-16 shrink-0 flex-wrap items-center justify-center gap-1 self-start">
                  {art.srcs.map((src) => (
                    <PrintedImageOr key={src} src={src} className={art.thumbClass} />
                  ))}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-sm font-black">{c.name}</span>
                  <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] font-bold text-zinc-600">
                    {c.count}
                  </span>
                </p>
                <p className="mt-1 text-[12px] leading-snug text-zinc-700">{c.what}</p>
                <p className="mt-1 text-[12px] leading-snug text-zinc-600">
                  <b className="text-zinc-500">{REFERENCE_LABELS.useLabel}</b> · {c.use}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** One glossary group. Exported so the How to Play page shows the same list. */
export function TermGroupBlock({
  group,
  headingClass = "text-lava",
  level = 3,
}: {
  group: TermGroup;
  headingClass?: string;
  level?: 3 | 4;
}) {
  return (
    <section>
      <GroupTitle level={level} className={cn(GROUP_HEADING, headingClass)}>
        {group.title}
      </GroupTitle>
      <p className="mt-0.5 text-[12px] leading-snug text-zinc-500">{group.blurb}</p>
      <dl className="mt-1.5 space-y-2">
        {group.terms.map((t) => (
          <div key={t.id} className="rounded-xl border-l-4 border-zinc-300 bg-white py-1.5 pl-2.5">
            <dt className="text-sm font-black">{t.term}</dt>
            <dd className="mt-0.5 text-[12px] leading-snug text-zinc-700">{t.definition}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ReferenceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");

  const componentGroups = filterComponents(query);
  const termGroups = filterTerms(query);
  const hits =
    componentGroups.reduce((n, g) => n + g.items.length, 0) +
    termGroups.reduce((n, g) => n + g.terms.length, 0);

  return (
    <Modal open={open} size="lg" onClose={onClose}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold leading-tight text-stone-900">
            {id.feedback.reference}
          </h2>
          <p className="mt-1 text-[13px] leading-snug text-stone-600">
            {id.feedback.referenceHint}
          </p>
        </div>
        <button
          type="button"
          aria-label={id.common.close}
          onClick={onClose}
          className="rounded-lg p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
        >
          <X size={18} />
        </button>
      </div>

      {/* Sticky so the filter stays reachable on a phone-height panel. */}
      <div className="sticky top-0 z-10 -mx-1 mt-3 bg-white px-1 pb-2 pt-1">
        <div className="flex items-center gap-2 rounded-xl border-2 border-zinc-300 bg-white px-2.5 focus-within:border-lava">
          <Search size={16} className="shrink-0 text-zinc-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={REFERENCE_LABELS.searchLabel}
            placeholder={REFERENCE_LABELS.searchPlaceholder}
            className="min-h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
          />
          {query ? (
            <button
              type="button"
              aria-label={REFERENCE_LABELS.clearSearch}
              onClick={() => setQuery("")}
              className="rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>
        {query ? (
          <p className="mt-1 px-1 text-[11px] font-bold text-zinc-500" aria-live="polite">
            {hits} {REFERENCE_LABELS.resultCount}
          </p>
        ) : null}
      </div>

      {hits === 0 ? (
        <p className="rounded-xl bg-zinc-100 p-3 text-[13px] font-bold text-zinc-600">
          {REFERENCE_LABELS.noResults}
        </p>
      ) : (
        <div className="space-y-5">
          {componentGroups.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                {REFERENCE_LABELS.componentsHeading}
              </h3>
              {componentGroups.map((group) => (
                <ComponentGroupBlock key={group.id} group={group} level={4} />
              ))}
            </div>
          )}
          {termGroups.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                {REFERENCE_LABELS.termsHeading}
              </h3>
              {termGroups.map((group) => (
                <TermGroupBlock key={group.id} group={group} level={4} />
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
