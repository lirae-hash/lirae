import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import ws from "ws";
dotenv.config({ path: ".env.local" });

import { buildChapterPrompt, parseChapterResponse } from "../src/lib/dna/prompt";
import { THE_KITCHEN } from "../src/lib/dna/settings/the-kitchen";
import type { ChoiceLogEntry, Vibe, SpiceLevel } from "../src/types/database";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: ws } }
);

async function generateText(prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": GEMINI_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      }),
    }
  );

  const data = await response.json();
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error("No text in response");
  }
  return data.candidates[0].content.parts[0].text;
}

function determineEnding(choices: { tag: "open" | "guarded" }[]): "hea" | "hfn" | "heartbreak" {
  const openCount = choices.filter(c => c.tag === "open").length;
  const guardedCount = choices.filter(c => c.tag === "guarded").length;

  if (openCount >= 6) return "hea";
  if (guardedCount >= 6) return "heartbreak";
  return "hfn";
}

async function main() {
  // Get the most recent playthrough
  const { data: pt } = await supabase
    .from("playthroughs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!pt) {
    console.log("No playthrough found");
    return;
  }

  console.log("Regenerating playthrough:", pt.id);
  console.log("Vibe:", pt.vibe, "| Spice:", pt.spice);

  const choiceLog = (pt.choice_log || []) as ChoiceLogEntry[];

  let output = `# The Kitchen - Full Playthrough\n\n`;
  output += `**Vibe:** ${pt.vibe} | **Spice:** ${pt.spice} | **Ending:** ${pt.ending}\n\n`;
  output += `---\n\n`;

  for (let chapterNo = 1; chapterNo <= 10; chapterNo++) {
    console.log(`\nGenerating Chapter ${chapterNo}...`);

    // Build choice log up to this chapter
    const choicesUpToNow = choiceLog.slice(0, chapterNo - 1);

    // Determine ending for chapter 10
    let ending: "hea" | "hfn" | "heartbreak" | null = null;
    if (chapterNo === 10) {
      const realChoices = choicesUpToNow.filter(c => c.id !== "continue");
      ending = determineEnding(realChoices as { tag: "open" | "guarded" }[]);
    }

    const prompt = buildChapterPrompt({
      chapterNo,
      settingSheet: THE_KITCHEN,
      vibe: pt.vibe as Vibe,
      archetype: (pt.archetype as "brooding" | "cinnamon" | "rogue" | "protector" | "tortured" | "golden") || "brooding",
      spice: pt.spice as SpiceLevel,
      protagonistName: pt.protagonist_name,
      choiceLog: choicesUpToNow,
      ending,
    });

    const response = await generateText(prompt);
    const { prose, choices } = parseChapterResponse(response);

    output += `## Chapter ${chapterNo}\n\n`;
    output += `${prose}\n\n`;

    if (choices && choices.length > 0) {
      output += `### Choices:\n\n`;

      const chosenChoice = choiceLog[chapterNo - 1];

      for (const choice of choices) {
        const isChosen = chosenChoice && chosenChoice.id === choice.id;
        const marker = isChosen ? "→" : " ";
        output += `${marker} [${choice.tag.toUpperCase()}] ${choice.text}\n`;
      }

      if (chosenChoice && chosenChoice.id !== "continue") {
        output += `\n**You chose:** ${chosenChoice.text}\n`;
      }
    } else {
      output += `*[No choices - Continue]*\n`;
    }

    output += `\n---\n\n`;

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 1000));
  }

  const filename = `full-playthrough-${pt.vibe}-spice${pt.spice}-${pt.ending}.md`;
  fs.writeFileSync(filename, output);
  console.log(`\n✓ Exported to: ${filename}`);
}

main().catch(console.error);
