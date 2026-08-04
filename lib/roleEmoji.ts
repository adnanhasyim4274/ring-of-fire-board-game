// Siluet satwa untuk standee pemain. Kunci = Role.id dari data/roles.ts.
export const roleEmoji: Record<string, string> = {
  elang: "🦅",
  orangutan: "🦧",
  harimau: "🐯",
  monyet: "🐒",
  komodo: "🦎",
};

/** Aman dipakai walau data peran belum dikenal — jejak kaki sebagai cadangan. */
export function emojiForRole(roleId: string): string {
  return roleEmoji[roleId] ?? "🐾";
}
