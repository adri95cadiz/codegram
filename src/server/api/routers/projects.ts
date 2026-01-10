import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { projects } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getAIClient } from "@/server/ai-utils";
import { promises as fs } from "fs";
import * as path from "path";

export const projectsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    // Return empty array if not authenticated
    if (!ctx.session?.user?.id) {
      return [];
    }

    const userId = ctx.session.user.id;
    return await ctx.db.query.projects.findMany({
      where: (p, { eq }) => eq(p.userId, userId),
      orderBy: [desc(projects.createdAt)],
    });
  }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string(),
      stack: z.string(),
      vibe: z.string(), // "chill", "focused", etc
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return await ctx.db.insert(projects).values({
        id: Math.random().toString(36).substring(7),
        userId: userId,
        title: input.title,
        description: input.description,
        stack: input.stack,
        vibe: input.vibe,
        status: "active",
        nextStep: "Initialize Repository",
      }).returning();
    }),

  updateStatus: publicProcedure
    .input(z.object({
      id: z.string(),
      status: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .update(projects)
        .set({ status: input.status })
        .where(eq(projects.id, input.id));
    }),

  delete: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.delete(projects).where(eq(projects.id, input.id));
    }),

  initializeProject: publicProcedure
    .input(z.object({
      id: z.string(),
      localPath: z.string(),
      githubUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      let ai;
      try {
        ai = await getAIClient(ctx.session?.user?.id ?? "1", ctx.db);
      } catch (error: any) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: error.message || "AI configuration error",
        });
      }

      const { client: openai, model } = ai;

      // 1. Scan Files
      let packageJson = "{}";
      let readme = "No README found.";
      let fileStructure = "Unknown";

      try {
        const files = await fs.readdir(input.localPath);
        fileStructure = files.slice(0, 20).join(", ");

        if (files.includes("package.json")) {
          packageJson = await fs.readFile(path.join(input.localPath, "package.json"), "utf-8");
        }
        if (files.includes("README.md")) {
          readme = await fs.readFile(path.join(input.localPath, "README.md"), "utf-8");
        }
      } catch (e) {
        console.error("Failed to read project files", e);
      }

      // 2. AI Analysis "The Soul Search"
      const prompt = `
            Analyze this project context and define its "Soul".
            
            Files: ${fileStructure}
            Package.json: ${packageJson.slice(0, 1000)}
            README: ${readme.slice(0, 1000)}
            
            Return JSON:
            {
                "vibe": "A aesthetic/mood description (e.g. 'Cyberpunk Speedrun', 'Corporate Zen', 'Spaghetti Western')",
                "objectives": ["3-4 clear technical or product objectives based on README/deps"],
                "roadmap": ["3-5 actionable next steps for a developer"]
            }
        `;

      try {
        const completion = await openai.chat.completions.create({
          model: model,
          messages: [{ role: "system", content: "You are a Senior Tech Lead / Game Master. Output valid JSON." }, { role: "user", content: prompt }],
          response_format: { type: "json_object" }
        });

        const analysis = JSON.parse(completion.choices[0].message.content || "{}");

        const soulData = {
          personality: analysis.vibe || "Mystery Code",
          context: analysis.objectives ? analysis.objectives.join("\n") : "Explore the codebase",
          knowledge_base: analysis.roadmap || [],
          lastScanned: new Date(),
        };

        await ctx.db
          .update(projects)
          .set({
            localPath: input.localPath,
            githubUrl: input.githubUrl,
            soul: soulData,
            status: "active",
            nextStep: analysis.roadmap?.[0] || "Explore"
          })
          .where(eq(projects.id, input.id));

        return { success: true, soul: soulData };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to analyze project",
        });
      }
    }),
});
