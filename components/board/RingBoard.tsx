"use client";
import type { ReactNode } from "react";
import type { GameState, Scenario } from "@/engine/types";
import { isSeaLaneOpen, type MoveOption } from "@/lib/engineBridge";
import {
  CENTRE,
  CENTRE_RADIUS,
  RING_RADIUS,
  VIEWBOX,
  seaLanePath,
} from "@/lib/ring";
import { CENTRE_COLOR, SEA_LANE_COLOR } from "@/lib/theme";
import { en as id } from "@/lib/i18n/en";
import { RingTile } from "./RingTile";

export function RingBoard({
  state,
  scenario,
  selectedTile,
  moveOptions,
  onSelectTile,
  centre,
}: {
  state: GameState;
  scenario: Scenario;
  selectedTile: number | null;
  moveOptions: MoveOption[];
  onSelectTile: (index: number) => void;
  /** Isi Zona Krisis — Kartu Bencana + Kartu Berita aktif. */
  centre?: ReactNode;
}) {
  const ringSize = scenario.ringSize;
  const [seaA, seaB] = scenario.seaLaneEndpoints ?? [0, Math.floor(ringSize / 2)];
  const seaLaneIdx = scenario.seaLaneIndices ?? [];
  // Bukan `state.seaLaneOpen` mentah: bencana Oseanografi menutup Rute Laut
  // tanpa mengubah bendera itu, dan papan harus ikut menunjukkannya.
  const seaOpen = isSeaLaneOpen(state);
  const rimTargets = new Set(moveOptions.filter((m) => !m.viaSeaLane).map((m) => m.index));
  const seaTargets = new Set(moveOptions.filter((m) => m.viaSeaLane).map((m) => m.index));

  // The ring has to be readable as one shape, so the board fits the column it
  // is given rather than forcing a 480px minimum and scrolling sideways inside
  // the page — the whole point of a ring board is seeing all of it at once.
  // The viewBox is square and so is the box below it, so the SVG scales with
  // no letterboxing at any width, and every hit area is the same polygon as
  // the hexagon drawn under it, so the two can never drift apart.
  return (
    <div className="rounded-3xl border border-black/10 bg-gradient-to-b from-[#12293b] to-[#07141f] p-2 shadow-inner">
      <div className="mx-auto aspect-square w-full max-w-[620px]">
        <svg
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          className="h-full w-full"
          role="group"
          aria-label={`${id.board.title} — ${scenario.name}`}
        >
          {/* Zona Krisis: Samudra Pasifik di tengah cincin */}
          <circle cx={CENTRE} cy={CENTRE} r={CENTRE_RADIUS + 26} fill="#071726" opacity={0.9} />
          <circle
            cx={CENTRE}
            cy={CENTRE}
            r={CENTRE_RADIUS}
            fill={CENTRE_COLOR}
            stroke="#1d4a63"
            strokeWidth={3}
          />

          {/* Panah arah main — warga berevakuasi searah jarum jam */}
          <circle
            cx={CENTRE}
            cy={CENTRE}
            r={RING_RADIUS + 68}
            fill="none"
            stroke="#f0a24a"
            strokeWidth={2}
            strokeDasharray="3 26"
            opacity={0.45}
          />

          {/* Sea Lane — the straight chord the 3 purple tiles sit on */}
          <path
            d={seaLanePath(seaA, seaB, ringSize)}
            fill="none"
            stroke={SEA_LANE_COLOR}
            strokeWidth={seaOpen ? 8 : 5}
            strokeLinecap="round"
            strokeDasharray="22 14"
            opacity={seaOpen ? 0.9 : 0.28}
            className={seaOpen ? "sea-flow" : undefined}
          />
          {!seaOpen && (
            <g>
              <line
                x1={CENTRE - 30}
                y1={CENTRE - 30}
                x2={CENTRE + 30}
                y2={CENTRE + 30}
                stroke="#ef4444"
                strokeWidth={7}
                strokeLinecap="round"
              />
              <line
                x1={CENTRE + 30}
                y1={CENTRE - 30}
                x2={CENTRE - 30}
                y2={CENTRE + 30}
                stroke="#ef4444"
                strokeWidth={7}
                strokeLinecap="round"
              />
            </g>
          )}

          {/* 27 hex tiles: 24 on the rim, 3 on the Sea Lane */}
          {state.tiles.map((tile) => (
            <RingTile
              key={tile.index}
              tile={tile}
              ringSize={ringSize}
              seaLaneOrder={seaLaneIdx.indexOf(tile.index)}
              seaLaneCount={seaLaneIdx.length}
              seaLaneEndpoints={[seaA, seaB]}
              seaLaneOpen={seaOpen}
              regionName={scenario.regionNames[tile.index]}
              players={state.players.filter((p) => p.position === tile.index)}
              isSelected={selectedTile === tile.index}
              isMoveTarget={rimTargets.has(tile.index)}
              isSeaTarget={seaTargets.has(tile.index)}
              isNewsTarget={state.newsTileIndex === tile.index && !state.newsRevealed}
              onSelect={onSelectTile}
            />
          ))}
        </svg>
      </div>

      {/* The Sea Lane now runs through the middle of the ring, so the Crisis
          Zone content sits beneath the board instead of being overlaid on it.
          Capped and centred: stretched to the full width of the board it read
          as a banner rather than as the small marker it stands in for. */}
      {centre && (
        <div className="mx-auto mt-1 flex w-full max-w-[22rem] flex-col items-center gap-1 px-2 text-center">
          {centre}
        </div>
      )}

      <BoardLegend seaOpen={seaOpen} />
    </div>
  );
}

function BoardLegend({ seaOpen }: { seaOpen: boolean }) {
  const items: { label: string; swatch: ReactNode }[] = [
    {
      label: id.board.calm,
      swatch: <span className="inline-block h-3 w-3 rounded-full border-2 border-emerald-600 bg-white" />,
    },
    {
      label: id.board.panicked,
      swatch: <span className="inline-block h-3 w-3 rotate-45 rounded-[2px] border-2 border-red-900 bg-red-500" />,
    },
    {
      label: id.board.crisisToken,
      swatch: <span className="inline-block h-3 w-3 rounded-full bg-lava" />,
    },
    {
      label: id.board.damage[1],
      swatch: <span className="inline-block h-3 w-3 border-2 border-dashed border-amber-400" />,
    },
    {
      label: id.board.damage[2],
      swatch: <span className="inline-block h-3 w-3 border-2 border-zinc-500 bg-zinc-800 text-[8px] leading-none text-red-400">✕</span>,
    },
    {
      label: seaOpen ? id.hud.seaLaneOpen : id.hud.seaRouteClosed,
      swatch: <span className="inline-block h-0.5 w-4 bg-sea" />,
    },
  ];
  return (
    <ul className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-1 pb-1 text-[10px] font-bold text-sky-100/80">
      <li className="text-sky-200/60">{id.board.clockwise}</li>
      {items.map((it) => (
        <li key={it.label} className="inline-flex items-center gap-1">
          {it.swatch}
          {it.label}
        </li>
      ))}
    </ul>
  );
}
