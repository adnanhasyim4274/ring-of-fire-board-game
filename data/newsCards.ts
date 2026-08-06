// ============================================================================
// RING OF FIRE v3.0 — News Cards (16)
// 4 per category, spread across all 6 sectors. Exactly 5 are TRUE.
//
// The front of the card is what the table sees. Everything from `truth` down is
// printed on the BACK and only revealed after the team commits a verdict.
//
// Five cards are FACT on purpose: literacy is verification, not blanket
// suspicion. Refusing true information costs exactly as much as swallowing a lie.
//
// Source: docs/00-MASTER-SPEC-v3.md §4.1
// ============================================================================

import type { NewsCard } from "@/engine/types";

export const newsCards: NewsCard[] = [
  // ——— SOCIAL & SUPERSTITION ————————————————————————————————————————
  {
    id: "news_soc_01",
    category: "social_superstition",
    title: "The Serpent Under Merapi Has Woken",
    body: "The ground behind our village turned to grey mud overnight and swallowed a shed. The elders say the earth serpent is angry because someone broke a taboo. Nobody move until the offering is made. Share this so people stop digging!",
    attachedContent:
      "Shaky phone video: villagers standing around a collapsed patch of ground, someone sobbing off-camera.",
    targetSectorId: "sunda",
    truth: "hoax",
    locks: ["HOW", "WHO"],
    explanation:
      "The mud is liquefaction: strong shaking makes water-saturated soil temporarily behave like a liquid, so the ground loses its strength and structures sink. It is well documented, it has nothing to do with an animal, and waiting for a ritual keeps people standing on the exact ground that is failing.",
    redFlags:
      "An explanation that forbids action, an appeal to authority nobody can name, and a demand to stay put in the danger zone.",
    ifIgnored: { panic: 1, panicTargetSector: true, lockEvacuationSector: true },
    ifValidated: { removeCrisisToken: true, calmTargetSector: true },
  },
  {
    id: "news_soc_02",
    category: "social_superstition",
    title: "Rotorua's Geysers Fell Silent — The Ancestors Are Warning Us",
    body: "The big geyser has not erupted in four days. My aunt says this only happened once before, the year of the great flood. The ancestors are telling us to leave the coast and climb inland tonight. FORWARD THIS.",
    attachedContent:
      "A photo of a still, steaming geyser basin with a caption in a heavy dramatic font.",
    targetSectorId: "south_pacific",
    truth: "hoax",
    locks: ["HOW", "WHEN"],
    explanation:
      "Geyser intervals shift constantly with rainfall, groundwater and even nearby drilling — a quiet spell is ordinary and is not a forecasting tool. Worse, the instruction is backwards: this is a coastal region where the official advice in a real event is to move inland and uphill, which is not the same as an unplanned night-time scramble.",
    redFlags:
      "A single relative as the only source, a pattern claimed from one past coincidence, and an urgent instruction issued at night.",
    ifIgnored: { panic: 1, panicTargetSector: true },
    ifValidated: { removeCrisisToken: true, apBonus: 1 },
  },
  {
    id: "news_soc_03",
    category: "social_superstition",
    title: "The Mountain Spirit Demands We Stay",
    body: "Anyone who abandons the village before the ceremony will bring the landslide down on the rest of us. That is what happened in 1998. Do not board the trucks. Tell your family.",
    attachedContent:
      "A voice note transcript circulating in a village group chat, forwarded more than forty times.",
    targetSectorId: "andes",
    truth: "hoax",
    locks: ["HOW", "WHY"],
    explanation:
      "Slope failure is driven by rainfall, seismic shaking and slope angle — leaving a hillside cannot trigger one. Messages that threaten collective punishment for evacuating are one of the most reliable ways misinformation turns deadly, because they convert a safety decision into a loyalty test.",
    redFlags:
      "Collective blame, a threat aimed at anyone who leaves, and a claim about a past event that nobody can check.",
    ifIgnored: { panic: 1, lockEvacuationSector: true },
    ifValidated: { removeCrisisToken: true, calmTargetSector: true },
  },
  {
    id: "news_soc_04",
    category: "social_superstition",
    title: "The Old Stone Says: Do Not Build Below This Point",
    body: "There is a carved stone above our village. It reads: remember the disaster of the great tsunami, do not build your homes below this point. People are saying it is just folklore. Is it?",
    attachedContent:
      "A photo of a weathered stone marker on a hillside path, moss in the carved characters.",
    targetSectorId: "hokkaido",
    truth: "fact",
    locks: ["WHERE", "HOW"],
    explanation:
      "These markers are real. Tsunami stones along the Sanriku coast were placed by survivors of earlier disasters, and the settlements that respected the line above them fared measurably better in later events. It is inherited hazard mapping, written in stone because paper does not last a century.",
    redFlags:
      "None — and that is the lesson. Dismissing this as 'just superstition' would throw away a genuine, verifiable hazard record. Check the source before you discard it.",
    ifIgnored: { panic: 1, panicTargetSector: true },
    ifValidated: { removeCrisisToken: true, stepTowardReadyPost: true },
  },

  // ——— VISUAL MANIPULATION ——————————————————————————————————————————
  {
    id: "news_vis_01",
    category: "visual_manipulation",
    title: "25-Metre Wall of Water Filmed Off Sanriku",
    body: "LOOK AT THIS. The wave is already taller than the apartment blocks. Get your family and RUN, do not wait for the siren!!",
    attachedContent:
      "A 9-second clip of an enormous wave curling over a seafront city. The water surface shimmers oddly and the building edges wobble between frames.",
    targetSectorId: "hokkaido",
    truth: "hoax",
    locks: ["WHAT", "WHERE"],
    explanation:
      "The clip was produced with a video generator. The giveaways are physical: real water does not shimmer with a uniform texture, and solid architecture does not flex between frames. The skyline also does not match the coast it claims to show.",
    redFlags:
      "Melting edges on buildings, water that looks like fabric, and an instruction to ignore the official siren.",
    ifIgnored: { panic: 1, panicTargetSector: true },
    ifValidated: { removeCrisisToken: true, calmTargetSector: true },
  },
  {
    id: "news_vis_02",
    category: "visual_manipulation",
    title: "Leaked Satellite Image: The San Andreas Has Split Open",
    body: "This is the image they took down within an hour. A crack you can see from orbit. Why is nobody reporting this?",
    attachedContent:
      "A satellite-style image of dry terrain with a stark black fissure running across it, corner metadata cropped away.",
    targetSectorId: "cascadia",
    truth: "hoax",
    locks: ["WHAT", "WHEN"],
    explanation:
      "The fissure was painted in: its edges are uniformly sharp while the surrounding terrain is soft, and it casts no shadow even though nearby ridges do. The underlying scene is an unmodified public satellite image several years old.",
    redFlags:
      "Cropped metadata, a shadowless feature, and the 'they deleted it' framing that makes the absence of coverage feel like proof.",
    ifIgnored: { panic: 1, panicTargetSector: true },
    ifValidated: { removeCrisisToken: true, drawEvidence: 1 },
  },
  {
    id: "news_vis_03",
    category: "visual_manipulation",
    title: "A New Island Is Rising Beside Taal",
    body: "Fishermen filmed land coming out of the water this morning. The government has said nothing. Something is being hidden from us.",
    attachedContent:
      "Drone-style footage of steaming water with a dark mass breaking the surface. The steam loops seamlessly every two seconds.",
    targetSectorId: "philippine",
    truth: "hoax",
    locks: ["WHAT", "WHO"],
    explanation:
      "Submarine eruptions can build new land — that part is real, which is what makes this convincing. But this particular footage is synthetic: the steam repeats on a short loop, and the account that posted it was created the same week and has no other content.",
    redFlags:
      "A looping background, a brand-new account, and a real phenomenon used as cover for a fake recording.",
    ifIgnored: { panic: 1, panicTargetSector: true },
    ifValidated: { removeCrisisToken: true, apBonus: 1 },
  },
  {
    id: "news_vis_04",
    category: "visual_manipulation",
    title: "That Ash Column Over Merapi Is Real",
    body: "People keep saying this photo is edited because it looks too dramatic. I took it myself from the ridge road at 06:40 this morning.",
    attachedContent:
      "A crisp photo of a dense grey eruption column, sunrise light on one side, ash shadow falling across the valley.",
    targetSectorId: "sunda",
    truth: "fact",
    locks: ["WHAT", "WHO"],
    explanation:
      "The image is authentic. The lighting on the column matches the stated time of day, the ash shadow falls in the direction the sun would put it, and the observatory's own bulletin logged an ash emission in the same window.",
    redFlags:
      "None — the trap here is the opposite one. Calling every dramatic image fake is its own failure, and dismissing this delays a response that is genuinely needed.",
    ifIgnored: { panic: 1, panicTargetSector: true },
    ifValidated: { removeCrisisToken: true, stepTowardReadyPost: true },
  },

  // ——— FRAUD MOTIVE ————————————————————————————————————————————————
  {
    id: "news_fra_01",
    category: "fraud_motive",
    title: "Emergency Donation for Valparaíso Families",
    body: "Families on the coast have not eaten in three days and the authorities are doing nothing. Send whatever you can directly to the account below — every peso goes straight to them. Please do not scroll past.",
    attachedContent:
      "A photo of a crying child in front of a collapsed house, with a personal bank account number overlaid.",
    targetSectorId: "andes",
    truth: "hoax",
    locks: ["WHY", "WHO"],
    explanation:
      "The photograph is from a different disaster on another continent, years ago. Legitimate relief runs through registered organisations that publish their accounts; a personal account number with no organisation behind it is the single clearest sign of a disaster scam.",
    redFlags:
      "A private account number, urgency stacked on guilt, and an image that cannot be traced to the event it claims.",
    ifIgnored: { panic: 1, apPenaltyFirstPlayer: 1 },
    ifValidated: { removeCrisisToken: true, drawEvidence: 1 },
  },
  {
    id: "news_fra_02",
    category: "fraud_motive",
    title: "Last Seats on the Evacuation Ferry",
    body: "Only 40 seats left on tonight's ferry. Reserve now by sending the booking fee and show the receipt at the pier. Do not wait, the boat leaves at 22:00.",
    attachedContent:
      "A flyer with a ferry photo, a countdown timer graphic, and a payment link.",
    targetSectorId: "philippine",
    truth: "hoax",
    locks: ["WHY", "WHEN"],
    explanation:
      "Official evacuation transport is never sold seat by seat, and never by advance transfer to an individual. The countdown is the product: manufactured scarcity is what stops people checking, which is exactly when they pay.",
    redFlags:
      "A fee for something that is free in a real emergency, a ticking clock, and payment demanded before any verification.",
    ifIgnored: { panic: 1, apPenaltyFirstPlayer: 1 },
    ifValidated: { removeCrisisToken: true, apBonus: 1 },
  },
  {
    id: "news_fra_03",
    category: "fraud_motive",
    title: "Install QuakeShield Before the Big One",
    body: "This app gives you a 30-second warning before any earthquake. Free download, but you have to allow contacts and location for the alert network to work. Everyone in Seattle should have it.",
    attachedContent:
      "An app store listing with a five-star rating and a screenshot of a red alert countdown.",
    targetSectorId: "cascadia",
    truth: "hoax",
    locks: ["WHY", "WHO"],
    explanation:
      "Genuine earthquake early warning is run by public agencies and needs no access to your contacts. This app harvests the permissions it asks for; the countdown screen is a mock-up, and the developer has no seismic network behind it.",
    redFlags:
      "Permissions unrelated to the stated function, a public safety service offered by an unknown private developer, and reviews all posted in the same week.",
    ifIgnored: { panic: 1, apPenaltyFirstPlayer: 1 },
    ifValidated: { removeCrisisToken: true, drawEvidence: 1 },
  },
  {
    id: "news_fra_04",
    category: "fraud_motive",
    title: "The National Relief Fund for Tonga Is Now Open",
    body: "Donations are open through the national disaster agency's official portal. The link is on their verified page and on the government domain. Shared because people keep asking where to send help.",
    attachedContent:
      "A screenshot of a government domain donation page with the agency's published registration number.",
    targetSectorId: "south_pacific",
    truth: "fact",
    locks: ["WHO", "WHERE"],
    explanation:
      "This one checks out. The link resolves to a government domain, the agency's registration number is published and matches, and the appeal appears on the agency's own verified channel rather than only in forwarded messages.",
    redFlags:
      "None — and treating every donation appeal as a scam is its own harm. The skill is telling a registered agency on its own domain apart from a stranger's account number.",
    ifIgnored: { panic: 1 },
    ifValidated: { removeCrisisToken: true, apBonus: 1, drawEvidence: 1 },
  },

  // ——— PSEUDOSCIENCE ————————————————————————————————————————————————
  {
    id: "news_pse_01",
    category: "pseudoscience",
    title: "Earthquake Clouds Over Seattle — Megathrust Tomorrow",
    body: "Look at the sky right now. Those long straight clouds are earthquake clouds. Every major quake has them 24 hours before. Tomorrow morning. I am not joking, get out of the city.",
    attachedContent:
      "A photo of a long thin cloud band at sunset, circled in red marker.",
    targetSectorId: "cascadia",
    truth: "hoax",
    locks: ["HOW", "WHEN"],
    explanation:
      "There is no mechanism linking cloud shapes to fault rupture, and no method anywhere can name the day of an earthquake. Long straight cloud bands are ordinary lee-wave formations produced by wind flowing over terrain.",
    redFlags:
      "A precise date, a claimed pattern with no mechanism, and a photo of a completely common weather feature.",
    ifIgnored: { panic: 1, panicTargetSector: true },
    ifValidated: { removeCrisisToken: true, calmTargetSector: true },
  },
  {
    id: "news_pse_02",
    category: "pseudoscience",
    title: "Insider Leak: Aftershock at 02:00 Sharp",
    body: "My cousin works at the agency. Big aftershock tonight at exactly 2 AM. Get everyone out of the house before then. Please forward to your neighbourhood group.",
    attachedContent:
      "A chat screenshot dense with siren emoji, tagged 'Forwarded many times'.",
    targetSectorId: "sunda",
    truth: "hoax",
    locks: ["HOW", "WHO"],
    explanation:
      "Aftershock sequences follow statistical patterns — they decay predictably in rate — but no agency on earth can put a clock time on one. The 'insider relative' is the oldest disguise in rumour circulation because it is unfalsifiable.",
    redFlags:
      "An exact time, an unnamed insider, and the 'forwarded many times' label that should lower your trust rather than raise it.",
    ifIgnored: { panic: 1, panicTargetSector: true },
    ifValidated: { removeCrisisToken: true, apBonus: 1 },
  },
  {
    id: "news_pse_03",
    category: "pseudoscience",
    title: "The Sea Pulled Back and the Fish Are Stranded",
    body: "Strange scene at the beach — the water has gone out much further than any low tide and people are walking on the seabed picking up fish. Everyone is filming. Should we be worried?",
    attachedContent:
      "A photo of an unusually exposed shoreline with a crowd walking out onto the wet sand, backs to the horizon.",
    targetSectorId: "hokkaido",
    truth: "fact",
    locks: ["HOW", "WHAT"],
    explanation:
      "This is real and it is the most urgent sign on this whole deck. A sudden, extreme withdrawal of the sea is a tsunami precursor: the trough of the wave arrives before the crest. The correct response is to leave the shoreline immediately and move to high ground.",
    redFlags:
      "None in the report — the danger is in the crowd's reaction. Treating a genuine natural warning as a curiosity to film is how people die on beaches.",
    ifIgnored: { panic: 1, panicTargetSector: true },
    ifValidated: { removeCrisisToken: true, stepTowardReadyPost: true, apBonus: 1 },
  },
  {
    id: "news_pse_04",
    category: "pseudoscience",
    title: "Animals Are Coming Down Off Mayon",
    body: "Farmers on the lower slope say wildlife has been moving downhill in numbers since yesterday — birds, then the larger animals. Old people say that means something. Is there anything to it?",
    attachedContent:
      "A daylight photo of birds massed on a fence line with the volcano's shoulder behind them.",
    targetSectorId: "philippine",
    truth: "fact",
    locks: ["HOW", "WHERE"],
    explanation:
      "The observation is genuine and worth acting on, though not for mystical reasons. Animals detect changes people miss — ground temperature, gas emission, small tremors — and the volcano observatory's instruments recorded matching signals on the same slope. Corroboration is what turns an anecdote into evidence.",
    redFlags:
      "None, provided you check it against instruments. An animal report alone proves nothing; an animal report that matches the monitoring data is a real signal.",
    ifIgnored: { panic: 1, panicTargetSector: true },
    ifValidated: { removeCrisisToken: true, stepTowardReadyPost: true },
  },
];

export const newsCardById: Record<string, NewsCard> = Object.fromEntries(
  newsCards.map((c) => [c.id, c])
);

export const newsCardsByCategory = newsCards.reduce<Record<string, NewsCard[]>>(
  (acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  },
  {}
);

export function buildNewsDeck(): string[] {
  return newsCards.map((c) => c.id);
}
