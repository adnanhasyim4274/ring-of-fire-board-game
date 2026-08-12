// ==========================================================================
// Generated from the print artwork in E:\archives\ringoffire\desain.
// Do not edit by hand: rerun scratchpad/build_assets.py instead.
//
// Only artwork that maps unambiguously to game data is listed here. The
// Disaster, News and Evidence fronts are deliberately absent, because their
// filenames carry no card id and guessing the mapping would put the wrong
// rule text in front of a player.
// ==========================================================================

export const ART = {
  roleCard: {
    sumatran_tiger: "/art/role/sumatran_tiger.webp",
    japanese_macaque: "/art/role/japanese_macaque.webp",
    bald_eagle: "/art/role/bald_eagle.webp",
    andean_llama: "/art/role/andean_llama.webp",
    kea_parrot: "/art/role/kea_parrot.webp",
    whale_shark: "/art/role/whale_shark.webp",
    back: "/art/role/back.webp",
  } as Record<string, string>,
  tile: {
    desert: { normal: "/art/tile/desert.webp", destroyed: "/art/tile/desert-destroyed.webp" },
    island: { normal: "/art/tile/island.webp", destroyed: "/art/tile/island-destroyed.webp" },
    sea: { normal: "/art/tile/sea.webp", destroyed: "/art/tile/sea-destroyed.webp" },
    snow: { normal: "/art/tile/snow.webp", destroyed: "/art/tile/snow-destroyed.webp" },
    volcano: { normal: "/art/tile/volcano.webp", destroyed: "/art/tile/volcano-destroyed.webp" },
  } as Record<string, { normal: string; destroyed: string }>,
  token: {
    verdict_fact: "/art/token/verdict-fact.webp",
    verdict_hoax: "/art/token/verdict-hoax.webp",
    verdict_abstain: "/art/token/verdict-abstain.webp",
    action_point: "/art/token/action-point.webp",
    reputation_point: "/art/token/reputation-point.webp",
  },
  disasterCard: {
    dis_atm_01: "/art/disaster/dis_atm_01.webp",
    dis_atm_02: "/art/disaster/dis_atm_02.webp",
    dis_atm_03: "/art/disaster/dis_atm_03.webp",
    dis_atm_04: "/art/disaster/dis_atm_04.webp",
    dis_oce_01: "/art/disaster/dis_oce_01.webp",
    dis_oce_02: "/art/disaster/dis_oce_02.webp",
    dis_oce_03: "/art/disaster/dis_oce_03.webp",
    dis_oce_04: "/art/disaster/dis_oce_04.webp",
    dis_tec_01: "/art/disaster/dis_tec_01.webp",
    dis_tec_02: "/art/disaster/dis_tec_02.webp",
    dis_tec_03: "/art/disaster/dis_tec_03.webp",
    dis_tec_04: "/art/disaster/dis_tec_04.webp",
    dis_vol_01: "/art/disaster/dis_vol_01.webp",
    dis_vol_02: "/art/disaster/dis_vol_02.webp",
    dis_vol_03: "/art/disaster/dis_vol_03.webp",
    dis_vol_04: "/art/disaster/dis_vol_04.webp",
    back: "/art/disaster/back.webp",
  } as Record<string, string>,
  panicMeter: "/art/hud/panic-meter.webp",
  boardMap: "/art/board/map.webp",
  boxFront: "/art/box/front.webp",
} as const;
