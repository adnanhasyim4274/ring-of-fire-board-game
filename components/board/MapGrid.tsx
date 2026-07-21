"use client";
import type { GameState } from "@/engine/types";
import { scenarioById } from "@/data/scenarios";
import { Tile } from "./Tile";

export function MapGrid({
  state,
  selectedTile,
  moveTargets,
  onTileClick,
}: {
  state: GameState;
  selectedTile: number | null;
  moveTargets: number[]; // tiles highlighted as valid move/escort targets
  onTileClick: (index: number) => void;
}) {
  const scenario = scenarioById[state.scenarioId];
  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-900 via-blue-950 to-slate-950 p-1.5 shadow-inner">
      <p className="pb-1 text-center text-[10px] font-black uppercase tracking-widest text-orange-300/90">
        {scenario.name}
      </p>
      <div
        className="grid w-full gap-1"
        style={{ gridTemplateColumns: `repeat(${scenario.cols}, minmax(0, 1fr))` }}
        role="grid"
        aria-label={scenario.name}
      >
        {state.tiles.map((tile) => (
          <Tile
            key={tile.index}
            tile={tile}
            regionName={scenario.regionNames[tile.index]}
            players={state.players.filter((p) => p.position === tile.index)}
            isSelected={selectedTile === tile.index}
            isEventTarget={state.activeEventTileIndex === tile.index && state.activeEventOutcome === "pending"}
            isMoveTarget={moveTargets.includes(tile.index)}
            onClick={() => onTileClick(tile.index)}
          />
        ))}
      </div>
    </div>
  );
}
