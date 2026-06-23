import type { SpiceLevel, Vibe, HeroArchetype } from "@/types/database";

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

export function getVoiceRules(heroName: string): string {
  return `
== POV — SECOND PERSON, PRESENT TENSE (the core mechanic) ==
The reader IS the protagonist. Write to "you," never "she." The love interest (${heroName}) is "he." Present tense throughout, for immediacy.
- Stay inside your head — we feel what you feel: the awareness, the irritation, the pull you don't want to admit to.
- Do NOT assign "you" inner reactions her choices haven't earned (no "your heart melts," no "you didn't know why you felt this way"). Give the situation and the sensory moment richly; leave her response open enough for the reader to fill in.
- Use her name only if one was provided, and only in others' dialogue. If none was given, never invent one — others address her by role.

His character (baseline — his specific manner comes from his archetype and this world, not fixed here): ${heroName} has done something that hurt you, and he knows it. Whether he regrets it is the question the story slowly answers. Call him ${heroName} and nothing else.

Prose register: real, adult, emotionally precise — think Emily Henry or Sally Thorne. Not YA, not purple, not overwrought. The restraint is what makes it land. (See the STYLE REFERENCE near the top for the exact target register.)

== AVOID (these read as AI slop) ==
- Slipping into "she," or into past tense.
- Describing the reader's own appearance (she can't see herself).
- Telling the reader how to feel ("it was electrifying"), or naming feelings her choices haven't earned.
- Re-describing the same physical tic (his eyes, her lip). Notice something new each time.
- Dialogue that exists only to dump backstory.
- Opening on atmosphere before anything happens; ending on resolution instead of an open loop.
`;
}

// HEROINE VOICE & DISPOSITION — the fixed narrative LENS the whole story is told
// through. This is deliberately NOT a backstory or a fixed identity: the
// protagonist is always second-person "you" and the reader projects herself onto
// her. What this pins down is only her VOICE and DISPOSITION — the consistent way
// she perceives, thinks, and acts — so "you" stays coherent across all ten
// chapters the way a novelist's character sheet keeps a narrator consistent.
// Fed into every generation, exactly like the hero archetype.
export const HEROINE_VOICE = `
== HEROINE VOICE & DISPOSITION (the lens — fixed every chapter, never contradicted) ==
"You" are not a blank camera, and not a fixed character with a biography — you are a *way of seeing*. The reader brings her own identity; you supply the voice and disposition the whole story is told through. Hold these constant in every chapter:

- PERCEPTIVE & OBSERVANT. You read people and rooms fast — you catch the tell he didn't mean to show, the shift in the air, the thing under what was said. Your noticing is a skill, not passivity.
- INTERIORITY WITH ATTITUDE. Your inner voice is wry, specific, and opinionated — never neutral scene-painting. You have takes. You're a little defensive, quick to judge, quicker to catch yourself judging, and you can be funny about it.
- AGENCY. You act ON situations; you don't just react to him. You make moves, set terms, push back, decide. You are one of two formidable people in the scene — never an admirer pointed at an attractive man.
- PSYCHOLOGICALLY COHERENT. Everything you do follows from this disposition. You never go soft, swoony, or passive in a way this lens wouldn't — if he moves you, it still sounds like you.

This is the FLOOR, not a fixed personality. The four traits above stay constant in every story — but the TEXTURE of your voice (how dry or warm, how fast or watchful, how openly combative) takes its color from THIS setting and from the man you're up against (his archetype, below). The heroine in a high-rise acquisition sparring with a brooding rival does not sound like the heroine in a small mountain town up against a steady protector. Be recognizably yourself within this one story; do not be the same woman in every story.
`;

// LABELED style reference — included so the model can match the REGISTER
// (confident heroine who runs the scene, description that characterizes HER
// taste and wit, real banter). It is shown ONLY as a tonal target; the prompt
// is emphatic that its words must never be reproduced.
export const STYLE_REFERENCE = `
== STYLE REFERENCE — emulate this REGISTER, never copy these words ==
The passage below is published fiction (Sally Thorne, "99 Percent Mine"), shown ONLY as a tonal target. Do NOT reuse its words, phrasing, names, or situations — study HOW it works and write something entirely your own:

  "Nobody taught me this when I first started as a bartender, but luckily, I was a quick learner: When a group of men are walking in, you should work out which one is the alpha. […] 'We must go to the same barber, because you're looking real pretty, too. Now, order something or get out.' […] I imagine a Ken doll left out in the sun too long, and I step on that soft tan head like it's a cigarette. 'Not for a million years.' […] The light hits his face in a shadowless beige pan of color, and he's nothing that could interest me. I'm a face snob. It's all about the shadows."

WHY this is the target: her voice has attitude; she runs the scene and wins the exchange; and when she describes the man ("a Ken doll left out in the sun"), the description characterizes HER taste and wit, not his measurements. That is the register every chapter should hit.
`;

// Romance-reader research, distilled. Applies to EVERY chapter of EVERY adventure.
export const READER_GUIDELINES = `
== READER CRAVINGS & HARD AVOIDS (apply to every chapter, every adventure) ==

HARD AVOIDS — these make readers quit. Never do them:
- NO miscommunication-as-plot. Never manufacture conflict from two people simply failing to talk. Any distance between them must come from a real, understandable choice (often the reader's own choice), never a dumb misunderstanding that one honest sentence would fix.
- NO insta-love. Attraction can be instant; trust and love are earned across the arc — that's why it's a slow burn. Never have either of them in love before the story has earned it.
- NO passive doormat heroine — and no fake "I don't need anyone" girlboss who then needs rescuing. She has genuine agency; her choices drive the story. She has a spine and she uses it.
- NO repetitive physical tics. Don't keep re-describing the same feature (his eye color, her biting her lip). Notice new things; let the body language evolve.
- NO pregnancy reveals and NO time-skip-to-married-with-kids endings. Keep the ending about the two of them, now.
- NEVER romanticize genuine abuse. In dark or morally-gray settings his hardness must ultimately resolve as protection, and she always keeps her agency and her spine. Cruelty is never the love language.

READER CRAVINGS — lean into these. They are what readers love:
- HE FALLS FIRST, AND VISIBLY. Show him increasingly wrecked by her. Yearning is the engine of the story — let the reader see how much he wants her through what he says, does, and can't quite hide.
- BANTER IS MANDATORY. Sharp, witty dialogue with subtext in every encounter. Readers stay for the voices. What they don't say is where the heat lives.
- THE "SNAP" MOMENTS ARE HERO BEATS. Kissing and the moment his control finally breaks are never throwaways — build to them and let them land hard. This is the heart of the steamy-not-explicit ceiling.
- LET HER (AND THE READER) HEAR HOW MUCH HE WANTS HER. Deliver the "hearing the guy in love" feeling through his words and actions, even though POV stays on "you."
- KEEP THE TENSION ALIVE — even during the truce. Never let the dynamic go flat or "too nice." There is always an undercurrent: longing, challenge, or an old wound.
- PROSE QUALITY MATTERS. Show, don't tell. Sharp interior voice. No over-explaining, never tell the reader how to feel. Readers notice bad writing and quit.
`;

export const SPICE_RULES: Record<SpiceLevel, string> = {
  1: "Sweet warmth — Emotional tension only. Physical awareness limited to his presence and voice. No body-scanning.",
  2: "Warm tension — Charged glances. Awareness of how close he is. You notice his hands, his jaw, his stillness. Restrained.",
  3: "Slow burn — Electric. You are aware of exactly how close he is at all times. Almost-touches. Charged dialogue with subtext.",
};

export const VIBE_RULES: Record<Vibe, string> = {
  dark: "Dark Desire — Moody, atmospheric, intimate shadows. The tension lives in what's unsaid and unseen. Industrial textures, low light, shared exhaustion.",
  gold: "Golden Hour — Warm light, soft edges, the beauty of ordinary moments. Morning light through windows, the warmth of places that run on discipline and love.",
  rose: "Midnight Rose — Sensual, delicate, the world of sweetness with depth. The way beauty is always a form of seduction if you're paying attention.",
  sage: "Emerald Envy — Earthy richness, tradition as weight and legacy. The lushness of place and season and memory.",
};

export const ARCHETYPE_RULES: Record<HeroArchetype, { name: string; behavior: string }> = {
  brooding: {
    name: "The Brooding Rival",
    behavior: "Controlled, withholding, cracks slowly, says less than he means. Every word is measured. When he finally opens up, it lands like a confession. His competence is intimidating. His rare moments of vulnerability are devastating.",
  },
  cinnamon: {
    name: "The Cinnamon Roll",
    behavior: "Warm, openly kind, soft under any gruffness. He makes you feel safe without asking anything in return. His devotion shows in actions, not demands. He notices what you need before you say it. When he's protective, it's gentle, not possessive.",
  },
  rogue: {
    name: "The Charming Rogue",
    behavior: "Witty, flirtatious, deflects with humor, banter-forward. He makes you laugh even when you're trying to be mad. Every exchange is a game he clearly enjoys. Under the charm is someone who pays closer attention than he lets on.",
  },
  protector: {
    name: "The Protector",
    behavior: "Steady, loyal, quietly intense, action over words. He puts himself between you and trouble without making it about him. His strength is calm, not aggressive. When he speaks, it matters. His love is shown in what he does, not what he says.",
  },
  tortured: {
    name: "The Tortured Soul",
    behavior: "Guarded by real pain, intense, redeemable. The walls are there for a reason, and lowering them costs him something. His intensity can be overwhelming. He fights the pull toward you because he doesn't think he deserves it. When he breaks, it's raw.",
  },
  golden: {
    name: "The Golden Boy",
    behavior: "Effortless, admired, has everything—and is surprised by how much he wants you. Others want him; he wants *you*. His privilege doesn't make him unkind, but he's used to getting what he wants. The vulnerability is that you make him uncertain.",
  },
};

export const BEATS: Beat[] = [
  {
    number: 1,
    name: "The Clash",
    title: "The Rival",
    emotionalFunction: "Establish the enemy dynamic and the attraction simultaneously — you feel both in the same moment, the threat and the pull. AND orient the reader: who you are here, what you want, what's at stake.",
    fixedElements: [
      "OPEN ON CONTACT — the BEST first line is an actual line of dialogue or a beat of direct contact between you and him: someone speaks, or you collide. Lead with that. (Her sharp interior voice with attitude — a wry, opinionated take on this exact moment, like the bartender opening in the STYLE REFERENCE — is the only acceptable alternative.) NEVER an establishing description of the setting, the weather, the room, or your arrival into it. The arrival still happens — but THROUGH that first exchange, not in a descriptive paragraph before it.",
      "Orient the reader, but woven IN — never as a setup paragraph: who she is here (her role, why she's here) and what she WANTS (the concrete goal she came for) surface through her voice and the friction of the scene, inside the first beats.",
      "You recognise him the instant you clock him — and the HISTORY (what he did, what it cost you) and the POWER IMBALANCE (he holds something over you) come out THROUGH THE EXCHANGE: needled, thrown in each other's faces, loaded with subtext. Never a narrator paragraph reciting the backstory (apply the exposition-through-dialogue rule hard here — this is the chapter with the most to set up).",
      "This first collision is LIVE AND SPOKEN — the two of you actually make contact and spar this chapter. You feel the threat and the pull in the same breath.",
      "You are formidable. You don't break. You don't flinch visibly. (Show this through what you do and say, not by narrating your personality.)",
      "He notices you noticing him. He is not surprised to see you — he was expecting this.",
      "End on the charged, unresolved beat of the clash — the next move (how you meet this) is hers.",
    ],
    variableSlots: ["LOCATION", "HIS ROLE", "YOUR ROLE", "WHAT YOU WANT", "WHAT HE DID", "THE DETAIL"],
    hookType: "revelation",
    hookFunction: "Something you learn at the end of this chapter changes the power dynamic. It's not what you expected.",
    hasChoices: true,
    choiceDescriptions: {
      a: "You let him see you seeing him — hold his gaze, don't look away first",
      b: "You give nothing — keep your face neutral, your walls intact",
      c: "You let something slip — a flash of the anger, the hurt, something real",
    },
  },
  {
    number: 2,
    name: "Forced Proximity",
    title: "No Escape",
    emotionalFunction: "Remove the option to avoid each other. You must now exist in close quarters. The irritation is real. So is everything else.",
    fixedElements: [
      "A situation forces you into physical or professional proximity",
      "You try to establish distance or rules; he does not fight it but doesn't help you either",
      "One moment of accidental closeness — not romantic, just physical reality",
      "You catch yourself noticing something about him that is not his professional role",
      "You immediately rationalise it",
    ],
    variableSlots: ["PROXIMITY CATALYST", "CLOSE QUARTERS SCENE", "THE THING YOU NOTICE"],
    hookType: "cliffhanger",
    hookFunction: "Something external cuts the chapter at the worst possible moment — the situation just got harder to escape.",
    hasChoices: true,
    choiceDescriptions: {
      a: "You don't step back — let the closeness be his problem, not yours",
      b: "You put space between you — reclaim the boundary he crossed",
    },
  },
  {
    number: 3,
    name: "Reluctant Truce",
    title: "Fine",
    emotionalFunction: "You need each other. Both hate it. The truce is practical, not warm — but something shifts when you actually work together.",
    fixedElements: [
      "A shared goal or crisis forces genuine cooperation",
      "He is unexpectedly good at something you respect",
      "You are unexpectedly good at something he needed",
      "You achieve something together. Neither says so.",
      "The chapter ends with the truce holding — but something underneath it has changed",
    ],
    variableSlots: ["THE SHARED GOAL", "HIS COMPETENCE", "YOUR COMPETENCE", "THE MOMENT IT SHIFTS"],
    hookType: "choice",
    hookFunction: "The chapter ends on an offered gesture — not romantic, but the first genuinely human thing between you. The reader decides whether you accept it.",
    hasChoices: true,
    choiceDescriptions: {
      a: "You let yourself feel something — acknowledge, even silently, that this was good",
      b: "You stay armored — whatever that was, you're not giving it a name",
    },
  },
  {
    number: 4,
    name: "First Crack",
    title: "Something Real",
    emotionalFunction: "A crack in his armor. You see something beneath the composure that is not the enemy you constructed. It unsettles you more than his competence ever did.",
    fixedElements: [
      "You encounter him outside his professional role, or in a moment he didn't control",
      "He is briefly, undeniably human",
      "You have a choice: exploit it or protect it. You choose without quite deciding to.",
      "He knows you saw. He does not address it.",
      "You spend the rest of the chapter trying to un-see it",
    ],
    variableSlots: ["THE CRACK SCENE", "WHAT YOU SEE", "YOUR CHOICE"],
    hookType: "revelation",
    hookFunction: "You find out something about his past that reframes what he did to you. Not exonerates — reframes. You are not ready for this information.",
    hasChoices: true,
    choiceDescriptions: {
      a: "You let him know you saw — offer something human back",
      b: "You pretend you didn't see — protect him, or protect yourself",
    },
  },
  {
    number: 5,
    name: "The Almost",
    title: "Almost",
    emotionalFunction: "The pivot of the entire adventure. The tension that has been building since ch.1 reaches a peak and breaks — but not into resolution. Into awareness. You cannot pretend anymore that this is only professional.",
    fixedElements: [
      "A specific scene of forced, extended closeness — not accidental, intentional on someone's part",
      "The space between you becomes the subject of the scene without either of you saying so",
      "He moves closer. Or you do. Or neither does but both want to.",
      "Something specific — not an interruption, but a choice — stops it",
      "The chapter ends without resolution. You feel the exact shape of what didn't happen.",
    ],
    variableSlots: ["THE ALMOST SCENE", "WHO MOVES", "THE INTERRUPTION"],
    hookType: "revelation",
    hookFunction: "The midpoint lands without asking anything of the reader. You just feel it.",
    hasChoices: false,
  },
  {
    number: 6,
    name: "The Setback",
    title: "What You Found",
    emotionalFunction: "You find out what he did — the full shape of it. Not a rumour. Evidence. The walls go back up. This is worse than before ch.4 because now you know what you were starting to feel.",
    fixedElements: [
      "You discover the truth of what he did without him present",
      "The discovery recontextualises something warm from a previous chapter — now it reads as manipulation",
      "You do not confront him immediately. You sit with it.",
      "The chapter ends before the confrontation — reader chooses how you respond",
    ],
    variableSlots: ["WHAT YOU FIND", "THE WARM THING RECONTEXTUALISED", "WHERE YOU ARE WHEN YOU FIND IT"],
    hookType: "cliffhanger",
    hookFunction: "The chapter cuts right before you have to decide what to do with what you know.",
    hasChoices: true,
    choiceDescriptions: {
      a: "You let the anger lead — burn it down, consequences later",
      b: "You go to him first — make him explain before anyone else knows",
    },
  },
  {
    number: 7,
    name: "The Reckoning",
    title: "Say It",
    emotionalFunction: "The confrontation. Everything you've been not saying since ch.1 is now in the room. This is the most emotionally naked chapter. Both of you are stripped of your professional identities here.",
    fixedElements: [
      "You initiate (regardless of reader choice — this is your beat)",
      "He does not deflect. For the first time, he meets you directly.",
      "You say the accusation plainly. He does not deny it.",
      "Something about his response is unexpected — not what you prepared for",
      "The chapter ends unresolved. He has given you something to think about but not an answer.",
    ],
    variableSlots: ["WHERE THE CONFRONTATION HAPPENS", "HIS UNEXPECTED RESPONSE"],
    hookType: "choice",
    hookFunction: "He's given you something. Now you have to decide whether to hear the rest.",
    hasChoices: true,
    choiceDescriptions: {
      a: "You leave — you need to feel this alone before you can hear more",
      b: "You stay — you want the whole truth, even if it undoes you",
    },
  },
  {
    number: 8,
    name: "The Confession",
    title: "What He Didn't Say",
    emotionalFunction: "The real reason. Not an excuse — a truth. What he did was real. But the reason behind it changes the shape of everything. You have to reckon with what you've been told.",
    fixedElements: [
      "He tells you something you didn't know — a sacrifice, a cost, a protection you didn't ask for",
      "The revelation is specific and verifiable — not just words",
      "You do not immediately forgive him. You absorb it.",
      "Something shifts physically in this chapter — you let him closer than before",
      "The chapter ends just before the break — you feel the edge",
    ],
    variableSlots: ["THE REAL REASON", "THE PROOF", "THE PHYSICAL SHIFT"],
    hookType: "revelation",
    hookFunction: "The last image of the chapter is something that makes you hold your breath.",
    hasChoices: true,
    choiceDescriptions: {
      a: "You let your body answer — close the distance without words",
      b: "You make him hear you first — say what you've been holding back",
    },
  },
  {
    number: 9,
    name: "The Surrender",
    title: "You Choose",
    emotionalFunction: "You stop fighting it. So does he. The chapter delivers on every beat of tension built since ch.1. This is the payoff.",
    fixedElements: [
      "You make the first real move (the whole adventure has been building to your agency here)",
      "He matches you — he has been waiting",
      "The scene is grounded in the specific world of the Setting Sheet",
      "What happens here is shaped entirely by the spice level you set at the beginning",
    ],
    variableSlots: ["THE SURRENDER SCENE", "THE FINAL CATALYST"],
    hookType: "revelation",
    hookFunction: "You just experience this.",
    hasChoices: false,
  },
  {
    number: 10,
    name: "The Resolution",
    title: "Determined by ending",
    emotionalFunction: "Land the story. Honour the choices you made. Leave you with something real.",
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
