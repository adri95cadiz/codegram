import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

import { OpenAI } from "openai";
import { env } from "@/env";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const feedRouter = createTRPCRouter({
  generateIdea: publicProcedure
    .input(
      z.object({
        vibe: z.string().optional(),
        mode: z.enum(["chaos", "serious", "learning", "startup", "artist", "gamedev"]).optional().default("chaos"),
        duration: z.enum(["quick", "weekend", "week", "month", "founder"]).optional().default("weekend"),
        cursor: z.number().nullish(),
      })
    )
    .query(async ({ input }) => {
      const vibe = input.vibe || "Random";
      const mode = input.mode || "chaos";
      const duration = input.duration || "weekend";

      const durationPrompts = {
        quick: "Scope: Tiny. Must be buildable in 1-2 hours. Focus on single-feature tools.",
        weekend: "Scope: Small. Buildable in a weekend (48h). Focus on MVP.",
        week: "Scope: Medium. Hackathon scale (1 week). Focus on polish and core loop.",
        month: "Scope: Large. Side hustle scale (1 month). Focus on database, auth, and users.",
        founder: "Scope: Massive. Startup/Unicorn scale. Focus on scalability, market fit, and complex architecture."
      };

      const systemPrompts = {
        chaos: `You are a chaotic good senior engineer.
            Goal: Replace doom scrolling with "doom coding".
            Rules:
            1. Ideas must be technically interesting but slightly unhinged.
            2. No generic "To-Do List".
            3. Focus on: Visuals, weird APIs, retro tech.
            4. Tone: Punchy, excited.`,
        serious: `You are a pragmatic CTO.
            Goal: Build portfolio-worthy products.
            Rules:
            1. Ideas must be viable SaaS or useful tools.
            2. Focus on: Clean architecture, market value.
            3. Tone: Professional, clear.`,
        learning: `You are a CS professor.
            Goal: Teach concepts.
            Rules:
            1. Focus on algorithms, data structures, low-level.
            2. Tone: Educational, precise.`,
        startup: `You are a YC Partner.
            Goal: Find the next unicorn.
            Rules:
            1. Ideas must have high growth potential.
            2. Focus on: B2B, Marketplaces, AI.
            3. Tone: Demanding, visionary.`,
        artist: `You are a Creative Technologist.
            Goal: Make digital art.
            Rules:
            1. Focus on: WebGL, Shaders, Generative Art, Audio.
            2. Tone: Abstract, inspiring.`,
        gamedev: `You are an Indie Game Dev.
            Goal: Make fun mechanics.
            Rules:
            1. Focus on: Godot, Unity, WebGPU, Physics.
            2. Tone: Playful, technical.`
      };
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `${systemPrompts[mode]}
            
            ${durationPrompts[duration]}
            
            General Rules:
            1. Return JSON only.
            2. Be concise.
            
            Schema:
            {
              "title": "Short catchy title",
              "description": "2 sentence pitch.",
              "stack": "3-4 tech keywords",
              "effort": "Matches the requested scope",
              "why": "Why this is worth building."
            }`
          },
          {
            role: "user",
            content: `Generate a coding idea with this vibe: ${vibe}`
          }
        ],
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error("No content generated");
      
      const generatedIdea = JSON.parse(content) as {
        title: string;
        description: string;
        stack: string;
        effort: string;
        why: string;
      };

      return {
        idea: {
          id: Math.random().toString(36).substring(7),
          ...generatedIdea,
          vibe: input.vibe || "Random",
        },
        nextCursor: (input.cursor ?? 0) + 1,
      };
    }),

  toggleLike: publicProcedure
    .input(
      z.object({
        idea: z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          stack: z.string(),
          effort: z.string(),
          why: z.string(),
          vibe: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: In a real app, we would get the userId from the session
      // const userId = ctx.session.user.id;
      const MOCK_USER_ID = 1;

      // Check if already liked (mock logic for now since we don't have a real DB connection verified)
      // await ctx.db.insert(likes).values({
      //   userId: MOCK_USER_ID,
      //   ideaSnapshot: input.idea,
      // });

      return { success: true };
    }),
});
