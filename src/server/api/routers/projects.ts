import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { projects } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";

export const projectsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return await ctx.db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));
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
      id: z.number(),
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
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.delete(projects).where(eq(projects.id, input.id));
    }),

  initializeProject: publicProcedure
    .input(z.object({
        id: z.number(),
        localPath: z.string(),
        githubUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
        // imports usually go at top, but for this refactor we put them here or move them up
        // ideally move to top of file
        const { promises: fs } = await import("fs");
        const { OpenAI } = await import("openai");
        const path = await import("path");
        const { env } = await import("@/env");
        
        const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

        // 1. Scan Files
        // Try to read package.json and README.md
        let packageJson = "{}";
        let readme = "No README found.";
        let fileStructure = "Unknown";
        
        try {
             // Basic list of top-level files
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
            // Continue even if read fails, we'll infer from what we have
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
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: "You are a Senior Tech Lead / Game Master. Output valid JSON." }, { role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });
        
        const analysis = JSON.parse(completion.choices[0].message.content || "{}");
        
        const analysisData = {
            vibe: analysis.vibe || "Mystery Code",
            objectives: analysis.objectives || ["Explore the codebase"],
            lastScanned: new Date(),
            roadmap: analysis.roadmap || []
        };

        // 3. Update DB
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
    }),
});
