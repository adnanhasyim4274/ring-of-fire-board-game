// ============================================================================
// RING OF FIRE v3.0 — which printed News card front goes on which News card.
//
// The illustrator's files are named by position in the print sheet
// (`Front_News Card 7.png`), not by card id, so the mapping below was
// established by READING THE PRINTED HEADLINE off each artwork and matching it
// against `data/newsCards.ts`. Nothing here is inferred from a filename.
//
// ASSET PIPELINE — source file -> card id (the only pair that resolves):
//
//   desain/News_Card/Front_News Card.png      ->  news_vis_02
//
// The other thirteen fronts carry headlines that exist nowhere in
// `data/newsCards.ts`, so they have no id to be filed under and are
// deliberately absent:
//
//   Front_News Card 2.png   "Viral Thread: Crow Migration Signals Doomsday!"
//   Front_News Card 3.png   "Secret Cult & The Earth God's Wrath"
//   Front_News Card 4.png   "Global Elite Conspiracy: Weather Weapon!"
//   Front_News Card 5.png   "Discovery Of Radiation-Healing Spring"
//   Front_News Card 6.png   "Deepfake Early Warning: Immediate Evacuation!"
//   Front_News Card 7.png   "Leaked Satellite Photo: Seafloor Fissure"
//   Front_News Card 8.png   "Tsunami Buoy Activation"
//   Front_News Card 9.png   "Seismic Foreshock Swarm"
//   Front_News Card 10.png  "Crater Dome Expansion"
//   Front_News Card 11.png  "Abrupt Tidal Receding"
//   Front_News Card 12.png  "Toxic SO2 Gas Plume"
//   Front_News Card 13.png  "Impending Mudflow Warning"
//   Front_News Card 14.png  "Structural Fatigue On Main Bridge"
//
// Several of those are thematically close to a v3 card (11 reads like
// `news_pse_03`, 2 like `news_pse_04`) but the headline, the post body, the
// attached-content note and at least one of the two locks all differ, so
// treating them as the same card would put the wrong debrief in front of a
// player. They stay out until the writer supplies matching records.
//
// The two backs (`Back_News Card_FACT.png`, `Back_News Card_HOAX 2.png`) are a
// single FACT/HOAX stamp each with no card-specific text, so they are one
// shared image per verdict rather than a per-card back. They are not listed
// here because `NewsCardDisplay` builds its own back from `explanation`,
// `redFlags` and the two effect blocks, none of which the printed back carries.
//
// NOTE for whoever reads the art on the table: `Front_News Card.png` prints
// "Target Sector: Peaks", a label from the pre-v3 sector list. The card's real
// target in v3 is Cascadia, which is why the sector line is still rendered from
// game data underneath the artwork.
// ============================================================================

/**
 * News card id -> printed front artwork. Only ids present here get the art
 * treatment; every other card falls back to the text layout.
 */
export const NEWS_ART: Record<string, string> = {
  news_vis_02: "/art/news/news_vis_02.webp",
};
