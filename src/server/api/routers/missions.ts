import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { missions } from "@/server/db/schema";
import { users } from "@/server/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const missionsRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({
      projectId: z.string(),
      title: z.string().min(1),
      description: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [mission] = await ctx.db.insert(missions).values({
        id: Math.random().toString(36).substring(7),
        projectId: input.projectId,
        title: input.title,
        description: input.description,
        status: "pending",
        progress: 0,
      }).returning();
      return mission;
    }),

  getByProject: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.missions.findMany({
        where: eq(missions.projectId, input.projectId),
        orderBy: [desc(missions.createdAt)],
      });
    }),

  updateStatus: publicProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(["pending", "active", "completed"]),
      progress: z.number().min(0).max(100).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db.update(missions)
        .set({
          status: input.status,
          ...(input.progress !== undefined && { progress: input.progress }),
          updatedAt: new Date(),
        })
        .where(eq(missions.id, input.id))
        .returning();
      return updated;
    }),

  // Accept a pending mission
  acceptMission: publicProcedure
    .input(z.object({ missionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.update(missions)
        .set({ status: "active", updatedAt: new Date() })
        .where(eq(missions.id, input.missionId))
        .returning();
    }),

  // Reject a pending mission (delete it)
  rejectMission: publicProcedure
    .input(z.object({ missionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(missions)
        .where(eq(missions.id, input.missionId))
        .returning();
    }),

  // Update mission progress
  updateProgress: publicProcedure
    .input(z.object({
      missionId: z.string(),
      progress: z.number().min(0).max(100)
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.update(missions)
        .set({ progress: input.progress, updatedAt: new Date() })
        .where(eq(missions.id, input.missionId))
        .returning();
    }),

  // Complete mission and award XP
  completeMission: publicProcedure
    .input(z.object({ missionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get the mission to find XP reward
      const [mission] = await ctx.db.select()
        .from(missions)
        .where(eq(missions.id, input.missionId))
        .limit(1);

      if (!mission) {
        throw new Error("Mission not found");
      }

      // Mark mission as completed
      await ctx.db.update(missions)
        .set({
          status: "completed",
          progress: 100,
          updatedAt: new Date()
        })
        .where(eq(missions.id, input.missionId));

      // Award XP to user (using first user in DB for now)
      const [firstUser] = await ctx.db.select()
        .from(users)
        .limit(1);

      if (!firstUser) {
        throw new Error("No user found in database");
      }

      const newTotalXp = (firstUser.totalXp || 0) + (mission.xp || 0);
      const newLevel = Math.floor(newTotalXp / 1000) + 1;

      await ctx.db.update(users)
        .set({
          totalXp: newTotalXp,
          level: newLevel
        })
        .where(eq(users.id, firstUser.id));

      return {
        mission,
        xpGained: mission.xp,
        newTotalXp,
        newLevel,
        leveledUp: newLevel > (firstUser.level || 1)
      };
    }),
});
