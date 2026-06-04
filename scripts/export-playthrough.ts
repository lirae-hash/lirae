import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import ws from "ws";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: ws } }
);

async function exportPlaythrough() {
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

  console.log("Playthrough:", pt.id);
  console.log("Adventure:", pt.adventure_id);
  console.log("Vibe:", pt.vibe, "| Spice:", pt.spice);
  console.log("Ending:", pt.ending);

  // Get ALL cached chapters for this adventure (ignore path_hash since chapters are unique per vibe/spice combo in practice)
  const { data: chapters, error } = await supabase
    .from("chapters_cache")
    .select("*")
    .eq("adventure_id", pt.adventure_id)
    .order("chapter_no", { ascending: true });

  console.log("Cache query error:", error);
  console.log("Found chapters:", chapters?.length || 0);

  if (!chapters || chapters.length === 0) {
    console.log("No cached chapters found - chapters may not have been cached due to RLS");
    console.log("\nExporting from choice_log only:\n");

    const choiceLog = pt.choice_log as { id: string; text: string; tag: string }[];
    let output = `# The Kitchen - Playthrough Choices\n\n`;
    output += `**Vibe:** ${pt.vibe} | **Spice:** ${pt.spice} | **Ending:** ${pt.ending || "N/A"}\n\n`;
    output += `---\n\n`;

    choiceLog.forEach((choice, i) => {
      if (choice.id !== "continue") {
        output += `**Chapter ${i + 1} choice:** [${choice.tag.toUpperCase()}] ${choice.text}\n\n`;
      } else {
        output += `**Chapter ${i + 1}:** *[Continue - no choice]*\n\n`;
      }
    });

    const filename = `playthrough-choices-${pt.ending || "incomplete"}.md`;
    fs.writeFileSync(filename, output);
    console.log(`Exported choices to: ${filename}`);
    return;
  }

  const choiceLog = pt.choice_log as { id: string; text: string; tag: string }[];

  let output = `# The Kitchen - Full Playthrough\n\n`;
  output += `**Vibe:** ${pt.vibe} | **Spice:** ${pt.spice} | **Ending:** ${pt.ending || "N/A"}\n\n`;
  output += `---\n\n`;

  for (const chapter of chapters) {
    output += `## Chapter ${chapter.chapter_no}\n\n`;
    output += `${chapter.prose}\n\n`;

    const choices = chapter.choices as { id: string; text: string; tag: string }[] | null;

    if (choices && choices.length > 0) {
      output += `### Choices:\n\n`;

      // Find if a choice was made for this chapter
      const choiceIndex = chapter.chapter_no - 1;
      const chosenChoice = choiceLog[choiceIndex];

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
  }

  const filename = `playthrough-${pt.vibe}-spice${pt.spice}-${pt.ending || "incomplete"}.md`;
  fs.writeFileSync(filename, output);
  console.log(`\nExported to: ${filename}`);
}

exportPlaythrough();
