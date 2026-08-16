"use client";
import type { ReactNode } from "react";
import { Footprints } from "lucide-react";
import type { GameState, Scenario, SectorId } from "@/engine/types";
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
  currentPlayerId,
}: {
  state: GameState;
  scenario: Scenario;
  selectedTile: number | null;
  moveOptions: MoveOption[];
  onSelectTile: (index: number) => void;
  /** Isi Zona Krisis — Kartu Bencana + Kartu Berita aktif. */
  centre?: ReactNode;
  /**
   * Whose "You are here" marker to draw. Optional: it defaults to the Guardian
   * whose turn it is, which is already in `state`, so the call site does not
   * have to pass anything. Override it only to point the marker somewhere else.
   */
  currentPlayerId?: string;
}) {
  const ringSize = scenario.ringSize;
  const [seaA, seaB] = scenario.seaLaneEndpoints ?? [0, Math.floor(ringSize / 2)];
  const seaLaneIdx = scenario.seaLaneIndices ?? [];
  // Bukan `state.seaLaneOpen` mentah: bencana Oseanografi menutup Rute Laut
  // tanpa mengubah bendera itu, dan papan harus ikut menunjukkannya.
  const seaOpen = isSeaLaneOpen(state);
  const rimTargets = new Set(moveOptions.filter((m) => !m.viaSeaLane).map((m) => m.index));
  const seaTargets = new Set(moveOptions.filter((m) => m.viaSeaLane).map((m) => m.index));

  // Both cards already carry their target on `state`, so nothing new has to be
  // threaded down from the page: the News card names one sector, the Disaster
  // card names a list. An EMPTY `affectedSectorIds` means "every sector", and
  // outlining all 24 tiles at once would say nothing, so it highlights none.
  const cardSectors = new Set<SectorId>();
  if (state.activeNews) cardSectors.add(state.activeNews.targetSectorId);
  for (const s of state.activeDisaster?.affectedSectorIds ?? []) cardSectors.add(s);
  const cardSectorNames = scenario.sectors
    .filter((s) => cardSectors.has(s.id))
    .map((s) => s.name);

  // Which Guardian gets the "You are here" marker, and which tile that is.
  const youId = currentPlayerId ?? state.players[state.currentPlayerIndex]?.id;
  const youTile = state.players.find((p) => p.id === youId)?.position ?? null;

  // That tile is drawn LAST. The "You are here" callout deliberately spills
  // past its own hexagon, and inside one SVG later siblings paint on top, so
  // without this the pill would slide under whichever neighbour has a higher
  // index. Keys are tile indices, so reordering costs nothing in React.
  const drawOrder =
    youTile === null
      ? state.tiles
      : [
          ...state.tiles.filter((t) => t.index !== youTile),
          ...state.tiles.filter((t) => t.index === youTile),
        ];

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
          aria-label={`${id.board.title}: ${scenario.name}`}
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
          {drawOrder.map((tile) => (
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
              currentPlayerId={youId}
              isCardTarget={tile.sectorId !== null && cardSectors.has(tile.sectorId)}
              onSelect={onSelectTile}
            />
          ))}
        </svg>
      </div>

      {/* CARD → TILE, in words. Playtesters could read "Sunda Arc" on a card and
          still not know which hexagons that was, so the sector is named here in
          the same breath as the beaded ring that marks it on the board. */}
      {cardSectorNames.length > 0 && (
        <p className="mx-auto mt-1.5 flex w-full max-w-[24rem] items-center justify-center gap-1.5 rounded-xl border-2 border-dotted border-lava px-2 py-1 text-[11px] font-bold leading-snug text-orange-100">
          <span aria-hidden className="shrink-0">
            <CardTargetSwatch />
          </span>
          <span>
            {id.feedback.cardTarget}: {cardSectorNames.join(" · ")}
          </span>
        </p>
      )}

      {/* WHERE CAN I GO, in words. */}
      {moveOptions.length > 0 && (
        <p className="mt-1.5 flex items-center justify-center gap-1.5 text-center text-[11px] font-bold text-emerald-200">
          <Footprints className="h-4 w-4 shrink-0" aria-hidden />
          {id.feedback.moveHint}
        </p>
      )}

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

/**
 * The hatch-and-dots swatch that stands for "a card names this sector". Drawn
 * with a background image rather than a colour block so it still reads as a
 * distinct texture in greyscale, exactly like the hatch on the board.
 */
function CardTargetSwatch() {
  return (
    <span
      className="inline-block h-3 w-3 rounded-[2px] border-2 border-dotted border-lava"
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.85) 0 2px, transparent 2px 5px)",
      }}
    />
  );
}

function BoardLegend({ seaOpen }: { seaOpen: boolean }) {
  const items: { label: string; swatch: ReactNode }[] = [
    // The three cues the playtesters asked for come first — they are what a
    // player needs on turn one, ahead of the token vocabulary.
    {
      label: id.feedback.youAreHere,
      swatch: (
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border-2 border-white">
          <span className="block h-1.5 w-1.5 rounded-full border border-white" />
        </span>
      ),
    },
    {
      label: id.board.moveTarget,
      swatch: <Footprints className="h-3.5 w-3.5 text-emerald-300" />,
    },
    {
      label: id.feedback.cardTarget,
      swatch: <CardTargetSwatch />,
    },
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
      <li className="w-full text-center font-normal text-sky-200/60">
        {id.feedback.cardTargetHint}
      </li>
    </ul>
  );
}
