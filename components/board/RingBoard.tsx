"use client";
import type { ReactNode } from "react";
import type { GameState, Scenario } from "@/engine/types";
import { isSeaRouteOpen, type MoveOption } from "@/lib/engineBridge";
import {
  CENTRE,
  CENTRE_RADIUS,
  RING_RADIUS,
  VIEWBOX,
  seaRouteLabelPoint,
  seaRoutePath,
} from "@/lib/ring";
import { CENTRE_COLOR, SEA_ROUTE_COLOR } from "@/lib/theme";
import { id } from "@/lib/i18n/id";
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
  // Bukan `state.seaRouteOpen` mentah: bencana Oseanografi menutup Rute Laut
  // tanpa mengubah bendera itu, dan papan harus ikut menunjukkannya.
  const seaOpen = isSeaRouteOpen(state);
  const rimTargets = new Set(moveOptions.filter((m) => !m.viaSeaRoute).map((m) => m.index));
  const seaTargets = new Set(moveOptions.filter((m) => m.viaSeaRoute).map((m) => m.index));

  return (
    <div className="overflow-x-auto rounded-3xl border border-black/10 bg-gradient-to-b from-[#12293b] to-[#07141f] p-2 shadow-inner">
      <div className="relative mx-auto aspect-square w-full min-w-[480px] max-w-[620px]">
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

          {/* Rute Laut — 4 busur ungu putus-putus yang MENGITARI Zona Krisis */}
          <g>
            {scenario.seaRoutes.map(([a, b]) => {
              const path = seaRoutePath(a, b, ringSize);
              const lab = seaRouteLabelPoint(a, b, ringSize);
              return (
                <g key={`sea-${a}-${b}`}>
                  <path
                    d={path}
                    fill="none"
                    stroke={SEA_ROUTE_COLOR}
                    strokeWidth={seaOpen ? 7 : 5}
                    strokeLinecap="round"
                    strokeDasharray="20 14"
                    opacity={seaOpen ? 0.95 : 0.3}
                    className={seaOpen ? "sea-flow" : undefined}
                  />
                  {!seaOpen && (
                    <line
                      x1={lab.x - 22}
                      y1={lab.y - 22}
                      x2={lab.x + 22}
                      y2={lab.y + 22}
                      stroke="#ef4444"
                      strokeWidth={6}
                      strokeLinecap="round"
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* 28 ubin heksagon */}
          {state.tiles.map((tile) => (
            <RingTile
              key={tile.index}
              tile={tile}
              ringSize={ringSize}
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

        {/* Isi Zona Krisis — overlay HTML supaya teksnya bisa dipilih & dibaca screen reader */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="pointer-events-auto flex flex-col items-center justify-center gap-1 overflow-hidden text-center"
            style={{ width: "31%", height: "31%" }}
          >
            {centre ?? (
              <p className="text-[10px] font-bold leading-tight text-sky-200/70">
                {id.board.crisisZoneEmpty}
              </p>
            )}
          </div>
        </div>
      </div>

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
      label: seaOpen ? id.hud.seaRouteOpen : id.hud.seaRouteClosed,
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
