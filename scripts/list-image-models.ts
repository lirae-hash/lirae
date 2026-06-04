import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function listModels() {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
  );
  const data = await res.json();
  const imageModels = data.models?.filter((m: { name: string }) =>
    m.name.toLowerCase().includes("image")
  ) || [];
  console.log("Image models:");
  imageModels.forEach((m: { name: string }) => console.log(" ", m.name));
}
listModels();
