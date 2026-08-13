"use client";
import { memo } from "react";
import type { Player, TileState } from "@/engine/types";
import {
  READY_POST_COLOR,
  READY_POST_EDGE,
  SECTOR_COLOR,
  SECTOR_EDGE,
  SECTOR_GLYPH,
  SEA_LANE_COLOR,
  SEA_LANE_EDGE,
  CRISIS_COLOR,
} from "@/lib/theme";
import {
  seaLaneHexPoints,
  seaLaneTileCentre,
  tileCentre,
  tileHexPoints,
} from "@/lib/ring";
import { TILE_ART_BOX, TILE_ART_WASH, tileArtworkSrc } from "@/lib/tileArt";
import { emojiForRole } from "@/lib/roleEmoji";
import { en as id } from "@/lib/i18n/en";

/**
 * Ikon bentuk per sektor. Ini isyarat NON-WARNA yang wajib ada supaya sektor
 * masih bisa dibedakan tanpa persepsi warna (MASTER-SPEC §2 + WCAG 1.4.1).
 */
const GLYPH_PATH: Record<string, string> = {
  // Gunung api meletus — Busur Vulkanik
  volcano: "M -16 13 L -6 -9 L 6 -9 L 16 13 Z M -6 -9 L -2 -16 M 6 -9 L 3 -17",
  // Gelombang tsunami — Busur Salju & Tsunami
  wave:
    "M -17 2 q 8.5 -11 17 0 q 8.5 11 17 0 M -17 11 q 8.5 -11 17 0 q 8.5 11 17 0",
  // Jajaran puncak — Busur Pegunungan & Gurun
  peaks: "M -18 13 L -7 -8 L -1 1 L 6 -14 L 18 13 Z",
  // Pulau volcanic — Busur Kepulauan Vulkanik
  island: "M -17 10 q 9 -6 17 0 q 8 6 17 0 M -8 2 L 0 -13 L 8 2 Z",
  // Tenda posko — Pos Siaga
  post: "M -15 12 L 0 -13 L 15 12 Z M 0 -13 L 0 12 M 0 -13 L 0 -19 L 10 -16 L 0 -13",
  // Konifer — Busur Cascadia. SECTOR_GLYPH memakai kunci ini, dan tanpa
  // entri di sini `d` menjadi undefined sehingga ubinnya kehilangan isyarat
  // non-warna yang justru wajib untuk pemain buta warna.
  pine: "M 0 -18 L -10 -2 L -5 -2 L -13 9 L 13 9 L 5 -2 L 10 -2 Z M 0 9 L 0 14",
  // Semburan geiser — Busur Pasifik Selatan
  geyser:
    "M -13 13 L 13 13 M 0 13 L 0 -2 M -4 -2 q -6 -9 -1 -16 M 4 -2 q 6 -9 1 -16",
  // Penyeberangan laut — Sea Lane, ombak dengan panah melintas
  lane: "M -16 9 q 8 -9 16 0 q 8 9 16 0 M 0 -16 L 0 3 M -7 -9 L 0 -16 L 7 -9",
};

export interface RingTileProps {
  tile: TileState;
  ringSize: number;
  /** Position of this tile within the Sea Lane chain, or -1 if it is a rim tile. */
  seaLaneOrder?: number;
  seaLaneCount?: number;
  seaLaneEndpoints?: [number, number];
  seaLaneOpen?: boolean;
  regionName?: string;
  players: Player[];
  isSelected: boolean;
  isMoveTarget: boolean;
  isSeaTarget: boolean;
  isNewsTarget: boolean;
  onSelect: (index: number) => void;
}

function RingTileImpl({
  tile,
  ringSize,
  seaLaneOrder = -1,
  seaLaneCount = 0,
  seaLaneEndpoints = [0, 12],
  seaLaneOpen = true,
  regionName,
  players,
  isSelected,
  isMoveTarget,
  isSeaTarget,
  isNewsTarget,
  onSelect,
}: RingTileProps) {
  // Sea Lane tiles sit on a chord through the middle, not on the ring circle.
  const onLane = tile.isSeaLane && seaLaneOrder >= 0;
  const centre = onLane
    ? seaLaneTileCentre(seaLaneOrder, seaLaneCount, seaLaneEndpoints[0], seaLaneEndpoints[1], ringSize)
    : tileCentre(tile.index, ringSize);
  const points = onLane
    ? seaLaneHexPoints(seaLaneOrder, seaLaneCount, seaLaneEndpoints[0], seaLaneEndpoints[1], ringSize)
    : tileHexPoints(tile.index, ringSize);
  const hancur = tile.damage === 2;
  const retak = tile.damage === 1;

  const fill = tile.isSeaLane
    ? SEA_LANE_COLOR
    : tile.isReadyPost
      ? READY_POST_COLOR
      : tile.sectorId
        ? SECTOR_COLOR[tile.sectorId]
        : READY_POST_COLOR;
  const edge = tile.isSeaLane
    ? SEA_LANE_EDGE
    : tile.isReadyPost
      ? READY_POST_EDGE
      : tile.sectorId
        ? SECTOR_EDGE[tile.sectorId]
        : READY_POST_EDGE;
  const glyph = tile.isSeaLane
    ? "lane"
    : tile.isReadyPost
      ? "post"
      : tile.sectorId
        ? SECTOR_GLYPH[tile.sectorId]
        : "post";

  // Printed artwork for this hex. The mapping lives in lib/tileArt.ts.
  const artSrc = tileArtworkSrc(tile);
  const clipId = `rof-hex-clip-${tile.index}`;
  // A destroyed tile is darkened, a closed Sea Lane is faded out.
  const bodyOpacity = hancur ? 0.9 : onLane && !seaLaneOpen ? 0.35 : 1;

  const calm = tile.occupants.filter((v) => v.status === "calm");
  const panicked = tile.occupants.filter((v) => v.status === "panicked");
  const shown = [...panicked, ...calm].slice(0, 3);
  const overflow = tile.occupants.length - shown.length;

  const label = [
    regionName ?? `${id.board.title} ${tile.index}`,
    tile.isSeaLane
      ? id.board.seaLane
      : tile.isReadyPost
        ? id.board.posSiaga
        : tile.sectorId
          ? id.board.sectorCue[tile.sectorId]
          : id.board.posSiaga,
    retak ? id.board.damage[1] : hancur ? id.board.damage[2] : null,
    tile.hasCrisisToken ? id.board.crisisToken : null,
    calm.length ? `${calm.length} ${id.board.calm}` : null,
    panicked.length ? `${panicked.length} ${id.board.panicked}` : null,
    isMoveTarget || isSeaTarget ? id.board.moveTarget : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={isSelected}
      className="group cursor-pointer outline-none"
      onClick={() => onSelect(tile.index)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(tile.index);
        }
      }}
    >
      {/* Tile body, three layers:
            1. the flat sector colour, which stays visible if the artwork ever
               fails to load, so a missing file can never blank out the board;
            2. the printed painting, clipped to the hexagon;
            3. the same colour washed back on top, keeping the sector cue and
               the contrast the white Villager/Crisis/number overlays need.
          A closed Sea Lane is dimmed AND dashed, so the state reads without
          relying on colour alone. */}
      <defs>
        <clipPath id={clipId}>
          <polygon points={points} />
        </clipPath>
      </defs>
      <polygon points={points} fill={hancur ? "#1b1b1f" : fill} />
      {/* Decorative: the <g> above already names the region, sector and state. */}
      <image
        href={artSrc}
        x={centre.x - TILE_ART_BOX / 2}
        y={centre.y - TILE_ART_BOX / 2}
        width={TILE_ART_BOX}
        height={TILE_ART_BOX}
        preserveAspectRatio="xMidYMid meet"
        clipPath={`url(#${clipId})`}
        opacity={bodyOpacity}
        aria-hidden
      />
      <polygon
        points={points}
        fill={hancur ? "#1b1b1f" : fill}
        fillOpacity={hancur ? 0.55 : TILE_ART_WASH}
        stroke={hancur ? "#000000" : edge}
        strokeWidth={3}
        strokeDasharray={onLane && !seaLaneOpen ? "10 8" : undefined}
        opacity={bodyOpacity}
      />

      {/* Watermark ikon sektor — isyarat non-warna */}
      <path
        d={GLYPH_PATH[glyph]}
        transform={`translate(${centre.x} ${centre.y - 20}) scale(0.95)`}
        fill="none"
        stroke="#ffffff"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={hancur ? 0.18 : 0.62}
      />

      {/* Retak — dua garis patah + tepi kuning */}
      {retak && (
        <>
          <polygon
            points={points}
            fill="none"
            stroke="#F0B429"
            strokeWidth={4}
            strokeDasharray="10 7"
          />
          <path
            d={`M ${centre.x - 30} ${centre.y - 26} l 11 14 l -8 9 l 14 16
                M ${centre.x + 6} ${centre.y - 30} l -7 17 l 12 8 l -5 15`}
            fill="none"
            stroke="#2b1a05"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.75}
          />
        </>
      )}

      {/* Hancur — dicoret dan digelapkan */}
      {hancur && (
        <>
          <line
            x1={centre.x - 34}
            y1={centre.y - 34}
            x2={centre.x + 34}
            y2={centre.y + 34}
            stroke="#c0392b"
            strokeWidth={6}
            strokeLinecap="round"
          />
          <line
            x1={centre.x + 34}
            y1={centre.y - 34}
            x2={centre.x - 34}
            y2={centre.y + 34}
            stroke="#c0392b"
            strokeWidth={6}
            strokeLinecap="round"
          />
        </>
      )}

      {/* Token Warga: bentuk + warna + ikon, bukan warna saja */}
      {!hancur && (
        <g>
          {shown.map((v, i) => {
            const step = 22;
            const x = centre.x + (i - (shown.length - 1) / 2) * step;
            const y = centre.y + 8;
            return v.status === "panicked" ? (
              <g key={v.id}>
                <rect
                  x={x - 8.5}
                  y={y - 8.5}
                  width={17}
                  height={17}
                  rx={2.5}
                  transform={`rotate(45 ${x} ${y})`}
                  fill="#EF4444"
                  stroke="#7F1D1D"
                  strokeWidth={2.5}
                />
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight={900}
                  fill="#ffffff"
                >
                  !
                </text>
              </g>
            ) : (
              <circle
                key={v.id}
                cx={x}
                cy={y}
                r={9.5}
                fill="#ffffff"
                stroke="#047857"
                strokeWidth={3}
              />
            );
          })}
          {overflow > 0 && (
            <text
              x={centre.x + 34}
              y={centre.y + 14}
              textAnchor="middle"
              fontSize={16}
              fontWeight={900}
              fill="#ffffff"
            >
              +{overflow}
            </text>
          )}
        </g>
      )}

      {/* Token Krisis */}
      {tile.hasCrisisToken && !hancur && (
        <g>
          <circle
            cx={centre.x + 30}
            cy={centre.y - 32}
            r={13}
            fill={CRISIS_COLOR}
            stroke="#ffffff"
            strokeWidth={3}
          />
          <text
            x={centre.x + 30}
            y={centre.y - 26}
            textAnchor="middle"
            fontSize={17}
            fontWeight={900}
            fill="#ffffff"
          >
            !
          </text>
        </g>
      )}

      {/* Evakuasi terkunci */}
      {tile.evacuationLocked && !hancur && (
        <rect
          x={centre.x - 40}
          y={centre.y - 40}
          width={14}
          height={11}
          rx={2}
          fill="#111827"
          stroke="#ffffff"
          strokeWidth={2}
        />
      )}

      {/* Standee pemain */}
      {players.length > 0 && (
        <text
          x={centre.x}
          y={centre.y + 36}
          textAnchor="middle"
          fontSize={players.length > 2 ? 18 : 24}
        >
          {players.map((p) => emojiForRole(p.roleId)).join("")}
        </text>
      )}

      {/* Nomor ubin — kait cepat saat diskusi di meja */}
      <text
        x={centre.x}
        y={centre.y - 34}
        textAnchor="middle"
        fontSize={15}
        fontWeight={800}
        fill="#ffffff"
        opacity={0.72}
      >
        {tile.index}
      </text>

      {/* Sorotan status */}
      {isNewsTarget && (
        <polygon
          points={points}
          fill="none"
          stroke={CRISIS_COLOR}
          strokeWidth={7}
          className="panic-pulse"
          style={{ transformOrigin: `${centre.x}px ${centre.y}px` }}
        />
      )}
      {isMoveTarget && !isSelected && (
        <polygon points={points} fill="none" stroke="#34D399" strokeWidth={7} />
      )}
      {isSeaTarget && !isSelected && (
        <polygon
          points={points}
          fill="none"
          stroke={SEA_LANE_COLOR}
          strokeWidth={7}
          strokeDasharray="14 8"
        />
      )}
      {isSelected && (
        <polygon points={points} fill="none" stroke="#ffffff" strokeWidth={8} />
      )}

      {/* Area sentuh penuh heksagon — tetap di atas semua dekorasi */}
      <polygon points={points} fill="transparent" />
      {/* Cincin fokus keyboard */}
      <polygon
        points={points}
        fill="none"
        stroke="#facc15"
        strokeWidth={5}
        className="opacity-0 group-focus-visible:opacity-100"
      />
    </g>
  );
}

export const RingTile = memo(RingTileImpl);
