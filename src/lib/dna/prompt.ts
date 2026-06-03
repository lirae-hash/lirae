import type { SpiceLevel, Vibe, ChoiceLogEntry } from "@/types/database";
import { VOICE_RULES, SPICE_RULES, VIBE_RULES, getBeat, type Beat } from "./enemies-to-lovers";

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
  spice: SpiceLevel;
  protagonistName: string | null;
  choiceLog: ChoiceLogEntry[];
}

function renderSettingSlots(settingSheet: SettingData, beat: Beat): string {
  const relevantSlots: string[] = [];

  // Always include core world info
  relevantSlots.push(`Setting: ${settingSheet.setting}`);
  relevantSlots.push(`His role: ${settingSheet.worldDetails.hisRole}`);
  relevantSlots.push(`Her role: ${settingSheet.worldDetails.herRole}`);
  relevantSlots.push(`Their history: ${settingSheet.worldDetails.theirHistory}`);

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
  const { chapterNo, settingSheet, vibe, spice, protagonistName, choiceLog } = params;
  const beat = getBeat(chapterNo);

  if (!beat) {
    throw new Error(`No beat found for chapter ${chapterNo}`);
  }

  const vibeNote = settingSheet.vibeNotes[vibe] || VIBE_RULES[vibe];

  const prompt = `You are generating Chapter ${beat.number} of a Lirae interactive romance.

== STORY DNA (fixed rules — always apply) ==
Trope: Enemies-to-Lovers
Beat ${beat.number} — "${beat.name}"
Chapter title: "${beat.title}"
Emotional function: ${beat.emotionalFunction}

Fixed elements (must all appear):
${beat.fixedElements.map((e) => `- ${e}`).join("\n")}

${VOICE_RULES}

Love interest name: ${settingSheet.heroName}
HARD CONTENT CEILING: spice ${spice}/3 — ${SPICE_RULES[spice]}. Never explicit. Fade to black above this line.

== SETTING (this adventure) ==
${renderSettingSlots(settingSheet, beat)}

${settingSheet.generationNotes.length > 0 ? `
Generation notes for this world:
${settingSheet.generationNotes.map((n) => `- ${n}`).join("\n")}
` : ""}

== READER CONTEXT ==
Vibe/atmosphere: ${vibeNote}
Protagonist: ${protagonistName || "unnamed — refer to her as \"she\" throughout, never give her a name"}
Choices she has made so far:
${renderChoiceLog(choiceLog)}

== OUTPUT FORMAT ==
Write 900–1100 words of prose. Stay in close third person, past tense, in her head.

${beat.hasChoices && beat.choiceDescriptions
    ? `After the prose, provide exactly ${beat.choiceDescriptions.c ? "3" : "2"} choices for the reader. Format them exactly like this:

CHOICE_A: [${beat.choiceDescriptions.a}]
CHOICE_B: [${beat.choiceDescriptions.b}]${beat.choiceDescriptions.c ? `
CHOICE_C: [${beat.choiceDescriptions.c}]` : ""}

Each choice should be a single sentence describing what she does, written in third person. Make them feel meaningfully different — one more vulnerable/open, one more guarded/strategic${beat.choiceDescriptions.c ? ", one unexpected" : ""}.`
    : "This chapter has no choices — end on the emotional beat itself."}

No headings, no preamble, no meta-commentary. Just the prose${beat.hasChoices ? ", then the choices" : ""}.`;

  return prompt;
}

export function parseChapterResponse(response: string): {
  prose: string;
  choices: { id: string; text: string; tag: "open" | "guarded" }[] | null;
} {
  // Look for choice markers
  const choicePattern = /CHOICE_([ABC]):\s*(.+?)(?=CHOICE_[ABC]:|$)/gs;
  const matches = [...response.matchAll(choicePattern)];

  if (matches.length === 0) {
    // No choices found — this is a no-choice beat
    return {
      prose: response.trim(),
      choices: null,
    };
  }

  // Extract prose (everything before the first CHOICE_)
  const firstChoiceIndex = response.indexOf("CHOICE_");
  const prose = response.slice(0, firstChoiceIndex).trim();

  // Parse choices
  const choiceTags: Record<string, "open" | "guarded"> = {
    A: "open",      // Bold/vulnerable choices are "open"
    B: "guarded",   // Strategic/protective choices are "guarded"
    C: "open",      // Unexpected choices lean "open" (reveals more)
  };

  const choices = matches.map((match) => ({
    id: match[1].toLowerCase(),
    text: match[2].trim(),
    tag: choiceTags[match[1]] || "guarded",
  }));

  return { prose, choices };
}
