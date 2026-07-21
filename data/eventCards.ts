import type { EventCard } from "@/engine/types";

// Section 6.1 final content (evt_01–evt_05) plus 5 added cards for replayability.
// evt_03: the spec's "WHEN" lock is folded into HOW (timestamp check = forensic
// verification) per the builder note — see DECISIONS.md.
export const eventCards: EventCard[] = [
  {
    id: "evt_01",
    title: "Giant Tsunami Incoming!",
    body: "Warning! Seawater is already flooding the streets. Share this video with your whole family so they run NOW!",
    attachedContent: "A blurry video still showing a cloud-high wave sweeping over a skyscraper.",
    targetTileType: "coast",
    status: "hoax",
    requiredLocks: ["WHAT", "WHERE"],
    effectIfIgnored: "Panic Meter +1, villagers on the Coastal Area tile become panicked.",
    ignored: { panicTargetTile: true },
  },
  {
    id: "evt_02",
    title: "Insider Leak: Aftershock at 2 AM!",
    body: "Serious warning! Everyone needs to leave their homes tonight at exactly 2 AM. The ground is going to split open. Please forward this to your neighborhood group chat!",
    attachedContent: "A WhatsApp-style screenshot full of red siren emoji, tagged 'Forwarded many times.'",
    targetTileType: "city_center",
    status: "pseudoscience",
    requiredLocks: ["HOW", "WHO"],
    effectIfIgnored: "Panic Meter +1, the city's streets gridlock as villagers scramble to flee.",
    ignored: { panicTargetTile: true },
  },
  {
    id: "evt_03",
    title: "Emergency Donation for Lava Flow Victims!",
    body: "Families on the mountain slope are starving and haven't eaten in 3 days! The government is doing nothing. Please transfer whatever you can to Mr. X's personal account right now.",
    attachedContent: "A photo of a crying child holding an empty bowl in front of a ruined house.",
    targetTileType: "slope",
    status: "scam",
    requiredLocks: ["HOW", "WHY"], // original date check (HOW) OR poster's motive (WHY)
    effectIfIgnored: "Panic Meter +1, a relief player loses 1 AP next round from dealing with scammed villagers.",
    ignored: { apPenaltyFirstPlayer: true },
  },
  {
    id: "evt_04",
    title: "The Angry Earth Serpent!",
    body: "The ground in our village suddenly turned to mud and swallowed a house! It's because the Earth Serpent is angry — someone must have broken a taboo!",
    attachedContent: "Amateur footage of villagers crying hysterically as the ground caves in and sucks down a building.",
    targetTileType: "city_center",
    status: "superstition",
    requiredLocks: ["HOW"], // it's liquefaction, not a monster
    effectIfIgnored: "Villagers in the residential area refuse to evacuate (Permanently Panicked until special help arrives).",
    ignored: { panicTargetTile: true, permanentPanic: true },
  },
  {
    id: "evt_05",
    title: "Sudden Sea Withdrawal!",
    body: "Strange phenomenon! Villagers at the beach are confused seeing fish flopping around in the sand because the sea suddenly pulled back very far. Many are just happily collecting the fish.",
    attachedContent: "A photo of a suddenly-dry coral beach and villagers crowding around, backs to the sea.",
    targetTileType: "coast",
    status: "fact",
    requiredLocks: ["HOW"],
    effectIfIgnored: "No warning given — villagers stay on the beach, at high risk if a real tsunami hits.",
    effectIfValidated: "Successfully spreading the correct science! The team gets a bonus: villagers on the Coastal Area tile automatically move one step away from the shore.",
    ignored: { panicTargetTile: true },
    validated: { calmTargetTile: true, moveTargetTowardSafe: true },
  },
  // ——— Added cards (same pattern, more replay variety) ———
  {
    id: "evt_06",
    title: "Lava Already at the School Gates!",
    body: "LOOK at this photo — glowing lava is flowing right past the elementary school! Grab your kids and run, the whole slope is gone!",
    attachedContent: "A dramatic photo of lava flowing past a building — the school sign is oddly sharp while everything else is blurry.",
    targetTileType: "slope",
    status: "hoax",
    requiredLocks: ["WHAT", "WHERE"], // edited photo OR wrong location
    effectIfIgnored: "Panic Meter +1, villagers on the Mountain Slope tile become panicked.",
    ignored: { panicTargetTile: true },
  },
  {
    id: "evt_07",
    title: "This App Predicts Quakes From Clouds!",
    body: "Download QuakeCloud now! It reads 'earthquake clouds' in the sky and just predicted a magnitude 9 for tomorrow morning. Science doesn't want you to know!",
    attachedContent: "A screenshot of an app showing a long thin cloud circled in red with the caption '100% accurate!'.",
    targetTileType: "city_center",
    status: "pseudoscience",
    requiredLocks: ["HOW"], // no method can predict quakes from clouds
    effectIfIgnored: "Panic Meter +1, city villagers stay up all night watching the sky instead of preparing.",
    ignored: { panicTargetTile: true },
  },
  {
    id: "evt_08",
    title: "Last Seats on the Rescue Bus!",
    body: "Official evacuation buses are almost full! Reserve your family's seats NOW — just send the booking fee to this account and show the receipt to the driver.",
    attachedContent: "A forwarded flyer with a bus photo, a countdown timer, and a personal bank account number.",
    targetTileType: "city_center",
    status: "scam",
    requiredLocks: ["WHY", "WHO"], // profit motive OR fake account
    effectIfIgnored: "Panic Meter +1, a relief player loses 1 AP next round helping villagers who paid for seats that don't exist.",
    ignored: { apPenaltyFirstPlayer: true },
  },
  {
    id: "evt_09",
    title: "Ghost Lights on the Forest Ridge!",
    body: "Strange floating lights were seen between the trees last night. The forest spirits are furious — nobody is allowed to pass the ridge or use the evacuation path!",
    attachedContent: "A shaky night video of faint orange glows drifting between dark trees.",
    targetTileType: "forest_slope",
    status: "superstition",
    requiredLocks: ["HOW", "WHO"], // it's venting volcanic gas igniting — ask the observatory
    effectIfIgnored: "Villagers refuse to use the forest evacuation path (Permanently Panicked until special help arrives).",
    ignored: { panicTargetTile: true, permanentPanic: true },
  },
  {
    id: "evt_10",
    title: "Official Advisory: Aftershocks Expected",
    body: "BMKG confirms: aftershocks of decreasing strength are expected near the fault line over the next 24 hours. Stay away from cracked buildings and follow your local assembly point signs.",
    attachedContent: "A press-briefing photo from the official geophysics agency with a magnitude chart.",
    targetTileType: "fault_zone",
    status: "fact",
    requiredLocks: ["WHO"], // confirm it really is the official source
    effectIfIgnored: "The advisory is dismissed as 'just another rumor' — fault-line villagers panic.",
    effectIfValidated: "Clear instructions reach everyone: villagers on Fault Zone tiles calm down and line up for evacuation.",
    ignored: { panicTargetTile: true },
    validated: { calmTileType: "fault_zone" },
  },
];

export const eventCardById: Record<string, EventCard> = Object.fromEntries(
  eventCards.map((c) => [c.id, c])
);

export const eventCardIds: string[] = eventCards.map((c) => c.id);
