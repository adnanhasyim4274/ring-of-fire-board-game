import type { Role } from "@/engine/types";

export const roles: Role[] = [
  {
    id: "eagle",
    name: "Eagle",
    nickname: "The Scout",
    ability:
      "Once per round: peek at the top card of the Disaster Deck to see what the Ring of Fire is planning next.",
    abilityType: "peek_disaster",
  },
  {
    id: "komodo",
    name: "Komodo Dragon",
    nickname: "The Grounder",
    ability:
      "Once per round (free): cancel the panic on the tile where you are standing — calm every villager there and remove the crisis token.",
    abilityType: "cancel_panic",
  },
  {
    id: "monkey",
    name: "Monkey",
    nickname: "The Networker",
    ability:
      "Draws 1 extra Evidence Card each round (favoring WHY/WHO rumors), but loses 1 AP next round whenever a hoax goes un-debunked.",
    abilityType: "bonus_evidence",
  },
  {
    id: "orangutan",
    name: "Orangutan",
    nickname: "The Scientist",
    ability:
      "Once per round: peek at the top card of the Event Deck before it's revealed publicly.",
    abilityType: "peek_event",
  },
  {
    id: "tiger",
    name: "Tiger",
    nickname: "The Responder",
    ability:
      "Gets a bonus +1 Action Point specifically for evacuation: the first Escort action each round costs 1 less AP.",
    abilityType: "bonus_ap",
  },
];

export const roleById: Record<string, Role> = Object.fromEntries(roles.map((r) => [r.id, r]));
