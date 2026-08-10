// ============================================================================
// Ability icons — playtesters asked for a glyph instead of a wall of text.
// Every icon is chosen from what the ability DOES (carry, peek, swap, calm,
// cross water), never from the animal that owns it. Two Guardians with a
// similar action would share a glyph; the animal art lives in roleEmoji.ts.
// Keys mirror data/roles.ts: ActiveAbilityKey, SubMissionKey and Role.id.
// ============================================================================

import { createElement, type ReactElement } from "react";
import {
  Anchor,
  ArrowLeftRight,
  Binoculars,
  Gem,
  HandHeart,
  HandHelping,
  HeartHandshake,
  KeyRound,
  Layers,
  LifeBuoy,
  LockOpen,
  MapPin,
  Radio,
  ShieldCheck,
  Ship,
  Sparkles,
  Target,
  UsersRound,
  WavesHorizontal,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ActiveAbilityKey, SubMissionKey } from "@/engine/types";

/** Active abilities: the icon is the verb the player performs. */
const activeIcons: Record<ActiveAbilityKey, LucideIcon> = {
  // Tiger — end a move on villagers, gain AP that only buys Escort.
  tactical_escort: UsersRound,
  // Macaque — spend Evidence to force one lock open.
  data_mining: LockOpen,
  // Eagle — look at the top card before anyone else does.
  recon: Binoculars,
  // Llama — stand still, calm the crowd, lift the Crisis Token.
  suppress: HeartHandshake,
  // Kea — read a hand, then trade one card out of it.
  network_sync: ArrowLeftRight,
  // Whale Shark — push a villager along the current.
  open_water: WavesHorizontal,
};

/** Sub-missions: the icon is the goal being tracked. */
const subMissionIcons: Record<SubMissionKey, LucideIcon> = {
  // Tiger — pull people out of tiles under a Crisis Token.
  rescue_crisis: LifeBuoy,
  // Macaque — hoard the highest-value Evidence.
  collect_3pt: Gem,
  // Eagle — stand on damaged ground and chart it.
  critical_mapping: MapPin,
  // Llama — total villagers talked down.
  calm_six: HandHeart,
  // Kea — the card you handed over was the key that cracked the round.
  catalyst: KeyRound,
  // Whale Shark — villagers landed safely on the far side.
  safe_passage: Anchor,
};

/** Passives: keyed by role id, because a passive has no key of its own. */
const passiveIcons: Record<string, LucideIcon> = {
  // Strong Back — two villagers carried for the price of one.
  sumatran_tiger: HandHelping,
  // Walking Archive — a bigger hand of cards than anyone else.
  japanese_macaque: Layers,
  // High Altitude — terrain penalties simply do not apply.
  bald_eagle: Wind,
  // Steady Herd — Auto-Panic cannot fire on your tile.
  andean_llama: ShieldCheck,
  // Ground Signal — barter at any range.
  kea_parrot: Radio,
  // Open Water — the Sea Lane is a cheap road for you.
  whale_shark: Ship,
};

export function iconForActive(activeKey: ActiveAbilityKey): LucideIcon {
  return activeIcons[activeKey] ?? Zap;
}

export function iconForSubMission(subMissionKey: SubMissionKey): LucideIcon {
  return subMissionIcons[subMissionKey] ?? Target;
}

export function iconForPassive(roleId: string): LucideIcon {
  return passiveIcons[roleId] ?? Sparkles;
}

/**
 * Renders one of the icons above. Takes the component as a prop so callers
 * never assign a looked-up component to a capitalised local during render —
 * that pattern trips `react-hooks/static-components`.
 * Colour is inherited from the surrounding text; only sizing is passed in.
 */
export function AbilityIcon({
  icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}): ReactElement {
  return createElement(icon, { className, "aria-hidden": true });
}
