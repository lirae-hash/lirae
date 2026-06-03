import type { SpiceLevel, Vibe } from "@/types/database";

export interface Beat {
  number: number;
  name: string;
  title: string;
  emotionalFunction: string;
  fixedElements: string[];
  variableSlots: string[];
  hookType: "revelation" | "cliffhanger" | "choice";
  hookFunction: string;
  hasChoices: boolean;
  choiceDescriptions?: {
    a: string;
    b: string;
    c?: string;
  };
}

export const TROPE = "enemies-to-lovers";
export const TROPE_LABEL = "Enemies to Lovers";

export const VOICE_RULES = `
**POV:** Close third person. Stay in her head. We feel everything she feels, including things she won't admit to herself.

**Tense:** Past tense.

**Her character (fixed across all adventures):**
She is intelligent, competent, and privately tired of having to prove it. She does not shrink. She is not naive. She has been underestimated before and she will not let it happen again. She is also, underneath the armor, someone who wants things very much — she just doesn't say so.

**His character (fixed across all adventures):**
Julian Voss. Controlled. Composed to the point of maddening. Not cruel — precise. He chooses his words carefully and says less than he means. He has done something that hurt her, and he knows it. Whether he regrets it is the question the adventure slowly answers.

**Prose style reference:** Write like Emily Henry or Colleen Hoover — real, adult, emotionally precise. Not YA. Not purple. Not overwrought. The restraint is what makes it hit.

**What to avoid:**
- Describing her appearance to herself in mirrors
- "She didn't know why she felt this way" (she does know)
- His eyes changing color
- Telling the reader how to feel ("it was electrifying")
- Dialogue that exists only to explain backstory
`;

export const SPICE_RULES: Record<SpiceLevel, string> = {
  1: "Sweet warmth — Emotional tension only. Physical awareness limited to presence and voice. No body-scanning.",
  2: "Warm tension — Charged glances. Awareness of proximity. She notices his hands, his jaw, his stillness. Restrained.",
  3: "Slow burn — Electric. She is aware of exactly how close he is at all times. Almost-touches. Charged dialogue with subtext.",
};

export const VIBE_RULES: Record<Vibe, string> = {
  dark: "Dark Desire — Moody, atmospheric, intimate shadows. The tension lives in what's unsaid and unseen. Industrial textures, low light, shared exhaustion.",
  gold: "Golden Hour — Warm light, soft edges, the beauty of ordinary moments. Morning light through windows, the warmth of places that run on discipline and love.",
  rose: "Midnight Rose — Sensual, delicate, the world of sweetness with depth. The way beauty is always a form of seduction if you're paying attention.",
  sage: "Emerald Envy — Earthy richness, tradition as weight and legacy. The lushness of place and season and memory.",
};

export const BEATS: Beat[] = [
  {
    number: 1,
    name: "The Clash",
    title: "The Rival",
    emotionalFunction: "Establish the enemy dynamic and the attraction simultaneously. She must feel both in the same moment — the threat and the pull.",
    fixedElements: [
      "She arrives somewhere and senses him before she sees him",
      "When she sees him, she recognises who he is immediately",
      "The power imbalance is established — he has something over her professionally",
      "She is shown to be formidable. She does not break. She does not flinch visibly.",
      "He notices her noticing him. He is not surprised to see her.",
      "The chapter ends before any real conversation happens — just the fact of him",
    ],
    variableSlots: ["LOCATION", "HIS ROLE", "HER ROLE", "WHAT HE DID", "THE DETAIL"],
    hookType: "revelation",
    hookFunction: "Something she learns at the end of this chapter changes the power dynamic. It's not what she expected.",
    hasChoices: true,
    choiceDescriptions: {
      a: "Bold/direct — she initiates contact on her own terms",
      b: "Strategic — she gathers information before moving",
      c: "Unexpected — she does something that reveals more about her than him",
    },
  },
  {
    number: 2,
    name: "Forced Proximity",
    title: "No Escape",
    emotionalFunction: "Remove the option to avoid each other. They must now exist in close quarters. The irritation is real. So is everything else.",
    fixedElements: [
      "A situation forces them into physical or professional proximity",
      "She tries to establish distance or rules; he does not fight it but doesn't help her either",
      "One moment of accidental closeness — not romantic, just physical reality",
      "She catches herself noticing something about him that is not his professional role",
      "She immediately rationalises it",
    ],
    variableSlots: ["PROXIMITY CATALYST", "CLOSE QUARTERS SCENE", "THE THING SHE NOTICES"],
    hookType: "cliffhanger",
    hookFunction: "Something external cuts the chapter at the worst possible moment — the situation just got harder to escape.",
    hasChoices: true,
    choiceDescriptions: {
      a: "She leans into the proximity — makes it her advantage",
      b: "She establishes a clear professional boundary, out loud",
    },
  },
  {
    number: 3,
    name: "Reluctant Truce",
    title: "Fine",
    emotionalFunction: "They need each other. Both hate it. The truce is practical, not warm — but something shifts when they actually work together.",
    fixedElements: [
      "A shared goal or crisis forces genuine cooperation",
      "He is unexpectedly good at something she respects",
      "She is unexpectedly good at something he needed",
      "They achieve something together. Neither says so.",
      "The chapter ends with the truce holding — but something underneath it has changed",
    ],
    variableSlots: ["THE SHARED GOAL", "HIS COMPETENCE", "HER COMPETENCE", "THE MOMENT IT SHIFTS"],
    hookType: "choice",
    hookFunction: "The chapter ends on an offered gesture — not romantic, but the first genuinely human thing between them. The reader decides whether she accepts it.",
    hasChoices: true,
    choiceDescriptions: {
      a: "Accept the gesture — acknowledge the shift",
      b: "Deflect with professionalism — protect the distance",
    },
  },
  {
    number: 4,
    name: "First Crack",
    title: "Something Real",
    emotionalFunction: "A crack in his armor. She sees something beneath the composure that is not the enemy she constructed. It unsettles her more than his competence ever did.",
    fixedElements: [
      "She encounters him outside his professional role, or in a moment he didn't control",
      "He is briefly, undeniably human",
      "She has a choice: exploit it or protect it. She chooses without quite deciding to.",
      "He knows she saw. He does not address it.",
      "She spends the rest of the chapter trying to un-see it",
    ],
    variableSlots: ["THE CRACK SCENE", "WHAT SHE SEES", "HER CHOICE"],
    hookType: "revelation",
    hookFunction: "She finds out something about his past that reframes what he did to her. Not exonerates — reframes. She is not ready for this information.",
    hasChoices: true,
    choiceDescriptions: {
      a: "Confront the new information directly",
      b: "File it away and say nothing — for now",
    },
  },
  {
    number: 5,
    name: "The Almost",
    title: "Almost",
    emotionalFunction: "The pivot of the entire adventure. The tension that has been building since ch.1 reaches a peak and breaks — but not into resolution. Into awareness. She cannot pretend anymore that this is only professional.",
    fixedElements: [
      "A specific scene of forced, extended closeness — not accidental, intentional on someone's part",
      "The space between them becomes the subject of the scene without either of them saying so",
      "He moves closer. Or she does. Or neither does but both want to.",
      "Something specific — not an interruption, but a choice — stops it",
      "The chapter ends without resolution. The reader feels the exact shape of what didn't happen.",
    ],
    variableSlots: ["THE ALMOST SCENE", "WHO MOVES", "THE INTERRUPTION"],
    hookType: "revelation",
    hookFunction: "The midpoint lands without asking anything of the reader. She just feels it.",
    hasChoices: false,
  },
  {
    number: 6,
    name: "The Setback",
    title: "What She Found",
    emotionalFunction: "She finds out what he did — the full shape of it. Not a rumour. Evidence. The walls go back up. This is worse than before ch.4 because now she knows what she was starting to feel.",
    fixedElements: [
      "She discovers the truth of what he did without him present",
      "The discovery recontextualises something warm from a previous chapter — now it reads as manipulation",
      "She does not confront him immediately. She sits with it.",
      "The chapter ends before the confrontation — reader chooses how she responds",
    ],
    variableSlots: ["WHAT SHE FINDS", "THE WARM THING RECONTEXTUALISED", "WHERE SHE IS WHEN SHE FINDS IT"],
    hookType: "cliffhanger",
    hookFunction: "The chapter cuts right before she has to decide what to do with what she knows.",
    hasChoices: true,
    choiceDescriptions: {
      a: "Escalate — take it to whoever has power to act on it",
      b: "Go directly to him — alone, tonight, now",
    },
  },
  {
    number: 7,
    name: "The Reckoning",
    title: "Say It",
    emotionalFunction: "The confrontation. Everything they've been not saying since ch.1 is now in the room. This is the most emotionally naked chapter. Both of them are stripped of their professional identities here.",
    fixedElements: [
      "She initiates (regardless of reader choice — this is her beat)",
      "He does not deflect. For the first time, he meets her directly.",
      "She says the accusation plainly. He does not deny it.",
      "Something about his response is unexpected — not what she prepared for",
      "The chapter ends unresolved. He has given her something to think about but not an answer.",
    ],
    variableSlots: ["WHERE THE CONFRONTATION HAPPENS", "HIS UNEXPECTED RESPONSE"],
    hookType: "choice",
    hookFunction: "He's given her something. Now she has to decide whether to hear the rest.",
    hasChoices: true,
    choiceDescriptions: {
      a: "Walk out — she's not ready",
      b: "Stay — ask him to explain, knowing she might believe him",
    },
  },
  {
    number: 8,
    name: "The Confession",
    title: "What He Didn't Say",
    emotionalFunction: "The real reason. Not an excuse — a truth. What he did was real. But the reason behind it changes the shape of everything. She has to reckon with what she's been told.",
    fixedElements: [
      "He tells her something she didn't know — a sacrifice, a cost, a protection she didn't ask for",
      "The revelation is specific and verifiable — not just words",
      "She does not immediately forgive him. She absorbs it.",
      "Something shifts physically in this chapter — she lets him closer than before",
      "The chapter ends just before the break — the reader feels the edge",
    ],
    variableSlots: ["THE REAL REASON", "THE PROOF", "THE PHYSICAL SHIFT"],
    hookType: "revelation",
    hookFunction: "The last image of the chapter is something that makes the reader hold their breath.",
    hasChoices: true,
    choiceDescriptions: {
      a: "Say nothing — close the distance",
      b: "Say everything — all of it, out loud, first",
    },
  },
  {
    number: 9,
    name: "The Surrender",
    title: "She Chooses",
    emotionalFunction: "She stops fighting it. So does he. The chapter delivers on every beat of tension built since ch.1. This is the payoff.",
    fixedElements: [
      "She makes the first real move (the whole adventure has been building to her agency here)",
      "He matches her — he has been waiting",
      "The scene is grounded in the specific world of the Setting Sheet",
      "What happens here is shaped entirely by the spice level the reader set at the beginning",
    ],
    variableSlots: ["THE SURRENDER SCENE", "THE FINAL CATALYST"],
    hookType: "revelation",
    hookFunction: "The reader just experiences this.",
    hasChoices: false,
  },
  {
    number: 10,
    name: "The Resolution",
    title: "Determined by ending",
    emotionalFunction: "Land the story. Honour the choices she made. Leave her with something real.",
    fixedElements: [
      "A closing scene that mirrors the opening of ch.1 — but different now",
      "One line that lands the whole adventure",
      "A final beat that seeds the next adventure (new question, new city, new conflict — same heat)",
    ],
    variableSlots: ["THE CLOSING MIRROR SCENE", "THE SEASON 2 SEED"],
    hookType: "revelation",
    hookFunction: "The adventure ends.",
    hasChoices: false,
  },
];

export function getBeat(chapterNo: number): Beat | undefined {
  return BEATS.find((b) => b.number === chapterNo);
}

export function determineEnding(choiceLog: { tag: "open" | "guarded" }[]): "hea" | "hfn" | "heartbreak" {
  if (choiceLog.length === 0) return "hfn";
  const openCount = choiceLog.filter((c) => c.tag === "open").length;
  const ratio = openCount / choiceLog.length;
  if (ratio >= 0.7) return "hea";
  if (ratio >= 0.4) return "hfn";
  return "heartbreak";
}
