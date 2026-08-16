import { describe, expect, it } from "vitest";
import { reduce } from "./reducer";
import type { GameAction, GameState } from "./types";
import { newsCardById } from "@/data/newsCards";
import { scenarioById } from "@/data/scenarios";
import { evidenceCards } from "@/data/evidenceCards";

const SCENARIO_ID = Object.keys(scenarioById)[0];
const act = (s: GameState, a: GameAction) => reduce(s, a)!;

describe("probe", () => {
  it("barter", () => {
    let s = reduce(null, {
      type: "START_GAME",
      scenarioId: SCENARIO_ID,
      players: [
        { name: "A", roleId: "kea_parrot" },
        { name: "B", roleId: "andean_llama" },
      ],
      seed: 7,
    })!;
    s = act(s, { type: "DEBUG_SET_DISASTER_TOP", cardId: "dis_atm_03" });
    s = act(s, { type: "DRAW_DISASTER" });
    s = act(s, { type: "ADVANCE_PHASE" });
    s = act(s, { type: "DEBUG_SET_NEWS_TOP", cardId: "news_soc_01" });
    s = act(s, { type: "DRAW_NEWS" });
    s = act(s, { type: "ADVANCE_PHASE" });
    console.log("[P] locks", newsCardById["news_soc_01"].locks);
    const key = evidenceCards.find((c) => c.category === "HOW" && !c.isWildcard)?.id;
    console.log("[P] how non-wildcard", key);
    s.players[0].hand = ["evd_who_01"];
    s.players[1].hand = ["evd_how_02"];
    const after = act(s, {
      type: "BARTER",
      playerId: s.players[0].id,
      withPlayerId: s.players[1].id,
      giveCardId: "evd_who_01",
      takeCardId: "evd_how_02",
    });
    console.log("[P] hands", after.players[0].hand, after.players[1].hand);
    console.log("[P] tail log", after.log.slice(-3).map((l) => l.message));
    console.log("[P] positions", s.players[0].position, s.players[1].position);
    expect(true).toBe(true);
  });
});
