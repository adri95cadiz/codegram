import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const githubRouter = createTRPCRouter({
  saveToken: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Basic validation: try to fetch user info from GitHub
      try {
        const response = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `token ${input.token}`,
            Accept: "application/vnd.github.v3+json",
          },
        });
        
        if (!response.ok) throw new Error("Invalid GitHub Token");
        const userData = await response.json() as { login: string };

        await ctx.db
          .update(users)
          .set({ 
            githubToken: input.token,
            githubUsername: userData.login,
          })
          .where(eq(users.id, userId));

        return { success: true, username: userData.login };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "GitHub Authentication failed");
      }
    }),

  getRepos: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user?.githubToken) return [];

    try {
      const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100", {
        headers: {
          Authorization: `token ${user.githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) return [];
      const repos = await response.json() as Array<{ name: string, full_name: string, html_url: string, description: string }>;
      
      return repos.map(r => ({
        name: r.name,
        fullName: r.full_name,
        url: r.html_url,
        description: r.description
      }));
    } catch (error) {
      console.error("Failed to fetch repos:", error);
      return [];
    }
  }),

  getConnectionStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    return {
      isConnected: !!user?.githubToken,
      username: user?.githubUsername ?? null,
    };
  }),

  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    await ctx.db
      .update(users)
      .set({ githubToken: null, githubUsername: null })
      .where(eq(users.id, userId));
    return { success: true };
  }),
});
