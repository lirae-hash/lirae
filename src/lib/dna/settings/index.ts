import { THE_KITCHEN } from "./the-kitchen";
import { CEDAR_HOLLOW } from "./cedar-hollow";
import { THE_ACQUISITION } from "./the-acquisition";
import { THE_INHERITANCE } from "./the-inheritance";

export type AdventureSetting = typeof THE_KITCHEN;

// Display / shelf order.
export const ALL_SETTINGS: AdventureSetting[] = [
  THE_KITCHEN,
  CEDAR_HOLLOW,
  THE_ACQUISITION,
  THE_INHERITANCE,
];

export const SETTINGS_BY_ID: Record<string, AdventureSetting> = Object.fromEntries(
  ALL_SETTINGS.map((s) => [s.id, s])
);

export function getSetting(id: string): AdventureSetting | undefined {
  return SETTINGS_BY_ID[id];
}

export { THE_KITCHEN, CEDAR_HOLLOW, THE_ACQUISITION, THE_INHERITANCE };
