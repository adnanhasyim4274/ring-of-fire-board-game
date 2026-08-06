"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Gavel,
  Play,
  Target,
  Users,
  X,
  Zap,
} from "lucide-react";
import { roles } from "@/data/roles";
import { Button } from "@/components/ui/Button";
import { PHASE_ORDER } from "@/components/hud/PhaseIndicator";
import { OutcomeBanner } from "@/components/cards/OutcomeBanner";
import { cn } from "@/lib/utils";
import { en as id } from "@/lib/i18n/en";
import { emojiForRole } from "@/lib/roleEmoji";
import { SECTOR_COLOR } from "@/lib/theme";
import { CENTRE, RING_RADIUS, VIEWBOX, seaLanePath, tileHexPoints } from "@/lib/ring";

const RING_SIZE = 24;
const READY_POSTS = [0, 4, 8, 12, 16, 20];
const SEA_LANE_ENDPOINTS: [number, number] = [0, 12];
const SECTOR_ORDER = ["sunda", "philippine", "hokkaido", "cascadia", "andes", "south_pacific"] as const;
const sectorOf = (i: number) => SECTOR_ORDER[Math.floor(i / 4) % 6];


export default function HowToPlayPage() {
  const s = id.howTo.sections;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 p-4 pb-16">
      <header className="flex items-center gap-2">
        <Link href="/" aria-label={id.common.back} className="rounded-lg p-2 hover:bg-black/5">
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
            <li key={c.action} className="flex items-start justify-between gap-3 p-2">
              <span className="text-[13px] font-bold">{c.action}</span>
              <span className="shrink-0 text-[12px] font-black text-amber-700">{c.cost}</span>
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

/** Diagram cincin yang identik dengan papan asli — 28 ubin + 4 Rute Laut. */
function RingDiagram() {
  return (
    <figure className="my-3 overflow-hidden rounded-2xl bg-gradient-to-b from-[#12293b] to-[#07141f] p-2">
      <svg viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} className="mx-auto w-full max-w-sm" role="img" aria-label={id.board.title}>
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
