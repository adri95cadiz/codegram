import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { users, projects } from "@/server/db/schema";
import { eq, sql, count } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const user = await ctx.db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      githubUsername: user.githubUsername,
      createdAt: user.createdAt,
      openaiKey: user.openaiKey,
      anthropicKey: user.anthropicKey,
      geminiKey: user.geminiKey,
      preferredModel: user.preferredModel,
    };
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(256).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.db
        .update(users)
        .set({
          name: input.name,
        })
        .where(eq(users.id, userId));

      return { success: true };
    }),

  updateLLMKeys: protectedProcedure
    .input(
      z.object({
        openaiKey: z.string().optional(),
        anthropicKey: z.string().optional(),
        geminiKey: z.string().optional(),
        preferredModel: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.db
        .update(users)
        .set({
          openaiKey: input.openaiKey,
          anthropicKey: input.anthropicKey,
          geminiKey: input.geminiKey,
          preferredModel: input.preferredModel,
        })
        .where(eq(users.id, userId));

      return { success: true };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get project count
    const projectCount = await ctx.db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.userId, userId));

    // For now, return basic stats
    // In the future, we can add likes count, streak calculation, etc.
    return {
      projectCount: projectCount[0]?.count ?? 0,
      likesCount: 0, // Placeholder
      streak: 0, // Placeholder - would need streak calculation logic
    };
  }),
});
