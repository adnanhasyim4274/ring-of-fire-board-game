"use client";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  BookOpen,
  Boxes,
  Check,
  Gavel,
  Library,
  Map as MapIcon,
  Play,
  Search,
  Target,
  Users,
  X,
  Zap,
} from "lucide-react";
import { ART } from "@/data/artManifest";
import { roles } from "@/data/roles";
import { ringOfFireScenario } from "@/data/scenarios";
import { tileTypeById } from "@/data/tileTypes";
import { Button } from "@/components/ui/Button";
import { PHASE_ORDER } from "@/components/hud/PhaseIndicator";
import { OutcomeBanner } from "@/components/cards/OutcomeBanner";
import {
  ComponentGroupBlock,
  ReferenceModal,
  TermGroupBlock,
  useReference,
} from "@/components/ReferenceModal";
import { cn } from "@/lib/utils";
import { en as id } from "@/lib/i18n/en";
import { emojiForRole } from "@/lib/roleEmoji";
import { COMPONENTS, REFERENCE_LABELS, TERMS } from "@/lib/reference";
import { SECTOR_COLOR } from "@/lib/theme";
import { TILE_ART, type TileArtKey } from "@/lib/tileArt";
import { CENTRE, RING_RADIUS, VIEWBOX, seaLanePath, tileHexPoints } from "@/lib/ring";

const RING_SIZE = 24;
const READY_POSTS = [0, 4, 8, 12, 16, 20];
/** Normal → Cracked → Destroyed, in the order the board applies them. */
const DAMAGE_STAGES = [0, 1, 2] as const;
const SEA_LANE_ENDPOINTS: [number, number] = [0, 12];
const SECTOR_ORDER = ["sunda", "philippine", "hokkaido", "cascadia", "andes", "south_pacific"] as const;
const sectorOf = (i: number) => SECTOR_ORDER[Math.floor(i / 4) % 6];

/**
 * Playtest note: "the image for the Sea Lane tiles seems to be missing from the
 * explanation section." It was — the legend under the ring diagram drew the Sea
 * Lane as a dashed line and nothing else, and no tile showed its printed
 * painting at all. This gallery is built from `TILE_ART`, so every hex kind on
 * the board (the six sectors, the Ready Posts and the Sea Lane) is guaranteed a
 * picture: adding a key without artwork would not compile.
 */
interface TileGalleryEntry {
  key: TileArtKey;
  title: string;
  subtitle: string;
  /** Terrain names for a sector, the rules hint for a Ready Post or Sea Lane. */
  note: string;
  /** Only the sectors label their note, because only theirs is a terrain list. */
  noteLabel?: string;
  swatch: string;
  src: string;
  immune: boolean;
}

function buildTileGallery(): TileGalleryEntry[] {
  const scenario = ringOfFireScenario;
  const sectors: TileGalleryEntry[] = scenario.sectors.map((sector) => ({
    key: sector.id,
    title: sector.name,
    subtitle: sector.region,
    note: [
      ...new Set(sector.tileIndices.map((i) => tileTypeById[scenario.layout[i]].name)),
    ].join(" · "),
    noteLabel: REFERENCE_LABELS.tiles.terrainLabel,
    swatch: SECTOR_COLOR[sector.id],
    src: ART.tile[TILE_ART[sector.id]].normal,
    immune: false,
  }));

  return [
    ...sectors,
    {
      key: "ready_post",
      title: id.board.posSiaga,
      subtitle: `${scenario.readyPostIndices.length} × ${id.board.posSiaga}`,
      note: id.board.posSiagaHint,
      swatch: "#2B2F38",
      src: ART.tile[TILE_ART.ready_post].normal,
      immune: true,
    },
    {
      key: "sea_lane",
      title: id.board.seaRoute,
      subtitle: `${scenario.seaLaneIndices.length} × ${id.board.seaRoute}`,
      note: id.board.seaRouteHint,
      swatch: "#7B4FA8",
      src: ART.tile[TILE_ART.sea_lane].normal,
      immune: true,
    },
  ];
}

const tileGallery = buildTileGallery();

/** The painting used for the damage strip: the volcanic arc, which can be hit. */
const damageArt = ART.tile[TILE_ART.cascadia];

export default function HowToPlayPage() {
  const s = id.howTo.sections;
  const reference = useReference();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 p-4 pb-16">
      <header className="flex items-center gap-2">
        <Link href="/" aria-label={id.common.back} className="-ml-1 rounded-lg p-3 hover:bg-black/5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black">
            <BookOpen className="h-6 w-6 text-lava" />
            {id.howTo.title}
          </h1>
          <p className="text-xs font-bold text-zinc-500">{id.howTo.subtitle}</p>
        </div>
      </header>

      {/* Playtesters wanted one place that explains every card and every term,
          reachable without scrolling the whole page. */}
      <Button
        variant="secondary"
        onClick={() => reference.setOpen(true)}
        className="flex w-full items-center gap-2 text-left"
      >
        <Search className="h-4 w-4 shrink-0 text-lava" />
        <span className="min-w-0">
          <span className="block text-sm font-black">{id.feedback.reference}</span>
          <span className="block text-[11px] font-bold text-zinc-500">
            {id.feedback.referenceHint}
          </span>
        </span>
      </Button>
      <ReferenceModal open={reference.open} onClose={reference.dismiss} />

      {/* Tujuan */}
      <Section title={s.goal.title} icon={<Target className="h-4 w-4" />}>
        <p className="text-sm leading-relaxed text-zinc-700">{s.goal.body}</p>
        <ul className="mt-2 space-y-1">
          {s.goal.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-[13px] leading-snug">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lava" />
              {b}
            </li>
          ))}
        </ul>
      </Section>

      {/* Papan */}
      <Section title={s.board.title}>
        <p className="text-sm leading-relaxed text-zinc-700">{s.board.body}</p>
        <RingDiagram />
        <ul className="mt-2 space-y-1">
          {s.board.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-[13px] leading-snug">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lava" />
              {b}
            </li>
          ))}
        </ul>
      </Section>

      {/* Every tile kind, with its printed painting — Sea Lane included. */}
      <Section title={REFERENCE_LABELS.tiles.heading} icon={<MapIcon className="h-4 w-4" />}>
        <p className="text-sm leading-relaxed text-zinc-700">{REFERENCE_LABELS.tiles.body}</p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {tileGallery.map((t) => (
            <li
              key={t.key}
              className="flex items-start gap-2.5 rounded-xl border-2 border-zinc-200 bg-white p-2.5"
            >
              <TileArtwork src={t.src} swatch={t.swatch} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black">{t.title}</span>
                <span className="block text-[11px] font-bold text-zinc-400">{t.subtitle}</span>
                <span className="mt-1 block text-[12px] leading-snug text-zinc-700">
                  {t.noteLabel ? (
                    <b className="text-zinc-500">{t.noteLabel} · </b>
                  ) : null}
                  {t.note}
                </span>
                {t.immune ? (
                  <span className="mt-1 inline-block rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                    {REFERENCE_LABELS.tiles.immune}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>

        <h3 className="mt-4 text-sm font-black uppercase tracking-wide text-lava">
          {REFERENCE_LABELS.tiles.damageHeading}
        </h3>
        <p className="mt-0.5 text-[12px] leading-snug text-zinc-600">
          {REFERENCE_LABELS.tiles.damageBody}
        </p>
        <ul className="mt-2 grid grid-cols-3 gap-2">
          {DAMAGE_STAGES.map((stage) => (
            <li
              key={stage}
              className="rounded-xl border-2 border-zinc-200 bg-white p-2 text-center"
            >
              <TileArtwork
                src={stage === 2 ? damageArt.destroyed : damageArt.normal}
                swatch={SECTOR_COLOR.cascadia}
                className="mx-auto"
              />
              <span className="mt-1 block text-[12px] font-black">{id.board.damage[stage]}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-zinc-600">
                {stage === 0 ? REFERENCE_LABELS.tiles.damageNormal : id.board.damageHint[stage]}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] font-bold leading-snug text-zinc-500">
          {REFERENCE_LABELS.tiles.crackNote}
        </p>
      </Section>

      {/* 5 fase */}
      <Section title={s.loop.title}>
        <p className="text-sm leading-relaxed text-zinc-700">{s.loop.body}</p>
        <ol className="mt-2 space-y-1.5">
          {PHASE_ORDER.map((p) => (
            <li
              key={p}
              className="flex items-start gap-2.5 rounded-xl border-2 border-zinc-200 bg-white p-2.5"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lava text-sm font-black text-white">
                {id.phases[p].num}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-black">{id.phases[p].name}</span>
                <span className="block text-[12px] leading-snug text-zinc-600">
                  {id.phases[p].hint}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </Section>

      {/* Fase 3 — biaya AP */}
      <Section title={s.turns.title} icon={<Zap className="h-4 w-4" />}>
        <p className="text-sm leading-relaxed text-zinc-700">{s.turns.body}</p>
        <ul className="mt-2 divide-y divide-zinc-200 overflow-hidden rounded-xl border-2 border-zinc-200 bg-white">
          {s.turns.costs.map((c) => (
            <li
              key={c.action}
              className="flex flex-wrap items-start justify-between gap-x-3 gap-y-0.5 p-2"
            >
              <span className="min-w-0 text-[13px] font-bold">{c.action}</span>
              <span className="ml-auto text-[12px] font-black text-amber-700">{c.cost}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Commit & Flip */}
      <Section title={s.commitFlip.title} icon={<Gavel className="h-4 w-4" />}>
        <p className="text-sm leading-relaxed text-zinc-700">{s.commitFlip.body}</p>
        <ol className="mt-2 space-y-2">
          {s.commitFlip.steps.map((step) => (
            <li key={step.title} className="rounded-xl border-l-4 border-lava bg-white p-2.5">
              <p className="text-sm font-black">{step.title}</p>
              <p className="text-[13px] leading-snug text-zinc-600">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-3 space-y-2">
          <OutcomeBanner outcome="verified" />
          <OutcomeBanner outcome="lucky_guess" />
          <OutcomeBanner outcome="rumour_spreads" />
        </div>

        <p className="mt-3 rounded-xl bg-zinc-100 p-2.5 text-[13px] font-bold leading-snug text-zinc-700">
          {s.commitFlip.note}
        </p>
      </Section>

      {/* Table Talk Protocol */}
      <Section title={id.tableTalk.title} icon={<Users className="h-4 w-4" />}>
        <p className="text-sm font-bold italic text-violet-800">{id.tableTalk.lead}</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <ul className="space-y-1 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-2.5">
            <li className="text-[11px] font-black uppercase tracking-wide text-emerald-700">
              {id.tableTalk.allowed}
            </li>
            {id.tableTalk.allowedItems.map((item) => (
              <li key={item} className="flex items-start gap-1.5 text-[12px] leading-snug">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                {item}
              </li>
            ))}
          </ul>
          <ul className="space-y-1 rounded-xl border-2 border-red-200 bg-red-50 p-2.5">
            <li className="text-[11px] font-black uppercase tracking-wide text-red-700">
              {id.tableTalk.forbidden}
            </li>
            {id.tableTalk.forbiddenItems.map((item) => (
              <li key={item} className="flex items-start gap-1.5 text-[12px] leading-snug">
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-2 rounded-xl bg-violet-50 p-2.5 text-[13px] leading-snug text-violet-900">
          {id.tableTalk.why}
        </p>
      </Section>

      {/* Evidence */}
      <Section title={s.evidence.title}>
        <p className="text-sm leading-relaxed text-zinc-700">{s.evidence.body}</p>
        <ul className="mt-2 space-y-1">
          {s.evidence.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-[13px] leading-snug">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lava" />
              {b}
            </li>
          ))}
        </ul>
      </Section>

      {/* Peran */}
      <Section title={s.roles.title}>
        <p className="text-sm leading-relaxed text-zinc-700">{s.roles.body}</p>
        <ul className="mt-2 space-y-2">
          {roles.map((role) => (
            <li key={role.id} className="rounded-xl border-2 border-zinc-200 bg-white p-2.5">
              <p className="flex items-center gap-2 text-sm font-black">
                <span className="text-xl leading-none">{emojiForRole(role.id)}</span>
                {role.name}
                <span className="text-[11px] font-bold text-zinc-400">{role.title}</span>
              </p>
              <p className="mt-1 text-[12px] leading-snug text-zinc-700">
                <b>{id.role.passive}</b> · {role.passiveName}: {role.passive}
              </p>
              <p className="text-[12px] leading-snug text-violet-800">
                <b>{id.role.active}</b> · {role.activeName}: {role.active}
              </p>
              <p className="text-[12px] leading-snug text-amber-800">
                <b>{id.role.subMission}</b> · {role.subMissionName}: {role.subMission}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Ekonomi */}
      <Section title={s.economy.title}>
        <ul className="space-y-1">
          {s.economy.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-[13px] leading-snug">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lava" />
              {b}
            </li>
          ))}
        </ul>
      </Section>


      {/* Everything in the box — playtesters asked for one list of the lot. */}
      <Section
        title={REFERENCE_LABELS.componentsHeading}
        icon={<Boxes className="h-4 w-4" />}
      >
        <div className="space-y-4">
          {COMPONENTS.map((group) => (
            <ComponentGroupBlock key={group.id} group={group} headingClass="text-zinc-500" />
          ))}
        </div>
      </Section>

      {/* Glossary — the disaster words and the table words, in plain English. */}
      <Section title={REFERENCE_LABELS.termsHeading} icon={<Library className="h-4 w-4" />}>
        <div className="space-y-4">
          {TERMS.map((group) => (
            <TermGroupBlock key={group.id} group={group} headingClass="text-zinc-500" />
          ))}
        </div>
      </Section>

      {/* Catatan demo */}
      <Section title={s.demo.title}>
        <p className="text-sm leading-relaxed text-zinc-700">{s.demo.body}</p>
      </Section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href="/setup" className="flex-1">
          <Button className="w-full">
            <Play className="mr-2 inline h-5 w-5" />
            {id.howTo.startNow}
          </Button>
        </Link>
        <Link href="/" className="flex-1">
          <Button variant="secondary" className="w-full">
            {id.howTo.backHome}
          </Button>
        </Link>
      </div>
    </main>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-1.5 flex items-center gap-1.5 text-lg font-black text-lava">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * One printed tile painting, tinted with its sector colour the same way the
 * board renderer washes it. Decorative: the tile's name sits beside it.
 */
function TileArtwork({
  src,
  swatch,
  className,
}: {
  src: string;
  swatch: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl",
        className
      )}
      style={{ backgroundColor: `${swatch}22` }}
    >
      <Image
        src={src}
        alt=""
        width={56}
        height={56}
        className="h-full w-full object-contain"
        draggable={false}
      />
    </span>
  );
}

/** Diagram cincin yang identik dengan papan asli — 28 ubin + 4 Rute Laut. */
function RingDiagram() {
  return (
    <figure className="mx-auto my-3 max-w-md overflow-hidden rounded-2xl bg-gradient-to-b from-[#12293b] to-[#07141f] p-2">
      <svg viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} className="w-full" role="img" aria-label={id.board.title}>
        <circle cx={CENTRE} cy={CENTRE} r={RING_RADIUS - 200} fill="#0b2233" stroke="#1d4a63" strokeWidth={3} />
        {[SEA_LANE_ENDPOINTS].map(([a, b]: [number, number]) => (
          <path
            key={`${a}-${b}`}
            d={seaLanePath(a, b, RING_SIZE)}
            fill="none"
            stroke="#7B4FA8"
            strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray="20 14"
          />
        ))}
        {Array.from({ length: RING_SIZE }).map((_, i) => (
          <g key={i}>
            <polygon
              points={tileHexPoints(i, RING_SIZE)}
              fill={READY_POSTS.includes(i) ? "#2B2F38" : SECTOR_COLOR[sectorOf(i)]}
              stroke="#00000055"
              strokeWidth={3}
            />
          </g>
        ))}
      </svg>
      <figcaption className="mt-1 flex flex-wrap justify-center gap-2 text-[10px] font-bold text-sky-100/80">
        {SECTOR_ORDER.map((sid) => (
          <span key={sid} className="inline-flex items-center gap-1">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: SECTOR_COLOR[sid] }}
            />
            {id.board.sectorCue[sid]}
          </span>
        ))}
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#2B2F38] ring-1 ring-white/40" />
          {id.board.posSiaga}
        </span>
        <span className={cn("inline-flex items-center gap-1")}>
          <span className="inline-block h-0.5 w-4 bg-sea" />
          {id.board.seaRoute}
        </span>
      </figcaption>
    </figure>
  );
}
