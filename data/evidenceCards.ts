// ============================================================================
// RING OF FIRE v3.0 — Evidence Cards (25 unique, deck of 50)
//
// Every card does two jobs and you only ever get one of them:
//   TOP ZONE  — the MIL effect: opens one 5W1H lock.
//   BOTTOM ZONE — the Resource: discard it for a tactical gain.
//
// 2-point cards carry a bonus. There is exactly ONE wildcard in the whole deck:
// "Official Confirmation", HOW, 3 points, opens a lock of any category.
// Source: docs/00-MASTER-SPEC-v3.md §4.2
// ============================================================================

import type { EvidenceCard, EvidenceCategory } from "@/engine/types";
import { gameConfig } from "./gameConfig";

export const evidenceCards: EvidenceCard[] = [
  // ——————————————————————————————————————————————————————————————————
  // WHAT 🔍 — what is off about the content itself?
  // ——————————————————————————————————————————————————————————————————
  {
    id: "evd_what_01",
    category: "WHAT",
    title: "Photo Detective",
    points: 1,
    description:
      "Look at the edge of the wave: the pixels go soft like wet paint, while the ship beside it stays razor sharp. Those two things did not come out of the same camera.",
    milEffect: "Opens 1 [WHAT] lock on the active News Card.",
    resourceName: "Emergency Sprint",
    resourceEffect: "Discard this card for an immediate +2 AP.",
    resourceKind: "ap2",
  },
  {
    id: "evd_what_02",
    category: "WHAT",
    title: "Shadow Analysis",
    points: 2,
    description:
      "The building throws its shadow to the left and the crowd throws theirs to the right. One sun, two directions: someone pasted these together.",
    milEffect: "Opens 1 [WHAT] lock. Bonus: refunds 1 AP to whoever played it.",
    resourceName: "Alternate Route",
    resourceEffect: "Discard to cross one damaged tile without paying the terrain penalty.",
    resourceKind: "alt_route",
    bonus: "refund_ap",
  },
  {
    id: "evd_what_03",
    category: "WHAT",
    title: "AI Artefact Check",
    points: 1,
    description:
      "Count the fingers, then read the sign in the background. Six fingers and letters that dissolve into squiggles: this was generated, not filmed.",
    milEffect: "Opens 1 [WHAT] lock on the active News Card.",
    resourceName: "Loudspeaker",
    resourceEffect: "Discard to turn 1 panicking villager Calm for free (0 AP).",
    resourceKind: "calm_free",
  },
  {
    id: "evd_what_04",
    category: "WHAT",
    title: "Frame-by-Frame",
    points: 2,
    description:
      "Step through it one frame at a time. The wave jumps position between two frames: this clip was cut together from separate footage.",
    milEffect: "Opens 1 [WHAT] lock. Bonus: refunds 1 AP to whoever played it.",
    resourceName: "Logistics Assist",
    resourceEffect: "Discard to swap a card with another Guardian at no AP cost.",
    resourceKind: "trade",
    bonus: "refund_ap",
  },
  {
    id: "evd_what_05",
    category: "WHAT",
    title: "Zoom All the Way In",
    points: 1,
    description:
      "Blown up to full size, the floodwater smears like a brushstroke and the roof tiles bleed into each other. No sensor produces that.",
    milEffect: "Opens 1 [WHAT] lock on the active News Card.",
    resourceName: "Emergency Sprint",
    resourceEffect: "Discard this card for an immediate +2 AP.",
    resourceKind: "ap2",
  },

  // ——————————————————————————————————————————————————————————————————
  // WHERE 📍 — where is it really from?
  // ——————————————————————————————————————————————————————————————————
  {
    id: "evd_where_01",
    category: "WHERE",
    title: "Reverse Image Search",
    points: 2,
    description:
      "Drop the photo into a search engine and it comes back with a date three years old and a country two borders away. Same picture, different disaster.",
    milEffect: "Opens 1 [WHERE] lock. Bonus: refunds 1 AP to whoever played it.",
    resourceName: "Alternate Route",
    resourceEffect: "Discard to cross one damaged tile without paying the terrain penalty.",
    resourceKind: "alt_route",
    bonus: "refund_ap",
  },
  {
    id: "evd_where_02",
    category: "WHERE",
    title: "Map Cross-Check",
    points: 1,
    description:
      "The post says the bridge by the market collapsed. Pull up the map: there is no bridge by that market, and there never was.",
    milEffect: "Opens 1 [WHERE] lock on the active News Card.",
    resourceName: "Emergency Sprint",
    resourceEffect: "Discard this card for an immediate +2 AP.",
    resourceKind: "ap2",
  },
  {
    id: "evd_where_03",
    category: "WHERE",
    title: "Landmark Test",
    points: 1,
    description:
      "Those mountains sit on the wrong side of the skyline for this town, and the ridge is the wrong shape entirely. That is somebody else's horizon.",
    milEffect: "Opens 1 [WHERE] lock on the active News Card.",
    resourceName: "Loudspeaker",
    resourceEffect: "Discard to turn 1 panicking villager Calm for free (0 AP).",
    resourceKind: "calm_free",
  },
  {
    id: "evd_where_04",
    category: "WHERE",
    title: "Geotag Inspector",
    points: 2,
    description:
      "The file still carries its location data, and it points three thousand kilometres away. Somebody only changed the caption.",
    milEffect: "Opens 1 [WHERE] lock. Bonus: refunds 1 AP to whoever played it.",
    resourceName: "Logistics Assist",
    resourceEffect: "Discard to swap a card with another Guardian at no AP cost.",
    resourceKind: "trade",
    bonus: "refund_ap",
  },

  // ——————————————————————————————————————————————————————————————————
  // WHEN 🕐 — when did this actually happen?
  // ——————————————————————————————————————————————————————————————————
  {
    id: "evd_when_01",
    category: "WHEN",
    title: "Metadata Extraction",
    points: 1,
    description:
      "The capture timestamp inside the file reads eleven months before the event it is being sold as. The photo is real; the story around it is not.",
    milEffect: "Opens 1 [WHEN] lock on the active News Card.",
    resourceName: "Emergency Sprint",
    resourceEffect: "Discard this card for an immediate +2 AP.",
    resourceKind: "ap2",
  },
  {
    id: "evd_when_02",
    category: "WHEN",
    title: "Old Archive Match",
    points: 2,
    description:
      "The news archive has this exact frame filed under a different disaster, on a different continent, years ago. Recycled footage is the cheapest lie there is.",
    milEffect: "Opens 1 [WHEN] lock. Bonus: refunds 1 AP to whoever played it.",
    resourceName: "Alternate Route",
    resourceEffect: "Discard to cross one damaged tile without paying the terrain penalty.",
    resourceKind: "alt_route",
    bonus: "refund_ap",
  },
  {
    id: "evd_when_03",
    category: "WHEN",
    title: "Weather Record",
    points: 1,
    description:
      "The clip shows heavy rain. The weather record for that day and that place says clear sky. One of them is lying and it is not the barometer.",
    milEffect: "Opens 1 [WHEN] lock on the active News Card.",
    resourceName: "Loudspeaker",
    resourceEffect: "Discard to turn 1 panicking villager Calm for free (0 AP).",
    resourceKind: "calm_free",
  },
  {
    id: "evd_when_04",
    category: "WHEN",
    title: "Timeline Reconstruction",
    points: 3,
    description:
      "Line up every version of this post by the minute it appeared. The 'eyewitness account' shows up ninety minutes after the meme it supposedly inspired.",
    milEffect: "Opens 1 [WHEN] lock. Bonus: refunds 1 AP to whoever played it.",
    resourceName: "Logistics Assist",
    resourceEffect: "Discard to swap a card with another Guardian at no AP cost.",
    resourceKind: "trade",
    bonus: "refund_ap",
  },

  // ——————————————————————————————————————————————————————————————————
  // WHO 👤 — who is actually saying this?
  // ——————————————————————————————————————————————————————————————————
  {
    id: "evd_who_01",
    category: "WHO",
    title: "Trace the Account",
    points: 2,
    description:
      "The account spreading the eruption warning was created yesterday evening, has no real name, and uses a stock photo of an animal. That is not a witness.",
    milEffect: "Opens 1 [WHO] lock. Bonus: calms 1 panicking villager on the nearest tile.",
    resourceName: "Loudspeaker",
    resourceEffect: "Discard to turn 1 panicking villager Calm for free (0 AP).",
    resourceKind: "calm_free",
    bonus: "calm_nearest",
  },
  {
    id: "evd_who_02",
    category: "WHO",
    title: "Verified Badge Double-Check",
    points: 1,
    description:
      "The 'official agency' handle has one letter swapped and zero posts older than this week. The real one is still sitting there, quietly, with years of history.",
    milEffect: "Opens 1 [WHO] lock on the active News Card.",
    resourceName: "Emergency Sprint",
    resourceEffect: "Discard this card for an immediate +2 AP.",
    resourceKind: "ap2",
  },
  {
    id: "evd_who_03",
    category: "WHO",
    title: "Bot Swarm Detector",
    points: 2,
    description:
      "Three hundred accounts posted this word for word inside the same minute. Real witnesses do not type in unison.",
    milEffect: "Opens 1 [WHO] lock. Bonus: calms 1 panicking villager on the nearest tile.",
    resourceName: "Logistics Assist",
    resourceEffect: "Discard to swap a card with another Guardian at no AP cost.",
    resourceKind: "trade",
    bonus: "calm_nearest",
  },
  {
    id: "evd_who_04",
    category: "WHO",
    title: "Call the Named Source",
    points: 3,
    description:
      "The article credits a named scientist. Phone the institute and she says plainly: she never wrote it, and she was never asked.",
    milEffect: "Opens 1 [WHO] lock. Bonus: calms 1 panicking villager on the nearest tile.",
    resourceName: "Alternate Route",
    resourceEffect: "Discard to cross one damaged tile without paying the terrain penalty.",
    resourceKind: "alt_route",
    bonus: "calm_nearest",
  },

  // ——————————————————————————————————————————————————————————————————
  // WHY 🎭 — why is somebody pushing this?
  // ——————————————————————————————————————————————————————————————————
  {
    id: "evd_why_01",
    category: "WHY",
    title: "Phishing Link Warning",
    points: 1,
    description:
      "The message pushes you to click a strange link to claim emergency food aid. There is no aid at the other end: only a form that wants your ID number.",
    milEffect: "Opens 1 [WHY] lock on the active News Card.",
    resourceName: "Logistics Assist",
    resourceEffect: "Discard to swap a card with another Guardian at no AP cost.",
    resourceKind: "trade",
  },
  {
    id: "evd_why_02",
    category: "WHY",
    title: "Who Profits?",
    points: 2,
    description:
      "Follow the money. Every share of this 'warning' pays the poster in ad revenue. Fear is not their mistake, it is their business model.",
    milEffect: "Opens 1 [WHY] lock. Bonus: refunds 1 AP to whoever played it.",
    resourceName: "Emergency Sprint",
    resourceEffect: "Discard this card for an immediate +2 AP.",
    resourceKind: "ap2",
    bonus: "refund_ap",
  },
  {
    id: "evd_why_03",
    category: "WHY",
    title: "Clickbait Alarm",
    points: 1,
    description:
      "All caps, six sirens, and 'share before they delete it'. Real safety warnings tell you what to do; this one only tells you to panic and forward.",
    milEffect: "Opens 1 [WHY] lock on the active News Card.",
    resourceName: "Loudspeaker",
    resourceEffect: "Discard to turn 1 panicking villager Calm for free (0 AP).",
    resourceKind: "calm_free",
  },
  {
    id: "evd_why_04",
    category: "WHY",
    title: "Donation Account Check",
    points: 2,
    description:
      "Real relief money goes to a registered organisation you can look up. This one goes to one stranger's personal account, and the account name keeps changing.",
    milEffect: "Opens 1 [WHY] lock. Bonus: refunds 1 AP to whoever played it.",
    resourceName: "Alternate Route",
    resourceEffect: "Discard to cross one damaged tile without paying the terrain penalty.",
    resourceKind: "alt_route",
    bonus: "refund_ap",
  },

  // ——————————————————————————————————————————————————————————————————
  // HOW 🔬 — what does the science actually say?
  // ——————————————————————————————————————————————————————————————————
  {
    id: "evd_how_01",
    category: "HOW",
    title: "Official Confirmation (BMKG / USGS / JMA)",
    points: 3,
    description:
      "A live briefing from the agency that actually monitors this: no plate movement, no volcanic activity, nothing on the instruments today. The report is simply wrong.",
    milEffect:
      "WILDCARD. Scientifically solid enough to open a [HOW] lock, or a lock of ANY other category the table needs.",
    resourceName: "Mental Fortitude",
    resourceEffect:
      "Discard to stop the Panic Meter rising this round, even if the team fails to resolve the news.",
    resourceKind: "panic_shield",
    isWildcard: true,
  },
  {
    id: "evd_how_02",
    category: "HOW",
    title: "Science Class Memory",
    points: 1,
    description:
      "Remember the lesson: nothing on Earth can name the hour an earthquake will strike. Anyone promising '2 AM sharp' is inventing it.",
    milEffect: "Opens 1 [HOW] lock on the active News Card.",
    resourceName: "Emergency Sprint",
    resourceEffect: "Discard this card for an immediate +2 AP.",
    resourceKind: "ap2",
  },
  {
    id: "evd_how_03",
    category: "HOW",
    title: "Seismograph Reading",
    points: 2,
    description:
      "The station's own trace tells it straight: no tremor recorded in the last twenty-four hours. The 'constant shaking' story has nothing under it.",
    milEffect: "Opens 1 [HOW] lock. Bonus: refunds 1 AP to whoever played it.",
    resourceName: "Alternate Route",
    resourceEffect: "Discard to cross one damaged tile without paying the terrain penalty.",
    resourceKind: "alt_route",
    bonus: "refund_ap",
  },
  {
    id: "evd_how_04",
    category: "HOW",
    title: "Tsunami Warning Signs",
    points: 1,
    description:
      "The real precursors are a long strong quake, the sea drawing back, and a roar like a train. Check the story against that list before you check it against your fear.",
    milEffect: "Opens 1 [HOW] lock on the active News Card.",
    resourceName: "Loudspeaker",
    resourceEffect: "Discard to turn 1 panicking villager Calm for free (0 AP).",
    resourceKind: "calm_free",
  },
];

export const evidenceCardById: Record<string, EvidenceCard> = Object.fromEntries(
  evidenceCards.map((c) => [c.id, c])
);

export const evidenceCardsByCategory: Record<EvidenceCategory, EvidenceCard[]> = {
  WHAT: evidenceCards.filter((c) => c.category === "WHAT"),
  WHERE: evidenceCards.filter((c) => c.category === "WHERE"),
  WHEN: evidenceCards.filter((c) => c.category === "WHEN"),
  WHO: evidenceCards.filter((c) => c.category === "WHO"),
  WHY: evidenceCards.filter((c) => c.category === "WHY"),
  HOW: evidenceCards.filter((c) => c.category === "HOW"),
};

/** The single wildcard in the deck. */
export const wildcardEvidenceId = "evd_how_01";

/** 25 unique cards x `evidenceCopies` = a 50-card deck. */
export function buildEvidenceDeck(): string[] {
  const ids: string[] = [];
  for (const c of evidenceCards) {
    for (let i = 0; i < gameConfig.evidenceCopies; i++) ids.push(c.id);
  }
  return ids;
}
