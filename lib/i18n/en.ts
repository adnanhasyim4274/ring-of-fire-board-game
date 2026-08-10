// ============================================================================
// RING OF FIRE v3.0 — every string the interface shows (English)
// Tone reference: docs/00-MASTER-SPEC-v3.md
//
// RULE: no UI text is written inline in JSX. Everything routes through here.
// Card, role and tile content is NOT here — that belongs to data/.
// ============================================================================

export const en = {
  appName: "Ring of Fire",
  appNameLong: "Ring of Fire Board Game",
  tagline: "Wildlife Guardians of the Pacific Ring of Fire",

  meta: {
    title: "Ring of Fire — Wildlife Guardians of the Pacific",
    description:
      "A cooperative board game about disaster response and media literacy. Filter the rumours, hold the panic down, and get people to the Ready Posts — together.",
  },

  common: {
    back: "Back",
    close: "Close",
    cancel: "Cancel",
    continue: "Continue",
    confirm: "Yes, go ahead",
    next: "Next",
    of: "of",
    none: "—",
    home: "Home",
    ap: "AP",
    points: "pts",
    round: "Round",
    optional: "optional",
  },

  home: {
    blurb:
      "The Pacific Ring of Fire is waking up. But something travels faster than lava: a rumour. As Wildlife Guardians, filter what comes in — fact or hoax — and get people to the Ready Posts before the mountain decides for you.",
    playNow: "Start the Mission",
    continueGame: "Continue Game",
    howToPlay: "How to Play",
    passAndPlay: "One device · pass and play · 2–6 Guardians",
    demoNote: "This is a digital demo. The physical board game is the real product.",
    pillars: [
      {
        title: "Literacy is the mechanic",
        body: "Not a true-or-false guess. You have to open the 5W1H locks first.",
      },
      {
        title: "One card, one choice",
        body: "An Evidence card can prove the truth OR save a life. Never both.",
      },
      {
        title: "Win together or lose together",
        body: "Fully cooperative. Nobody wins alone on the Ring of Fire.",
      },
    ],
  },

  setup: {
    title: "Assemble the Guardians",
    scenario: "Scenario",
    playerCount: "How many players?",
    playerName: "Player",
    namePlaceholder: "Guardian name",
    pickRole: "Choose a role",
    start: "Begin Phase 1",
    roleTaken: "Already taken",
    needRoles: "Every player needs a role before the mission starts.",
    rolePassive: "Passive",
    roleActive: "Active (0 AP, once per round)",
    roleSubMission: "Sub-Mission",
    rolePlaystyle: "Playstyle",
  },

  phases: {
    p1_disaster: {
      num: "1",
      name: "The Ring of Fire's Wrath",
      short: "Disaster",
      hint: "Reveal 1 Disaster Card. Its effect rewrites the rules for this whole round.",
    },
    p2_news: {
      num: "2",
      name: "Breaking News",
      short: "News",
      hint: "Reveal 1 News Card. Everyone on the target tile panics immediately.",
    },
    p3_turns: {
      num: "3",
      name: "Guardian Turns",
      short: "Turns",
      hint: "4 AP each. Move, calm, escort, investigate, play evidence.",
    },
    p4_verdict: {
      num: "4",
      name: "The Verdict",
      short: "Verdict",
      hint: "Open both locks, commit your verdict out loud, then flip the card.",
    },
    p5_impact: {
      num: "5",
      name: "Impact & Escalation",
      short: "Impact",
      hint: "Tile damage, spend Reputation, then the next round begins.",
    },
  },

  hud: {
    panicMeter: "Panic Meter",
    panicHint: "Fill it and people stop believing you at all.",
    reputation: "Reputation",
    reputationHint: "Spend it on Reward cards in Phase 5.",
    disasterDeck: "Disaster Deck",
    disasterDeckHint: "This deck is the clock.",
    cardsLeft: "cards left",
    round: "Round",
    evacuated: "Rescued",
    target: "target",
    ap: "AP",
    apFull: "Action Points",
    firstPlayer: "First player",
    onDuty: "Your turn",
    waiting: "Waiting",
    seaLaneOpen: "Sea Lane open",
    seaRouteClosed: "Sea Lane CLOSED this round",
    activeChaos: "Chaos in play",
    ownedRewards: "Rewards owned",
  },

  board: {
    title: "The Ring",
    posSiaga: "Ready Post",
    posSiagaHint: "Safe zone and bonus stage. Anyone who reaches it counts as Rescued.",
    crisisZone: "Crisis Zone",
    crisisZoneEmpty: "No card is in play at the centre yet.",
    seaRoute: "Sea Lane",
    seaRouteHint: "2 AP per tile, 1 villager at a time. Closed during an Oceanic disaster.",
    crisis: "Crisis",
    crisisToken: "Crisis Token",
    calm: "Calm",
    panicked: "Panicked",
    evacuationLocked: "Evacuation locked",
    you: "You",
    villagers: "villagers",
    damage: {
      0: "Normal",
      1: "Cracked",
      2: "Destroyed",
    },
    damageHint: {
      1: "Entering this tile costs 1 extra AP.",
      2: "Impassable. Anyone still on it is lost.",
    },
    legend: "Legend",
    clockwise: "Villagers evacuate clockwise",
    tapTile: "Tap a tile to see what is on it",
    tileEmpty: "Empty tile.",
    seaLane: "Sea Lane",
    moveTarget: "Reachable",
    selected: "Selected",
    sectorShort: {
      sunda: "Sunda",
      philippine: "Philippine",
      hokkaido: "Hokkaido",
      cascadia: "Cascadia",
      andes: "Andes",
      south_pacific: "S. Pacific",
    },
    /** Non-colour cue per sector (accessibility). */
    sectorCue: {
      sunda: "Volcano",
      philippine: "Island",
      hokkaido: "Wave",
      cascadia: "Pine",
      andes: "Peaks",
      south_pacific: "Geyser",
    },
  },

  news: {
    incoming: "Breaking News",
    postedBy: "Forwarded from another group",
    attached: "Attached content",
    targetSector: "Target sector",
    locks: "5W1H locks — both must open",
    lockOpen: "Open",
    lockClosed: "Locked",
    lockOpenedBy: "Opened by",
    front: "Front",
    back: "Back",
    statusHidden: "Fact or hoax? Do not guess — prove it.",
    truth: "True status",
    truthHoax: "HOAX",
    truthFakta: "FACT",
    explanation: "What is actually going on",
    redFlags: "The red flags you should have caught",
    ifIgnored: "If ignored",
    ifValidated: "If validated",
    tapToFlip: "Ready to flip",
    category: {
      social_superstition: "Social & Superstition",
      visual_manipulation: "Visual Manipulation",
      fraud_motive: "Fraud Motive",
      pseudoscience: "Pseudoscience",
    },
  },

  /** NewsEffect in data/ carries numbers and flags, not sentences — these are the words. */
  newsEffect: {
    none: "No extra effect.",
    panicTargetSector: "Villagers in the target sector panic",
    calmTargetSector: "Villagers in the target sector calm down",
    lockEvacuationSector: "Evacuation locked in the target sector for 1 round",
    apPenalty: "AP off the first player",
    apBonus: "extra AP",
    stepTowardReadyPost: "Villagers automatically step toward a Ready Post",
    removeCrisisToken: "Crisis Token removed",
    drawEvidence: "Draw an Evidence card",
  },

  verdict: {
    title: "The Verdict",
    step1: "1. Open both locks",
    step2: "2. Commit your verdict together",
    step3: "3. Flip the card",
    stepDone: "done",
    prompt: "What is the team's verdict?",
    locksIncomplete:
      "The locks are not both open. You may still commit — but if you are right, it only counts as a Lucky Guess.",
    locksComplete: "Both locks are open. Your verdict has something behind it.",
    hoax: "HOAX",
    fakta: "FACT",
    abstain: "Abstain",
    hoaxHint: "We think this is false.",
    faktaHint: "We think this is true.",
    abstainHint: "Not enough evidence. Counts as Rumour Spreads.",
    committed: "Verdict locked",
    committedNote: "The verdict can no longer be changed.",
    flip: "FLIP THE NEWS CARD",
    flipping: "Flipping…",
    confirmTitle: "Lock in the verdict now?",
    confirmBody:
      "Once the Verdict token is down, the team CANNOT change its mind. Make sure everyone has spoken.",
    confirmChoice: "Verdict to lock in",
    confirmYes: "Lock it in",
    confirmNo: "Keep discussing",
  },

  outcome: {
    verified: {
      label: "VERIFIED",
      headline: "Right verdict, both locks open.",
      body: "+1 Reputation. The Crisis Token is removed. The \"if validated\" effect applies.",
    },
    lucky_guess: {
      label: "LUCKY GUESS",
      headline: "Right verdict — but the locks were not both open.",
      body: "No Reputation. The Crisis Token stays on the board.",
      lesson:
        "Being right by guessing is not literacy. What is scored is not your answer, but how you got there.",
    },
    rumour_spreads: {
      label: "RUMOUR SPREADS",
      headline: "Wrong verdict, or the team abstained.",
      body: "+1 Panic. Draw 1 Chaos card. The \"if ignored\" effect applies.",
    },
  },

  evidence: {
    hand: "Evidence",
    handLimit: "Hand limit",
    empty: "Your hand is empty. Investigate to draw a card.",
    reveal: "Tap to reveal your hand (make sure only you can see it)",
    hide: "Hide hand",
    whoseHand: "Whose hand?",
    zonaAtas: "Top Zone — MIL effect",
    zonaBawah: "Bottom Zone — Resource",
    playToLock: "Play onto a lock",
    playToLockShort: "Play",
    discardFor: "Discard for",
    noMatch: "Does not match either lock on this card",
    blockedRound: "Blocked this round",
    blockedChaos: "Blocked by a Chaos card",
    wildcard: "Wildcard — opens any lock",
    pickLock: "Which lock do you want to open?",
    barter: "Barter",
    barterTitle: "Barter Evidence",
    barterGive: "Give this card",
    barterWith: "Barter with",
    barterTake: "Take this card",
    barterConfirm: "Swap",
    barterSameTileOnly: "You must be on the same tile (unless you are the Kea Parrot).",
    category: {
      WHAT: "What is off about it?",
      WHERE: "Where is it really from?",
      WHEN: "When did it actually happen?",
      WHO: "Who is saying it?",
      WHY: "Why is it being spread?",
      HOW: "What does the science say?",
    },
  },

  tableTalk: {
    title: "Table Talk Protocol",
    lead: "The cards stay in your hand. Your mouth is what opens.",
    allowed: "Allowed",
    forbidden: "Not allowed",
    allowedItems: [
      "Naming your card's category (\"I have a WHO\")",
      "Naming its point value (\"it's worth 2\")",
      "Explaining what it says in your own words",
      "Arguing, proposing, bargaining",
    ],
    forbiddenItems: [
      "Showing the face of the card",
      "Reading the card text out word for word",
      "Handing the card over for someone else to read",
      "Quietly showing it to one player only",
    ],
    why: "Because you cannot read it out verbatim, you are forced to put the idea in your own words — and that is exactly the proof that you understood it.",
    compact: "Describe your evidence in your own words. Do not show the card.",
  },

  disaster: {
    active: "Active disaster",
    draw: "Reveal the Disaster Card",
    location: "Location",
    roundEffect: "Round Effect (lasts all round)",
    endEffect: "Final Consequence",
    affectedSectors: "Affected sectors",
    allSectors: "The whole ring",
    category: {
      tectonic: "Tectonic",
      volcanic: "Volcanic",
      oceanic: "Oceanic",
      atmospheric: "Atmospheric",
    },
  },

  chaos: {
    title: "Chaos Cards",
    subtitle: "Team-wide setbacks that stay until they are bought off",
    empty: "No Chaos cards yet. Keep it that way.",
    drawn: "A new Chaos card was drawn",
    count: "in play",
  },

  reward: {
    title: "Spend Reputation",
    subtitle: "Trade Reputation for permanent upgrades that help the whole team.",
    cost: "Rep",
    buy: "Buy",
    owned: "Owned",
    tooExpensive: "Not enough Reputation",
    empty: "Every Reward card is already owned.",
    skip: "Skip shopping",
  },

  role: {
    passive: "Passive",
    active: "Active",
    activeCost: "0 AP · once per round",
    activeUsed: "Already used this round",
    use: "Use",
    subMission: "Sub-Mission",
    subMissionReward: "+2 team Reputation when complete",
    subMissionDone: "Complete!",
    progress: "Progress",
    playstyle: "Playstyle",
  },

  actions: {
    title: "Actions",
    move: "Move here",
    moveVia: "Via the Sea Lane",
    calm: "Calm a villager",
    escort: "Escort a villager",
    escortPick: "Pick who you are escorting",
    escortHint: "Now tap the destination tile.",
    escortSelected: "selected",
    investigate: "Investigate (draw 1 Evidence)",
    endTurn: "End Turn",
    endTurnDone: "Turn already ended",
    cards: "Cards",
    notEnoughAp: "Not enough AP",
    drawDisaster: "Face the Ring of Fire",
    drawNews: "Reveal the News Card",
    nextRound: "Start the Next Round",
    toVerdict: "On to the Verdict",
    toImpact: "On to Impact",
    posSiagaBonus: "Ready Post bonus available when you end your turn here.",
    seaRouteBlocked: "The Sea Lane is closed (Oceanic disaster).",
    tileImpassable: "Destroyed tile — nobody can enter.",
  },

  peek: {
    title: "A look you are not supposed to share",
    disaster: "Next Disaster Card",
    news: "Next News Card",
    hand: "That player's hand",
    close: "Got it — keep it quiet",
  },

  gameOver: {
    winTitle: "The Ring Settles",
    loseTitle: "Mission Failed",
    reasons: {
      win: "You hit the evacuation target before the Disaster deck ran out. People got out because the information was verified — not because you got lucky.",
      panic:
        "The Panic Meter filled. Nobody trusts the Guardians any more, and evacuation became impossible.",
      casualties:
        "Too many people were lost. The evacuation target can no longer be reached.",
      timeout:
        "The last Disaster Card came up. The megathrust swept away everyone still out there.",
    },
    stats: {
      title: "Mission Report",
      rounds: "Rounds survived",
      evacuated: "People rescued",
      lost: "People lost",
      verified: "Verified",
      luckyGuess: "Lucky guesses",
      rumourSpreads: "Rumours spread",
      hoaxDebunked: "Hoaxes debunked",
      factsValidated: "Facts confirmed",
      subMissions: "Sub-Missions done",
      reputation: "Final Reputation",
    },
    literacyNote:
      "Look at the Lucky Guess number. That is how many times you were right without knowing why — and it is the first thing to fix next game.",
    playAgain: "Play Again",
    backHome: "Back to Home",
  },

  log: {
    title: "Mission Log",
    show: "Open",
    hide: "Close",
    empty: "Nothing logged yet.",
  },

  debug: {
    title: "Playtest Panel",
    setPanic: "Set panic",
    setReputation: "Set reputation",
    setPhase: "Set phase",
    newsTop: "Top news card",
    disasterTop: "Top disaster card",
    trimDeck: "Leave 1 disaster card",
  },

  timer: {
    label: "Discussion timer",
    timeUp: "Time is up — decide now",
  },

  /**
   * Shown once before the first round so a new player can picture a turn
   * before being asked to take one. Reopenable from the board at any time.
   */
  primer: {
    open: "Rules",
    title: "How a round works",
    subtitle:
      "Sixty seconds of reading, then you can play. You are Wildlife Guardians on the Pacific Ring of Fire, and you win or lose as one table.",
    goalLabel: "Your goal",
    goalBody:
      "Move enough villagers to a Ready Post before the Disaster deck runs out. The target scales with the size of your table, and the counter at the top of the board always shows the one you need.",
    roundLabel: "Every round runs these five phases, in this order",
    steps: [
      {
        n: "1",
        title: "The Ring of Fire's Wrath",
        body: "A Disaster card flips and rewrites this round's rules. Ocean disasters shut the Sea Lane through the middle of the board.",
      },
      {
        n: "2",
        title: "Breaking News",
        body: "A News card arrives. A Crisis Token lands on the region it names, and everybody standing there panics.",
      },
      {
        n: "3",
        title: "Guardian Turns",
        body: "Four action points each. Move, calm a panicked villager, escort someone to safety, investigate, or play Evidence onto the news card's two 5W1H locks.",
      },
      {
        n: "4",
        title: "The Verdict",
        body: "The table commits to HOAX, FACT or ABSTAIN. Only then do you turn the card over and read the truth on the back.",
      },
      {
        n: "5",
        title: "Impact and Escalation",
        body: "Damage is applied, reputation is spent, and the win and loss conditions are checked before the next round begins.",
      },
    ],
    outcomeLabel: "What the verdict earns you",
    outcomes: [
      {
        tag: "VERIFIED",
        cond: "Right verdict, both locks opened",
        result: "+1 Reputation, and the Crisis Token is cleared",
        tone: "good" as const,
      },
      {
        tag: "LUCKY GUESS",
        cond: "Right verdict, but the locks were incomplete",
        result: "Nothing at all. Being right is not the same as being sure",
        tone: "warn" as const,
      },
      {
        tag: "RUMOUR SPREADS",
        cond: "Wrong verdict, or you abstained",
        result: "+1 Panic, and you draw a Chaos card",
        tone: "bad" as const,
      },
    ],
    keyLabel: "The two rules that decide most games",
    keys: [
      "An Evidence card can prove the news OR be spent to act faster. Never both. That single choice is the whole game.",
      "While an unverified Crisis Token sits on a tile, nobody can be escorted off it. You cannot rescue your way past a rumour, you have to settle it first.",
    ],
    loseLabel: "You lose if",
    lose: [
      "The Panic Meter reaches 6",
      "Too few villagers remain for the target to be reachable",
      "The Disaster deck runs out before you hit the target",
    ],
    dontShow: "Do not show this again",
    start: "Got it, begin Phase 1",
    close: "Close",
  },

  howTo: {
    title: "How to Play",
    subtitle: "Ring of Fire: cooperative, 2–6 players, 60–90 minutes, ages 15+.",
    backHome: "Back to Home",
    startNow: "Play Now",
    sections: {
      goal: {
        title: "The Goal",
        body: "Get enough Villager tokens to a Ready Post before the Disaster deck runs out. You win together or lose together — there is no single winner.",
        bullets: [
          "Win: the evacuation target reaches a Ready Post before the Disaster deck is empty. The target scales with the table: 9 villagers with 2 Guardians, 12 with 3, 15 with 4 or more.",
          "Lose — Literacy Failure: the Panic Meter reaches 6.",
          "Lose — Casualties: too few villagers remain for the target to be reachable.",
          "Lose — Out of Time: the last Disaster Card is drawn with the target unmet.",
        ],
      },
      board: {
        title: "The Board: The Ring",
        body: "The board is the Ring of Fire itself — 27 hexagonal tiles, 24 forming a closed ring with a Sea Lane cutting straight through the hole in the middle.",
        bullets: [
          "24 rim tiles: 6 sectors of 3 land tiles, with a Ready Post at each junction.",
          "Rim neighbours are simply one step left or right along the ring.",
          "3 Sea Lane tiles cross the middle, joining two opposite Ready Posts and skipping 12 tiles of walking.",
          "The Sea Lane costs 2 AP per tile, carries 1 villager at a time, and shuts completely during an Oceanic disaster.",
          "Ready Posts are immune to disaster damage and are the evacuation destination.",
          "Damage runs in two stages: Normal → Cracked (entering costs +1 AP) → Destroyed (impassable, anyone on it is lost).",
        ],
      },
      loop: {
        title: "The Round — 5 Phases",
        body: "Every round runs in a fixed order. The order is never rearranged.",
      },
      turns: {
        title: "Phase 3 — Spending 4 AP",
        body: "Each player gets 4 Action Points per round and may repeat the same action as long as the AP holds out.",
        costs: [
          { action: "Move to an adjacent tile", cost: "1 AP (2 AP if the destination is Cracked)" },
          { action: "Move along the Sea Lane", cost: "2 AP, 1 villager max" },
          { action: "Calm a villager (Panicked → Calm)", cost: "2 AP" },
          { action: "Escort / evacuate a villager", cost: "1 AP" },
          { action: "Investigate (draw 1 Evidence)", cost: "1 AP" },
          { action: "Play Evidence onto a lock", cost: "0 AP" },
          { action: "Discard Evidence for its Resource", cost: "0 AP" },
          { action: "Barter Evidence", cost: "1 AP" },
          { action: "Your role's Active ability", cost: "0 AP, once per round" },
        ],
      },
      commitFlip: {
        title: "Commit & Flip — the heart of the game",
        body: "There is no computer at the table that knows the answer. So the card itself becomes the computer. Three steps, and the order is absolute.",
        steps: [
          {
            title: "1. COMMIT",
            body: "Open both 5W1H locks with matching Evidence — the 3-point HOW card is a wildcard that opens any lock. Then say the verdict out loud together and place the Verdict token: HOAX, FACT or Abstain. Once it is down, nobody changes their mind.",
          },
          {
            title: "2. FLIP",
            body: "Anyone may turn the News Card over. The back carries the true status, a two or three sentence explanation, and the red flags you were meant to catch.",
          },
          {
            title: "3. RESOLVE",
            body: "Compare your verdict against the answer. There are exactly three outcomes — and two of them look similar but mean very different things.",
          },
        ],
        note: "Feedback always arrives, 100% of the time. What changes is not whether you get told, but what it costs you.",
      },
      evidence: {
        title: "Evidence cards do two jobs",
        body: "Every Evidence card has two zones, and you only ever get to use one of them.",
        bullets: [
          "Top Zone — MIL effect: opens one lock of its category.",
          "Bottom Zone — Resource: discard it for a tactical gain (extra AP, an alternate route, a free calm, and so on).",
          "The 3-point HOW card (Official Confirmation) is a wildcard: it opens a lock of any category.",
          "That is the dilemma: use it to prove the truth, or spend it to save someone faster. Never both.",
        ],
      },
      roles: {
        title: "The Wildlife Guardians",
        body: "Each role has a Passive that is always on, a free Active ability once per round, and a personal Sub-Mission worth +2 Reputation to the team when it is completed. Six animals, one from each corner of the Pacific.",
      },
      economy: {
        title: "Reputation, Chaos and Rewards",
        bullets: [
          "A correct, fully-locked verification gives +1 Reputation. A finished Sub-Mission gives +2.",
          "A failed verification draws a Chaos card — a team-wide setback that stays until it is bought off.",
          "In Phase 5 you may trade Reputation for Reward cards: permanent upgrades for the whole team.",
        ],
      },
      demo: {
        title: "About this demo",
        body: "This web prototype is a supporting demo, not the finished product. The physical board game is the real deliverable — this only shows that the mechanics hold up.",
      },
    },
  },
} as const;

export type Strings = typeof en;

/** Back-compat alias: components still import `{ id }` from the i18n module. */
export const id = en;
