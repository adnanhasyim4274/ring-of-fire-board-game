// Animal silhouettes for the player standees. Keys are Role.id from
// data/roles.ts. These were still the v2 ids, so every one of the six
// current Guardians fell through to the generic paw fallback.
export const roleEmoji: Record<string, string> = {
  sumatran_tiger: "🐅",
  japanese_macaque: "🐒",
  bald_eagle: "🦅",
  andean_llama: "🦙",
  kea_parrot: "🦜",
  whale_shark: "🦈",
};

/** Safe for an unknown role id: a paw print stands in. */
export function emojiForRole(roleId: string): string {
  return roleEmoji[roleId] ?? "🐾";
}
