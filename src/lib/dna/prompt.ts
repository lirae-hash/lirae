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
    .map((c, i) => `Ch.${i + 1}: ${c.text}`)
    .join("\n");
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

== OUTPUT FORMAT ==
Write the chapter prose in SECOND PERSON, PRESENT TENSE. The reader IS the protagonist — always "you," never "she." ("You feel him before you see him. He looks up. His eyes find yours.")

**CRITICAL PAGE-TURNER RULES:**
1. OPEN IN MOTION — Start with dialogue, conflict, or a sharp question. No establishing description first. Hook the reader in the first line.
2. BANTER OVER DESCRIPTION — Readers stay for the voices. More sharp dialogue exchanges, more subtext, less atmosphere.
3. END ON AN OPEN LOOP — The last line of the chapter MUST leave something unresolved. A question unanswered, a word unsaid, a look that demands interpretation. Make them NEED the next chapter.

Your job is to fulfill the emotional beat above — when the beat is complete, the chapter is done. But always end on a hook, never a resolution.

${beat.hasChoices && beat.choiceDescriptions
    ? `After the prose, you MUST provide exactly ${beat.choiceDescriptions.c ? "3" : "2"} reader choices.

== CRITICAL CHOICE RULES ==
Every choice must be an EMOTIONAL STANCE — how she shows up emotionally — NOT a plot/logistics decision.
- NO "right answer" — each choice is a different emotional flavor, equally valid
- Choices are about: guard vs. open, pursue vs. be pursued, self vs. him, say-the-scary-thing vs. hold back
- NEVER write choices about strategy, logistics, or what happens next plot-wise
- Each choice reveals something about who she is in this moment

The emotional flavors for this beat:
- Choice 1 (OPEN stance): ${beat.choiceDescriptions.a}
- Choice 2 (GUARDED stance): ${beat.choiceDescriptions.b}${beat.choiceDescriptions.c ? `
- Choice 3 (OPEN stance): ${beat.choiceDescriptions.c}` : ""}

Format EXACTLY like this, each on its own line after the prose:
CHOICE_1: You [emotional action/stance].
CHOICE_2: You [emotional action/stance].${beat.choiceDescriptions.c ? `
CHOICE_3: You [emotional action/stance].` : ""}

Write real sentences that fit this story — no brackets, no placeholders.`
    : "This chapter has no choices — end on the emotional beat itself."}
${chapterNo === 10 ? `
== SHAREABLE CARD QUOTE ==
After the prose, on a new line, provide a single memorable quote from this chapter for the reader's shareable ending card.
Pick the most emotionally resonant line — a declaration of love, a vulnerable confession, or a defining moment.
Format EXACTLY like this:

CARD_QUOTE: "[The exact line from the chapter]"
CARD_QUOTE_SPEAKER: [speaker name - either "${settingSheet.heroName}" if he said it, "${protagonistName || 'Her'}" if she said it, or "Narration" if it's narrative description]

Choose a line that will make the reader want to share it. His declarations of love are usually most shareable.` : ""}

No headings, no preamble, no meta-commentary. Just the prose${beat.hasChoices ? ", then the choices on separate lines" : ""}${chapterNo === 10 ? ", then the card quote" : ""}.`;

  return prompt;
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
