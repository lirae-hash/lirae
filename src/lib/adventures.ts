/**
 * Lightweight adventure catalog for UI (shelf, setup screen, share card).
 *
 * Kept separate from src/lib/dna/settings so client components don't bundle
 * every adventure's full prose/slots. Keep ids + order in sync with
 * src/lib/dna/settings/index.ts (ALL_SETTINGS).
 */

export interface AdventureCard {
  id: string;
  title: string;
  trope: string;
  blurb: string;
  heroName: string;
}

export const ADVENTURE_CATALOG: AdventureCard[] = [
  {
    id: "the-kitchen",
    title: "The Kitchen",
    trope: "Enemies to Lovers",
    blurb: "A pastry chef with a score to settle. The chef who destroyed her reputation. One Michelin-starred kitchen. Paris.",
    heroName: "Julian",
  },
  {
    id: "cedar-hollow",
    title: "Cedar Hollow",
    trope: "Enemies to Lovers",
    blurb: "You swore you'd never come back. Now you're home to settle your grandmother's estate — and the boy you left, the one who never fought for you to stay, is the only man standing between you and leaving again.",
    heroName: "Eli",
  },
  {
    id: "the-acquisition",
    title: "The Acquisition",
    trope: "Enemies to Lovers",
    blurb: "You're the heir to a media empire and the only person who's ever beaten Adrian Vale. Now his firm has launched a hostile takeover of everything you built — and thirty days locked in a room with him will decide who walks away with it all.",
    heroName: "Adrian",
  },
  {
    id: "the-inheritance",
    title: "The Inheritance",
    trope: "Enemies to Lovers",
    blurb: "You're the journalist who got too close to the Ashbournes — and now you're named in the patriarch's will, trapped inside the estate for thirty days with the dangerous man who's spent a year destroying you. He wants you gone. You don't scare.",
    heroName: "Damon",
  },
];

export const ADVENTURE_CARDS_BY_ID: Record<string, AdventureCard> = Object.fromEntries(
  ADVENTURE_CATALOG.map((a) => [a.id, a])
);

export function getAdventureCard(id: string): AdventureCard | undefined {
  return ADVENTURE_CARDS_BY_ID[id];
}
