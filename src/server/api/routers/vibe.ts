import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getAIClient } from "@/server/ai-utils";
import { isSafePath } from "./inspector";
import { promises as fs } from "fs";
import path from "path";
import { TRPCError } from "@trpc/server";

export const vibeRouter = createTRPCRouter({
  processVibe: protectedProcedure
    .input(
      z.object({
        vibe: z.string(),
        projectPath: z.string(),
        language: z.enum(["en", "es"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { vibe, projectPath, language } = input;
      const langKey = language || (ctx.language === 'es' ? 'es' : 'en');

      if (!isSafePath(projectPath)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Target path is outside allowed boundaries.",
        });
      }

      let ai;
      try {
        ai = await getAIClient(ctx.session.user.id, ctx.db);
      } catch (error: any) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: error.message || "AI configuration error",
        });
      }

      const { client: openai, model } = ai;

      // 1. Get project context (list of files)
      const entries = await fs.readdir(projectPath, { withFileTypes: true });
      const fileList = entries
        .filter(e => !e.name.startsWith('.') && e.name !== 'node_modules')
        .map(e => e.name)
        .join(", ");

      // 2. Ask AI what to do
      const systemPrompt = `You are an elite "Vibe Coder". 
        Your goal is to implement changes to a local codebase based on a user's "vibe".
        Project Files: ${fileList}
        
        Rules:
        1. Analyze which file(s) need changing.
        2. Provide specific code changes.
        3. ALWAYS return JSON.
        
        Output format:
        {
          "thought": "Brief explanation of what you're doing",
          "changes": [
            {
              "file": "relative/path/to/file",
              "action": "replace" | "create",
              "content": "The full content of the file"
            }
          ]
        }`;

      try {
        const completion = await openai.chat.completions.create({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Vibe: ${vibe}` }
          ],
          response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content || "{}");
        return result;
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to process vibe",
        });
      }
    }),
});
