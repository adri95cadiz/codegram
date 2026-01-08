import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const githubRouter = createTRPCRouter({
  saveToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const mockUserId = 1; // Temporary: using mock user until full auth
      
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
          .where(eq(users.id, mockUserId));

        return { success: true, username: userData.login };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "GitHub Authentication failed");
      }
    }),

  getRepos: publicProcedure.query(async ({ ctx }) => {
    const mockUserId = 1;
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, mockUserId),
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

  getConnectionStatus: publicProcedure.query(async ({ ctx }) => {
    const mockUserId = 1;
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, mockUserId),
    });

    return {
      isConnected: !!user?.githubToken,
      username: user?.githubUsername ?? null,
    };
  }),

  disconnect: publicProcedure.mutation(async ({ ctx }) => {
    const mockUserId = 1;
    await ctx.db
      .update(users)
      .set({ githubToken: null, githubUsername: null })
      .where(eq(users.id, mockUserId));
    return { success: true };
  }),
});
