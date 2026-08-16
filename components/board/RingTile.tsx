"use client";
import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
  CENTRE,
  HEX_RADIUS,
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

/**
 * Three board cues answer three different questions, so each one owns a
 * different *shape* language and never just a different colour (WCAG 1.4.1):
 *
 *   "where am I?"        double concentric ring + a "You are here" callout pill
 *   "where can I go?"    one solid ring + a big pulsing FOOTPRINT badge
 *   "what does the card  diagonal HATCH across the hex + a dotted ring
 *    mean on the board?"
 *
 * Double ring vs single ring vs dotted ring, and pill vs footprint vs hatch:
 * a player who cannot see colour at all still gets three separate answers.
 */
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
  /**
   * Id of the Guardian whose turn it is. Optional: left out, no tile claims the
   * "You are here" treatment and the board renders exactly as it did before.
   */
  currentPlayerId?: string;
  /**
   * True when the active Disaster or News card names this tile's sector.
   * Optional and off by default; RingBoard derives it from `state`.
   */
  isCardTarget?: boolean;
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
  currentPlayerId,
  isCardTarget = false,
  onSelect,
}: RingTileProps) {
  // `null` before the media query has been read, so compare explicitly. The
  // play page only mounts the board after hydration, so there is no SSR pass
  // to disagree with.
  const reduceMotion = useReducedMotion() === true;
  // Sea Lane tiles sit on a chord through the middle, not on the ring circle.
  const onLane = tile.isSeaLane && seaLaneOrder >= 0;
  const centre = onLane
    ? seaLaneTileCentre(seaLaneOrder, seaLaneCount, seaLaneEndpoints[0], seaLaneEndpoints[1], ringSize)
    : tileCentre(tile.index, ringSize);
  const points = onLane
    ? seaLaneHexPoints(seaLaneOrder, seaLaneCount, seaLaneEndpoints[0], seaLaneEndpoints[1], ringSize)
    : tileHexPoints(tile.index, ringSize);
  // Second hexagon, 11 units wider, for the outer half of the "You are here"
  // double ring. Same helper, same rotation — the two can never drift apart.
  const haloPoints = onLane
    ? seaLaneHexPoints(
        seaLaneOrder,
        seaLaneCount,
        seaLaneEndpoints[0],
        seaLaneEndpoints[1],
        ringSize,
        HEX_RADIUS + 11
      )
    : tileHexPoints(tile.index, ringSize, HEX_RADIUS + 11);
  const hancur = tile.damage === 2;
  const retak = tile.damage === 1;

  // Is the Guardian holding the device standing on this tile?
  const youAreHere =
    currentPlayerId !== undefined && players.some((p) => p.id === currentPlayerId);

  // The "You are here" pill sits INWARD of the tile, in the empty band between
  // the rim and the Crisis Zone disc. Placing it above the tile would push the
  // pill off the top of the viewBox for tile 0. The middle Sea Lane tile sits
  // exactly on the centre, where "inward" has no direction, so fall back to up.
  const inwardDistance = Math.hypot(CENTRE - centre.x, CENTRE - centre.y);
  const inwardX = inwardDistance > 1 ? (CENTRE - centre.x) / inwardDistance : 0;
  const inwardY = inwardDistance > 1 ? (CENTRE - centre.y) / inwardDistance : -1;
  const calloutX = centre.x + inwardX * 96;
  const calloutY = centre.y + inwardY * 96;

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
  const hatchId = `rof-card-hatch-${tile.index}`;
  // A destroyed tile is darkened, a closed Sea Lane is faded out.
  const bodyOpacity = hancur ? 0.9 : onLane && !seaLaneOpen ? 0.35 : 1;

  const calm = tile.occupants.filter((v) => v.status === "calm");
  const panicked = tile.occupants.filter((v) => v.status === "panicked");
  const shown = [...panicked, ...calm].slice(0, 3);
  const overflow = tile.occupants.length - shown.length;

  // Every clause that used to be here is still here, in the same order. The
  // three new cues are appended, because a cue that is only visual is not a
  // cue for a screen reader user.
  const label = [
    regionName ?? `${id.board.title} ${tile.index}`,
    youAreHere ? id.feedback.youAreHere : null,
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
    isCardTarget ? id.feedback.cardTarget : null,
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
        {/* Both stripes sit fully inside the 20-unit tile: a stroke centred on
            x=0 would have its outer half clipped by the pattern box and the
            hatch would come out half weight. Light stripe next to dark, so the
            texture survives on both the pale and the dark paintings. */}
        {isCardTarget && (
          <pattern
            id={hatchId}
            width={20}
            height={20}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1={4} y1={0} x2={4} y2={20} stroke="#ffffff" strokeWidth={6} opacity={0.5} />
            <line x1={11} y1={0} x2={11} y2={20} stroke="#160604" strokeWidth={4} opacity={0.45} />
          </pattern>
        )}
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

      {/* CARD → TILE, part 1: a light/dark diagonal hatch laid across the whole
          hexagon. Texture, not colour, so the "the card is talking about THIS
          patch of the board" reading survives greyscale, and it is a fill,
          which neither of the other two cues ever uses. Drawn under the tokens
          so villagers and Guardians stay readable on top of it. */}
      {isCardTarget && !hancur && (
        <polygon points={points} fill={`url(#${hatchId})`} clipPath={`url(#${clipId})`} />
      )}

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

      {/* WHERE CAN I GO, part 1: the footprint. It used to be a 16px lucide
          glyph buried in the side panel, which playtesters never spotted. Now it
          is a ~60 unit badge sitting on the destination tile itself, white on a
          dark disc so it holds up over any sector artwork, and it breathes so
          it reads as an invitation rather than as printed decoration.
          Under the tokens, so nothing it covers is information. */}
      {(isMoveTarget || isSeaTarget) && !hancur && (
        <motion.g
          style={{
            transformBox: "view-box",
            transformOrigin: `${centre.x}px ${centre.y - 4}px`,
          }}
          animate={reduceMotion ? undefined : { scale: [1, 1.16, 1] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 1.3, repeat: Infinity, ease: "easeInOut" }
          }
          aria-hidden
        >
          {/* Reduced motion keeps this exact frame: full-opacity disc, 4-unit
              ring, solid white feet. The animation only ever dips away from the
              strongest state, never towards it. */}
          <circle cx={centre.x} cy={centre.y - 4} r={30} fill="#08130E" opacity={0.82} />
          <circle
            cx={centre.x}
            cy={centre.y - 4}
            r={30}
            fill="none"
            stroke={isSeaTarget && !isMoveTarget ? SEA_LANE_COLOR : "#34D399"}
            strokeWidth={4}
          />
          <g transform={`translate(${centre.x} ${centre.y - 4})`}>
            <Foot x={-12} y={9} angle={-14} />
            <Foot x={10} y={-9} angle={-14} />
          </g>
        </motion.g>
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

      {/* Standee pemain. One <g> per Guardian instead of one run of emoji, so
          the Guardian whose turn it is can be built differently rather than
          merely tinted: bigger silhouette, a white standee base, and a second
          outline ring around it. Size + double outline, no colour involved. */}
      {players.length > 0 && (
        <g>
          {players.map((p, i) => {
            const isYou = p.id === currentPlayerId;
            const step = players.length > 2 ? 27 : 34;
            const x = centre.x + (i - (players.length - 1) / 2) * step;
            const y = centre.y + 36;
            return (
              <g key={p.id}>
                {isYou ? (
                  <>
                    <circle cx={x} cy={y - 8} r={19} fill="#0B1220" />
                    <circle cx={x} cy={y - 8} r={19} fill="none" stroke="#ffffff" strokeWidth={4} />
                    <circle cx={x} cy={y - 8} r={24} fill="none" stroke="#0B1220" strokeWidth={3} />
                  </>
                ) : (
                  <circle cx={x} cy={y - 6} r={12} fill="#0B1220" opacity={0.5} />
                )}
                <text
                  x={x}
                  y={isYou ? y + 2 : y}
                  textAnchor="middle"
                  fontSize={isYou ? 27 : players.length > 2 ? 16 : 19}
                >
                  {emojiForRole(p.roleId)}
                </text>
              </g>
            );
          })}
        </g>
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

      {/* Sorotan status. Four rings, four dash patterns, so they stay separable
          in greyscale:
            card target  · · · · beads (round caps on a hairline dash)
            move target   ~~~~~~~~~   solid
            Sea crossing – – – –  long dash
            you are here ═══════ two concentric solid rings
          Every ring is drawn over a darker, wider copy of itself so it keeps
          its contrast on both the pale and the dark tile paintings. */}

      {/* CARD → TILE, part 3: the bead ring. Static for the rest of the named
          sector, pulsing on the single tile the News card points at. */}
      {(isCardTarget || isNewsTarget) && (
        <>
          <polygon
            points={points}
            fill="none"
            stroke="#160604"
            strokeWidth={13}
            strokeDasharray="0.1 22"
            strokeLinecap="round"
            opacity={0.85}
          />
          <motion.polygon
            points={points}
            fill="none"
            stroke={CRISIS_COLOR}
            strokeWidth={9}
            strokeDasharray="0.1 22"
            strokeLinecap="round"
            animate={
              isNewsTarget && !reduceMotion ? { strokeOpacity: [1, 0.3, 1] } : undefined
            }
            transition={
              isNewsTarget && !reduceMotion
                ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                : undefined
            }
          />
        </>
      )}

      {/* WHERE CAN I GO, part 2: the ring around the destination. */}
      {(isMoveTarget || isSeaTarget) && !isSelected && (
        <>
          <polygon points={points} fill="none" stroke="#04241A" strokeWidth={13} opacity={0.8} />
          <motion.polygon
            points={points}
            fill="none"
            stroke={isSeaTarget && !isMoveTarget ? SEA_LANE_COLOR : "#34D399"}
            strokeWidth={9}
            strokeDasharray={isSeaTarget && !isMoveTarget ? "18 10" : undefined}
            animate={reduceMotion ? undefined : { strokeOpacity: [1, 0.45, 1] }}
            transition={
              reduceMotion
                ? undefined
                : { duration: 1.3, repeat: Infinity, ease: "easeInOut" }
            }
          />
        </>
      )}

      {isSelected && (
        <polygon points={points} fill="none" stroke="#ffffff" strokeWidth={8} />
      )}

      {/* WHERE AM I, part 1: the double ring. Drawn after everything else so a
          selected or targeted tile still shows it, and offset outward as well
          as traced on the hex itself, two concentric outlines being a shape no
          other cue on this board uses. */}
      {youAreHere && (
        <g aria-hidden>
          <polygon points={haloPoints} fill="none" stroke="#0B1220" strokeWidth={12} opacity={0.9} />
          <polygon points={haloPoints} fill="none" stroke="#ffffff" strokeWidth={6} />
          <polygon points={points} fill="none" stroke="#0B1220" strokeWidth={10} opacity={0.9} />
          <polygon points={points} fill="none" stroke="#ffffff" strokeWidth={5} />
        </g>
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

      {/* WHERE AM I, part 2: a permanent worded marker, not a hover tooltip and
          not a colour. It leans inward, into the empty band between the rim and
          the Crisis Zone, because anchoring it above the hex would push it off
          the top of the viewBox for the tiles at 12 o'clock. RingBoard draws
          this tile last so the pill is never buried under a neighbour. */}
      {youAreHere && (
        <g aria-hidden>
          <line
            x1={centre.x + inwardX * 54}
            y1={centre.y + inwardY * 54}
            x2={centre.x + inwardX * 74}
            y2={centre.y + inwardY * 74}
            stroke="#0B1220"
            strokeWidth={10}
            strokeLinecap="round"
          />
          <line
            x1={centre.x + inwardX * 54}
            y1={centre.y + inwardY * 54}
            x2={centre.x + inwardX * 74}
            y2={centre.y + inwardY * 74}
            stroke="#ffffff"
            strokeWidth={4.5}
            strokeLinecap="round"
          />
          <rect
            x={calloutX - 118}
            y={calloutY - 24}
            width={236}
            height={48}
            rx={24}
            fill="#0B1220"
            stroke="#ffffff"
            strokeWidth={4}
          />
          <g transform={`translate(${calloutX - 88} ${calloutY - 8})`}>
            <path
              d="M 0 15 C 0 15 -9.5 2 -9.5 -5 a 9.5 9.5 0 1 1 19 0 C 9.5 2 0 15 0 15 Z"
              fill="#ffffff"
            />
            <circle cx={0} cy={-5} r={3.6} fill="#0B1220" />
          </g>
          <text
            x={calloutX + 20}
            y={calloutY + 10}
            textAnchor="middle"
            fontSize={28}
            fontWeight={900}
            fill="#ffffff"
          >
            {id.feedback.youAreHere}
          </text>
        </g>
      )}
    </g>
  );
}

/**
 * One footprint — sole plus three toes — drawn about its own origin, roughly
 * 22 units tall. Two of these, offset and toed in the same direction, read as
 * somebody walking; a single one just reads as a blob.
 */
function Foot({ x, y, angle }: { x: number; y: number; angle: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <ellipse cx={0} cy={2.5} rx={6.4} ry={9.8} fill="#ffffff" />
      <circle cx={-4} cy={-9.6} r={2.2} fill="#ffffff" />
      <circle cx={0.2} cy={-11.4} r={2.4} fill="#ffffff" />
      <circle cx={4.3} cy={-9.8} r={2.2} fill="#ffffff" />
    </g>
  );
}

export const RingTile = memo(RingTileImpl);
