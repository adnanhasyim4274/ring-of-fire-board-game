// ============================================================================
// RING OF FIRE v3.0 — Reward / Upgrade Cards (10)
// Bought with Reputation in Phase 5. Reputation only comes from verifications
// that are correct AND fully locked — a lucky guess earns nothing.
// Source: docs/00-MASTER-SPEC-v3.md §4.5
// ============================================================================

import type { RewardCard, RewardEffectKey } from "@/engine/types";

export const rewardCards: RewardCard[] = [
  {
    id: "rew_peta_evakuasi",
    title: "Evacuation Chart",
    cost: 2,
    description:
      "The crossing is finally charted and buoyed. Sea Lane tiles cost 1 AP instead of 2.",
    effectKey: "sea_lane_cheap",
  },
  {
    id: "rew_pengeras_suara_desa",
    title: "Village Loudspeaker",
    cost: 2,
    description:
      "One horn on the village hall beats a hundred forwarded messages. Calming costs 1 less AP.",
    effectKey: "calm_cheap",
  },
  {
    id: "rew_radio_komunitas",
    title: "Community Radio",
    cost: 3,
    description:
      "A frequency the community owns, broadcast from the post itself, with nobody in between. Every Guardian gains +1 AP permanently.",
    effectKey: "ap_up",
  },
  {
    id: "rew_dermaga_darurat",
    title: "Emergency Jetty",
    cost: 3,
    description:
      "Pontoons and steel ladders go in at both ends of the crossing. Sea Lane tiles cost 1 AP.",
    effectKey: "sea_lane_cheap",
  },
  {
    id: "rew_pusat_data_warga",
    title: "Community Data Centre",
    cost: 3,
    description:
      "One big board listing everything already verified, readable by anyone who walks past. Hand limit +2.",
    effectKey: "hand_limit_up",
  },
  {
    id: "rew_jaringan_relawan",
    title: "Volunteer Network",
    cost: 4,
    description:
      "Dozens of extra hands to hold and circulate evidence. Hand limit +2 for every Guardian.",
    effectKey: "hand_limit_up",
  },
  {
    id: "rew_sekolah_siaga",
    title: "Disaster-Ready School",
    cost: 4,
    description:
      "Children drill the route until evacuation is reflex rather than an announcement. Calm costs 1 AP less.",
    effectKey: "calm_cheap",
  },
  {
    id: "rew_kampanye_klarifikasi",
    title: "Clarification Campaign",
    cost: 4,
    description:
      "A patient, repeatable, shareable correction finally overtakes the rumour. Buy off and discard 1 active Chaos card.",
    effectKey: "clear_chaos",
  },
  {
    id: "rew_klinik_lapangan",
    title: "Field Clinic",
    cost: 5,
    description:
      "A medical tent at the evacuation node restores both strength and trust. Buy off and discard 1 active Chaos card.",
    effectKey: "clear_chaos",
  },
  {
    id: "rew_drone_pemantau",
    title: "Survey Drone",
    cost: 5,
    description:
      "An eye overhead sends route imagery every ten minutes, so nobody has to guess their next step. Every Guardian gains +1 AP permanently.",
    effectKey: "ap_up",
  },
];

export const rewardCardById: Record<string, RewardCard> = Object.fromEntries(
  rewardCards.map((c) => [c.id, c])
);

/**
 * Every effect key above appears on exactly two cards, but the standing bonuses
 * are read with a yes/no test (`hasReward`) and applied once, so a second copy
 * of the same effect used to be a silent waste of Reputation.
 *
 * The fix is refusal rather than stacking: stacking would hand a team that
 * banks Reputation +2 AP, +4 hand limit and free crossings, which is exactly
 * the pressure the Panic Meter is supposed to keep on. `clear_chaos` is the one
 * exception — it is a one-shot that discards a Chaos card, so a second copy is
 * a second use, not a duplicate bonus.
 */
export const REPEATABLE_REWARD_EFFECTS: readonly RewardEffectKey[] = ["clear_chaos"];

export function isRepeatableReward(effectKey: RewardEffectKey): boolean {
  return REPEATABLE_REWARD_EFFECTS.includes(effectKey);
}

/**
 * The team already owns a card granting this effect, and buying another would
 * do nothing. Ready before the click, so the shop can say so on the card.
 */
export function isRewardEffectCovered(
  effectKey: RewardEffectKey,
  owned: readonly string[]
): boolean {
  if (isRepeatableReward(effectKey)) return false;
  return owned.some((id) => rewardCardById[id]?.effectKey === effectKey);
}

/** Kartu Reward yang mampu dibeli dengan Reputasi sekarang, termurah lebih dulu. */
export function affordableRewards(
  reputation: number,
  owned: string[] = []
): RewardCard[] {
  return rewardCards
    .filter(
      (r) =>
        !owned.includes(r.id) &&
        r.cost <= reputation &&
        !isRewardEffectCovered(r.effectKey, owned)
    )
    .sort((a, b) => a.cost - b.cost);
}
