import type { SpiceLevel, Vibe, ChoiceLogEntry, HeroArchetype } from "@/types/database";
import { getVoiceRules, READER_GUIDELINES, SPICE_RULES, VIBE_RULES, ARCHETYPE_RULES, getBeat, type Beat } from "./enemies-to-lovers";

interface SettingData {
  heroName: string;
  setting: string;
  worldDetails: Record<string, string>;
  slots: Record<string, string>;
  vibeNotes: Record<string, string>;
  generationNotes: string[];
}

interface PromptParams {
  chapterNo: number;
  settingSheet: SettingData;
  vibe: Vibe;
  archetype: HeroArchetype;
  spice: SpiceLevel;
  protagonistName: string | null;
  choiceLog: ChoiceLogEntry[];
  ending?: "hea" | "hfn" | "heartbreak" | null;
  finalWords?: string | null;
}

const ENDING_RULES: Record<string, string> = {
  hea: `ENDING: Happily Ever After (HEA)
The reader chose vulnerability and connection. Write a full, forward-looking ending. You are together. The future is open. End with one specific, earned moment of joy. This is the reward for leaning in.`,
  hfn: `ENDING: Happy For Now (HFN)
The reader made mixed choices — bold and cautious, open and defended. Write an honest ending about uncertainty. You are together but the future is real, not fairy-tale. There's hope but also honesty about what lies ahead.`,
  heartbreak: `ENDING: Heartbreak
The reader chose distance, protection, escalation. The relationship doesn't survive — not because those choices were wrong, but because they have weight. Write this ending with dignity and beauty. You are not diminished. You are just alone. Make it ache, but make it true.`,
};

function renderSettingSlots(settingSheet: SettingData, beat: Beat): string {
  const relevantSlots: string[] = [];

  // Always include core world info
  relevantSlots.push(`Setting: ${settingSheet.setting}`);
  relevantSlots.push(`His role: ${settingSheet.worldDetails.hisRole}`);
  relevantSlots.push(`Your role: ${settingSheet.worldDetails.yourRole || settingSheet.worldDetails.herRole}`);
  relevantSlots.push(`Your history with him: ${settingSheet.worldDetails.theirHistory}`);

  // Include what you want if available (for ch.1 orientation)
  if (settingSheet.worldDetails.whatYouWant) {
    relevantSlots.push(`What you want: ${settingSheet.worldDetails.whatYouWant}`);
  }

  // Add beat-specific slots
  for (const slotKey of beat.variableSlots) {
    const slotValue = settingSheet.slots[slotKey];
    if (slotValue) {
      relevantSlots.push(`[${slotKey}]: ${slotValue}`);
    }
  }

  return relevantSlots.join("\n");
}

function renderChoiceLog(choiceLog: ChoiceLogEntry[]): string {
  if (choiceLog.length === 0) return "(no choices made yet)";

  return choiceLog
    .map((c, i) => `Ch.${i + 1}: [${c.tag === "open" ? "opened toward him" : "guarded herself"}] ${c.text}`)
    .join("\n");
}

// LAYER 2 — make the reader's PREVIOUS choice (and the running pattern) real
// input to this chapter, so the story is continuous with her decision rather
// than a generic next beat.
function renderContinuity(choiceLog: ChoiceLogEntry[]): string {
  if (choiceLog.length === 0) return ""; // chapter 1 — nothing to carry yet

  const last = choiceLog[choiceLog.length - 1];
  const openCount = choiceLog.filter((c) => c.tag === "open").length;
  const ratio = openCount / choiceLog.length;

  const consequence =
    last.tag === "open"
      ? `Because her last move was to open toward him — "${last.text}" — he felt it land. Open THIS chapter a degree warmer: he meets her with a crack in his own composure, a little less defended than before, and the air between you is closer. Live in the aftermath of that opening.`
      : `Because her last move was to protect herself / pull back — "${last.text}" — he felt the door close. Open THIS chapter a degree cooler: he is more careful, a flicker of being rebuffed under his control, and he does not push. The distance between you has widened. Live in the aftermath of that retreat.`;

  const pattern =
    ratio >= 0.7
      ? "Again and again she has chosen to open toward him. The relationship has been steadily thawing — he is more unguarded with her now than he has ever been, and the closeness is real and growing."
      : ratio >= 0.4
      ? "She has been of two minds — opening in some moments, protecting herself in others. The connection is real but unsettled; a current of held-back wanting runs under everything, and he is never quite sure which version of her he'll meet."
      : "Again and again she has chosen to guard herself. The distance has been accruing — he has stopped reaching as openly, his composure a little more closed, and what's between you is charged but held at arm's length.";

  return `
== CONTINUITY — her last choice shapes THIS chapter (critical, do not skip) ==
${consequence}
Do NOT reset to a neutral next scene — open inside the echo of what she chose, and let his behavior visibly respond to it.

Where the whole arc has brought you so far: ${pattern}
Let that cumulative trajectory be FELT — in how he is with her, in how close you stand, in what goes unsaid — never stated outright. A reader on this path is living a different romance than one who has been choosing the opposite, and this chapter should prove it.
`;
}

// LAYER 1 — the choice-writing rules. Shared by the chapter prompt and the
// choices-only recovery prompt so both stay in sync.
function renderChoiceInstructions(beat: Beat): string {
  if (!beat.hasChoices || !beat.choiceDescriptions) {
    return "This chapter has no choices — end on the emotional beat itself.";
  }
  const c = beat.choiceDescriptions;
  return `After the prose, you MUST provide exactly ${c.c ? "3" : "2"} reader choices. These are the heart of the experience — write them with as much care as the prose itself.

== HOW TO WRITE THE CHOICES (critical) ==
Each choice is how SHE responds, in this exact moment, to HIM and to what just happened between you. Obey every rule:

1. ROOT IT IN THIS SCENE. Each choice must reference something concrete that just happened in the prose above — the object he handed you, the exact thing he just admitted, the look, the door he's standing in, the silence he left. The reader should know instantly which scene this belongs to. NEVER an abstract feeling like "you open up" or "you stay guarded."
2. FRAME IT AROUND HIM AND THE RELATIONSHIP. Make each choice about the two of you — how you answer what he just did or said — not about your private mood in the abstract. The connection is the stakes.
3. MAKE BOTH COST SOMETHING. Each option should let the reader feel what it risks — her pride, her heart, the upper hand, the fragile thing building between you. There is no safe option; she should sense the price of either.
4. TRUE DILEMMA — NO RIGHT ANSWER. Both options must be genuinely tempting, each pulling on a different part of what she wants. The reader should actually hesitate.
5. FRESH EVERY TIME. Do not reuse the wording, shape, or rhythm of choices from earlier chapters. This pair exists only for this scene.

Beneath the concrete surface, each choice still carries an emotional stance — this is what quietly steers her toward her ending. Honor it, but NEVER name it in the text:
- CHOICE_1 is an OPENING move — leaning toward him / letting him in. This beat's flavor of that: ${c.a}
- CHOICE_2 is a GUARDING move — protecting herself / holding the line. This beat's flavor of that: ${c.b}${c.c ? `
- CHOICE_3 is another OPENING move — a different way of leaning in. This beat's flavor: ${c.c}` : ""}

Format EXACTLY like this, each on its own line after the prose — real, specific sentences in her second-person voice, concrete to THIS scene, no brackets, no labels, no "(open)/(guarded)" markers:
CHOICE_1: You [a concrete response to this exact moment that leans toward him].
CHOICE_2: You [a concrete, different response to this exact moment that protects you].${c.c ? `
CHOICE_3: You [a third concrete response — another way of leaning in].` : ""}`;
}

export function buildChapterPrompt(params: PromptParams): string {
  const { chapterNo, settingSheet, vibe, archetype, spice, protagonistName, choiceLog, ending, finalWords } = params;
  const beat = getBeat(chapterNo);

  if (!beat) {
    throw new Error(`No beat found for chapter ${chapterNo}`);
  }

  const vibeNote = settingSheet.vibeNotes[vibe] || VIBE_RULES[vibe];
  const archetypeInfo = ARCHETYPE_RULES[archetype];

  // For chapter 10, include ending-specific guidance and final words
  let endingGuidance = chapterNo === 10 && ending ? `\n${ENDING_RULES[ending]}\n` : "";

  if (chapterNo === 10 && finalWords) {
    endingGuidance += `
THE READER'S FINAL WORDS TO HIM:
Before this chapter begins, she said: "${finalWords}"

CRITICAL: You MUST incorporate her actual words into the scene. Have her speak them — or a version of them — directly to him. Then write his response to those specific words and build the final scene around that emotional exchange. Her words are the heart of this ending.
`;
  }

  const prompt = `You are generating Chapter ${beat.number} of a Lirae interactive romance.${endingGuidance}

== STORY DNA (fixed rules — always apply) ==
Trope: Enemies-to-Lovers
Beat ${beat.number} — "${beat.name}"
Chapter title: "${beat.title}"
Emotional function: ${beat.emotionalFunction}

Fixed elements (must all appear):
${beat.fixedElements.map((e) => `- ${e}`).join("\n")}

${getVoiceRules(settingSheet.heroName)}
${READER_GUIDELINES}

Love interest name: ${settingSheet.heroName}
LOVE INTEREST ARCHETYPE: ${archetypeInfo.name}
${archetypeInfo.behavior}
Apply this archetype to his dialogue, behavior, and how he responds to your choices. The DNA beats stay the same — HE changes.

HARD CONTENT CEILING: spice ${spice}/3 — ${SPICE_RULES[spice]}. Never explicit. Fade to black above this line.

== SETTING (this adventure) ==
${renderSettingSlots(settingSheet, beat)}

${settingSheet.generationNotes.length > 0 ? `
Generation notes for this world:
${settingSheet.generationNotes.map((n) => `- ${n}`).join("\n")}
` : ""}

== READER CONTEXT ==
Vibe/atmosphere: ${vibeNote}
Protagonist name: ${protagonistName || "unnamed — others address her by role, never invent a name"}
Choices you have made so far:
${renderChoiceLog(choiceLog)}
${renderContinuity(choiceLog)}
== OUTPUT FORMAT ==
Write the chapter prose in SECOND PERSON, PRESENT TENSE. The reader IS the protagonist — always "you," never "she." ("You feel him before you see him. He looks up. His eyes find yours.")

**THE #1 RULE — DIALOGUE IS THE ENGINE OF THIS CHAPTER:**
This is a romance. The reader falls for him through what he SAYS. A chapter that is mostly atmospheric description with little dialogue reads as lifeless AI filler — never write that.
- DIALOGUE-FORWARD: roughly 40–60% of this chapter must be spoken exchange, with AT LEAST 6–8 lines of real dialogue. He MUST speak — several back-and-forth exchanges in this chapter, never just one line.
- HIS LINES ARE HIS CHARACTER: write his speech in his archetype's distinct voice (see the LOVE INTEREST ARCHETYPE above — its wit, restraint, deflection, or heat). Every line he says carries subtext. She should be able to fall for him from his dialogue alone.
- SHE GIVES AS GOOD AS SHE GETS: her lines are sharp, specific, and alive — she is not a passive listener. The conversation is the battlefield of the enemies-to-lovers arc; let them spar, deflect, and land hits on each other.
- RATION DESCRIPTION HARD: at most 1–2 short atmospheric beats in the whole chapter, and fold them INTO the action or something she notices mid-conversation (his hands, a glance, the heat of the room) — NEVER a standalone descriptive paragraph. Spend the words on exchange and her interior reaction, not on the room.

**ALSO:**
1. OPEN IN MOTION — start on a line of dialogue or a sharp beat of action, never an establishing description of the setting.
2. END ON AN OPEN LOOP — the last line MUST leave something unresolved: a question unanswered, a word unsaid, a look that demands interpretation. Make them NEED the next chapter.

Your job is to fulfill the emotional beat above — when the beat is complete, the chapter is done. But always end on a hook, never a resolution.

${beat.hasChoices
    ? `Write the COMPLETE scene, CARRIED BY THEIR CONVERSATION: deliver every fixed element listed above through what they say and do, and bring the beat all the way to its charged, unresolved moment before you end. Do NOT stop at the setup or backstory — he must be present and SPEAKING, and the tension must be live by the final line. Aim for a full, dialogue-driven chapter (roughly 4–8 paragraphs, the majority of it spoken exchange), ending on the open-loop hook that puts the next move in her hands.

IMPORTANT: Output ONLY the chapter prose. Do NOT write any reader choices, numbered or bulleted options, "You could…" lines, or a "What do you do?" prompt. The choices are generated separately — end on the hook and stop.`
    : "This chapter has no choices — end on the emotional beat itself. Deliver the full scene (roughly 4–8 paragraphs), not just the setup."}
${chapterNo === 10 ? `
== SHAREABLE CARD QUOTE ==
After the prose, on a new line, provide a single memorable quote from this chapter for the reader's shareable ending card.
Pick the most emotionally resonant line — a declaration of love, a vulnerable confession, or a defining moment.
Format EXACTLY like this:

CARD_QUOTE: "[The exact line from the chapter]"
CARD_QUOTE_SPEAKER: [speaker name - either "${settingSheet.heroName}" if he said it, "${protagonistName || 'Her'}" if she said it, or "Narration" if it's narrative description]

Choose a line that will make the reader want to share it. His declarations of love are usually most shareable.` : ""}

No headings, no preamble, no meta-commentary. Just the chapter prose${chapterNo === 10 ? ", then the card quote" : ""}.`;

  return prompt;
}

// A chapter is unusable if it was cut off mid-sentence (no sentence-ending
// punctuation) OR if it's implausibly short — the model occasionally stops at
// the setup/backstory (~1k chars) before the beat is actually delivered. Real
// chapters run ~2.3k–6k chars; regenerate anything well under that.
const MIN_CHAPTER_CHARS = 1500;
export function looksTruncated(prose: string): boolean {
  const t = prose.trim();
  if (t.length < MIN_CHAPTER_CHARS) return true;
  return !/[.!?…—"”'’*)\]]$/.test(t);
}

// Count spoken lines of dialogue (paired double-quotes, curly or straight). The
// reader feedback is that chapters read as flat description — a chapter must be
// dialogue-forward, so we gate on a minimum number of spoken utterances.
export const MIN_DIALOGUE_LINES = 6;
export function countDialogueLines(prose: string): number {
  const doubleQuotes = (prose.match(/[“”„‟«»"]/g) || []).length;
  return Math.floor(doubleQuotes / 2);
}

// Deterministic fallback choices from the beat's stance descriptions. Used when
// the (separate) choices generation call fails — so a failed choices call never
// kills the whole chapter. Not scene-specific, but valid and on-stance.
export function fallbackChoices(chapterNo: number): { id: string; text: string; tag: "open" | "guarded" }[] | null {
  const beat = getBeat(chapterNo);
  if (!beat || !beat.hasChoices || !beat.choiceDescriptions) return null;
  const c = beat.choiceDescriptions;
  const out: { id: string; text: string; tag: "open" | "guarded" }[] = [
    { id: "1", text: c.a, tag: "open" },
    { id: "2", text: c.b, tag: "guarded" },
  ];
  if (c.c) out.push({ id: "3", text: c.c, tag: "open" });
  return out;
}

// Recovery prompt: when a choice-beat generation comes back WITHOUT choices,
// ask for just the choices, grounded in the prose that was actually written.
export function buildChoicesPrompt(prose: string, params: PromptParams): string | null {
  const beat = getBeat(params.chapterNo);
  if (!beat || !beat.hasChoices || !beat.choiceDescriptions) return null;

  return `You are continuing a Lirae enemies-to-lovers romance. The love interest is ${params.settingSheet.heroName} ("he"); the reader is "you" (second person).

Here is the chapter that was just written:
"""
${prose}
"""

${renderChoiceInstructions(beat)}

Output ONLY the ${beat.choiceDescriptions.c ? "3" : "2"} CHOICE_ lines and nothing else — no prose, no preamble, no commentary.`;
}

export interface ParsedChapterResponse {
  prose: string;
  choices: { id: string; text: string; tag: "open" | "guarded" }[] | null;
  cardQuote: string | null;
  cardQuoteSpeaker: string | null;
}

export function parseChapterResponse(response: string): ParsedChapterResponse {
  // Extract card quote if present (for chapter 10)
  const cardQuoteMatch = response.match(/^CARD_QUOTE:\s*"?([^"]+)"?\s*$/im);
  const cardQuoteSpeakerMatch = response.match(/^CARD_QUOTE_SPEAKER:\s*(.+)$/im);

  const cardQuote = cardQuoteMatch ? cardQuoteMatch[1].trim() : null;
  const cardQuoteSpeaker = cardQuoteSpeakerMatch ? cardQuoteSpeakerMatch[1].trim() : null;

  // Remove card quote lines from response for prose extraction
  let cleanResponse = response
    .replace(/^CARD_QUOTE:.*$/gim, "")
    .replace(/^CARD_QUOTE_SPEAKER:.*$/gim, "")
    .trim();

  // Look for choice markers - support both CHOICE_1/2/3 and CHOICE_A/B/C formats
  // Each choice is on its own line
  const choicePattern = /^CHOICE_([123ABC]):\s*(.+)$/gim;
  const matches = [...cleanResponse.matchAll(choicePattern)];

  if (matches.length === 0) {
    // No choices found — this is a no-choice beat
    return {
      prose: cleanResponse.trim(),
      choices: null,
      cardQuote,
      cardQuoteSpeaker,
    };
  }

  // Extract prose (everything before the first CHOICE_)
  const firstChoiceIndex = cleanResponse.search(/^CHOICE_[123ABC]:/im);
  const prose = firstChoiceIndex > 0
    ? cleanResponse.slice(0, firstChoiceIndex).trim()
    : cleanResponse.trim();

  // Map choice identifiers to tags
  // Choice 1/A = vulnerable/open, Choice 2/B = guarded/strategic, Choice 3/C = unexpected/open
  const choiceTags: Record<string, "open" | "guarded"> = {
    "1": "open",
    "2": "guarded",
    "3": "open",
    "A": "open",
    "B": "guarded",
    "C": "open",
  };

  const choices = matches.map((match, index) => ({
    id: String(index + 1),
    text: match[2].trim(),
    tag: choiceTags[match[1].toUpperCase()] || "guarded",
  }));

  return { prose, choices, cardQuote, cardQuoteSpeaker };
}
