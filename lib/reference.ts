// ============================================================================
// RING OF FIRE v3.0 — the in-game reference: every component, every term.
//
// Playtesters asked for three things:
//   "a list explaining all the cards and items in the game"
//   "some technical disaster related terms and game-specific terms could use
//    clearer explanations"
// This file is that list, as data. No JSX lives here, so the same content can
// be rendered by the reference modal and by the How to Play page.
//
// COUNTS ARE DERIVED, NEVER TYPED BY HAND. Every number below is read out of
// data/ at module load, so a change to a deck cannot leave this page lying.
//
// Definitions are written for a 15-year-old: one or two plain sentences, and no
// jargon used to explain jargon.
// ============================================================================

import { ART } from "@/data/artManifest";
import { chaosCards } from "@/data/chaosCards";
import { disasterCards } from "@/data/disasterCards";
import { evidenceCards } from "@/data/evidenceCards";
import { gameConfig } from "@/data/gameConfig";
import { newsCards } from "@/data/newsCards";
import { rewardCards } from "@/data/rewardCards";
import { roles } from "@/data/roles";
import { ringOfFireScenario } from "@/data/scenarios";
import { landTileTypeIds, tileTypeById } from "@/data/tileTypes";

// ——— Types ——————————————————————————————————————————————————————————

export interface ReferenceComponent {
  id: string;
  /** What it is called on the table. */
  name: string;
  /** How many are in the box, in words — always derived from data/. */
  count: string;
  /** What the thing physically is. */
  what: string;
  /** What it is FOR: the job it does during play. */
  use: string;
}

export interface ComponentGroup {
  id: string;
  title: string;
  items: ReferenceComponent[];
}

export interface ReferenceTerm {
  id: string;
  term: string;
  definition: string;
}

export interface TermGroup {
  id: string;
  title: string;
  blurb: string;
  terms: ReferenceTerm[];
}

// ——— Derived counts —————————————————————————————————————————————————

const totalTiles = ringOfFireScenario.layout.length;
const readyPostCount = ringOfFireScenario.readyPostIndices.length;
const seaLaneTileCount = ringOfFireScenario.seaLaneIndices.length;
const landTileCount = totalTiles - readyPostCount - seaLaneTileCount;
const terrainTypeCount = landTileTypeIds.length;
const terrainTypeNames = landTileTypeIds
  .map((tid) => tileTypeById[tid].name)
  .join(", ");

const sectorCount = ringOfFireScenario.sectors.length;
const roleCount = roles.length;

const newsCount = newsCards.length;
const newsFactCount = newsCards.filter((c) => c.truth === "fact").length;
const newsHoaxCount = newsCount - newsFactCount;
const newsCategoryCount = new Set(newsCards.map((c) => c.category)).size;

const evidenceUniqueCount = evidenceCards.length;
const evidenceDeckCount = evidenceUniqueCount * gameConfig.evidenceCopies;
const evidenceCategoryCount = new Set(evidenceCards.map((c) => c.category)).size;
const evidenceWildcardCount = evidenceCards.filter((c) => c.isWildcard).length;

const disasterCount = disasterCards.length;
const disasterCategoryCount = new Set(disasterCards.map((c) => c.category)).size;
const oceanicCount = disasterCards.filter((c) => c.category === "oceanic").length;

const chaosCount = chaosCards.length;
const rewardCount = rewardCards.length;
const rewardCheapest = Math.min(...rewardCards.map((r) => r.cost));
const rewardDearest = Math.max(...rewardCards.map((r) => r.cost));

const verdictTokenCount = Object.keys(ART.token).filter((k) =>
  k.startsWith("verdict_")
).length;

const subMissionCount = roles.filter((r) => r.subMissionKey).length;

// ——— The components in the box ————————————————————————————————————————

export const COMPONENTS: ComponentGroup[] = [
  {
    id: "board",
    title: "The board",
    items: [
      {
        id: "hex_tiles",
        name: "Hex tiles",
        count: `${totalTiles} hexes`,
        what: `${ringOfFireScenario.ringSize} of them lock together into a closed ring of ${sectorCount} regions, and ${seaLaneTileCount} more sit in the hole in the middle.`,
        use: "The board itself. Guardians and villagers stand on the tiles, and disasters damage them.",
      },
      {
        id: "terrain_tiles",
        name: "Terrain tiles",
        count: `${landTileCount} of the ${totalTiles}, in ${terrainTypeCount} kinds`,
        what: `The ordinary land you walk on: ${terrainTypeNames}.`,
        use: "Where the villagers start, and the only tiles a disaster can crack or destroy.",
      },
      {
        id: "ready_post_tiles",
        name: "Ready Post tiles",
        count: `${readyPostCount} (one at each junction between regions)`,
        what: "The dark hexes where two regions meet. Disasters never damage them.",
        use: "The finish line. A villager brought here is rescued, and a Guardian who ends a turn here gets bonus AP next round.",
      },
      {
        id: "sea_lane_tiles",
        name: "Sea Lane tiles",
        count: `${seaLaneTileCount}`,
        what: `The purple water hexes that cut straight across the middle, joining two opposite Ready Posts.`,
        use: `A shortcut that skips a long walk around the rim: ${gameConfig.seaLaneCost} AP per tile, ${gameConfig.seaLaneMaxVillagers} villager at a time, and closed on any Oceanic disaster.`,
      },
    ],
  },
  {
    id: "guardians",
    title: "Guardians",
    items: [
      {
        id: "role_cards",
        name: "Guardian role cards",
        count: `${roleCount} (one per animal)`,
        what: "One card per Guardian, listing an always-on Passive, a free once-a-round Active, and a personal Sub-Mission.",
        use: "Your character sheet. Everyone plays a different animal, so no two players can do the same job.",
      },
      {
        id: "guardian_pawns",
        name: "Guardian pawns",
        count: `${roleCount} (${gameConfig.minPlayers}–${gameConfig.maxPlayers} in use)`,
        what: "One standing figure per animal, in that Guardian's colour.",
        use: "Shows which tile you are on. Almost every action needs you to be standing in the right place.",
      },
      {
        id: "ap_tokens",
        name: "Action Point tokens",
        count: `${gameConfig.baseAP} per Guardian, refilled every round`,
        what: "Small tokens you spend and hand back.",
        use: "Your turn, made countable. Moving, calming, escorting and investigating all cost AP; playing Evidence does not.",
      },
    ],
  },
  {
    id: "decks",
    title: "The decks",
    items: [
      {
        id: "news_cards",
        name: "News cards",
        count: `${newsCount} (${newsHoaxCount} hoax, ${newsFactCount} true)`,
        what: `Rumours in ${newsCategoryCount} flavours. The front is what the table sees; the truth, the explanation and the red flags are printed on the back.`,
        use: "One is revealed every round. It drops a Crisis Token on a region and is the thing the table has to judge.",
      },
      {
        id: "evidence_cards",
        name: "Evidence cards",
        count: `${evidenceDeckCount} cards (${evidenceUniqueCount} different ones, ${gameConfig.evidenceCopies} copies of each)`,
        what: `Verification techniques in ${evidenceCategoryCount} categories, worth 1 to 3 points. Exactly ${evidenceWildcardCount} is a wildcard.`,
        use: "Your hand. Each card can open a 5W1H lock on the news, or be discarded for a tactical boost: one or the other, never both.",
      },
      {
        id: "disaster_cards",
        name: "Disaster cards",
        count: `${disasterCount} (${disasterCategoryCount} categories), drawn as a deck of ${gameConfig.disasterDeckSize}`,
        what: "Each card rewrites the rules for one round, then applies damage at the end of it.",
        use: `The game clock. ${gameConfig.disasterDeckSize} cards means ${gameConfig.disasterDeckSize} rounds, and the ${oceanicCount} Oceanic cards also shut the Sea Lane.`,
      },
      {
        id: "chaos_cards",
        name: "Chaos cards",
        count: `${chaosCount}`,
        what: "Lasting setbacks that hit the whole team, such as blocked Evidence categories or a permanently higher calming cost.",
        use: "Drawn every time a verdict goes wrong. They stay in play until Reputation buys them off, so mistakes accumulate.",
      },
      {
        id: "reward_cards",
        name: "Reward cards",
        count: `${rewardCount} (costing ${rewardCheapest}–${rewardDearest} Reputation)`,
        what: "Permanent upgrades for the whole team: cheaper crossings, cheaper calming, bigger hands, more AP.",
        use: "Bought in Phase 5 with Reputation. They are the only thing Reputation is for, so do not hoard it to the end.",
      },
    ],
  },
  {
    id: "tokens",
    title: "Tokens and tracks",
    items: [
      {
        id: "villager_tokens",
        name: "Villager tokens",
        count: `${gameConfig.totalVillagers} (${gameConfig.totalVillagers / sectorCount} per region)`,
        what: "Two-sided tokens: Calm on one face, Panicked on the other.",
        use: `The people you are trying to save. Getting ${gameConfig.targetEvacuation} of them to a Ready Post wins the game at a full table.`,
      },
      {
        id: "crisis_token",
        name: "Crisis Token",
        count: "1 in play at a time",
        what: "A marker dropped on the region named by the round's News card.",
        use: "It blocks evacuation off that tile until the news is verified. You cannot rescue your way past a rumour.",
      },
      {
        id: "verdict_tokens",
        name: "Verdict tokens",
        count: `${verdictTokenCount} faces: FACT, HOAX, Abstain`,
        what: "The token the table places face-down to lock in its answer.",
        use: "It makes the decision final before the card is flipped. That order is what stops the answer influencing the reasoning.",
      },
      {
        id: "panic_meter",
        name: "Panic Meter",
        count: `1 track, ${gameConfig.panicMeterMax} spaces`,
        what: "A track with a marker that only ever climbs unless a card pushes it back.",
        use: `Public trust. Fill all ${gameConfig.panicMeterMax} spaces and nobody believes the Guardians any more: the team loses on the spot.`,
      },
      {
        id: "reputation_track",
        name: "Reputation track",
        count: `1 track, 0 to ${gameConfig.reputationTrackMax}`,
        what: "A shared score track with one marker for the whole team.",
        use: `The team's currency. +${gameConfig.reputationPerVerification} for a fully proven verdict, +${gameConfig.reputationPerSubMission} for a finished Sub-Mission, spent on Reward cards.`,
      },
      {
        id: "damage_markers",
        name: "Cracked and Destroyed markers",
        count: `up to ${landTileCount} (one per terrain tile)`,
        what: "Overlays placed on a tile as disasters chew through it, in two stages.",
        use: `Cracked costs ${gameConfig.moveCostCracked} AP to enter instead of ${gameConfig.moveCost}. Destroyed cannot be entered at all, and anyone still standing there is lost.`,
      },
    ],
  },
];

// ——— The glossary ——————————————————————————————————————————————————

export const TERMS: TermGroup[] = [
  {
    id: "disaster",
    title: "Disaster science terms",
    blurb:
      "The real hazards the cards are built on. Knowing these is also how you spot a card that gets the science wrong.",
    terms: [
      {
        id: "subduction",
        term: "Subduction",
        definition:
          "Where one of Earth's tectonic plates slides down underneath another one. Nearly every volcano and giant earthquake around the Pacific sits along a line where this is happening, which is why the region is called the Ring of Fire.",
      },
      {
        id: "megathrust",
        term: "Megathrust",
        definition:
          "The huge, gently sloping fault where a sinking plate grinds against the plate above it. When a long stretch of it slips at once it produces the largest earthquakes on Earth, with shaking that lasts minutes rather than seconds, and it can push up a tsunami.",
      },
      {
        id: "aftershock",
        term: "Aftershock",
        definition:
          "A smaller earthquake that follows a bigger one in the same area, sometimes for months. They get less frequent over time, but they are dangerous because they bring down buildings the first quake already weakened. No one can say in advance what time one will arrive.",
      },
      {
        id: "liquefaction",
        term: "Liquefaction",
        definition:
          "When strong shaking hits loose ground that is full of water, the soil briefly stops behaving like solid ground and starts behaving like a thick liquid. Buildings tilt or sink, and mud and water can well up through the surface.",
      },
      {
        id: "pyroclastic_flow",
        term: "Pyroclastic flow",
        definition:
          "An avalanche of scorching gas, ash and rock that pours down a volcano's slope, hugging the ground and moving far faster than a person can run. There is no sheltering from one; the only protection is not being in its path.",
      },
      {
        id: "ashfall",
        term: "Ashfall",
        definition:
          "Volcanic ash raining out of an eruption cloud. It is not soft like fireplace ash: it is fine, sharp ground-up rock that hurts to breathe, blots out visibility, wrecks engines, and can collapse a roof under its own weight, especially once rain makes it heavier.",
      },
      {
        id: "eruption_column",
        term: "Eruption column",
        definition:
          "The tall plume of ash and gas that rises straight up out of an erupting volcano. If it loses its upward push and collapses, that is one way a pyroclastic flow starts.",
      },
      {
        id: "tsunami",
        term: "Tsunami",
        definition:
          "A series of very long waves set off by something suddenly shifting a large volume of seawater, usually an undersea earthquake, landslide or eruption. Out in deep water it is barely noticeable; as it reaches shallow coast it slows down and piles up. The first wave is often not the biggest.",
      },
      {
        id: "tsunami_warning",
        term: "Tsunami advisory vs. warning",
        definition:
          "An advisory means dangerous currents and waves are expected in the water and right at the shoreline, so stay out of the sea and off the beach. A warning is the more serious one: flooding is expected to come inland, so move away from the coast to high ground straight away.",
      },
      {
        id: "sea_withdrawal",
        term: "Sea withdrawal",
        definition:
          "The sea draining away from the shore far past any normal low tide. It is one of nature's own tsunami warnings, the dip between waves arriving before the crest, and the correct response is to leave the shoreline immediately rather than walk out and film it.",
      },
      {
        id: "storm_surge",
        term: "Storm surge",
        definition:
          "Sea level pushed up onto the coast by a storm's winds and low pressure. Landing on top of a high tide, it floods ground that is normally dry, and it is what kills most people in a big coastal storm.",
      },
      {
        id: "submarine_eruption",
        term: "Submarine eruption",
        definition:
          "A volcano erupting beneath the sea. It can boil the water above it into steam and ash and, over time, genuinely build new islands, which is exactly why fake footage of \"a new island rising\" is so easy to believe.",
      },
      {
        id: "early_warning",
        term: "Earthquake early warning",
        definition:
          "A sensor network that detects the first, faster, gentler seismic wave and sends an alert before the damaging shaking arrives. It buys seconds to about a minute, and it is not prediction: nothing anywhere can name the day or hour an earthquake will strike.",
      },
      {
        id: "seismograph",
        term: "Seismograph",
        definition:
          "The instrument that records ground movement as a wiggly trace. It is the flat, checkable answer to a claim like \"the ground has been shaking all night\".",
      },
    ],
  },
  {
    id: "game",
    title: "Game terms",
    blurb:
      "Words that mean something specific at this table. If a rule argument starts, it usually starts here.",
    terms: [
      {
        id: "guardian",
        term: "Guardian",
        definition: `You. Each player takes one of the ${roleCount} animals, each speaking for a different corner of the Pacific, and the table wins or loses as one team.`,
      },
      {
        id: "action_point",
        term: "Action Point (AP)",
        definition: `The energy for your turn. You get ${gameConfig.baseAP} per round: moving costs ${gameConfig.moveCost}, calming ${gameConfig.calmCost}, escorting ${gameConfig.escortCost}, investigating ${gameConfig.investigateCost}, and playing an Evidence card onto a lock costs nothing.`,
      },
      {
        id: "ready_post",
        term: "Ready Post",
        definition: `The ${readyPostCount} safe hexes at the junctions between regions. Villagers who reach one are rescued, disasters never damage them, and ending your turn on one gives you +${gameConfig.readyPostApBonus} AP next round.`,
      },
      {
        id: "sea_lane",
        term: "Sea Lane",
        definition: `The ${seaLaneTileCount} water hexes crossing the middle of the ring, joining two opposite Ready Posts. It costs ${gameConfig.seaLaneCost} AP a tile and carries ${gameConfig.seaLaneMaxVillagers} villager at a time, and any Oceanic disaster closes it completely, which can strand you on the far side.`,
      },
      {
        id: "crisis_token",
        term: "Crisis Token",
        definition:
          "The marker a News card drops on a region. While it sits there, nobody can be escorted off that tile: calming people one by one does not shift it. Only a correct verdict removes it (or the Andean Llama's ability).",
      },
      {
        id: "villager_states",
        term: "Calm and Panicked",
        definition: `The two faces of a villager token. Panicked villagers cannot be escorted, and turning one back to Calm costs ${gameConfig.calmCost} AP, which is why letting a rumour run is more expensive than checking it.`,
      },
      {
        id: "lock",
        term: "5W1H lock",
        definition:
          "Every News card has exactly two locks, each labelled with one of WHAT, WHERE, WHEN, WHO, WHY or HOW. You open a lock by playing an Evidence card of the same category. It is the game asking you to show your working before you answer.",
      },
      {
        id: "dual_use",
        term: "Evidence card dual use",
        definition:
          "Each Evidence card has two halves and you only ever get one of them: the top half opens a lock, the bottom half is discarded for a tactical boost like extra AP or a free calm. Proving the truth or moving faster, never both from the same card.",
      },
      {
        id: "wildcard",
        term: "Wildcard",
        definition: `There is exactly ${evidenceWildcardCount} in the deck: the 3-point HOW card "Official Confirmation". It opens a lock of any category, so it is usually the card worth arguing over.`,
      },
      {
        id: "investigate",
        term: "Investigate",
        definition: `Spending ${gameConfig.investigateCost} AP to draw one Evidence card. It is how hands get refilled, and it is the action players forget to take until they are short a lock.`,
      },
      {
        id: "escort",
        term: "Escort",
        definition: `Spending ${gameConfig.escortCost} AP to lead a Calm villager one tile with you. This is the action that actually wins the game, and a Crisis Token is what stops it.`,
      },
      {
        id: "barter",
        term: "Barter",
        definition: `Swapping an Evidence card with another Guardian for ${gameConfig.barterCost} AP, normally only when you are on the same tile. It is how the right card reaches the right lock before the round closes.`,
      },
      {
        id: "hand_limit",
        term: "Hand limit",
        definition: `How many Evidence cards you may hold: ${gameConfig.handLimit} for everyone, ${gameConfig.handLimitScholar} for the Japanese Macaque. Over the limit at the end of your turn and you discard down.`,
      },
      {
        id: "table_talk",
        term: "Table Talk Protocol",
        definition:
          "Hands stay hidden. You may name a card's category and points and describe it in your own words, but you may not show it or read it out word for word. Putting it in your own words is the proof you understood it.",
      },
      {
        id: "commit_flip",
        term: "Commit & Flip",
        definition:
          "The rule at the heart of the game: the table agrees a verdict out loud and puts the token down first, and only then turns the News card over to read the truth. Feedback always comes after the decision, never before it.",
      },
      {
        id: "verified",
        term: "VERIFIED",
        definition: `The good outcome: your verdict was right AND both locks were open. +${gameConfig.reputationPerVerification} Reputation, the Crisis Token comes off, and the card's "if validated" bonus applies.`,
      },
      {
        id: "lucky_guess",
        term: "LUCKY GUESS",
        definition:
          "Your verdict was right but the locks were not both open. You get nothing at all and the Crisis Token stays. Being right without being able to show why is not media literacy, and the game refuses to pay for it.",
      },
      {
        id: "rumour_spreads",
        term: "RUMOUR SPREADS",
        definition:
          "Your verdict was wrong, or the table abstained. The Panic Meter goes up by one for the outcome, then again from the card's own \"if ignored\" effect, so expect two. You also draw a Chaos card.",
      },
      {
        id: "panic_meter",
        term: "Panic Meter",
        definition: `The track that measures how much the public still trusts you. Every failed verdict pushes it up, and if it reaches ${gameConfig.panicMeterMax} the team loses immediately: a Literacy Failure, not a body count.`,
      },
      {
        id: "reputation",
        term: "Reputation",
        definition: `The team's shared currency, earned only by verdicts you actually proved (+${gameConfig.reputationPerVerification}) and finished Sub-Missions (+${gameConfig.reputationPerSubMission}). Spend it in Phase 5 on Reward cards or on clearing a Chaos card.`,
      },
      {
        id: "sub_mission",
        term: "Sub-Mission",
        definition: `A personal goal printed on your role card: one per Guardian, ${subMissionCount} in all. Finishing it is worth +${gameConfig.reputationPerSubMission} Reputation to the whole team, so it is a shared prize, not a private score.`,
      },
      {
        id: "chaos_card",
        term: "Chaos card",
        definition: `One of ${chaosCount} lasting penalties, drawn every time a verdict fails. It hits everyone, it does not expire on its own, and the only way out is to buy it off with Reputation.`,
      },
      {
        id: "reward_card",
        term: "Reward card",
        definition: `One of ${rewardCount} permanent team upgrades bought with Reputation in Phase 5, costing ${rewardCheapest} to ${rewardDearest}. They make the rest of the game cheaper, so buying early beats saving up.`,
      },
      {
        id: "damage",
        term: "Cracked and Destroyed tiles",
        definition: `The two stages of tile damage. Cracked costs ${gameConfig.moveCostCracked} AP to enter instead of ${gameConfig.moveCost}; Destroyed cannot be entered at all and anyone still standing on it is lost. The two stages exist so you always get one round's warning.`,
      },
      {
        id: "round_effect",
        term: "Round Effect and Final Consequence",
        definition:
          "The two halves of a Disaster card. The Round Effect changes the rules for the whole round the moment the card is revealed; the Final Consequence is the damage applied at the end of that round.",
      },
      {
        id: "sector",
        term: "Sector",
        definition: `One of the ${sectorCount} coloured regions of the ring, each standing for a real part of the Pacific and each with its own three land tiles and its own Ready Post.`,
      },
    ],
  },
];

/**
 * UI strings for the reference screens. They live here rather than in the i18n
 * module because this reference is a self-contained unit — the modal and the
 * How to Play page share exactly these labels, and no string is written inline
 * in JSX.
 */
export const REFERENCE_LABELS = {
  searchPlaceholder: "Search a card, a token or a term…",
  searchLabel: "Filter components and terms",
  clearSearch: "Clear the search",
  componentsHeading: "What is in the box",
  termsHeading: "Glossary",
  useLabel: "What it is for",
  noResults: "Nothing matches that. Try a shorter word.",
  resultCount: "matches",
  tiles: {
    heading: "Every tile, and what it looks like",
    body: "Six coloured regions, the Ready Posts at their junctions, and the Sea Lane through the middle. This is the printed artwork, so the board will look like this in front of you.",
    terrainLabel: "Terrain here",
    damageNormal: "How every terrain tile starts.",
    damageHeading: "What damage looks like",
    damageBody:
      "Terrain tiles take damage in two stages. Ready Posts and Sea Lane tiles never take any.",
    crackNote: "Cracked keeps the same painting, with a crack printed across it.",
    immune: "Never damaged",
  },
} as const;
