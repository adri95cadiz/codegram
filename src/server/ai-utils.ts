import { OpenAI } from "openai";
import { type db } from "@/server/db";

export async function getAIClient(userId: string, database: typeof db) {
  const user = await database.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
  });

  if (!user) {
    throw new Error("User not found. Please sign in.");
  }

  const model = user.preferredModel || "gpt-4o-mini";

  if (model.startsWith("gpt")) {
    if (!user.openaiKey) {
      throw new Error("OpenAI API key is missing. Please add it in your profile settings to continue.");
    }
    return {
      client: new OpenAI({ apiKey: user.openaiKey }),
      model: model,
      provider: "openai" as const
    };
  }

  // Future-proofing for Anthropic/Gemini
  if (model.startsWith("claude")) {
    if (!user.anthropicKey) {
      throw new Error("Anthropic API key is missing. Please add it in your profile settings.");
    }
    // Return dummy structure for now or implement if needed
    throw new Error("Anthropic support coming soon. Please use an OpenAI model for now.");
  }

  // Default fallback if somehow none match
  if (!user.openaiKey) {
    throw new Error("AI configuration missing. Please set your API key in profile settings.");
  }

  return {
    client: new OpenAI({ apiKey: user.openaiKey }),
    model: "gpt-4o-mini",
    provider: "openai" as const
  };
}
