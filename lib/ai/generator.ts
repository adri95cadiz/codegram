import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient() {
  if (!client && process.env.OPENAI_API_KEY) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return client;
}

export interface GeneratedIdea {
  title: string;
  description: string;
  stack: string[];
  effort: "quick" | "weekend" | "week" | "month";
  why: string;
  vibe?: string;
}

const SYSTEM_PROMPT = `You are a creative coding idea generator for developers who want to learn and build.
Your ONLY job is to return valid JSON with a programming project idea.
Do NOT add any explanation, markdown, or extra text.
Return EXACTLY this JSON structure (no code blocks, no quotes around the JSON):
{
  "title": "a short catchy title (2-5 words)",
  "description": "a one sentence description",
  "stack": ["technology1", "technology2", "technology3"],
  "effort": "quick",
  "why": "why this project is interesting and fun (1-2 sentences)"
}

Valid effort values: "quick", "weekend", "week", or "month".
Stack must be an array of strings.`;

// Mock ideas para cuando no hay API key
const MOCK_IDEAS: GeneratedIdea[] = [
  {
    title: "TUI Git Client",
    description: "A terminal UI for git with vim keybindings and beautiful diff visualization",
    stack: ["Rust", "crossterm", "ratatui"],
    effort: "weekend",
    why: "Git becomes 10x more enjoyable in the terminal, and it's a great way to learn Rust TUI patterns",
  },
  {
    title: "AI-Generated SVG Animations",
    description: "Feed a prompt, get animated SVGs that you can customize and export",
    stack: ["TypeScript", "Zod", "Claude API"],
    effort: "week",
    why: "Bridges the gap between idea and asset creation, perfect for indie hackers",
  },
  {
    title: "Markdown -> Podcast Script",
    description: "Transform any markdown file into a podcast script with timestamps and speaker cues",
    stack: ["Node.js", "Zod", "ffmpeg"],
    effort: "weekend",
    why: "Repurposing content is huge, and podcasts are an underrated medium",
  },
];

export async function generateIdea(vibe: string = ""): Promise<GeneratedIdea> {
  const client = getClient();
  
  // If no client/API key, return mock ideas
  if (!client) {
    console.log("No OpenAI API key found, using mock ideas");
    return MOCK_IDEAS[Math.floor(Math.random() * MOCK_IDEAS.length)];
  }

  try {
    const userPrompt = vibe
      ? `Generate a coding project idea with this vibe: "${vibe}"`
      : "Generate a random coding project idea that would excite a developer.";

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    // Extract JSON from content (in case there's extra text)
    let jsonStr = content.trim();
    
    // Try to find JSON object in the content
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const idea = JSON.parse(jsonStr) as GeneratedIdea;
    
    // Validate required fields
    if (!idea.title || !idea.description || !idea.stack || !idea.effort || !idea.why) {
      console.error("Invalid idea structure from OpenAI:", idea, "Raw content:", content);
      throw new Error("Generated idea missing required fields");
    }
    
    // Ensure stack is an array
    if (!Array.isArray(idea.stack)) {
      idea.stack = typeof idea.stack === "string" ? [idea.stack] : [];
    }
    
    // Validate effort
    if (!["quick", "weekend", "week", "month"].includes(idea.effort)) {
      idea.effort = "weekend";
    }
    
    return idea;
  } catch (error) {
    console.error("Error generating idea from OpenAI:", error);
    // Fallback to mock ideas if API fails
    return MOCK_IDEAS[Math.floor(Math.random() * MOCK_IDEAS.length)];
  }
}
